<!-- killslop-disable-file buzzword-copy lorem-ipsum -->
# Panduan Kill AI Slop

Panduan ini mencakup penggunaan plugin, pemasangan skill, lint, konfigurasi, dan quality gates. Linter adalah pemeriksa pola teks, bukan penilaian desain.

## Perintah

Dari clone repo, gunakan `node cli/index.mjs`:

```sh
node cli/index.mjs lint [paths...] [--format text|json|github] [--strict] [--max-warnings N] [--config file]
node cli/index.mjs hook
node cli/index.mjs init --agent <name|all> [--global] [--replace] [--dry-run]
node cli/index.mjs rules
node cli/index.mjs contrast <foreground> <background>
node cli/index.mjs --version
```

`--force` adalah alias kompatibilitas untuk `--replace`. Konflik pemasangan disimpan dalam backup; tanpa pilihan itu, konflik menghentikan preflight sebelum ada file yang ditulis.

Exit code: `0` berarti tidak ada threshold yang terlampaui; `1` berarti error yang dikonfigurasi, `--strict` dengan warning, atau jumlah warning melewati `--max-warnings`; `2` berarti argumen, path, atau konfigurasi input tidak valid.

## Aturan lint

Ke-13 rule bawaan berstatus **warning advisory**. Tidak ada rule heuristik yang otomatis menganggap keputusan desain sebagai salah. `--strict` atau severity eksplisit `"error"` pada konfigurasi dapat dipakai sebagai kebijakan proyek.

| Rule | Sinyal yang dicari | Batas penting |
|---|---|---|
| `font-default` | Inter/Roboto sebagai font utama pada deklarasi CSS, fontFamily, Tailwind, Google Fonts, atau next/font | Tidak membaca CSS variable yang belum di-resolve; font sebagai fallback diperbolehkan |
| `gradient-purple-blue` | Gradien dengan stop ungu bersama biru/pink, termasuk beberapa bentuk Tailwind | Heuristik teks; belum menilai konteks brand atau seluruh color syntax |
| `emoji-icon` | Pictograph emoji di markup | Bendera dan simbol teks tertentu dikecualikan; bukan pemeriksaan makna ikon |
| `buzzword-copy` | Frasa pemasaran yang dikenal dan beberapa filler umum | Phrase-based; copy baru tetap perlu review manusia |
| `lorem-ipsum` | Placeholder lorem ipsum umum | Tidak mendeteksi placeholder lain |
| `card-grid-3` | Grid tiga kolom setara | Tidak menilai apakah kontennya memang setara |
| `shadow-heavy` | Blur bayangan besar di CSS, JS, Tailwind, atau drop-shadow | Variabel dan shadow yang dikomposisi kompleks dapat terlewat |
| `radius-blanket` | Radius besar yang berulang dalam satu file | Tidak mengukur konsistensi antarfile atau alasan produk |
| `spacing-off-scale` | Padding, margin, gap, dan Tailwind di luar skala proyek | `calc`, `clamp`, variable, `em`, dan konteks runtime tidak di-resolve |
| `center-all` | Banyak teks yang di-center dalam satu file | Tidak mengetahui panjang teks atau konteks editorial |
| `motion-duration` | Durasi transisi/animasi yang terlalu singkat atau panjang | Tidak membaca library animasi JavaScript atau menilai easing |
| `pure-black-white` | Background hitam/putih murni dalam pola yang dikenal | Tidak memeriksa semua token atau state tema |
| `icon-mix` | Import dari lebih dari satu keluarga ikon pada file yang dilint | Tidak menemukan ikon yang dimuat lewat font atau script eksternal |

Ekstensi yang dipindai mencakup CSS/SCSS/LESS, HTML, JS/TS/JSX/TSX, Vue, Svelte, Astro, Markdown/MDX, dan text. Direktori dependency/build umum dilewati. File di atas 1 MB tidak dipindai. Symlink yang diberikan langsung sebagai target ditolak; symlink tidak diikuti ketika traversal.

## Output dan ambang

```sh
node cli/index.mjs lint src --format text
node cli/index.mjs lint src --format json
node cli/index.mjs lint src --format github --max-warnings 10
node cli/index.mjs lint src --strict
```

- `text` untuk terminal.
- `json` memberi jumlah file, ringkasan, severity, lokasi, rule, dan pesan.
- `github` menghasilkan workflow annotations. Rule bawaan tetap warning.
- `--strict` menjadikan warning sebagai threshold gagal; `--max-warnings N` gagal bila warning lebih dari `N`.

## Konfigurasi

File `.killslop.json` dibaca dari direktori kerja. Alternatifnya berikan `--config path`.

