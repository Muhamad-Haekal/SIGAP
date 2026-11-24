# `.skills` mirror

This folder holds a mirror of the project's agent skills for editors and tools
that look for a `.skills` directory.

- The **active** skill is `.agents/skills/anatomy/`. opencode discovers it
  automatically (project agent-compatible location) and it is the copy the
  agent must read and run.
- `.skills/anatomy/` is an identical copy so the `.skills` folder is complete.
  It is intentionally **not** listed in `opencode.json` under `skills.paths`:
  skill names must be unique, and registering both copies would make opencode
  attempt to load `anatomy` twice.

See `AGENTS.md` for the workflow, the SIGAP-specific frontend integration, and
the verification commands.
