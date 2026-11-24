import { createHash } from "node:crypto";
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();
const SKILLS_DIR = join(ROOT, ".agents", "skills");
const ARCHIVE_DIR = join(ROOT, ".agents", "skills-archive");
const MIRROR_DIR = join(ROOT, ".skills");
const KIT_SRC = join(SKILLS_DIR, "anatomy", "kit");
const KIT_DST = join(ROOT, "src", "components", "anatomy");
const KIT_FILES = ["iso-kit.mjs", "iso.css", "lathe.mjs"];
const MANIFEST = join(SKILLS_DIR, "README.md");

const errors = [];
const warnings = [];
const notes = [];

const listDirs = (dir) =>
  existsSync(dir)
    ? readdirSync(dir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
        .sort()
    : [];

const walk = (dir, base = dir) => {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, base));
    else out.push(relative(base, full).split(sep).join("/"));
  }
  return out.sort();
};

const sha = (file) => createHash("sha256").update(readFileSync(file)).digest("hex");

const parseFrontmatter = (text) => {
  const clean = text.replace(/^\uFEFF/, "");
  if (!clean.startsWith("---")) return null;
  const end = clean.indexOf("\n---", 3);
  if (end === -1) return null;
  const block = clean.slice(3, end);
  const fields = {};
  for (const line of block.split(/\r?\n/)) {
    const match = /^([A-Za-z0-9_/-]+):\s*(.*)$/.exec(line);
    if (match) fields[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
  }
  return fields;
};

const active = listDirs(SKILLS_DIR);

for (const name of active) {
  const skillFile = join(SKILLS_DIR, name, "SKILL.md");
  if (!existsSync(skillFile)) {
    errors.push(`${name}: SKILL.md tidak ditemukan`);
    continue;
  }
  const text = readFileSync(skillFile, "utf8");
  const fm = parseFrontmatter(text);
  if (!fm) errors.push(`${name}: frontmatter YAML tidak valid`);
  else {
    if (!fm.name) errors.push(`${name}: frontmatter tanpa "name"`);
    else if (fm.name !== name)
      errors.push(`${name}: frontmatter name "${fm.name}" tidak sama dengan folder`);
    if (!fm.description) errors.push(`${name}: frontmatter tanpa "description"`);
    else if (fm.description.length < 40)
      warnings.push(`${name}: description pendek (${fm.description.length} karakter)`);
  }

  const stale = [...text.matchAll(/(?:~\/|\/)?\.claude\/skills|\.venv/g)].map((m) => m[0]);
  if (stale.length) {
    errors.push(
      `${name}: ${stale.length} referensi path usang (${[...new Set(stale)].join(", ")}) di SKILL.md`,
    );
  }

  const scriptsDir = join(SKILLS_DIR, name, "scripts");
  const refs = new Set(
    [...text.matchAll(/scripts\/[A-Za-z0-9_.\-/]+\.(?:py|cjs|mjs|js|sh)/g)].map((m) => m[0]),
  );
  for (const ref of refs) {
    const normalized = ref.replace(/^scripts\//, "");
    if (!existsSync(join(scriptsDir, normalized))) {
      errors.push(`${name}: SKILL.md merujuk "${ref}" yang tidak ada`);
    }
  }
  if (refs.size) notes.push(`${name}: ${refs.size} path script dirujuk, semua diperiksa`);
}

const archived = listDirs(ARCHIVE_DIR);
for (const name of archived) {
  if (active.includes(name)) errors.push(`${name}: ada di skills/ dan skills-archive/ sekaligus`);
  if (!existsSync(join(ARCHIVE_DIR, name, "SKILL.md")))
    warnings.push(`${name}: arsip tanpa SKILL.md`);
}

for (const [src, dst, label] of [
  [join(SKILLS_DIR, "anatomy"), join(MIRROR_DIR, "anatomy"), "mirror .skills/anatomy"],
]) {
  if (!existsSync(src) || !existsSync(dst)) {
    warnings.push(`${label}: direktori sumber/tujuan tidak ada, dilewati`);
    continue;
  }
  const srcFiles = walk(src);
  const dstFiles = walk(dst);
  const missing = srcFiles.filter((f) => !dstFiles.includes(f));
  const extra = dstFiles.filter((f) => !srcFiles.includes(f));
  const differing = srcFiles.filter(
    (f) => dstFiles.includes(f) && sha(join(src, f)) !== sha(join(dst, f)),
  );
  if (missing.length) errors.push(`${label}: hilang di tujuan -> ${missing.join(", ")}`);
  if (extra.length) errors.push(`${label}: hanya ada di tujuan -> ${extra.join(", ")}`);
  if (differing.length) errors.push(`${label}: isi berbeda -> ${differing.join(", ")}`);
  if (!missing.length && !extra.length && !differing.length)
    notes.push(`${label}: ${srcFiles.length} file identik`);
}

const copiedKit = KIT_FILES.filter((f) => existsSync(join(KIT_DST, f)));
const staleKit = copiedKit.filter((f) => sha(join(KIT_SRC, f)) !== sha(join(KIT_DST, f)));
if (staleKit.length)
  errors.push(`anatomy kit vs src/components/anatomy: isi berbeda -> ${staleKit.join(", ")}`);
else if (copiedKit.length)
  notes.push(`anatomy kit vs src/components/anatomy: ${copiedKit.join(", ")} identik`);
const notCopied = KIT_FILES.filter((f) => !existsSync(join(KIT_DST, f)));
if (notCopied.length)
  notes.push(`anatomy kit belum disalin (wajar bila figure tak butuh): ${notCopied.join(", ")}`);

if (existsSync(MANIFEST)) {
  const manifest = readFileSync(MANIFEST, "utf8");
  for (const name of active) {
    if (!manifest.includes("`" + name + "`"))
      errors.push(`manifest: skill aktif "${name}" tidak tercantum di .agents/skills/README.md`);
  }
} else {
  warnings.push("manifest .agents/skills/README.md belum ada");
}

if (!existsSync(KIT_DST)) warnings.push("src/components/anatomy tidak ada");
else if (statSync(KIT_DST).isDirectory()) {
  const extraKit = readdirSync(KIT_DST).filter(
    (f) => !KIT_FILES.includes(f) && !statSync(join(KIT_DST, f)).isDirectory(),
  );
  if (extraKit.length) notes.push(`src/components/anatomy file lokal: ${extraKit.join(", ")}`);
}

for (const note of notes) console.log(`  note  ${note}`);
for (const warning of warnings) console.log(`  warn  ${warning}`);
for (const error of errors) console.error(`  error ${error}`);

console.log(
  `\n${active.length} skill aktif, ${archived.length} arsip, ${errors.length} error, ${warnings.length} warning`,
);
process.exit(errors.length ? 1 : 0);
