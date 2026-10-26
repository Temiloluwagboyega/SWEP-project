#!/usr/bin/env python3
"""Install the locally reviewed Claude design skills into Codex without network access."""
import argparse
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import sys
import tempfile
import zipfile

ROOT = Path(__file__).resolve().parent.parent
BUNDLE = ROOT / 'design-skills' / 'codex-design-skills.zip'
EXPECTED = {'ui-ux-pro-max', 'frontend-design', 'web-design-guidelines',
            'vercel-react-best-practices', 'design-system', 'ui-styling', 'brand'}


def digest(content):
    return hashlib.sha256(content).hexdigest()


def read_bundle():
    checksum_file = BUNDLE.parent / 'bundle.sha256'
    expected_hash = checksum_file.read_text().split()[0]
    if digest(BUNDLE.read_bytes()) != expected_hash:
        raise ValueError('Bundle checksum mismatch; refusing installation.')
    with zipfile.ZipFile(BUNDLE) as archive:
        names = archive.namelist()
        if len(names) != len(set(names)):
            raise ValueError('Duplicate archive paths.')
        for info in archive.infolist():
            p = PurePosixPath(info.filename)
            if p.is_absolute() or '..' in p.parts or '\\' in info.filename:
                raise ValueError('Unsafe archive path.')
            if (info.external_attr >> 16) & 0o170000 == 0o120000:
                raise ValueError('Archive symlinks are not supported.')
        manifest = json.loads(archive.read('manifest.json'))
        if manifest['bundle_version'] != 1:
            raise ValueError('Unsupported bundle format.')
        if {s['name'] for s in manifest['skills']} != EXPECTED or len(manifest['skills']) != len(EXPECTED):
            raise ValueError('Unexpected skill inventory.')
        allowed = {'manifest.json'}
        for skill in manifest['skills']:
            if not re.fullmatch(r'[a-z0-9-]+', skill['name']):
                raise ValueError('Invalid skill name.')
            if 'SKILL.md' not in skill['files']:
                raise ValueError('Skill instructions are missing.')
            for relative, expected in skill['files'].items():
                member = f"{skill['name']}/{relative}"
                allowed.add(member)
                if digest(archive.read(member)) != expected:
                    raise ValueError(f'Checksum mismatch: {member}')
            text = archive.read(f"{skill['name']}/SKILL.md").decode()
            if not text.startswith('---\n') or not re.search(r'^name:\s*' + re.escape(skill['name']) + r'\s*$', text, re.M):
                raise ValueError(f"Invalid frontmatter: {skill['name']}")
        if set(names) != allowed:
            raise ValueError('Unmanifested archive contents.')
        return manifest


def matching(folder, skill):
    if not folder.is_dir() or folder.is_symlink():
        return False
    for relative, expected in skill['files'].items():
        p = folder / relative
        if p.is_symlink() or not p.is_file() or digest(p.read_bytes()) != expected:
            return False
    return True


def install(destination, manifest):
    # Preflight the entire inventory; never overwrite an existing installation.
    for skill in manifest['skills']:
        target = destination / skill['name']
        if target.exists() or target.is_symlink():
            if not matching(target, skill):
                raise FileExistsError(f'{target} already exists with different contents. It was left untouched.')
    destination.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(BUNDLE) as archive:
        for skill in manifest['skills']:
            target = destination / skill['name']
            if matching(target, skill):
                print(f"Already installed: {skill['name']}")
                continue
            # Stage on the same filesystem, then rename the complete skill atomically.
            with tempfile.TemporaryDirectory(prefix='.skill-stage-', dir=destination) as temporary:
                staged = Path(temporary) / skill['name']
                for relative in skill['files']:
                    p = staged / relative
                    p.parent.mkdir(parents=True, exist_ok=True)
                    p.write_bytes(archive.read(f"{skill['name']}/{relative}"))
                if not matching(staged, skill):
                    raise ValueError('Staged skill verification failed.')
                if target.exists() or target.is_symlink():
                    raise FileExistsError(f'{target} appeared during installation; left untouched.')
                staged.rename(target)
            print(f"Installed: {skill['name']}")
    if not all(matching(destination / s['name'], s) for s in manifest['skills']):
        raise ValueError('Post-install verification failed.')
    print(f'INSTALL_VERIFIED: {len(manifest["skills"])} skills at {destination}')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--dest', type=Path, help='Skills directory; defaults to $CODEX_HOME/skills or ~/.codex/skills')
    parser.add_argument('--verify-bundle', action='store_true', help='Verify all bundle checksums without installing')
    parser.add_argument('--check-installed', action='store_true', help='Verify an existing installation without changing files')
    args = parser.parse_args()
    manifest = read_bundle()
    destination = args.dest or Path(os.environ.get('CODEX_HOME', str(Path.home() / '.codex'))) / 'skills'
    if args.verify_bundle:
        print(f'BUNDLE_VERIFIED: {len(manifest["skills"])} skills, {sum(len(s["files"]) for s in manifest["skills"])} files')
    elif args.check_installed:
        if not all(matching(destination / s['name'], s) for s in manifest['skills']):
            raise ValueError(f'Installation is missing or differs at {destination}')
        print(f'INSTALL_VERIFIED: {len(manifest["skills"])} skills at {destination}')
    else:
        install(destination, manifest)
        print('The skills will be available on the next turn after Codex discovers them. If they are not listed, reopen this workspace.')


if __name__ == '__main__':
    try:
        main()
    except (OSError, ValueError, KeyError, zipfile.BadZipFile) as error:
        print(f'Installation incomplete: {error}', file=sys.stderr)
        raise SystemExit(1)
