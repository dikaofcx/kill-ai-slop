# Kill AI Slop — Prompt Satu File

> Berkas ini dihasilkan dari `SKILL.md`, `skills.md`, `soul.md`, dan `agents.md`. Ubah sumbernya, lalu jalankan `npm run sync-skills`.

## Instruksi inti

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

## Panduan praktis

# Kill AI Slop — Panduan Praktis

Gunakan daftar ini sebagai pemicu inspeksi, bukan aturan otomatis. Pola populer bukan masalah bila membantu produk dan digunakan dengan sengaja.

## Pola yang perlu diperiksa

| Gejala yang terlihat | Bukti yang perlu dicari | Arah perbaikan yang mungkin |
|---|---|---|
| Semua elemen punya bobot visual sama | Sulit menemukan tindakan atau informasi utama | Buat satu fokus per area; turunkan elemen pendukung |
| Font default dipakai untuk semua peran | Judul, isi, dan label sulit dibedakan atau tidak cocok dengan brand | Tetapkan peran tipografi; cek aksara, keterbacaan, lisensi, dan performa |
| Gradien tanpa fungsi | Tidak berhubungan dengan brand, status, atau konten | Gunakan warna brand atau aksen yang punya peran; pertahankan gradien bermakna |
| Emoji menggantikan ikon kontrol | Gaya, makna, atau alignment tidak konsisten | Gunakan satu keluarga ikon; emoji hanya bila bagian bahasa produk |
| Kartu identik hanya karena mudah dibuat | Konten setara yang seharusnya punya urutan atau relasi berbeda | Pertimbangkan daftar, editorial, satu fitur utama, atau grid; pertahankan kartu bila jelas |
| Shadow dan radius ditempel pada semua panel | Elevasi tidak menandakan interaksi atau tingkat permukaan | Gunakan border/divider untuk struktur; tetapkan radius dan shadow menurut peran |
| Semua area center-aligned | Teks panjang sulit dipindai atau baris terlalu lebar | Pilih alignment sesuai tugas baca dan batasi lebar bila membantu |
| Spacing tidak punya ritme | Jarak setara terasa acak | Gunakan skala token proyek; jika tidak ada, mulai dari kelipatan 4/8 lalu sesuaikan |
| Hero tanpa bukti produk | Janji tidak didukung tampilan, demo, atau informasi nyata | Tampilkan bukti yang tersedia; jangan menciptakan screenshot atau angka |
| Copy penuh buzzword | Kalimat tidak menjelaskan manfaat atau syarat | Ganti dengan tindakan/hasil nyata; hapus bila tidak menambah informasi |
| Motion menghias semua interaksi | Animasi lambat, mengganggu, atau mengabaikan preferensi | Batasi keluarga gerak; jaga respons cepat dan hormati reduced motion |

## Checklist review

1. **Hierarki:** tugas utama, navigasi, isi, dan status dapat dibedakan tanpa membuat semuanya mencolok.
2. **Tipografi:** skala responsif; ukuran, panjang baris, line-height, dan karakter font sesuai konten serta bahasa.
3. **Warna:** token punya peran semantik; warna bukan satu-satunya pembawa status.
4. **Layout:** grid dan spacing sesuai hubungan konten, bukan sekadar pola template.
5. **Aset:** gambar, ikon, dan ilustrasi berasal dari produk atau sumber yang jelas; bukan pengganti bukti nyata.
6. **Aksesibilitas:** periksa kontras, fokus keyboard, label, urutan baca, target kontrol, zoom, dan reduced motion.
7. **Responsif:** cek layar sempit dan lebar yang relevan; jangan sekadar mengecilkan desktop.
8. **Konsistensi:** aturan komponen berlaku pada state normal, hover/focus, error, kosong, dan loading yang ada.
9. **Pengurangan:** hapus dekorasi hanya bila tidak membantu fungsi, orientasi, atau identitas.
10. **Verifikasi:** catat viewport, state, dan pemeriksaan yang benar-benar dilakukan.

### Acuan aksesibilitas

Untuk audit WCAG, cek kriteria dan pengecualian di sumber resmi: [Contrast (Minimum), WCAG 2.2 SC 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) dan [Target Size (Minimum), WCAG 2.2 SC 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html). Titik pemeriksaan umum: 4.5:1 untuk teks normal, 3:1 untuk teks besar, dan target pointer 24×24 CSS px dengan pengecualian yang berlaku. Jangan menyatakan kepatuhan dari inspeksi warna saja—state dan pengecualian juga perlu ditinjau.

## Referensi visual yang diminta pengguna

Mulai dari sumber paling relevan dengan keputusan desain. Pelajari pola, jangan menyalin layout atau brand, dan jangan mengklaim meninjau contoh yang belum dibuka.

