# Roadmap

Kandidat kerja, bukan janji. Prioritasnya mengikuti kebutuhan nyata dan temuan regresi.

## Toolkit awal — v0.1.0

- Skill inti dan lima skill spesialis untuk UI, copy, mobile, aksesibilitas, serta implementasi.
- Adapter manifest untuk delapan ekosistem agent.
- CLI untuk lint, pemasangan aman, audit, pemeriksa kontras, dan hook advisory.
- Generator sumber, index skill, kasus evaluasi perilaku, smoke tests, dan CI lintas OS/Node.

## Berikutnya, bila ada kebutuhan nyata

- Uji pemasangan tiap adapter pada versi agent/client yang didukung dan catat batasannya.
- Resolve CSS custom properties agar rule font, gradient, dan spacing dapat melihat nilai `var()` secara aman.
- Tambah dukungan `oklch()` pada deteksi gradient setelah false-positive dan batas sintaks diuji.
- Pertimbangkan `--fix` hanya untuk transformasi mekanis yang semantik dan hasilnya dapat dibuktikan, misalnya nilai spacing pada kasus yang jelas.
- Tambah pemeriksaan hasil render melalui browser headless untuk kontras terkomputasi, panjang teks, dan target sentuh; jangan menyebut lint statis sebagai audit visual.
- Periksa konsistensi easing serta library animasi JavaScript hanya bila konteks proyek cukup untuk menghindari temuan spekulatif.
- Perluas kasus evaluasi dari regresi nyata, bukan dari anti-pattern yang dibuat-buat.
- Pertimbangkan dokumentasi berbahasa lain bila ada pengguna yang membutuhkannya.
- Pertimbangkan paket publik atau marketplace hanya setelah pemilik menyetujui rilis, lisensi, dan aset.

## Bukan tujuan

- Memaksakan satu gaya visual. Toolkit memberi metode, bukti, dan opsi—bukan estetika universal.
- Menganggap pola populer, pilihan brand, atau layout tertentu sebagai kesalahan tanpa konteks produk dan pengguna.
