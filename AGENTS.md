# SIGAP Express — Agent Guide

SIGAP Express (`package.json` name: `pengantaran`) is a single-page marketing
site for a delivery and packing service in Indonesia. All user-facing copy is
Indonesian. The site is built with React + Vite and uses CSS Modules.

## Commands

- `npm run dev` — start the Vite dev server with HMR
- `npm run build` — production build into `dist/`
- `npm run lint` — ESLint over the repository
- `npm run preview` — serve the production build locally

Run `npm run lint` before you finish any change to `src/`.

## Stack and conventions

- React 19 with function components and hooks. No class components.
- Vite 8 with `@vitejs/plugin-react`. Source in `src/` is JSX (`.jsx`), not
  TypeScript.
- CSS Modules per component (`Component.jsx` + `Component.module.css`).
- Global design tokens and shared classes live in `src/index.css`:
  `--orange`, `--orange-dark`, `--orange-tint`, `--ink`, `--ink-soft`,
  `--line`, `--radius-*`, `--shadow-*`, `wrap`, `eyebrow`, `btn`,
  `section-head`, `section-head h2`.
- Reuse the tokens instead of hard-coding colours. The brand accent is
  `#ea580c`.
- `framer-motion` is available. Honour `useReducedMotion()` and
  `prefers-reduced-motion`; motion is calm and optional.
- Components are composed in `src/App.jsx`. One component per file in
  `src/components/`, named exports are default; cross-cutting helpers go in
  `src/utils/`.
- Copy is Indonesian, sentence case, no lorem ipsum.
- Accessibility: semantic sections, keyboard support for interactive parts,
  `aria-label`/`aria-hidden` where needed, visible focus states.
- Responsive by default. Check 390 px, 768 px and 1180 px.
- Do not add comments to code unless explicitly asked.
- Do not commit build output, `node_modules`, or generated screenshots.

## Installed skills

Project skills are auto-discovered from `.agents/skills/`. Keep this list in
sync with the manifest in `.agents/skills/README.md`.

| Skill | Use for | Fit |
| --- | --- | --- |
| `anatomy` | Isometric explanatory SVG figures | Active install, integrated in `src/components/figures/` |
| `ui-ux-pro-max` | UI/UX review, layout, typography, color, a11y | Design intelligence; docs mostly in Chinese |
| `brand` | Brand voice, messaging, visual identity | Marketing copy and assets |
| `design` | Logo, CIP, icons, banners, social photos | Script paths are project-relative |
| `design-system` | Design tokens, component specs, slides | Token architecture |
| `slides` | HTML presentations | Reference only, no scripts |

Archived in `.agents/skills-archive/` (not loaded): `ui-styling` (shadcn/ui +
Tailwind, the project uses CSS Modules) and `banner-design` (missing
`frontend-design`, `ai-artist`, `ai-multimodal` dependencies). See the archive
README to restore either one.

Verify the skill tree after changing it:

```bash
node tools/verify-skills.mjs
```

## Anatomy skill — isometric explanatory figures