| Kategori | Sumber | Gunakan untuk |
|---|---|---|
| Website sections | [Made by Oversight — Sections](https://supply.madebyoversight.com/sections) | Komposisi section website |
| Screenshot aplikasi | [Shipframe](https://getshipframe.com) | Urutan visual screenshot aplikasi |
| Inspirasi aplikasi | [Mobbin](https://mobbin.com) | Pola layar dan alur produk |
| Font gratis | [Fontshare](https://www.fontshare.com) | Kandidat font; cek lisensi dan dukungan bahasa |
| Video penjelas | [Made by Oversight — Videos](https://supply.madebyoversight.com/videos) | Ritme dan struktur motion/video |

## Pustaka tambahan

Pilih kategori sesuai keputusan yang sedang dibuat; tidak perlu membuka semuanya.

| Kategori | Referensi |
|---|---|
| Website dan landing page | [Land-book](https://www.land-book.com) · [Godly](https://godly.website) · [Lapa Ninja](https://www.lapa.ninja) · [One Page Love](https://onepagelove.com) · [SaaS Landing Page](https://saaslandingpage.com) · [Curated Design](https://curated.design) · [Awwwards](https://www.awwwards.com) · [Codrops](https://tympanus.net/codrops) · [Refero](https://refero.design) · [SiteInspire](https://www.siteinspire.com) |
| Moodboard dan visual | [Are.na](https://www.are.na) · [Cosmos](https://cosmos.so) · [Savee](https://savee.it) · [Behance](https://www.behance.net) · [Dribbble](https://dribbble.com) |
| Font dan skala | [Uncut](https://uncut.wtf) · [Velvetyne](https://velvetyne.fr) · [Collletttivo](https://www.collletttivo.it) · [Bunny Fonts](https://fonts.bunny.net) · [Modern Font Stacks](https://modernfontstacks.com) · [Typewolf](https://www.typewolf.com) · [Fonts In Use](https://fontsinuse.com) · [Type Scale](https://type-scale.com) |
| Ikon | [Lucide](https://lucide.dev) · [Phosphor](https://phosphoricons.com) · [Tabler](https://tabler.io/icons) · [Heroicons](https://heroicons.com) · [Simple Icons](https://simpleicons.org) untuk logo brand · [SVG Repo](https://www.svgrepo.com) |
| Warna | [Coolors](https://coolors.co) · [Color Hunt](https://colorhunt.co) · [Radix Colors](https://www.radix-ui.com/colors) · [UI Gradients](https://uigradients.com) |
| Tekstur dan latar | [Haikei](https://haikei.app) · [fffuel](https://fffuel.co) · [MagicPattern](https://www.magicpattern.design) · [MeshGradient](https://meshgradient.com) · [Shape Divider](https://www.shapedivider.app) · [PatternPad](https://patternpad.com) |
| Komponen dan motion | [shadcn/ui](https://ui.shadcn.com) · [Radix Primitives](https://www.radix-ui.com/primitives) · [Base UI](https://base-ui.com) · [Magic UI](https://magicui.design) · [Motion](https://motion.dev) · [GSAP](https://gsap.com) · [Lenis](https://www.lenis.dev) · [Rive](https://rive.app) · [LottieFiles](https://lottiefiles.com) · [Scroll-driven Animations](https://scroll-driven-animations.style) |
| Gambar dan ilustrasi | [Unsplash](https://unsplash.com) · [Pexels](https://www.pexels.com) · [Blush](https://blush.design) · [Storyset](https://storyset.com) · [Humaaans](https://www.humaaans.com) |
| UX dan UI | [Laws of UX](https://lawsofux.com) · [Refactoring UI](https://www.refactoringui.com) · [Nielsen Norman Group](https://www.nngroup.com/articles) |

Pilih aset yang lisensinya jelas dan sesuai produk. Sumber di atas adalah titik mulai, bukan jaminan kualitas atau hak penggunaan.

## Prinsip visual

# Soul — Prinsip Visual

Tujuan Kill AI Slop bukan membuat setiap antarmuka tampak unik. Tujuannya memastikan pilihan visual terasa berasal dari produk, audiens, dan konteksnya—bukan dari default yang tidak pernah diperiksa.

## Prinsip

1. **Konteks sebelum gaya.** Mulai dari pekerjaan pengguna, produk, konten, dan batasan. Referensi datang sesudahnya.
2. **Bukti sebelum asumsi.** Gunakan aset, data, bahasa, dan perilaku yang benar-benar ada. Tandai dugaan dan jangan mengubahnya menjadi fakta.
3. **Spesifik tanpa pamer.** Karakter dapat muncul dari tipografi, ritme, bahasa, atau detail kecil; tidak perlu menambah efek di setiap area.
4. **Konsistensi sebagai sistem.** Warna, tipe, spacing, ikon, radius, elevasi, dan gerak harus saling mendukung, bukan berlomba.
5. **Kejelasan bagian dari art direction.** Navigasi, kontras, urutan baca, responsivitas, dan aksesibilitas bukan pekerjaan finishing.
6. **Kurangi sebelum menambah.** Jika halaman terasa ramai, uji apakah elemen yang tidak membantu bisa dihapus atau disederhanakan.
7. **Hormati yang sudah bekerja.** Jangan mengubah alur, brand, konten, semantik, atau komponen tanpa alasan yang terkait langsung dengan permintaan.
8. **Belajar dari referensi, bukan menyalin.** Ambil prinsip yang relevan, lalu terjemahkan ke konteks produk. Hindari meniru kombinasi layout, copy, aset, dan identitas.
9. **Perubahan harus bisa dijelaskan.** Setiap perubahan utama punya dampak pengguna yang spesifik; jika tidak, jangan tambahkan.
10. **Jujur pada verifikasi.** Bedakan hasil yang benar-benar diuji dari yang hanya terlihat masuk akal di kode.

## Default visual untuk produk Dika

Jika produk memang milik Dika dan tidak ada brand guide atau palet yang harus dipertahankan, gunakan biru cerah sebagai kandidat warna utama dengan aksen vivid yang saling melengkapi. Tetapkan warna lewat peran semantik dan uji kontras; jangan menerapkan preferensi ini ke brand klien atau produk lain.

## Rasa yang dituju

- Khas karena punya alasan, bukan karena ramai.
- Terarah tanpa terasa steril.
- Kontemporer tanpa bergantung pada satu tren.
- Mudah dipindai tanpa menjadikan setiap konten sebagai kartu.
- Menyenangkan jika sesuai produk, tetap jelas saat digunakan.

## Playbook agent

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
