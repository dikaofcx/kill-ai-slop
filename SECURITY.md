# Keamanan

Jangan memasukkan token, kata sandi, kredensial, data pelanggan, atau file rahasia ke repository, issue, contoh, maupun test fixture.

## Perilaku dan batas teknis

CLI berjalan lokal tanpa telemetry, tanpa dependency runtime, dan tanpa akses jaringan yang dibutuhkan. Linter membaca file sebagai teks; ia tidak mengevaluasi atau menjalankan kode yang dipindai. Isi file, hook event dari stdin, dan metadata eksternal harus diperlakukan sebagai data tak tepercaya—bukan instruksi untuk agent atau shell.

`lint`, `rules`, dan `contrast` tidak menulis ke target. Hook Claude Code menerima JSON dari stdin, membaca satu file yang didukung, mengembalikan konteks advisory, dan selalu keluar dengan status 0 agar tidak memblokir edit. Hook tidak menjalankan perintah dari input file. `init` dan `install` menulis skill ke tujuan yang diminta pengguna setelah preflight; konflik hanya diganti dengan pilihan eksplisit dan dibuatkan backup. `audit` menulis template ke path output yang diminta. `sync-assets` menyalin aset paket tanpa menghapus direktori tujuan secara rekursif.

Tetap tinjau perubahan filesystem sebelum menjalankan installer pada repo lain. Keamanan path, symlink, rollback, penanganan input hook, dan metadata adapter yang dapat memicu eksekusi adalah bagian dari cakupan pemeriksaan.

## Melaporkan kerentanan

Gunakan private vulnerability reporting pada repository GitHub ini bila tersedia. Sertakan versi atau commit, langkah reproduksi minimum, dampak, serta mitigasi yang sudah dicoba. Jangan membuka issue publik untuk detail kerentanan; bila pelaporan privat tidak tersedia, hubungi maintainer lewat kanal privat GitHub.

Jika kredensial terlanjur masuk ke commit, anggap kredensial itu terekspos: cabut atau rotasi terlebih dahulu, kemudian bersihkan riwayat sesuai prosedur repository. Menghapus berkas dari commit terbaru saja tidak mencabut secret.

## Di luar cakupan

False positive atau false negative pada heuristik lint bukan kerentanan keamanan. Laporkan sebagai issue biasa dengan contoh minimal dan konteks file; jangan menyertakan data rahasia.
