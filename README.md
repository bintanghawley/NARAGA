# NARAGA: Platform Kesiapsiagaan Komunitas Berbasis Readiness Gap Menuju Pemukiman Tangguh Bencana

> **Karya untuk:** Infinitera 2.0 Web Development Competition
> **Tema:** Inovasi Teknologi Berkelanjutan Menuju Ketahanan Pemukiman (SDG 11: Sustainable Cities and Communities)
> **Tim Pengusul:** Evan Mahardika · Raffi Bintang Hawley · Firman Maulana

---

## 📌 1. Gambaran Umum Proyek

**NARAGA** adalah platform berbasis web yang berfokus pada **kesiapsiagaan bencana pra-kejadian (*pre-disaster preparedness*)** di tingkat komunitas pemukiman (lingkungan RT, RW, atau desa).

Mayoritas aplikasi kebencanaan yang beredar berfokus pada pemantauan makro atau tanggap darurat pasca-bencana. Kenyataannya di lapangan, banyak warga pemukiman yang tidak mengetahui titik kumpul resmi, tidak mengenal rute evakuasi yang aman, dan minim pemahaman tas siaga bencana.

NARAGA hadir untuk mengukur dan memetakan **Readiness Gap** (kesenjangan kesiapsiagaan) yang terjadi di komunitas:

1. **Kesenjangan Sarana Fisik (*Facility Gap*):** Fasilitas keselamatan fisik memang belum tersedia di lingkungan pemukiman (misal: belum ada titik kumpul yang ditetapkan, belum ada APAR atau sirine peringatan).
2. **Kesenjangan Pemahaman & Sosialisasi (*Awareness Gap*):** Titik kumpul atau jalur evakuasi mungkin sudah ada, namun warga menjawab **"Tidak Tahu"** karena minimnya sosialisasi dan plang penunjuk arah di lapangan.

Melalui instrumen asesmen terstruktur dengan jawaban **Ya / Tidak / Tidak Tahu**, sistem menghasilkan **Readiness Score**, memetakan **Readiness Gap**, menyusun **Action Plan** terarah bagi pengurus lingkungan, menampilkan **Peta Evakuasi Interaktif**, serta menyediakan **Context-Aware AI Assistant** yang terhubung dengan data kesiapan wilayah.

---

## ✨ 2. Fitur Utama

| # | Fitur | Keterangan |
| :---: | :--- | :--- |
| 1 | **Asesmen Kesiapsiagaan 30 Soal** | Formulir terstruktur dengan pilihan Ya / Tidak / Tidak Tahu. Soal dibedakan per role (30 soal Pengurus + 30 soal Warga). Dilengkapi progress bar dan indikator warna pilihan jawaban. |
| 2 | **Readiness Score & Gap Analysis** | Skor kesiapan (%) dengan kategori (Sangat Siap / Cukup Siap / Kurang Siap), pemetaan *Facility Gap* vs *Awareness Gap*, serta visualisasi gauge chart interaktif. |
| 3 | **Action Plan Generator** | Rekomendasi rencana aksi otomatis berdasarkan gap yang terdeteksi, lengkap dengan label prioritas (Tinggi/Sedang/Rendah). |
| 4 | **Peta Evakuasi Interaktif** | Visualisasi titik kumpul (marker), posko medis, zona bahaya, dan rute evakuasi (polyline) di atas OpenStreetMap via Leaflet.js. |
| 5 | **Context-Aware AI Assistant** | Chat AI yang di-grounding dengan data kesiapan wilayah pengguna. Dilengkapi Smart Mock Fallback agar dapat langsung diuji tanpa API Key. |
| 6 | **Sistem Verifikasi Pengurus (RBAC)** | Alur pengajuan peran Warga → Pengurus → disetujui Admin, dengan modal konfirmasi dan catatan review. |
| 7 | **Dashboard Adaptif per Role** | Dashboard beranda disesuaikan konteks role dan riwayat asesmen pengguna. |
| 8 | **Panel Admin Internal** | Halaman verifikasi pengajuan pengurus dengan tabel riwayat, tombol Setujui/Tolak, dan catatan admin. |
| 9 | **Sidebar Navigasi Sliding** | Komponen navigasi samping dengan animasi pill hijau meluncur, konsisten di seluruh halaman (Dashboard, AI, Settings, Admin). |
| 10 | **Halaman Settings Lengkap** | Profil terpisah (nama + peran + foto avatar), edit wilayah komunitas, ganti password, riwayat asesmen, logout dengan konfirmasi, dan hapus akun. |
| 11 | **Kontak Darurat** | Daftar nomor telepon darurat (lokal + nasional) dengan tombol panggil langsung (`tel:`). |
| 12 | **Landing Page Publik** | Halaman awal informatif dengan hero section, statistik, alur cara kerja, dan testimoni komunitas. |