```json
{
  "ignore": ["src/vendor/**", "**/*.stories.tsx"],
  "rules": {
    "card-grid-3": "off",
    "spacing-off-scale": "error"
  },
  "spacingScale": [0, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128],
  "shadowBlurMax": 30,
  "radiusMinPx": 16,
  "radiusRepeat": 3,
  "centerRepeat": 4,
  "motionMinMs": 150,
  "motionMaxMs": 400
}
```

Severity yang diterima: `off`, `warn`, atau `error`. Nilai angka harus finite dan tidak negatif; batas maksimum durasi tidak boleh lebih kecil dari minimum. Config harus berupa JSON object biasa berukuran paling banyak 64 KB. Path config eksplisit yang hilang, symlink, JSON invalid, rule tak dikenal, dan nilai salah mengembalikan exit code 2.

## Pengecualian yang disengaja

Gunakan suppression hanya bila pola memang disengaja. Tambahkan alasan di code review.

```css
/* killslop-disable-next-line font-default -- brand menetapkan font ini */
body { font-family: Inter, sans-serif; }

.button { padding: 13px; } /* killslop-disable-line spacing-off-scale -- target visual mengikuti grid vendor */
```

`killslop-disable-line`, `killslop-disable-next-line`, dan `killslop-disable-file` menerima satu atau beberapa rule ID. Tanpa ID, semua temuan pada cakupan itu disembunyikan.

## Pemeriksa kontras

```sh
node cli/index.mjs contrast "#0B0B0F" "#F7F6F3"
node cli/index.mjs contrast "rgb(0 0 0)" "hsl(0 0% 100%)"
```

Parser mendukung hex, rgb/rgba, hsl/hsla, serta subset nama warna dasar. Angka dan rentang CSS divalidasi. Warna transparan tidak dihitung sebagai rasio tunggal—kompositkan dahulu terhadap background yang benar. Nilai ditampilkan dengan pemotongan dua desimal agar ambang tidak dinaikkan oleh pembulatan. Untuk WCAG 2.2 SC 1.4.3, referensi umum adalah 4.5:1 untuk teks normal dan 3:1 untuk teks besar; periksa state dan pengecualian yang relevan. Rasio saja bukan audit kepatuhan.

## Hook Claude Code

`hooks/hooks.json` mendaftarkan `PostToolUse` pada Write, Edit, dan MultiEdit. Hook membaca JSON event, memeriksa file teks yang didukung, lalu mengembalikan `hookSpecificOutput.additionalContext` dengan exit code 0. Temuan adalah advisory dan tidak memblokir edit. Input malformed, file tak didukung, path di luar project, file besar, symlink, atau config bermasalah dilewati; diagnostics ditulis tanpa mengubah exit code.

Kontrak hook telah diuji dengan payload simulasi. Pemeriksaan ini tidak mengklaim telah diverifikasi dalam sesi Claude Code live.

## Plugin dan pemasangan

Adapter ada di `.agents/plugins/`, `.claude-plugin/`, `.cline-plugin/`, `.codex-plugin/`, `.cursor-plugin/`, `.kimi-plugin/`, `.omp-plugin/`, dan `.qoder-plugin/`. Gunakan flow instalasi resmi client yang relevan. Repo ini belum diterbitkan ke marketplace; manifest lokal bukan bukti semua client sudah diuji.

CLI mendukung skill `claude`, `codex`, `cursor`, `cline`, `qoder`, `opencode`, `gemini`, dan `antigravity`. `init --dry-run` menunjukkan rencana; konflik menghentikan preflight; `--replace` membuat backup unik. Installer menolak symlink pada jalur target dan mencoba memulihkan file yang sudah ditulis bila operasi gagal.

## Quality gates dan pengembangan

```sh
npm ci
npm run sync-skills:check
npm run check
npm test
npm --prefix cli test
node cli/index.mjs lint cli/test/fixtures/slop.html --format json
```

`npm run ci` menjalankan sinkronisasi generated files, repository checker, dan tes. CI mencakup Linux, macOS, Windows, serta Node 20.12 dan 22. `npm test` menjalankan smoke tests dan suite CLI/rule.

Untuk menambah rule:

1. Tambahkan rule dengan default severity `warn` di `cli/lib/rules.mjs`; gunakan `error` hanya melalui konfigurasi pengguna.
2. Tambahkan kasus positif dan negatif beserta edge case yang relevan di `cli/test/lint.test.mjs`.
3. Perbarui tabel dan keterbatasan rule di panduan ini.
4. Jalankan `npm run ci`, `npm --prefix cli test`, dan `git diff --check`.

Edit empat sumber skill di root, lalu jalankan `npm run sync-skills`. Versi root `package.json` adalah satu-satunya sumber versi untuk `scripts/sync-version.mjs`.
