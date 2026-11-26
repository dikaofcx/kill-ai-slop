import fs from 'node:fs/promises';
import path from 'node:path';

function clean(value, fallback) {
  const normalized = String(value ?? '').replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
  return normalized || fallback;
}

export function renderAuditTemplate({ title, surface, stack = 'Belum dicatat', viewport = 'Pilih ukuran yang relevan' }) {
  const safeTitle = clean(title, 'Audit UI');
  const safeSurface = clean(surface, 'UI');
  const safeStack = clean(stack, 'Belum dicatat');
  const safeViewport = clean(viewport, 'Pilih ukuran yang relevan');
  return `# Audit UI — ${safeTitle}

> Catat bukti sebelum mengubah tampilan. Template ini membantu review; ia tidak menilai estetika atau memberi skor otomatis.

## 1. Kontrak perubahan

- **Surface / halaman:** ${safeSurface}
- **Stack:** ${safeStack}
- **Viewport yang akan diperiksa:** ${safeViewport}
- **Mode:** [ ] audit saja  [ ] audit + implementasi
- **Yang harus tetap:**
- **Batasan dan keputusan yang sudah disetujui:**

## 2. Baseline — sebelum edit

- **URL, route, atau komponen:**
- **Screenshot/tampilan ter-render yang diperiksa:**
- **State yang diamati:**
- **Fakta:**
- **Asumsi yang belum diverifikasi:**

## 3. Temuan (prioritaskan 3–7 yang berdampak)

| Bukti dan lokasi | Dampak bagi pengguna | Keyakinan | Perbaikan terkecil yang layak |
|---|---|---|---|
|  |  |  |  |

## 4. Arah dan token

- **Arah visual satu kalimat:**
- **Yang dipertahankan dan alasannya:**
- **Token yang berubah (peran dan nilai):**
- **Referensi yang benar-benar dibuka:**
- **Trade-off / asumsi:**

## 5. Perubahan implementasi

| Area/file | Perubahan | Temuan yang dijawab | Alasan |
|---|---|---|---|
|  |  |  |  |

## 6. Verifikasi

| Viewport / state / alat | Pemeriksaan | Hasil |
|---|---|---|
|  |  |  |

- **Perintah tes yang dijalankan dan hasil:**
- **Keyboard/focus, kontras, reflow, target, reduced motion:**
- **Overflow, clipping, console/build error:**
- **Yang belum diuji:**

## 7. Gerbang selesai

- [ ] Setiap perubahan utama menjawab temuan yang diamati.
- [ ] Scope, brand, konten, fungsi, dan semantik yang harus tetap tidak berubah.
- [ ] Tidak ada klaim atau aset produk yang dibuat-buat.
- [ ] Breakpoint dan state yang relevan diperiksa.
- [ ] Tes dan keterbatasan dilaporkan tanpa klaim berlebihan.
`;
}

export async function writeAuditTemplate({ output, ...options }) {
  if (!output) throw new Error('Tentukan file keluaran dengan --output <path>.');
  const destination = path.resolve(output);
  try {
    await fs.access(destination);
    throw new Error(`File sudah ada: ${destination}. Pilih path lain; CLI tidak menimpa audit lama.`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, renderAuditTemplate(options), { encoding: 'utf8', flag: 'wx' });
  return destination;
}