---

## 🛠️ 3. Arsitektur & Teknologi yang Digunakan

Proyek ini dibangun menggunakan arsitektur monolit modern berbasis lapisan (*Layered Architecture*) yang cepat, stabil, dan type-safe:

| Lapisan | Teknologi | Versi |
| :--- | :--- | :--- |
| **Framework** | Next.js (App Router) + React + TypeScript | v16.3.5 / React 19 |
| **Styling & UI** | Tailwind CSS + Lucide React Icons | v4 |
| **ORM & Database** | Prisma ORM + SQLite (dev) / PostgreSQL (prod) | Prisma v6 |
| **Autentikasi** | Auth.js / NextAuth (Credentials Provider + bcryptjs) | v5 beta |
| **Validasi** | Zod | v4 |
| **Pemetaan** | Leaflet.js + OpenStreetMap (tanpa API Key) | v1.9 |
| **AI Assistant** | Google Gemini API (@google/genai SDK) + Smart Mock Fallback | — |

### Keunggulan Arsitektur:
- **Zero Config Database:** SQLite lokal berjalan langsung tanpa install software eksternal apapun.
- **Smart Mock AI:** Asisten AI dapat langsung diuji & didemokan tanpa Gemini API Key berkat fallback cerdas.
- **Type-Safe End-to-End:** Prisma + Zod + TypeScript menjamin keamanan tipe data dari database hingga frontend.
- **Kompatibel Cloud:** Siap deploy ke Vercel + Neon/Supabase PostgreSQL tanpa mengubah kode bisnis.

---

## 🗄️ 4. Model Database (9 Tabel)

```
┌─────────────────────┐     ┌──────────────────────────┐
│       User          │────▶│  PengurusApplication     │
│  (WARGA/PENGURUS/   │     │  (PENDING/APPROVED/      │
│   ADMIN)            │     │   REJECTED)              │
└────────┬────────────┘     └──────────────────────────┘
         │
         ├────────────────▶ AssessmentSession
         │                    ├── AssessmentAnswer
         │                    └── (score, gaps, actionPlan)
         │
         └── communityId ──▶ Community
                               ├── EvacuationPoint (6 tipe marker)
                               ├── EvacuationRoute (polyline JSON)
                               └── EmergencyContact (lokal + global)

AssessmentQuestion (60 butir: 30 Pengurus + 30 Warga)
```

---

## 🔒 5. Sistem Hak Akses (RBAC 3 Role)

Sistem keamanan NARAGA menerapkan pembatasan hak akses berjenjang:

```
[ Pendaftaran Akun Baru ]
           │
           ▼
    ( Role: WARGA )
           │
           ├──► Mengisi Asesmen Kesiapsiagaan (30 Soal Khusus Warga)
           ├──► Melihat Readiness Score, Gap Analysis & Action Plan
           ├──► Membuka Peta Evakuasi & Kontak Darurat
           ├──► Konsultasi dengan Context-Aware AI Assistant
           ├──► Mengakses Riwayat Asesmen di Settings
           │
           ▼
[ Mengajukan Peran Pengurus Lingkungan ]
 (Isi data RT/RW, Jabatan, No. WhatsApp & Alasan)
           │
           ▼ (Status: PENDING)
[ Review oleh Admin Internal ]
    ├── Ditolak  ──► Tetap sebagai Warga
    └── Disetujui ──► Naik ke ( Role: PENGURUS )
                           │
                           ├──► Mengisi Asesmen Khusus Pengurus (30 Soal Tata Kelola)
                           ├──► Mengelola Titik Kumpul & Posko di Peta
                           ├──► Mengelola Jalur Evakuasi Lingkungan
                           └──► Memantau Kesiapan & Rencana Aksi Komunitas

( Role: ADMIN )
    ├──► Panel Verifikasi Pengajuan Pengurus (Setujui / Tolak)
    ├──► Tanya Asisten AI
    └──► Pengaturan Akun
```

---

