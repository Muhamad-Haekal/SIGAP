# Skill Manifest — SIGAP Express

Auto-discovered by opencode from this directory. Anything moved to
`.agents/skills-archive/` is not loaded. Keep this manifest in sync with the
`AGENTS.md` section "Installed skills".

Regenerate the checks with:

```bash
node tools/verify-skills.mjs
```

## Active skills

| Skill | Version | License | Files | Size | Refs | Scripts | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `anatomy` | upstream (no version field) | MIT | 138 | 1.9 MB | 10 | 59 | Integrated: kit copied to `src/components/anatomy/`, figures in `src/components/figures/` |
| `brand` | 1.0.0 | not declared | 18 | 87 KB | 11 | 5 | Ready (Node scripts) |
| `design` | 2.1.0 | MIT | 35 | 237 KB | 18 | 8 | Ready; script paths rewritten to project-relative (Python) |
| `design-system` | 1.0.0 | MIT | 27 | 175 KB | 7 | 10 | Ready (Python + Node) |
| `slides` | 1.0.0 | not declared | 6 | 19 KB | 5 | 0 | Reference only |
| `ui-ux-pro-max` | not declared | not declared | 71 | 3.6 MB | 0 | 31 | Ready (Python); SKILL.md mostly Chinese |

All active skills except `anatomy` declare `metadata.author: claudekit`.

## Archived skills

Located in `.agents/skills-archive/`, not loaded by opencode. See
`.agents/skills-archive/README.md` for the restore procedure.

| Skill | Reason |
| --- | --- |
| `ui-styling` | shadcn/ui + Tailwind only; this project uses CSS Modules without Tailwind |
| `banner-design` | 2 files; depends on `frontend-design`, `ai-artist`, `ai-multimodal` (not installed) and on non-existent `.claude/skills/.venv` paths |

## Local modifications

- `design/SKILL.md`: replaced 21 occurrences of
  `~/.claude/skills/design/scripts/` with
  `.agents/skills/design/scripts/`; added a "Script Paths" note; marked the
  `ui-styling` routing row as archived.
- `anatomy`: kit files `iso-kit.mjs`, `iso.css`, `lathe.mjs` are byte-identical
  to `src/components/anatomy/`; `tools/verify-skills.mjs` enforces this.

## Provenance

- `anatomy`: MIT, by [@wheresryan22](https://github.com/wheresryan22/anatomy)
  (recorded in `AGENTS.md`); mirror copy in `.skills/anatomy/`.
- Other skills: vendored `claudekit` pack. Versions above are read from each
  `SKILL.md` frontmatter; upstream commit hashes were not recorded at install
  time.

## Dependencies

- Node.js 20.10+ (project uses v24) for `anatomy` scripts, `brand` and
  `design-system` `.cjs` helpers.
- Python 3.10+ for `design`, `design-system`, `ui-ux-pro-max` scripts
  (project has 3.12).
- Chrome or Chromium for `anatomy` capture/line checks.
- Gemini API credentials only when a skill is asked to generate images
  (`design` logo/CIP/icon, `ui-ux-pro-max` is offline data only).
