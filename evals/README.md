# Behavioral regression cases

`cases.json` menyimpan prompt dan perilaku yang diharapkan untuk review manual. `npm run check` hanya memeriksa skema, ID duplikat, dan kelengkapan kasus; ia tidak menjalankan model atau menilai screenshot.

## Cara mengevaluasi perubahan skill

Jalankan setiap prompt pada sesi baru dengan skill yang sama. Bandingkan jawaban dengan konteks yang tercatat, lalu tandai tiap butir `must` dan `mustNot` sebagai pass/fail. Kasus harus tetap lolos tanpa mengandalkan riwayat percakapan yang tidak disertakan.

Jika perubahan sengaja mengubah perilaku:

1. Jelaskan kasus mana yang berubah dan mengapa.
2. Tambahkan kasus untuk regresi nyata, bukan variasi kosmetik dari prompt yang sama.
3. Pastikan `must` menjelaskan perilaku yang dapat diamati dan `mustNot` menangkap kesalahan mahal.
4. Jangan mengubah kasus hanya agar implementasi saat ini terlihat lolos.

Hasil manual yang belum benar-benar dijalankan tidak boleh dilaporkan sebagai “lulus”. Tidak ada skor estetika otomatis di harness ini.
