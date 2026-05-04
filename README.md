# 📦 STOCKR — Inventory Management System

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-95.8%25-3178c6?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)
![MUI](https://img.shields.io/badge/MUI-v6-007FFF?style=for-the-badge&logo=mui)
![DOKU](https://img.shields.io/badge/DOKU-Payment-orange?style=for-the-badge)
![Cloudinary](https://img.shields.io/badge/Cloudinary-CDN-3448C5?style=for-the-badge&logo=cloudinary)

**Platform manajemen inventori toko modern dengan fitur OCR KTP, peta real-time, payment gateway DOKU, dan partner registration flow.**

[Demo](#) · [Dokumentasi](#) · [Report Bug](#)

</div>

---

## ✨ Fitur Utama

### 🏪 Manajemen Toko

- **Registrasi toko multi-step** — form 2 langkah: data toko + data pemilik
- **OCR KTP otomatis** — scan KTP via upload file atau kamera langsung, data terisi otomatis menggunakan AI
- **Foto toko** — upload gambar toko via file atau kamera (tersimpan di Cloudinary)
- **Cascade location selector** — pilih Provinsi → Kota → Kecamatan → Kelurahan otomatis dari API wilayah Indonesia
- **Edit & kelola toko** — update data toko dan pemilik langsung dari dashboard settings

### 📍 Real-Time Location

- **Peta interaktif** (Canvas Map) — pin lokasi toko langsung di peta
- **Geolocation browser** — deteksi lokasi saat ini secara otomatis
- **Nominatim reverse geocoding** — konversi koordinat ke alamat lengkap otomatis
- **Pencarian lokasi** — cari nama tempat atau alamat via API internal

### 💳 Payment Gateway — DOKU

- **QRIS & multi-method payment** — VA BCA, Mandiri, BNI, BRI, OVO, GoPay, ShopeePay, DANA, LinkAja, Indomaret, Alfamart
- **Polling status otomatis** — status pembayaran diperbarui real-time tiap 3 detik
- **Link pembayaran DOKU** — redirect ke halaman pembayaran hosted DOKU
- **Retry mechanism** — buat ulang link pembayaran jika gagal atau expired (15 menit)

### 🤝 Partner / Mitra Registration

- **Multi-step onboarding** — 4 langkah: Data PIC → Data Bisnis → Perjanjian MoU → Pembayaran
- **3 pilihan paket** — Starter (Rp 99.000), Growth (Rp 299.000), Enterprise (Rp 799.000)
- **Digital MoU** — perjanjian kerjasama inline dengan checkbox persetujuan
- **Aktivasi instan** setelah pembayaran dikonfirmasi

### 📊 Inventori & Analitik

- **Manajemen produk** — tambah, edit, kategorikan ribuan SKU
- **Stok real-time** — monitor stok masuk/keluar, alert otomatis saat menipis
- **Laporan & analitik** — grafik penjualan, tren produk, export PDF/Excel
- **Riwayat transaksi** — audit trail lengkap dengan filter tanggal, produk, kategori

### 🎨 UI/UX

- **Dark / Light mode** — toggle tema persisten
- **Responsive** — layout adaptive mobile (card) dan desktop (table)
- **Mobile-first** — card list di mobile, table di desktop untuk semua halaman
- **Customer Service Chat Widget** — widget CS real-time terintegrasi

---

## 🛠️ Tech Stack

| Layer            | Teknologi                                                               |
| ---------------- | ----------------------------------------------------------------------- |
| **Framework**    | [Next.js 15](https://nextjs.org/) (App Router)                          |
| **Language**     | TypeScript                                                              |
| **UI Library**   | [MUI v6](https://mui.com/) + custom inline styles                       |
| **ORM**          | [Prisma](https://www.prisma.io/)                                        |
| **Database**     | PostgreSQL (via Prisma)                                                 |
| **Auth**         | Custom JWT / Session                                                    |
| **Storage**      | [Cloudinary](https://cloudinary.com/) (foto toko & KTP)                 |
| **Maps**         | Canvas Map custom + [Nominatim](https://nominatim.org/) (OpenStreetMap) |
| **OCR**          | AI-powered KTP scanning (via `/api/ocr`)                                |
| **Payment**      | [DOKU](https://www.doku.com/) — QRIS, VA, e-wallet                      |
| **Location API** | API Wilayah Indonesia (Provinsi/Kota/Kecamatan/Kelurahan)               |
| **Font**         | [Nunito](https://fonts.google.com/specimen/Nunito) (Google Fonts)       |
| **Deployment**   | [Vercel](https://vercel.com/)                                           |

---

## 📁 Struktur Folder

```
app/
├── (app)/                  # Layout utama dashboard
│   ├── api/
│   │   ├── auth/           # Autentikasi
│   │   ├── location/       # Geocoding & search lokasi
│   │   ├── mitra/          # Pendaftaran & payment mitra
│   │   │   ├── create-payment/
│   │   │   ├── payment-status/
│   │   │   └── register/
│   │   ├── ocr/            # Scan & ekstrak data KTP
│   │   ├── products/       # CRUD produk
│   │   ├── stores/         # CRUD toko & pemilik
│   │   ├── upload/
│   │   │   ├── ktp/        # Upload foto KTP ke Cloudinary
│   │   │   └── store-image/# Upload foto toko ke Cloudinary
│   │   └── wilayah/        # Data wilayah Indonesia
│   ├── components/
│   │   ├── header/         # Header dengan toggle tema
│   │   ├── sidebar/        # Navigasi sidebar
│   │   └── CSChatWidget/   # Widget customer service
│   ├── hooks/
│   │   └── useTheme/       # Custom hook dark/light mode
│   ├── list-toko/          # Halaman daftar toko
│   ├── registration/       # Registrasi toko (multi-step)
│   │   ├── CanvasMap/      # Komponen peta interaktif
│   │   └── LocationSelector/ # Cascade wilayah selector
│   └── settings/           # Edit & kelola toko
├── about/                  # Halaman about
├── login/                  # Halaman login
├── product/                # Landing page produk/fitur
└── register/               # Pendaftaran mitra (FormMitra)
prisma/
├── schema.prisma           # Skema database
└── seed-wilayah.ts         # Seed data wilayah Indonesia
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- Akun [Cloudinary](https://cloudinary.com/)
- Akun [DOKU](https://www.doku.com/) (untuk payment gateway)

### Instalasi

```bash
# Clone repo
git clone https://github.com/MulyaKoding/inventory-app.git
cd inventory-app

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
```

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/inventory_db"

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# DOKU Payment Gateway
DOKU_CLIENT_ID=your_doku_client_id
DOKU_SECRET_KEY=your_doku_secret_key
DOKU_BASE_URL=https://api.doku.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Setup Database

```bash
# Generate Prisma client
npx prisma generate

# Jalankan migrasi
npx prisma migrate dev

# Seed data wilayah Indonesia (opsional)
npx tsx prisma/seed-wilayah.ts
```

### Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## 📱 Halaman & Route

| Route           | Deskripsi                                      |
| --------------- | ---------------------------------------------- |
| `/`             | Landing page                                   |
| `/product`      | Showcase fitur STOCKR                          |
| `/about`        | Tentang platform                               |
| `/login`        | Login pengguna                                 |
| `/register`     | Pendaftaran mitra (multi-step + payment)       |
| `/list-toko`    | Daftar semua toko (table desktop, card mobile) |
| `/registration` | Registrasi toko baru (OCR KTP + peta)          |
| `/settings`     | Edit data toko & pemilik                       |

---

## 🔌 API Endpoints

| Method   | Endpoint                    | Deskripsi                                        |
| -------- | --------------------------- | ------------------------------------------------ |
| `GET`    | `/api/stores`               | Ambil semua data toko                            |
| `POST`   | `/api/stores`               | Daftarkan toko baru                              |
| `PUT`    | `/api/stores/[id]`          | Update data toko / pemilik                       |
| `DELETE` | `/api/stores/[id]`          | Hapus toko                                       |
| `POST`   | `/api/ocr`                  | Scan & ekstrak data dari foto KTP                |
| `POST`   | `/api/upload/ktp`           | Upload foto KTP ke Cloudinary                    |
| `POST`   | `/api/upload/store-image`   | Upload foto toko ke Cloudinary                   |
| `GET`    | `/api/wilayah`              | Data wilayah (provinsi/kota/kecamatan/kelurahan) |
| `POST`   | `/api/location`             | Geocoding pencarian lokasi                       |
| `POST`   | `/api/mitra/create-payment` | Buat link pembayaran DOKU                        |
| `GET`    | `/api/mitra/payment-status` | Cek status pembayaran                            |
| `POST`   | `/api/mitra/register`       | Simpan data mitra setelah bayar                  |

---

## 🤝 Paket Mitra

| Paket          | Harga          | Produk       | Pengguna    |
| -------------- | -------------- | ------------ | ----------- |
| **Starter**    | Rp 99.000/bln  | 500 produk   | 3 pengguna  |
| **Growth**     | Rp 299.000/bln | 5.000 produk | 10 pengguna |
| **Enterprise** | Rp 799.000/bln | Unlimited    | Unlimited   |

---

## 📸 Screenshot

> _Coming soon_

---

## 👤 Author

**MulyaKoding** — [@MulyaKoding](https://github.com/MulyaKoding)

---

## 📄 License

This project is private and proprietary. All rights reserved.

---

<div align="center">
  <sub>Built with ❤️ using Next.js · TypeScript · Prisma · DOKU · Cloudinary</sub>
</div>
