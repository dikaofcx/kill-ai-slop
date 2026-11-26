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