## 📂 6. Struktur Folder Proyek

```
naraga/
├── prisma/
│   ├── schema.prisma              # Definisi 9 tabel & relasi database
│   └── seed.ts                    # Seeding data demo (akun, soal, peta, asesmen dummy)
├── public/images/                 # Aset gambar (logo, avatar, hero banner)
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── admin/page.tsx         # Panel Admin Verifikasi + Sidebar
│   │   ├── ai/page.tsx            # Chat AI Context-Aware + Typing Animation
│   │   ├── assessment/page.tsx    # Formulir 30 Soal + Progress Bar + Hasil Evaluasi
│   │   ├── dashboard/             # Dashboard Adaptif (per-role, pre/post-test)
│   │   │   ├── page.tsx           # Server Component utama
│   │   │   ├── DashboardClientActions.tsx
│   │   │   ├── DashboardOverviewCards.tsx
│   │   │   └── ActionPlanSection.tsx
│   │   ├── login/page.tsx         # Halaman Masuk + Quick Fill demo
│   │   ├── map/page.tsx           # Peta Evakuasi Interaktif
│   │   ├── register/page.tsx      # Pendaftaran Warga Baru
│   │   ├── settings/              # Halaman Pengaturan Lengkap
│   │   │   ├── page.tsx           # Server Component settings
│   │   │   ├── SettingsClient.tsx # Client Component (profil, keamanan, avatar)
│   │   │   └── riwayat/           # Riwayat Asesmen (list + detail per sesi)
│   │   ├── api/                   # REST API Route Handlers (18+ endpoints)
│   │   │   ├── admin/             # Verifikasi pengurus
│   │   │   ├── ai/                # Chat AI dengan grounding konteks
│   │   │   ├── assessments/       # Soal, submit, skor, riwayat
│   │   │   ├── auth/              # NextAuth + register
│   │   │   ├── communities/       # List, create, join lingkungan
│   │   │   ├── emergency-contacts/# Kontak darurat
│   │   │   ├── evacuation-points/ # Titik kumpul & posko
│   │   │   ├── evacuation-routes/ # Rute polyline evakuasi
│   │   │   ├── pengurus/          # Pengajuan peran pengurus
│   │   │   ├── user/              # Profile & password update
│   │   │   └── location/          # Reverse geocoding & search
│   │   ├── globals.css            # Konfigurasi Tailwind CSS v4
│   │   ├── layout.tsx             # Root layout (Providers, Navbar, Footer)
│   │   └── page.tsx               # Landing Page publik
│   ├── components/
│   │   ├── DashboardSidebar.tsx   # Sidebar navigasi sliding hijau (semua halaman)
│   │   ├── EvacuationMap.tsx      # Komponen Peta Leaflet (Client-side)
│   │   ├── Navbar.tsx             # Navigasi utama responsif + role-aware avatar
│   │   ├── Providers.tsx          # NextAuth SessionProvider
│   │   └── TypewriterHeading.tsx  # Efek ketik animasi heading
│   ├── lib/
│   │   ├── assessment-engine.ts   # Rule-based engine: skor, gap, action plan
│   │   ├── assessment-questions.ts# Bank 60 soal (30 Pengurus + 30 Warga)
│   │   ├── auth.ts                # Konfigurasi Auth.js / NextAuth
│   │   ├── gemini.ts              # Gemini API + Smart Mock Fallback
│   │   └── prisma.ts              # Singleton Prisma Client
│   ├── types/
│   │   ├── index.ts               # Type definitions domain NARAGA
│   │   └── next-auth.d.ts         # Type augmentation untuk session
│   └── validators/
│       └── index.ts               # Skema validasi Zod
├── .env                           # Variabel lingkungan (SQLite & Mock AI)
├── package.json                   # Dependencies & scripts
├── AGENTS.md                      # Panduan rekan tim (handover document)
└── README.md                      # Dokumentasi ini
```

---

## 🚀 7. Cara Menjalankan Aplikasi di Lokal

### Prasyarat:
- **Node.js** versi 18+ (disarankan Node.js 20 atau 22+)
- **npm** (bawaan Node.js)
- *Tidak perlu* install database eksternal (SQLite otomatis)

### Langkah Instalasi:

