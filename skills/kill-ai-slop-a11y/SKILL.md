---
name: kill-ai-slop-a11y
description: Audit atau perbaiki aksesibilitas UI dengan pemeriksaan kontras, keyboard, fokus, label, target interaksi, reflow, dan reduced motion—tanpa mengganti art direction yang tidak bermasalah.
---

# Kill AI Slop — Accessibility

Gunakan untuk review aksesibilitas visual dan interaksi. Perlakukan aksesibilitas sebagai bagian dari desain, bukan tahap finishing. Sebutkan versi/tingkat standar yang benar-benar diperiksa; jangan menyatakan seluruh produk “compliant” dari spot-check.

## Audit berbasis tugas

1. **Tetapkan standar dan cakupan.** Catat halaman, state, input, teknologi bantu bila diuji, serta target WCAG yang diminta. Jika tidak disebutkan, nyatakan bahwa pemeriksaan adalah spot-check, bukan sertifikasi.
2. **Periksa konten dan semantik.** Judul, landmark, nama kontrol, label form, pesan error/status, alt text yang diperlukan, urutan DOM dan urutan baca.
3. **Periksa keyboard/focus.** Navigasi tanpa mouse, urutan dan visibilitas fokus, operasi komponen, dialog, escape/return focus bila relevan.
4. **Periksa tampilan.** Kontras teks dan komponen informatif, zoom/reflow, overflow, status yang tidak hanya dibedakan dengan warna, ukuran/jarak target, dan reduced motion.
5. **Perbaiki penyebabnya.** Ubah token atau komponen yang membuat masalah, bukan sekadar menambah outline/dekorasi satu kali. Pertahankan karakter brand selama tetap jelas.
6. **Verifikasi ulang state terkait.** Catat alat, browser/viewport, nilai yang diukur, state, hasil, pengecualian yang diterapkan, dan pemeriksaan manual yang tersisa.

## Ambang referensi WCAG 2.2

- **SC 1.4.3 Contrast (Minimum):** rasio minimal 4.5:1 untuk teks normal dan 3:1 untuk teks besar. Ada pengecualian, termasuk teks incidental serta logotype; nilai jangan dibulatkan untuk menyatakan lolos. Lihat [W3C Understanding SC 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).
- **SC 2.5.8 Target Size (Minimum):** target pointer sekurangnya 24×24 CSS px, kecuali pengecualian yang dijelaskan standar (misalnya spacing, inline, equivalent, user-agent control, essential). Lihat [W3C Understanding SC 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).

Gunakan alat kontras sebagai kalkulator, bukan auditor otomatis: gradien, gambar, overlay, transparansi, state, font tipis, dan konteks tampilan tetap perlu ditinjau. Jangan menyamakan “nilai lolos” dengan pengalaman yang mudah dipakai.