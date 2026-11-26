---
name: kill-ai-slop-mobile
description: Audit atau perbaiki layout web dan aplikasi pada layar sempit—reflow, navigasi, formulir, target sentuh, konten, dan state—tanpa sekadar mengecilkan tampilan desktop.
---

# Kill AI Slop — Mobile

Gunakan saat breakpoint sempit, layar ponsel, atau alur sentuh menjadi fokus. Pertahankan informasi dan fungsi; ubah prioritas presentasi hanya bila tugas pengguna menuntutnya.

## Prosedur

1. **Pilih viewport nyata.** Gunakan ukuran perangkat/breakpoint dari brief atau konfigurasi proyek. Jika tidak tersedia, pilih ukuran sempit dan ukuran lebar yang mewakili; laporkan nilainya.
2. **Uji konten panjang.** Periksa judul, bahasa dengan kata panjang, harga/angka, daftar, tabel, notifikasi, dan kontrol. Cari overflow, clipping, overlap, serta urutan baca yang berubah.
3. **Ikuti alur utama.** Coba navigasi, form, dialog, CTA sticky, keyboard virtual bila tersedia, state error/empty, dan scroll. Pastikan kontrol penting tidak tertutup atau terpisah dari konteksnya.
4. **Atur ulang, jangan sekadar mengecilkan.** Pilih stack, grid, disclosure, atau prioritas konten berdasarkan tugas layar. Hindari menyembunyikan fungsi tanpa alternatif.
5. **Periksa interaksi pointer dan keyboard.** Tinjau area target serta jarak antar kontrol; gunakan WCAG 2.2 SC 2.5.8 sebagai minimum pointer 24×24 CSS px dengan pengecualian yang berlaku. Area sentuh lebih besar dapat meningkatkan kenyamanan bila ruang memungkinkan.
6. **Verifikasi reflow dan zoom.** Cek layout pada lebar yang relevan, teks yang diperbesar, fokus, orientasi bila produk mendukungnya, serta reduced motion.

Jangan mengklaim “mobile responsive” hanya karena satu viewport berhasil dimuat. Laporkan ukuran, alur, state, dan masalah yang belum diperiksa.