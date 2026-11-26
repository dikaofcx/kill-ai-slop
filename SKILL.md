---
name: kill-ai-slop
description: Audit, restyle, atau bangun antarmuka web dan mobile agar terasa spesifik pada produk, bukan hasil template generik. Gunakan saat mengerjakan UI, landing page, aplikasi, layar mobile, atau saat diminta menghilangkan AI slop pada desain dan implementasi.
---

# Kill AI Slop — Core

Hilangkan keputusan generik hanya ketika ada bukti bahwa keputusan itu merugikan kejelasan, fungsi, atau karakter produk. Ini bukan daftar larangan visual dan bukan alasan untuk mengganti identitas yang sudah bekerja.

## Pilih mode kerja

- **Audit saja:** jangan mengubah kode. Catat apa yang benar-benar terlihat, dampaknya bagi pengguna, dan perbaikan terkecil yang layak.
- **Implementasi:** audit terlebih dahulu, lalu ubah hanya area yang termasuk cakupan permintaan. Pertahankan konten, struktur, semantik, brand, dan perilaku yang tidak diminta untuk diubah.
- **Dari nol:** gali konteks produk dan bukti yang tersedia sebelum memilih arah visual. Tandai asumsi; jangan mengisi kekosongan dengan klaim, fitur, atau aset rekaan.

Jika cakupan belum jelas, gunakan pilihan aman yang mudah dibatalkan. Tanyakan hanya ketika informasi yang hilang dapat mengubah arah, ruang lingkup, atau perilaku penting.

## Peta pola awal

Pola berikut adalah pemicu audit, bukan bukti otomatis bahwa desain salah. Pilih arah pengganti hanya jika cocok dengan konten, brand, tugas layar, dan kebutuhan aksesibilitas.

| Sinyal yang patut diperiksa | Arah yang bisa diuji | Bukti yang perlu dilihat |
|---|---|---|
| Satu font populer untuk semua peran | Pasangkan display dan body, atau gunakan typeface brand | Keterbacaan, aksara, lisensi, dan token yang sudah ada |
| Gradien ungu-biru yang ditempel di banyak area | Gunakan palet peran yang lebih terukur atau gradien satu keluarga warna | Identitas brand, kontras, dan kompetitor produk |
| Emoji dipakai sebagai ikon UI | Pakai satu sistem ikon konsisten dengan label aksesibel | Makna, platform, ukuran, dan kebutuhan label |
| Tiga kartu identik untuk semua konten | Coba daftar editorial, hierarki unggulan, atau grid dengan bobot berbeda | Apakah informasi memang setara atau punya prioritas |
| Shadow besar di setiap kotak | Gunakan border atau elevasi hanya pada elemen yang benar-benar melayang | Hierarki lapisan, focus, dan kontras tepi |
| Radius besar seragam pada semua komponen | Tetapkan token radius sesuai peran komponen | Konsistensi sistem dan kebutuhan target sentuh |
| Headline penuh buzzword | Sebutkan tindakan atau manfaat yang dapat dibuktikan | Sumber klaim, pengguna, dan hasil produk sebenarnya |
| Hero hanya judul, subjudul, tombol | Tambahkan visual produk hanya bila aset/data nyata tersedia | Akurasi aset, relevansi, dan waktu muat |
| Semua bagian diratakan ke tengah | Pilih alignment berdasarkan arah baca dan jenis konten | Panjang teks, bahasa/aksara, dan urutan baca |
| Spacing tanpa skala | Gunakan token proyek atau skala yang konsisten | Density, breakpoint, dan sistem yang sudah dipakai |
| Dark mode hitam/putih murni | Uji tinted neutral bila lebih nyaman dan sesuai brand | Kontras untuk semua state, bukan hanya layar statis |

## Alur wajib

