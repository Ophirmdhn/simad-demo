# SIMAD — Demo GIS Manajemen Aset Daerah

Prototype frontend-only untuk presentasi konsep Sistem Informasi Manajemen Aset Daerah. Tema visual menggunakan light theme netral; referensi screenshot diikuti pada fitur GIS, bukan penyalinan warna atau styling.

## Stack
- React 18 + Vite + TypeScript
- Tailwind CSS 4 (Vite plugin)
- Leaflet + React Leaflet
- OpenStreetMap
- Lucide React
- Data simulasi lokal (`src/data.ts`)

## Menjalankan
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Deploy ke Vercel
1. Push project ke GitHub.
2. Import repository di https://vercel.com/new.
3. Framework Preset: Vite.
4. Build Command: `npm run build`.
5. Output Directory: `dist`.
6. Deploy.

## Demo UI
- Desktop: panel filter dan daftar aset di kiri, peta di tengah, detail aset di kanan.
- Mobile: peta menjadi layar utama, pencarian/filter sebagai overlay, daftar aset dan detail sebagai bottom sheet.
- Polygon bidang aset demo bisa diaktif/nonaktifkan dari menu layer.

## Data
Edit array `assets` pada `src/data.ts`. Seluruh data, nilai, koordinat, dan informasi sertifikat merupakan simulasi untuk presentasi dan bukan data resmi.

## OpenStreetMap
Menggunakan tile standar `tile.openstreetmap.org` dengan atribusi. Tile standar OSM bukan layanan tile produksi dengan SLA dan memiliki kebijakan penggunaan. Untuk produksi atau trafik besar, gunakan penyedia tile yang sesuai atau host tile sendiri. Basemap saat ini berupa peta jalan OSM, bukan citra satelit. Citra satelit memerlukan penyedia imagery terpisah dengan ketentuan lisensi/penggunaan tersendiri.


## Input data spasial aset
Form tambah aset menerima latitude/longitude titik tengah, panjang, lebar, luas tanah, dan (untuk bangunan) luas bangunan. Jika koordinat batas polygon tidak diisi, aplikasi membentuk polygon persegi panjang perkiraan dari titik tengah + panjang + lebar. Untuk batas bidang sebenarnya yang tidak beraturan, masukkan minimal 3 titik koordinat polygon, satu titik per baris dengan format `latitude, longitude`. Kendaraan ditampilkan sebagai marker titik tanpa polygon.

Data hanya disimpan dalam state React selama sesi demo; belum tersimpan permanen dan akan kembali ke data awal saat halaman dimuat ulang.
