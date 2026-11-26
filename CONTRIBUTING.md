# Berkontribusi

Perubahan sebaiknya menjawab kebutuhan nyata atau memperbaiki regresi yang bisa ditunjukkan. Kritik sebuah sinyal harus disertai konteks; jangan mengubah selera pribadi menjadi larangan universal.

## Lingkungan dan sumber kanonis

Gunakan Node.js 20.12 atau lebih baru. CLI tidak memiliki dependency runtime. Dari clone repository, jalankan `npm ci`, lalu `npm run ci`.

Sumber skill inti ada di `SKILL.md`, `skills.md`, `soul.md`, dan `agents.md`; spesialis ada di `skills/<nama>/SKILL.md`. Setelah mengubah sumber inti, jalankan `npm run sync-skills`. Jangan mengedit manual berkas generated seperti `skills/kill-ai-slop/`, `skills/index.json`, `antislop.md`, atau salinan aset di `cli/skills/` dan `cli/rules/`.

Nama folder skill harus sama dengan `name` di frontmatter. Deskripsi perlu menjelaskan kapan skill dipakai, panjangnya 80–1024 karakter, dan harus tetap cukup spesifik untuk memicu penggunaan yang tepat.

## Mengubah rule atau perilaku CLI

Untuk rule, ubah `cli/lib/rules.mjs`, tambahkan kasus positif dan negatif beserta edge case di `cli/test/lint.test.mjs`, dan perbarui tabel serta batasnya di `GUIDE.md`. Tambahkan fixture HTML bila perlu menguji alur CLI penuh. Rule baru harus berstatus `warn` secara default; hanya konfigurasi eksplisit proyek pengguna yang boleh menjadikannya `error`.

Perubahan lain pada CLI perlu mencakup tes unit atau smoke yang membuktikan perilaku, termasuk exit code, output, dan efek sampingnya. Untuk installer, hook, atau sinkronisasi aset, uji jalur symlink, konflik, dry-run, serta kegagalan yang relevan.

## Manifests dan versi

Metadata adapter, path aset, dan versi harus tetap konsisten. Versi root `package.json` adalah sumber tunggal; sinkronkan manifest dan lockfile dengan `node scripts/sync-version.mjs` atau berikan versi baru, misalnya `node scripts/sync-version.mjs 0.2.0`. Jangan mengubah hanya satu manifest.

## Sebelum pull request

```sh
npm ci
npm run sync-skills       # bila sumber skill berubah
npm run ci
npm --prefix cli test
node cli/index.mjs lint cli/test/fixtures/slop.html --format json
git diff --check
git status --short
```

Jelaskan hasil yang benar-benar diuji, batas yang belum diverifikasi, alasan perubahan, dan konteks produk yang mendasari keputusan. Jangan memasukkan token, kredensial, screenshot sensitif, atau data pengguna ke commit, fixture, issue, maupun dokumentasi.
