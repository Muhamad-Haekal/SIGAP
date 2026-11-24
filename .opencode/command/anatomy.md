---
description: Build a crafted, interactive isometric figure that explains an idea as a real machine.
agent: build
---

Load the `anatomy` skill with the `skill` tool (name: `anatomy`), then follow it to build the requested figure.

Request:
$ARGUMENTS

Rules for this project (SIGAP Express, React 19 + Vite + CSS Modules):

1. Read `.agents/skills/anatomy/SKILL.md` first, then the references it points to. For app integration read `references/react.md`, `references/kit.md`, `references/craft.md`, `references/motion.md`, and `references/verify.md`. Read `references/webgl.md` before any shader and `references/3d.md` before any 3D.
2. Name the size (Figure, Hero, or Epic) before any geometry, then state the estimate for Hero/Epic.
3. Copy the kit files you need from `.agents/skills/anatomy/kit/` into `src/components/anatomy/` (or `src/anatomy/`). Never edit the installed skill for app work.
4. Keep the figure under `src/components/figures/<name>/` using the server/client split described in `AGENTS.md`. Match the site's light theme (`data-theme="light"`) and use the SIGAP orange (`#ea580c`) as the single accent where the craft rules call for one.
5. Make it responsive at 390px and still under reduced motion.
6. Verify before finishing: run the geometry audit if the figure has pipes, cables, or round parts (`node build.mjs --audit`), run `scripts/lines.mjs`, take `scripts/capture.mjs` and 4x close-up screenshots, and read every PNG.
7. Run `npm run lint` in the project when you touch app source.