1. **Kunci cakupan.** Identifikasi halaman/komponen, stack, breakpoint, brand, bagian yang harus dipertahankan, dan apakah pengguna meminta audit atau implementasi.
2. **Lihat hasil nyata.** Periksa kode, token, aset, dan tampilan terender yang tersedia. Utamakan bukti dari produk; jangan menilai berdasarkan selera atau prompt saja.
3. **Diagnosis seperlunya.** Catat maksimal 3–7 masalah berdampak tinggi (lebih sedikit untuk perubahan kecil). Setiap temuan harus menyebut bukti spesifik dan dampak pengguna. Pisahkan fakta dari dugaan.
4. **Tetapkan satu arah.** Rumuskan satu kalimat arah visual, lalu pilih token yang relevan—tipografi, warna, grid, spacing, radius, border/elevasi, ikon, dan motion. Gunakan token serta komponen proyek jika sudah ada.
5. **Ubah secara konsisten.** Dahulukan hierarki dan struktur; hapus noise sebelum menambah dekorasi. Jangan menambah dependency, pola, atau aset jika tidak menyelesaikan masalah yang ditemukan.
6. **Verifikasi.** Periksa breakpoint dan state interaksi yang terdampak; jalankan tes yang tersedia. Cek overflow, keterbacaan, kontras, keyboard/focus, target interaksi, serta reduced motion. Jangan mengklaim pemeriksaan yang tidak dilakukan.
7. **Laporkan faktual.** Ringkas arah, perubahan per area dan alasannya, bagian penting yang dipertahankan, hasil tes, serta batasan yang tersisa.

## Gunakan referensi sesuai kebutuhan

- Baca [agents.md](agents.md) sebelum perubahan multi-langkah; gunakan template laporan di sana.
- Baca [skills.md](skills.md) untuk heuristik, checklist, dan sumber visual. Daftar pola adalah pemicu pemeriksaan, bukan larangan.
- Baca [soul.md](soul.md) untuk prinsip keputusan jika arah visual belum jelas.
- Untuk tugas khusus, pilih satu atau lebih skill terkait di `skills/`: `kill-ai-slop-ui`, `kill-ai-slop-copy`, `kill-ai-slop-mobile`, `kill-ai-slop-a11y`, atau `kill-ai-slop-code`. Jangan muat semuanya tanpa alasan.

## Gunakan harness sebagai sinyal

- Dari clone repo, jalankan `node cli/index.mjs lint <paths>` untuk melihat pola yang mungkin perlu ditinjau. Semua rule bawaan bersifat warning advisory; gunakan `--strict` atau severity eksplisit pada `.killslop.json` hanya jika proyek memilih threshold tersebut.
- Jangan mengubah UI hanya untuk menghilangkan temuan regex. Periksa konteks produk, brand, kode dan hasil terender, lalu perbaiki hanya masalah yang benar-benar ada.
- Hook Claude Code `PostToolUse` mengembalikan temuan sebagai konteks tambahan dan selalu non-blocking. Ia bukan instruksi untuk mengubah setiap pola secara otomatis.
- `node cli/index.mjs contrast <foreground> <background>` memeriksa warna opaque yang didukung; warna transparan harus dikompositkan dahulu. Rasio tidak menggantikan review state dan pengecualian WCAG.

## Gerbang selesai

Sebelum menyebut pekerjaan selesai, pastikan:

- Perubahan menjawab temuan yang terlihat, bukan stereotip tentang desain AI.
- Brand, konten, struktur, aksesibilitas, dan fungsi yang harus dipertahankan tetap utuh.
- Tidak ada klaim, angka, testimonial, atau bukti produk yang dibuat-buat.
- Hasil diperiksa pada konteks yang relevan; semua yang belum diuji disebutkan apa adanya.
- Setiap perubahan utama dapat dijelaskan dengan dampak spesifik bagi pengguna.

Gradien, kartu, radius besar, font populer, atau animasi boleh dipakai bila punya alasan dan diterapkan dengan konsisten. Jangan memberi skor otomatis “AI slop”: penilaian visual memerlukan konteks dan pemeriksaan hasil terender.

## Format laporan singkat

```md
## <area atau section>
- <bukti yang terlihat> → <perubahan atau keputusan mempertahankan> — <dampak bagi pengguna>

Tokens yang berubah: <font, warna, spacing, radius, ikon, motion; tulis “tidak diubah” bila relevan>
Verifikasi: <tes/viewport/state yang benar-benar diperiksa>
Belum diperiksa: <batas yang masih ada>
```
