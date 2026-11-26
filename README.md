<!-- killslop-disable-file buzzword-copy lorem-ipsum -->
![Kill AI Slop](assets/banner.png)

# Kill AI Slop

[Indonesia](README.md) · [English](README.en.md)

Toolkit agent buat nge-audit, ngerombak, dan ngebangun UI yang beneran nyambung ke produknya—bukan template generik yang dipoles terus dibilang inovasi. Isinya satu skill inti, lima skill spesialis, adapter plugin, CLI buat lint dan install, plus quality harness.

**Pegangan utamanya:** pola populer itu bukan dosa. Jangan asal ganti sesuatu cuma biar kelihatan beda. Ubah yang memang bikin tugas pengguna makin susah, desain nggak konsisten, aksesibilitas jebol, atau karakter produk hilang. Linter cuma ngasih sinyal heuristik—bukan hakim buat ngecap UI sebagai “AI slop” dan bukan pengganti cek visual. Jadi jangan sok vonis cuma gara-gara satu warning.

## Mulai cepat

Butuh Node.js 20.12 atau lebih baru.

```sh
npm ci
npm run ci
node cli/index.mjs list
node cli/index.mjs lint src --format text
node cli/index.mjs contrast "#0B0B0F" "#F7F6F3"
```

Semua rule bawaan berstatus **warning advisory**. Kalau lint nemu sesuatu, itu sinyal buat dicek—bukan kiamat, dan command tetap jalan. Mau menjadikannya quality gate? Atur `--strict`, `--max-warnings N`, atau severity eksplisit di `.killslop.json`.

```sh
node cli/index.mjs lint src --format github --max-warnings 10
node cli/index.mjs lint src --strict
```

Output JSON, anotasi GitHub Actions, suppression, konfigurasi, dan batas heuristik dibahas di [GUIDE.md](GUIDE.md).

## Pasang skill

```sh
node cli/index.mjs init --agent claude --dry-run
node cli/index.mjs init --agent claude
node cli/index.mjs init --agent all --dry-run
```

Atau tentukan sendiri folder tujuan skill-nya:

```sh
node cli/index.mjs install --target ./.agents/skills --dry-run
node cli/index.mjs install --target ./.agents/skills
```

Installer ngecek konflik sebelum nulis, nolak symlink di jalur target, dan nggak bakal diam-diam nimpa file yang beda. Pakai `--replace` (atau alias `--force`) hanya kalau memang kamu pilih; file lama bakal dicadangkan dengan nama unik.

## Isi repo

- **Core:** [SKILL.md](SKILL.md), prosedur di [agents.md](agents.md), panduan pola di [skills.md](skills.md), dan prinsip visual di [soul.md](soul.md).
- **Lima skill spesialis:** [UI](skills/kill-ai-slop-ui/SKILL.md), [copy](skills/kill-ai-slop-copy/SKILL.md), mobile, aksesibilitas, dan implementasi kode—semuanya ada di [`skills/`](skills/).
- **CLI:** lint, hook Claude Code, pemasangan agent, daftar rule, dan pemeriksa kontras—tanpa dependency runtime.
- **Harness:** tes CLI dan rule, fixture, kasus evaluasi, pemeriksaan manifest dan tautan, sinkronisasi versi dan skill, plus CI lintas OS dan versi Node.
- **Adapter:** Agents, Claude Code, Cline, Codex, Cursor, Kimi, Oh My Pi, dan Qoder.
- **Referensi dan template:** [daftar sumber UI](skills/kill-ai-slop-ui/references/sources.md), [template token CSS](skills/kill-ai-slop-ui/references/tokens-template.css), logo, dan banner.

Sumber kanonis skill ada di empat file root. Kalau mengubah isinya, jalankan `npm run sync-skills`; jangan edit salinan generated langsung.

## Hook Claude Code

Plugin menjalankan hook `PostToolUse` untuk file yang ditulis atau diedit. Hasil lint nambah konteks buat agent, tapi sifatnya advisory dan hook selalu keluar dengan status 0—heuristik nggak boleh ngeblokir kerjaan. Protokolnya sudah dites dengan input simulasi, tapi belum diverifikasi di sesi Claude Code live.

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

Mau pasang lokal tanpa flow marketplace? Jalankan `node cli/index.mjs init --agent <name> --dry-run` dulu, terus cek rencana file-nya sebelum lanjut.

## Verifikasi

```sh
npm ci
npm run ci
npm --prefix cli test
node cli/index.mjs lint cli/test/fixtures/slop.html --format json
```

`npm run ci` ngecek sinkronisasi generated files, struktur, manifest, tautan, dan tes. Cek visual serta aksesibilitas tetap harus dilakukan terpisah di proyek target—linter nggak merender halaman, jadi jangan berharap dia bisa menilai tampilan.

Baca [GUIDE.md](GUIDE.md) buat kontrak perintah dan batas rule. Untuk kontribusi, keamanan, dan rencana proyek, cek [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), dan [ROADMAP.md](ROADMAP.md).
