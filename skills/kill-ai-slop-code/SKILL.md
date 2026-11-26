---
name: kill-ai-slop-code
description: Implementasikan atau rapikan kode UI setelah diagnosis visual yang jelas—gunakan komponen dan token yang ada, hindari dependency atau rewrite tak perlu, dan verifikasi perilaku serta hasilnya.
---

# Kill AI Slop — Code

Gunakan ketika tugas mencakup perubahan kode untuk mengatasi masalah UI yang telah diidentifikasi. Untuk perombakan visual, muat core `kill-ai-slop` dan skill `kill-ai-slop-ui` bila relevan.

## Cara implementasi

1. **Telusuri sumber tampilan.** Temukan route, komponen, token, CSS, aset, dan tes terkait. Pastikan file yang diubah memang penyebab masalah.
2. **Jaga batas.** Ubah bagian minimum yang menyelesaikan temuan tanpa merusak kontrak komponen, aksesibilitas, route, data, atau state.
3. **Reuse sebelum menambah.** Pakai design tokens, komponen, ikon, font, dan dependency yang ada. Jangan memasang package baru jika API native atau sistem proyek sudah cukup.
4. **Hindari tambalan rapuh.** Hindari selector global tak terkendali, magic numbers berulang, duplikasi komponen, inline styles yang tidak konsisten, dan CSS khusus satu viewport tanpa alasan.
5. **Jaga semantik.** Gunakan elemen HTML sesuai peran, label yang terhubung, status fokus, dan behavior keyboard; jangan mengganti kontrol interaktif dengan elemen dekoratif.
6. **Uji regresi.** Jalankan pemeriksaan proyek, uji state dan breakpoint yang tersentuh, cek console/layout, serta review diff. Jangan hapus tes atau menutupi kegagalan yang sudah ada.
7. **Lapor akurat.** Sebutkan file/area yang berubah, alasan, perintah tes dan statusnya, serta pemeriksaan manual yang belum dilakukan.

Jangan menilai kualitas kode dari jumlah baris atau mengklaim hasil visual tanpa melihat hasil terender.