The project includes the **Anatomy** agent skill (MIT, by
[@wheresryan22](https://github.com/wheresryan22/anatomy)). It builds crafted,
interactive isometric SVG figures that explain a technical idea as a real
physical object: a test rig, a dial gauge, a plotter, a lock, a machine, etc.
It supports optional WebGL shaders (fire, exhaust, water, caustics, lamp
light) that live inside the drawing, and an optional beta 3D mode.

### Where it lives

- **Active install (auto-discovered by opencode):**
  `.agents/skills/anatomy/`
- **Mirror:** `.skills/anatomy/` — identical copy for editors and tools that
  look for a `.skills` folder. It is **not** registered in `opencode.json`, so
  the `anatomy` skill is not loaded twice. Skill names must be unique.
- **Slash command:** `/anatomy <request>` is defined in
  `.opencode/command/anatomy.md`.

Do not create another `anatomy` skill under `.opencode/skills/`,
`.claude/skills/`, or `~/.agents/skills/`; opencode requires unique names.

### When to use it

Use Anatomy whenever the request is for an isometric illustration, an
explanatory diagram or figure for docs, a blog post, a landing page or an
article, a "Linear-style" or premium technical drawing, an interactive
explainer, or an SVG that shows how a system, algorithm or component works —
even if the user never says "isometric".

Do not use it for charts, axes/series plots, people, exact maps, or ideas that
have no mechanism to build.

### Read order

1. `.agents/skills/anatomy/SKILL.md` — workflow and craft rules (always first)
2. `references/craft.md` — the look, parts vocabulary, painter's order
3. `references/react.md` — server/client split for React (this project)
4. `references/kit.md` — kit API signatures and examples
5. `references/motion.md` — live behaviour, springs, tours, accessibility
6. `references/verify.md` — screenshots, audits, review checklist
7. `references/webgl.md` — only before writing a shader
8. `references/3d.md` — only before a 3D figure
9. `references/print.md` — only for A4/Letter PDFs
10. `references/walkthrough.md` — a full design walkthrough

### Integrating a figure into this Vite app

Anatomy ships a framework-free kit plus React components. For this site:

1. Copy only what the figure needs from `.agents/skills/anatomy/kit/` into
   `src/components/anatomy/` (or `src/anatomy/`):
   - `iso-kit.ts` and/or `iso-kit.mjs`
   - `iso.css`
   - `react/draw.tsx`, `react/live.tsx`
   - `lathe.mjs`, `tube.mjs`, `audit.mjs` when the figure has round parts,
     pipes/cables, or needs the geometry audit
   - `gl.mjs` for shaders, `turn*.mjs` for 3D
2. Put the figure under `src/components/figures/<name>/`, following the kit's
   layout:
   - `model.js` — pure model: real numbers, thresholds, readout text
   - `view.js` — world layout constants, projection, helpers
   - `geometry.js` — static paths computed once at module load
   - `frame.js` — only paths whose shape changes per frame
   - `art.tsx` — static art as JSX
   - `live.tsx` — `"use client"` equivalent: refs, loop, pointer/keyboard,
     aria, readout
   - `figure.tsx` — the card: `Fig n`, title, hint, readout, keys, caption
   - `<name>.css` — scoped tokens and styles
3. Import `iso.css` once (for example in `src/index.css` via `@import`, or in
   `src/main.jsx`). Wrap the figure in `className="iso"` and use
   `data-theme="light"` to match the SIGAP light theme.
4. Use the site's orange `#ea580c` for the one "lit" accent when the craft
   rules call for a single accent; keep the rest monochrome paper/ink so the
   figure belongs to the brand.
5. Sections: render the resting pose on the server/first render and start
   motion only inside effects. In Vite there is no server, but keep the static
   art in `art.tsx` and pass it to the live component as element props so
   geometry stays memoized at module load.
6. The kit ships `.tsx`. Vite transpiles it, but keep app source `.jsx`. If
   ESLint complains about `.tsx`, scope the ignore rather than loosening the
   whole config.
7. Make the card responsive at 390 px and make it still under reduced motion.
8. For a one-off figure that should not live in the app, use the framework-free
   build script (see below) to emit a standalone `.svg` or `.html`, then embed
   the SVG markup in a component.

### Framework-free path (standalone SVG or HTML)

From `.agents/skills/anatomy/`:

```bash
node examples/dial-indicator/build.mjs          # writes a standalone page
node examples/dial-indicator/build.mjs --light  # light theme
```

A lone `.svg` file comes from `figureSvg({ standalone: "light" })`. A full
page comes from `pageHtml({ script: kitScript() + live })`; add `glScript()`
when the figure has a shader.

### Workflow (short form)

1. **Size it** — Figure (40–80 parts, ≤1 WebGL layer, under an hour), Hero
   (80–150 parts, 2–4 hours), Epic (6+ hours; propose a Hero instead).
2. **Truth first** — collect real numbers and behaviour; put the model in a
   small pure module and drive the readout, motion and caption from it.
3. **Invent the object** — a real machine whose working *is* the idea. Never
   copy a reference image; take its finish, not its object.
4. **Parts list** — at least 40 parts grouped as base, structure, mechanism,
   controls, and the one lit subject. Every part sits on another part.
5. **Plan the world** — 1 world unit ≈ 1 px; x/y on the floor, z up; azimuth
   45° (35–60° for a long side), elevation 30° (higher for open objects); fit
   with `fitProjection`.
6. **Build geometry once** — `slabOf`, `cylinder`, `extrude`, `planOutline`,
   `topTicks`, `knurl`, `coil`, `radialTicks`; `lathe.mjs` for round parts,
   `tube.mjs` for pipes/cables. Move parts with `translateAlong`.
7. **Paint back to front** — `depthOf`, split wraparound parts into back/front
   halves. For pipes/cables/round parts use `A.recorder`, `A.settle`,
   `A.auditOrExit`.
8. **Frame it** — card with `Fig n`, title, hint, live readout, legend keys,
   true caption; words stay out of the drawing.
9. **Make it live** — calm time-based motion, idle tour, pointer + keyboard,
   stop offscreen, still under reduced motion.
10. **Verify like a critic** — read every PNG; run the audit and line check to
    zero; 4× close-ups of every junction in both themes.

### Craft rules that matter most

- Solids, not wireframes: filled paper colour, painted back to front.
- Let `extrude` shade; use `flat` only for floors and thin inlays.
- Tone hierarchy: base/feet `lo`, structure `mid`, subject `hi`, exactly one
  `lit` accent.
- Small precise detail, never noise: bevels 0.4–1.6, grooves inset 3–5,
  screws 0.4–0.55, ticks every 4–5 units.
- Every line resolves on a face, another line, or a terminal dot.
- No pipe or cable passes through anything, at rest or in motion.
- Crossings are drawn in true depth order (`A.settle` + audit), never tuned by
  eye.
- Curved surfaces shade smoothly, never in a staircase.
- A texture ends on a real edge or fades; never stops mid-surface.
- Shaders never pop or cut off; the SVG must still read without WebGL.
- Composition: figure centred, 55–65% of the card, still readable at 390 px.

### Verification commands

Run these from `.agents/skills/anatomy/` (or pass absolute paths):

```bash
node examples/dial-indicator/build.mjs                       # smoke test
node build.mjs --audit                                       # geometry audit
node scripts/lines.mjs page.html --out shots/lines.png       # line-end check
node scripts/capture.mjs page.html --out shots/page.png      # screenshot
node scripts/drive.mjs page.html --script ... --out shots/   # sequences
```

Requirements: Node.js 20.10+ (the project has Node 24) and Chrome or Chromium
for the browser checks. Set `CHROME_PATH` if Chrome is not in a standard
location. The checks are optional for the figure to exist but required by the
skill's quality bar.

### Pitfalls

- The installed skill is a vendored dependency. Make app changes in `src/`,
  not inside `.agents/skills/anatomy/`.
- Do not add `.skills` to `opencode.json` `skills.paths`; it would load a
  second `anatomy` and opencode requires unique skill names.
- Skill scripts assume the working directory is the skill root. If you run
  them from the project root, use absolute paths or `workdir`.
- Anatomy is not a chart library. If the request is a plot, use a chart
  library instead.
