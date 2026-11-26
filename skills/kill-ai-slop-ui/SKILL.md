---
name: kill-ai-slop-ui
description: Audit atau implementasikan arah visual UI web dan aplikasi—hierarki, tipografi, warna, layout, token, ikon, dan motion—tanpa mengganti brand atau menambah dekorasi generik.
---

# Kill AI Slop — UI

Gunakan bersama core `kill-ai-slop` saat pekerjaan utamanya menyangkut keputusan visual UI. Baca [soul.md](../kill-ai-slop/references/soul.md) dan [skills.md](../kill-ai-slop/references/skills.md) bila membutuhkan prinsip dan heuristik.

## Alur

1. **Pahami produk dan tugas layar.** Identifikasi siapa pengguna, apa yang perlu mereka lakukan, konten yang benar-benar ada, dan elemen brand yang harus tetap.
2. **Audit hasil terender.** Sebutkan maksimal 3–7 bukti: lokasi, kontras/hierarki, hubungan antar elemen, atau state yang bermasalah. Jangan mengubah gaya yang hanya berbeda dari preferensi pribadi.
3. **Pilih satu arah.** Tulis satu kalimat yang menjelaskan karakter dan alasan yang terkait dengan konteks produk. Jangan menggabungkan banyak moodboard yang saling bertentangan.
4. **Buat token dengan peran.** Tentukan hanya yang diperlukan: display/body/label, primary/accent/status/neutral, grid, spacing, radius, border/elevasi, ikon, dan gerak. Reuse design system proyek.
5. **Terapkan menyeluruh pada cakupan.** Jaga komponen, urutan baca, fungsi, dan konten. Hapus elemen yang tidak membantu sebelum menambah aksen baru.
6. **Periksa layar dan state.** Bandingkan sebelum/sesudah pada viewport terkait; cek focus/hover/error/empty bila ada, serta aksesibilitas dan overflow.

## Aturan keputusan

- Satu fokus utama per area; elemen pendukung tidak bersaing.
- Pilih alignment, kepadatan, dan bentuk berdasarkan konten serta tindakan, bukan kebiasaan template.
- Warna, shadow, radius, gradient, ilustrasi, dan animasi tidak dilarang. Setiap pilihan harus punya peran yang dapat dijelaskan.
- Gunakan bukti produk yang tersedia; jangan menciptakan metrik, testimoni, screenshot, atau fitur.
- Jangan menambah library UI/font/icon jika sistem yang ada dapat menyelesaikan masalah dengan baik.

## Titik awal yang dapat diukur

Angka berikut adalah rentang untuk memulai audit, bukan aturan lulus/gagal. Pertahankan design system yang sudah bekerja dan sesuaikan dengan bahasa, brand, device, density, serta fungsi komponen.

- **Tipografi:** line-height body sekitar 1.5 atau lebih sering membantu bacaan panjang; lebar 65ch dapat jadi batas awal untuk paragraf. Form, label, tabel, dan layout padat bisa memerlukan ukuran lain.
- **Warna:** mulai dari satu primary, accent seperlunya, dan neutral scale sekitar 5–9 langkah. Tambahkan warna status bila fungsi produk membutuhkannya; cek kontras pada setiap state.
- **Grid:** uji 12 kolom untuk konten yang memang punya relasi kolumnar atau satu alur editorial untuk bacaan berurutan. Jangan memaksa grid 12 kolom pada layar atau konten yang tidak memerlukannya.
- **Spacing:** skala contoh 4, 8, 12, 16, 24, 32, 48, 64, 96, 128; gunakan token proyek dan adaptasikan pada breakpoint alih-alih mengubah semua nilai secara mekanis.
- **Ikon dan elevasi:** satu keluarga ikon yang konsisten biasanya lebih jelas; stroke 1.5–2px dapat menjadi titik awal, bukan alasan mengganti ikon brand. Blur shadow di bawah 30px dapat membantu menghindari haze, tetapi kebutuhan elevasi harus mengikuti lapisan nyata.
- **Radius:** konsistensi token lebih penting daripada memilih angka universal seperti 2px atau pill. Radius besar dapat tepat untuk brand atau komponen tertentu.
- **Motion:** 150–400ms dan satu easing adalah rentang awal untuk banyak transisi kecil, bukan batas universal. Prioritaskan `prefers-reduced-motion`, jarak gerak, dan responsivitas.

## Alternatif layout untuk diuji

Pilih bentuk dari struktur konten, lalu periksa pada viewport target: satu item utama dengan dua pendukung bisa memakai split; daftar dengan bobot berbeda bisa memakai grid ber-span variatif; urutan proses bisa jadi baris editorial bernomor; bukti produk dapat ditampilkan sebagai screenshot atau tabel beranotasi hanya bila datanya benar. Hero tidak wajib menambah visual—gunakan hanya aset atau data nyata yang membantu tugas pengguna.

## Referensi dan template

Pilih dua atau tiga sumber yang sesuai keputusan saat ini dari [`references/sources.md`](references/sources.md); daftar itu bukan checklist untuk dibuka semua. Pelajari prinsip yang relevan, jangan menyalin layout atau identitas. [`references/tokens-template.css`](references/tokens-template.css) adalah titik awal opsional—ganti font, warna, dan tokennya sesuai brand, aksara, kontras, serta sistem proyek.

Laporkan arah, keputusan token yang berubah, area yang disentuh, bagian yang dipertahankan, viewport/state yang dicek, dan apa yang belum diuji.
