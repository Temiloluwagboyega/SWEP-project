# Codex design skill bundle

Prepared from the design skills already present in this machine's Claude setup. No network download was needed. This bundle contains complete skill folders, not only SKILL.md summaries.

## Included skills

| Skill | Purpose | Source |
| --- | --- | --- |
| `ui-ux-pro-max` | Searchable UI/UX guidance, palettes, typography, accessibility, product design-system recommendations, Next.js and other stack guidance | Next Level Builder plugin cache, **v2.13.0** |
| `frontend-design` | Deliberate visual direction, layout, typography, copy, and design critique | Anthropic official frontend-design plugin, local marketplace snapshot |
| `web-design-guidelines` | Web interface and accessibility review | Vercel skill already installed for Claude |
| `vercel-react-best-practices` | React/Next.js performance and implementation quality | Vercel skill already installed for Claude |
| `design-system` | Primitive/semantic/component tokens and component states | ClaudeKit-authored skill distributed in the UI UX Pro Max plugin |
| `ui-styling` | Tailwind, accessible component patterns, responsive layouts, and optional shadcn/ui guidance | ClaudeKit-authored skill distributed in the UI UX Pro Max plugin |
| `brand` | Brand voice, visual identity, typography/color consistency | ClaudeKit-authored skill distributed in the UI UX Pro Max plugin |

`brand` and `ui-styling` are included together with `design-system` because its instructions reference them as dependencies. Installing the skills does not add shadcn/ui, fonts, animation libraries, or any other dependency to the campus app.

Upstream sources: [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill), [Anthropic frontend-design](https://github.com/anthropics/skills/tree/main/skills/frontend-design), [Vercel agent skills](https://github.com/vercel-labs/agent-skills). The bundle is from local snapshots, not a claim that these are the newest remote releases.

## Installation status

**Prepared and tested; not activated in Codex.** This session cannot write to `/Users/wikiwoo/.codex/skills` or the project's `.agents/skills`. Both attempts returned `Operation not permitted`. An attempted normal installation also failed while creating its staging directory in the global skills folder. No existing global skills were overwritten.

Run this one command from your normal terminal:

```sh
python3 /Users/wikiwoo/Documents/swep/scripts/install-design-skills.py
```

It installs to `$CODEX_HOME/skills`, or `~/.codex/skills` when CODEX_HOME is not set. No npm, Git, or internet access is required. The skills will be available on your next turn after Codex discovers them; reopen the workspace if they are not listed.

To verify activation files afterward:

```sh
python3 /Users/wikiwoo/Documents/swep/scripts/install-design-skills.py --check-installed
```

For a custom installation path:

```sh
python3 scripts/install-design-skills.py --dest /your/custom/skills
```

Use a directory Codex actually discovers for activation. A successful copy to an arbitrary folder alone does not register skills.

## What was checked

- The archive contains seven named skills with valid SKILL.md frontmatter, supporting data, references, templates, and helper files.
- The archive SHA-256 is stored in `bundle.sha256`; each payload file is individually checksummed in `manifest.json` inside the archive.
- A temporary-directory install was exercised, then checked and repeated. A deliberately changed skill was detected and left untouched rather than overwritten.
- UI UX Pro Max's UX-domain search, Next.js stack search, and non-persistent design-system generation were exercised using the copied code and local data.
- Bundled Python files were syntax-parsed and Node `.cjs` helpers checked for syntax. Optional helpers that download assets, install app packages, create files, or perform web-based reviews were not executed.
- Supporting paths referenced by the main SKILL.md instructions were checked against the included files.

Repeat verification without touching global skills:

```sh
python3 scripts/verify-design-skills.py
```

These checks establish package completeness and the tested local capabilities. They are not a full security audit, a test of every optional helper, or evidence that the skills are already loaded into Codex.

## Compatibility adaptation and provenance

Only UI UX Pro Max's instruction examples were adapted from the Claude-specific `${CLAUDE_PLUGIN_ROOT}/.claude/skills/ui-ux-pro-max` location to the default Codex skills location. The examples now use `python3` and explain how to resolve the actual installed skill directory for custom/project-local installations. Search scripts and data were preserved.

The React skill's installed directory is `vercel-react-best-practices`, matching its declared skill name even though the Claude source directory is called `react-best-practices`.

Original available license files were retained. The UI UX Pro Max repository's MIT license was included in its packaged skills. Source locations and original file provenance are recorded in the archive manifest; adapted instruction files have their own installed-file hashes.

Skills remain subordinate to the user's instructions and the project's requirements. General guidance about caching, client storage, dependencies, animations, or visual styling must not override this project's incident privacy, shared validation, simple stack, or emergency-safety rules. Installing them does not change the app's UI or resolve its still-blocked npm/runtime checks.
