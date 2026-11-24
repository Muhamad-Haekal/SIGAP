# Skill Arsip

Skill di folder ini **tidak** dimuat opencode karena berada di luar
`.agents/skills/`. Disimpan agar perubahan dapat dibatalkan.

## Alasan arsip

| Skill | Alasan |
| --- | --- |
| `ui-styling` | Seluruh isinya shadcn/ui + Tailwind CSS. SIGAP memakai CSS Modules tanpa Tailwind, sehingga saran skill ini bertentangan dengan stack proyek. |
| `banner-design` | Hanya berisi `SKILL.md` + 1 referensi dan bergantung pada skill `frontend-design`, `ai-artist`, `ai-multimodal` yang tidak terpasang, plus path `.claude/skills/.venv` yang tidak ada. Kebutuhan banner tetap tercakup oleh skill `design` (referensi banner + ikon + CIP). |

## Memulihkan

```powershell
Move-Item -LiteralPath ".agents\skills-archive\<nama-skill>" -Destination ".agents\skills\<nama-skill>"
```

Setelah dipulihkan, jalankan `node tools/verify-skills.mjs`. Skill
`banner-design` tetap akan gagal verifikasi sampai dependensinya dipasang.
