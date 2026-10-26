#!/usr/bin/env python3
"""Verify the local skill bundle and test installation without touching global skills."""
import ast
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location('skill_installer', ROOT / 'scripts/install-design-skills.py')
installer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(installer)


def run(*args):
    result = subprocess.run(args, capture_output=True, text=True, cwd=ROOT)
    if result.returncode:
        raise AssertionError(f'Command failed: {args[0]}\n{result.stderr[:1000]}')
    return result.stdout


def main():
    manifest = installer.read_bundle()
    with tempfile.TemporaryDirectory(prefix='swep-skill-test-') as temporary:
        destination = Path(temporary) / 'skills'
        installer.install(destination, manifest)
        run(sys.executable, ROOT / 'scripts/install-design-skills.py', '--dest', destination, '--check-installed')
        installer.install(destination, manifest)
        # Positive control: a changed installation must be detected and preserved, not overwritten.
        changed = destination / 'brand' / 'SKILL.md'
        changed.write_text('Modified test fixture; must not be overwritten.\n')
        try:
            installer.install(destination, manifest)
        except FileExistsError:
            assert changed.read_text() == 'Modified test fixture; must not be overwritten.\n'
        else:
            raise AssertionError('Installer overwrote or accepted a changed skill.')
        search = destination / 'ui-ux-pro-max' / 'scripts/search.py'
        ux = json.loads(run(sys.executable, search, 'keyboard focus modal', '--domain', 'ux', '--json'))
        assert ux['domain'] == 'ux' and ux['count'] > 0 and ux['results']
        stack = json.loads(run(sys.executable, search, 'server components', '--stack', 'nextjs', '--json'))
        assert stack['stack'] == 'nextjs' and stack['count'] > 0 and stack['results']
        system = json.loads(run(sys.executable, search, 'education student portal', '--design-system', '--json', '-p', 'Skill Test'))
        assert system['design_system'] and not system['persistence']
        python_files = list(destination.rglob('*.py'))
        for p in python_files:
            ast.parse(p.read_text(), filename=str(p))
        node_files = list(destination.rglob('*.cjs'))
        for p in node_files:
            run('node', '--check', p)
        print(f'SKILLS_CHECKS_PASSED: {len(manifest["skills"])} skill packages; every file checksum; install/repeat/collision controls; UX search ({ux["count"]} matches); Next.js search ({stack["count"]} matches); non-persistent design-system generation; {len(python_files)} Python and {len(node_files)} Node helper syntax checks.')
        print('Global activation is not measured by this temporary-directory test.')


if __name__ == '__main__':
    main()
