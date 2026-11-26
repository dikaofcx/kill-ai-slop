# Agent Playbook — Kill AI Slop

Gunakan playbook ini untuk tugas multi-langkah. Untuk audit kecil, ambil bagian yang relevan dan jangan memaksakan proses penuh.

## 1. Tetapkan kontrak perubahan

Catat halaman/route/komponen, pengguna sasaran bila diketahui, stack, breakpoint, kebutuhan brand, fungsi yang harus tetap, batas waktu/teknis, serta mode **audit** atau **implementasi**. Jangan mengubah scope diam-diam.

Jika konteks tidak lengkap, periksa repo, design tokens, konten, screenshot, dan state yang tersedia. Pisahkan:

- **Fakta:** terlihat di kode, tampilan, dokumen, atau brief.
- **Asumsi:** belum dibuktikan; pilih yang aman dan mudah dibatalkan.
- **Pertanyaan pemblokir:** jawaban yang dapat mengubah arah, perilaku, atau risiko perubahan.

## 2. Ambil baseline dan bukti

Periksa tampilan terender bila dapat diakses; baca struktur dan komponen yang menyebabkannya. Catat viewport, browser/device bila relevan, dan state yang diamati. Jangan menyimpulkan masalah dari screenshot yang terpotong atau sekadar dari nama kelas CSS.

Sebelum edit, pastikan proyek saat ini bersih dari perubahan yang bukan bagian tugas. Jangan membuang atau menimpa kerja yang sudah ada.

## 3. Buat diagnosis ringkas

Pilih hingga 3–7 temuan utama. Untuk tiap temuan, tulis:

- **Bukti:** elemen, lokasi, state, atau perilaku yang benar-benar diamati.
- **Dampak:** apa yang jadi sulit, tidak terbaca, tidak konsisten, atau kurang jelas bagi pengguna.
- **Keyakinan:** tinggi/sedang/rendah; tandai bila masih dugaan.
- **Perbaikan terkecil yang layak:** apa yang perlu berubah dan apa yang tidak perlu disentuh.

Jangan melabeli pola sebagai “AI slop” hanya karena populer. Jika tidak ada masalah nyata, jangan mengarang temuan agar laporan terlihat produktif.

## 4. Tetapkan arah dan sistem

Tulis satu kalimat arah visual yang terkait dengan produk dan tugas pengguna. Pilih hanya token yang dibutuhkan: peran tipografi, warna semantik, grid, skala spacing, radius, border/elevasi, ikon, dan motion. Reuse sistem yang sudah ada jika masih layak. Catat alasan, sumber referensi yang benar-benar dilihat, dan trade-off.

## 5. Implementasikan dengan batas jelas

Urutkan perubahan berdasarkan dampak: hierarki dan tipografi, layout, warna, spacing, detail permukaan, ikon/motion, lalu copy. Kerjakan seluruh area yang perlu konsisten, tetapi jangan merombak bagian yang tidak termasuk scope. Utamakan native components dan dependency yang sudah tersedia. Jangan membuat copy, metrik, testimoni, fitur, atau bukti produk fiktif.

Jika permintaan **audit saja**, berhenti sebelum mengedit file. Jika arah penting belum diputuskan dan pilihannya akan terlihat jelas berbeda, tunjukkan opsi sebelum menerapkan perubahan yang mahal dibalik.

## 6. Verifikasi yang benar-benar dilakukan

Pilih pemeriksaan sesuai perubahan:

- build/test/lint proyek yang tersedia;
- viewport sempit dan lebar yang relevan, termasuk zoom/reflow jika menyentuh layout;
- state utama: normal, hover/focus, disabled, empty, error, loading bila ada;
- keyboard, urutan fokus, label, kontras, target interaksi, dan reduced motion;
- overflow, teks terpotong, console error, dan layout shift yang tampak.

Rekam perintah atau cara pemeriksaan dan hasil singkatnya. Bila browser/screenshot tidak tersedia, jangan mengklaim visual QA telah selesai.

## 7. Format laporan

Mulai dengan arah dan hasil. Untuk perubahan implementasi, gunakan tabel ringkas:

| Area | Perubahan | Bukti / alasan | Verifikasi |
|---|---|---|---|
| Header / hero | Perubahan konkret | Dampak yang ditemukan | Viewport/state/tes |

Akhiri dengan bagian penting yang dipertahankan, tes yang dijalankan dan statusnya, serta batasan atau risiko tersisa. Untuk audit saja, urutkan temuan menurut dampak dan sertakan lokasi serta usulan perbaikan.

## Gerbang review

Jangan tandai selesai bila:

- perubahan melampaui scope tanpa alasan atau izin;
- fungsi, semantik, aksesibilitas, atau konten penting rusak;
- ada klaim tanpa sumber atau tes diklaim padahal tidak dijalankan;
- laporan tidak membedakan observasi dengan asumsi;
- ada perubahan visual yang tidak dapat dihubungkan dengan temuan.