```bash
# 1. Clone repositori
git clone <url-repository>
cd naraga

# 2. Install Dependensi
npm install

# 3. Inisialisasi Database Lokal (SQLite)
npm run db:push

# 4. Isi Data Awal — Akun Demo, 60 Soal, Asesmen Dummy, Peta, Kontak Darurat
npm run db:seed

# 5. Jalankan Server Development
npm run dev
```

Buka peramban di: **[http://localhost:3000](http://localhost:3000)**

### Perintah Berguna Lainnya:

| Perintah | Fungsi |
| :--- | :--- |
| `npm run build` | Membangun aplikasi untuk produksi |
| `npm run lint` | Memeriksa format kode |
| `npm run db:push` | Sinkronisasi schema Prisma ke database |
| `npm run db:seed` | Reset & isi ulang data demo |
| `npm run db:studio` | Membuka Prisma Studio (GUI database) |

---

## 👥 8. Akun Demo & Data Dummy

Setelah menjalankan `npm run db:seed`, database akan terisi dengan data percontohan lengkap:

### Akun Login Demo:

| Role | Nama | Email | Password | Avatar | Keterangan |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ADMIN** | Evan Mahardika | `admin@naraga.id` | `admin123` | Evan | Panel verifikasi pengurus di `/admin` |
| **PENGURUS** | Raffi Bintang Hawley | `pengurus@naraga.id` | `pengurus123` | Raffi | Ketua RT 03, kelola titik kumpul & rute |
| **WARGA** | Firman Maulana | `warga@naraga.id` | `warga123` | Firman | Warga RT 03, asesmen & peta evakuasi |
| **WARGA (BARU)** | Dimas Pratama | `warga.baru@naraga.id` | `warga123` | — | Belum join lingkungan (uji alur join) |

> 💡 **Tip:** Di halaman `/login` tersedia tombol **"Quick Fill"** untuk mengisi email & password akun demo hanya dengan 1 kali klik.

### Data Dummy yang Di-seed:

| Data | Jumlah | Keterangan |
| :--- | :---: | :--- |
| Komunitas/Lingkungan | 3 | RT 03/RW 05, RT 01/RW 02, RT 07/RW 03 Sekaran |
| Akun Pengguna | 5 | 1 Admin, 1 Pengurus, 3 Warga |
| Soal Asesmen | 60 | 30 soal Pengurus + 30 soal Warga (4 kategori) |
| Sesi Asesmen Lengkap | 2 | Pengurus: 73.33% (22/30) · Warga: 60% (18/30) |
| Pengajuan Pengurus | 2 | 1 Approved (Raffi) · 1 Pending (Siti) |
| Titik Evakuasi | 6 | 3 Assembly Point · 1 Aid Post · 2 Hazard Point |
| Rute Evakuasi | 3 | 3 Polyline dengan warna berbeda |
| Kontak Darurat | 10 | 4 Lokal + 6 Nasional/Global |

---

## 📡 9. Dokumentasi API Endpoints

Seluruh API route terlindungi validasi Zod dan session-aware:

### Autentikasi & Akun:
| Method | Endpoint | Keterangan |
| :--- | :--- | :--- |
| `POST` | `/api/auth/[...nextauth]` | Handler sesi Auth.js (Login, Logout, Session) |
| `POST` | `/api/auth/register` | Pendaftaran user baru (default: WARGA) |
| `PATCH` | `/api/user/profile` | Update nama, email, foto, atau wilayah komunitas |
| `POST` | `/api/user/password` | Ganti password akun |

### Lingkungan & Komunitas:
| Method | Endpoint | Keterangan |
| :--- | :--- | :--- |
| `GET` | `/api/communities` | Daftar seluruh lingkungan RT/RW |
| `POST` | `/api/communities` | Daftarkan lingkungan baru (Pengurus/Admin) |
| `POST` | `/api/communities/[id]/join` | Gabungkan user ke lingkungan tertentu |

### Verifikasi Pengurus (RBAC):
| Method | Endpoint | Keterangan |
| :--- | :--- | :--- |
| `POST` | `/api/pengurus/apply` | Warga mengajukan peran Pengurus |
| `GET` | `/api/pengurus/apply` | Cek status pengajuan sendiri |
| `GET` | `/api/admin/applications` | Admin melihat seluruh pengajuan |
| `POST` | `/api/admin/applications/[id]/review` | Setujui / Tolak pengajuan |

### Asesmen & Readiness Gap Engine:
| Method | Endpoint | Keterangan |
| :--- | :--- | :--- |
| `GET` | `/api/assessments/questions` | Bank soal asesmen (30 butir sesuai role) |
| `POST` | `/api/assessments/submit` | Submit jawaban → hitung skor + gap + action plan |
| `GET` | `/api/assessments/history` | Riwayat asesmen user/komunitas |
| `GET` | `/api/assessments/[id]` | Detail lengkap 1 sesi asesmen |

### Geospasial & Kedaruratan:
| Method | Endpoint | Keterangan |
| :--- | :--- | :--- |
| `GET` | `/api/evacuation-points` | Titik kumpul, posko, zona bahaya |
| `POST` | `/api/evacuation-points` | Tambah titik baru (Pengurus/Admin) |
| `GET` | `/api/evacuation-routes` | Rute evakuasi (polyline coordinates) |
| `POST` | `/api/evacuation-routes` | Tambah rute baru (Pengurus/Admin) |
| `GET` | `/api/emergency-contacts` | Daftar kontak darurat |
| `POST` | `/api/emergency-contacts` | Tambah kontak darurat (Pengurus/Admin) |

### Asisten AI:
| Method | Endpoint | Keterangan |
| :--- | :--- | :--- |
| `POST` | `/api/ai/chat` | Chat AI dengan konteks kesiapan wilayah |

### Lokasi:
| Method | Endpoint | Keterangan |
| :--- | :--- | :--- |
| `GET` | `/api/location/search` | Pencarian lokasi (geocoding) |
| `GET` | `/api/location/reverse` | Reverse geocoding (koordinat → alamat) |

---

## 🧩 10. Alur Pengguna (User Flow)

### Alur Warga Baru:
```
Buka Landing Page → Klik "Mulai Tes" → Daftar Akun Baru → Login
→ Dashboard (Welcome) → Gabung Lingkungan (Pilih RT/RW)
→ Mulai Tes Kesiapsiagaan (30 Soal) → Lihat Readiness Score & Gap
→ Buka Peta Evakuasi → Tanya AI → Lihat Riwayat di Settings
```

### Alur Pengurus Lingkungan:
```
Login sebagai Pengurus → Dashboard (Skor + Action Plan)
→ Tes Kesiapsiagaan Khusus Pengurus (30 Soal Tata Kelola)
→ Kelola Peta: Tambah Titik Kumpul / Posko / Rute Evakuasi
→ Tanya AI (Konteks wilayah otomatis ter-inject)
```

### Alur Admin:
```
Login sebagai Admin → Panel Admin Verifikasi
→ Review Pengajuan Pengurus: Setujui / Tolak (+ Catatan)
→ Tanya AI → Settings
```

---

## 🌐 11. Panduan Migrasi ke Cloud PostgreSQL

Saat aplikasi siap di-deploy ke Vercel untuk produksi:

1. Buat database PostgreSQL gratis di **[Neon](https://neon.tech)** atau **[Supabase](https://supabase.com)**.
2. Salin *Connection URI*, misalnya: `postgresql://user:password@ep-xyz.neon.tech/naraga?sslmode=require`.
3. Di file `prisma/schema.prisma`, ubah:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
4. Di file `.env`, ubah `DATABASE_URL` ke Connection URI PostgreSQL tersebut.
5. Jalankan:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```
6. Aplikasi langsung beralih ke database cloud tanpa perlu mengubah kode bisnis!

---

## 📋 12. Checklist Kesiapan Lomba

- [x] `npm run build` → **Compiled successfully** tanpa error TypeScript
- [x] `npm run lint` → Tidak ada kesalahan fatal
- [x] Responsive design: Mobile (360px-414px) & Desktop (1280px+)
- [x] Alur lengkap: Daftar → Join → Asesmen → Skor → Peta → AI → Settings
- [x] 3 Role RBAC aktif: WARGA, PENGURUS, ADMIN
- [x] Data dummy ter-seed otomatis untuk demo
- [x] Smart Mock AI fallback tanpa API Key

---

## 🏆 Tim Pengembang

| Nama | Peran |
| :--- | :--- |
| **Evan Mahardika** | Backend Architecture, Database Design & API Integration |
| **Raffi Bintang Hawley** | Fullstack Frontend & UI/UX Development |
| **Firman Maulana** | Quality Assurance & Content Strategy |

---

> **NARAGA** — *Membangun Kesiapsiagaan dari Rumah ke Rumah, dari Gang ke Gang.*
