<!-- killslop-disable-file buzzword-copy lorem-ipsum -->
![Kill AI Slop](assets/banner.png)

# Kill AI Slop

Toolkit agent untuk mengaudit, merancang ulang, dan membangun UI yang terasa sesuai dengan produk—bukan hasil template generik. Isinya satu skill inti, lima spesialis, adaptor plugin, CLI linter/installer, dan quality harness.

**Prinsip utama:** pola populer bukan masalah dengan sendirinya. Ubah hanya keputusan yang terbukti mengaburkan tugas, merusak konsistensi, aksesibilitas, atau karakter produk. Linter memberi sinyal heuristik; ia tidak memberi skor otomatis “AI slop” dan tidak menggantikan pemeriksaan visual.

## Mulai cepat

Butuh Node.js 20.12 atau lebih baru.

```sh
npm ci
npm run ci
node cli/index.mjs list
node cli/index.mjs lint src --format text
node cli/index.mjs contrast "#0B0B0F" "#F7F6F3"
```

Semua aturan bawaan lint berstatus **warning advisory** dan tidak menggagalkan command. Gunakan `--strict`, `--max-warnings N`, atau severity eksplisit di `.killslop.json` bila proyek memang ingin menjadikannya quality gate.

```sh
node cli/index.mjs lint src --format github --max-warnings 10
node cli/index.mjs lint src --strict
```

Output JSON, GitHub Actions annotations, suppressions, konfigurasi, dan keterbatasan heuristik dijelaskan di [GUIDE.md](GUIDE.md).

## Pasang skill

```sh
node cli/index.mjs init --agent claude --dry-run
node cli/index.mjs init --agent claude
node cli/index.mjs init --agent all --dry-run
```

Alternatifnya, tentukan tujuan skill sendiri:

```sh
node cli/index.mjs install --target ./.agents/skills --dry-run
node cli/index.mjs install --target ./.agents/skills
```

Installer memeriksa konflik sebelum menulis, menolak symlink pada jalur target, dan tidak menimpa file berbeda diam-diam. `--replace` atau alias `--force` hanya digunakan atas pilihan pengguna dan menyimpan backup unik.

## Isi repo

- **Core:** [SKILL.md](SKILL.md), dengan prosedur di [agents.md](agents.md), panduan pola di [skills.md](skills.md), dan prinsip visual di [soul.md](soul.md).
- **Lima skill spesialis:** [UI](skills/kill-ai-slop-ui/SKILL.md), [copy](skills/kill-ai-slop-copy/SKILL.md), mobile, aksesibilitas, dan implementasi kode di [`skills/`](skills/).
- **CLI:** lint, hook Claude Code, pemasangan agent, daftar rule, dan pemeriksa kontras—tanpa dependency runtime.
- **Harness:** tes CLI/rule, fixture, kasus evaluasi, pemeriksaan manifest/tautan, sinkronisasi versi dan skill, serta CI lintas OS dan Node.
- **Adaptor:** Agents, Claude Code, Cline, Codex, Cursor, Kimi, Oh My Pi, dan Qoder.
- **Referensi dan template:** [daftar sumber UI](skills/kill-ai-slop-ui/references/sources.md), [template token CSS](skills/kill-ai-slop-ui/references/tokens-template.css), logo, dan banner.

Sumber kanonis skill ada di empat file root. Setelah mengubahnya, jalankan `npm run sync-skills`; jangan edit salinan generated secara langsung.

## Hook Claude Code

Plugin menjalankan hook `PostToolUse` untuk file yang ditulis atau diedit. Lint memberi konteks tambahan kepada agent, tetapi hook selalu advisory dan keluar dengan status 0 agar heuristic tidak memblokir pekerjaan. Protokol diuji dengan input simulasi; belum diverifikasi dalam sesi Claude Code live.

## Plugin dan batas publikasi

Manifest adapter ada di `.agents/plugins/`, `.claude-plugin/`, `.cline-plugin/`, `.codex-plugin/`, `.cursor-plugin/`, `.kimi-plugin/`, `.omp-plugin/`, dan `.qoder-plugin/`. Repo ini belum diterbitkan ke marketplace atau npm; jalur integrasi belum diuji pada setiap client agent. Repository ini publik untuk dibaca; penggunaan fitur atau layanan client tertentu tetap mengikuti izin dan konfigurasi masing-masing.

### Contoh perintah client

Perintah berikut dipertahankan dari paket sumber, tetapi belum diuji pada versi client terkini. Repository ini publik dan dapat diakses dari GitHub; ketersediaan plugin tetap bergantung pada dukungan serta konfigurasi client masing-masing. Jika perintah berubah, ikuti dokumentasi resmi client dan laporkan koreksi di issue.

```text
# Claude Code
/plugin marketplace add https://github.com/dikaofcx/kill-ai-slop
/plugin install kill-ai-slop@kill-ai-slop

# Kimi Code
/plugins install https://github.com/dikaofcx/kill-ai-slop
```

```sh
# Codex
codex plugin marketplace add dikaofcx/kill-ai-slop
codex plugin add kill-ai-slop@kill-ai-slop

# Cursor agent CLI
agent plugin marketplace add https://github.com/dikaofcx/kill-ai-slop

# Cline CLI
cline plugin install https://github.com/dikaofcx/kill-ai-slop.git

# Oh My Pi
omp plugin marketplace add dikaofcx/kill-ai-slop
omp plugin install kill-ai-slop@kill-ai-slop

# Pi
pi install git:github.com/dikaofcx/kill-ai-slop
```

Untuk pemasangan lokal tanpa flow marketplace, gunakan `node cli/index.mjs init --agent <name> --dry-run` terlebih dahulu dan periksa rencana file yang akan dipasang.

## Verifikasi

```sh
npm ci
npm run ci
npm --prefix cli test
node cli/index.mjs lint cli/test/fixtures/slop.html --format json
```

`npm run ci` memeriksa sinkronisasi generated files, struktur/manifest/tautan, dan tes. Periksa hasil visual dan aksesibilitas di proyek target secara terpisah; linter tidak merender halaman.

Lihat [GUIDE.md](GUIDE.md) untuk kontrak perintah dan batas rule, serta [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), dan [ROADMAP.md](ROADMAP.md) untuk kontribusi. Struktur adaptor terinspirasi oleh [`miqdadbadjuber/anti-slop`](https://github.com/miqdadbadjuber/anti-slop); konten, aturan, dan harness di sini disusun untuk Kill AI Slop.
