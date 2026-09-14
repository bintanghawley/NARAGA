# Panduan Pengembang & Handover Proyek: NARAGA

> **Dokumen ini dibuat khusus sebagai panduan rekan tim (Fullstack Frontend & Backend) yang melanjutkan pengembangan antarmuka (UI/UX) dan penyempurnaan fitur sebelum dikembalikan ke tahap QA Engineer & Finishing.**

---

## 🧭 1. Status Pengerjaan Terkini (Backend & Base App)

Fondasi backend, arsitektur data, logika bisnis, dan API terintegrasi telah **100% selesai dibangun dan lolos verifikasi `npm run build` tanpa error**.

### Fitur yang Sudah Aktif & Siap Dikonsumsi:
1. ✅ **Database Relasional & ORM:** 9 Model Prisma (`User`, `Community`, `PengurusApplication`, `AssessmentQuestion`, `AssessmentSession`, `AssessmentAnswer`, `EvacuationPoint`, `EvacuationRoute`, `EmergencyContact`).
2. ✅ **Autentikasi & RBAC:** Auth.js v5 dengan Credentials Provider (hash password `bcryptjs`), mendukung 3 Role (`WARGA`, `PENGURUS`, `ADMIN`).
3. ✅ **Alur Verifikasi Pengurus:** Warga mendaftar $\rightarrow$ mengajukan role Pengurus $\rightarrow$ Administrator internal menyetujui di panel admin $\rightarrow$ Role user otomatis naik menjadi `PENGURUS`.
4. ✅ **Rule-Based Assessment Engine:** Menghitung *Readiness Score* objektif $\left(\frac{N_{\text{Ya}}}{N_{\text{Total}}} \times 100\%\right)$, memetakan *Facility Gap* (jawaban Tidak) vs *Awareness Gap* (jawaban Tidak Tahu), serta meng-generate *Action Plan*.
5. ✅ **Peta Geospasial:** Terintegrasi dengan Leaflet.js & OpenStreetMap untuk visualisasi marker titik kumpul dan polyline rute evakuasi.
6. ✅ **Context-Aware AI Assistant:** Endpoint `/api/ai/chat` dengan injeksi konteks data kesiapan pemukiman. Dilengkapi **Smart Mock Fallback**, sehingga antarmuka chat AI dapat langsung diuji dan didemokan tanpa memerlukan Gemini API Key eksternal!

---

## 📂 2. Peta Struktur Folder Proyek

```
naraga/
├── prisma/
│   ├── schema.prisma          # Definisi 9 tabel & relasi database
│   └── seed.ts                # Seeding data default (Admin, Pengurus, Warga, Soal, Peta)
├── src/
│   ├── app/                   # Next.js App Router (Halaman & API Routes)
│   │   ├── admin/             # Panel Verifikasi Admin Internal (Approve/Reject)
│   │   ├── ai/                # Antarmuka Chat Context-Aware AI Assistant
│   │   ├── assessment/        # Formulir Asesmen Kesiapsiagaan & Laporan Gap
│   │   ├── dashboard/         # Dashboard Pengguna Adaptif sesuai Role
│   │   ├── login/             # Halaman Masuk dengan tombol Quick Fill
│   │   ├── map/               # Halaman Peta Evakuasi Lingkungan & Kontak Darurat
│   │   ├── register/          # Halaman Pendaftaran Warga Baru
│   │   ├── api/               # Seluruh REST API Route Handlers (16 endpoints)
│   │   │   ├── admin/         # API verifikasi pengurus untuk Admin
│   │   │   ├── ai/            # API percakapan AI dengan grounding konteks
│   │   │   ├── assessments/   # API soal, submission, skor, dan riwayat
│   │   │   ├── auth/          # NextAuth catch-all & register Warga
│   │   │   ├── communities/   # API list, create, & join lingkungan
│   │   │   ├── emergency-contacts/ # API kontak darurat
│   │   │   ├── evacuation-points/  # API titik kumpul & posko
│   │   │   ├── evacuation-routes/  # API rute polyline evakuasi
│   │   │   └── pengurus/      # API permohonan peran pengurus
│   │   ├── globals.css        # Konfigurasi Tailwind CSS v4
│   │   ├── layout.tsx         # Root layout dengan Providers, Navbar, & Footer
│   │   └── page.tsx           # Landing Page publik
│   ├── components/
│   │   ├── EvacuationMap.tsx  # Komponen Peta Interaktif Leaflet (Client-side)
│   │   ├── Navbar.tsx         # Navigasi utama responsif dengan session badge
│   │   └── Providers.tsx      # NextAuth SessionProvider wrapper
│   ├── lib/
│   │   ├── assessment-engine.ts # Logika hitung skor, deteksi gap & action plan
│   │   ├── auth.ts            # Konfigurasi Auth.js / NextAuth
│   │   ├── gemini.ts          # Integrasi Gemini API & Smart Mock Fallback
│   │   └── prisma.ts          # Singleton Prisma Client
│   ├── types/
│   │   ├── index.ts           # Type definitions domain NARAGA
│   │   └── next-auth.d.ts     # Type augmentation untuk session User & Role
│   └── validators/
│       └── index.ts           # Skema validasi Zod untuk seluruh input form & API
├── .env                       # Variabel lingkungan lokal (SQLite & Mock AI)
├── README.md                  # Dokumentasi lengkap sistem
└── agents.md                  # File ini (Panduan kerja rekan tim)
```

---

## 🎯 3. Roadmap Tugas Rekan Tim (Frontend & UI/UX Slicing)

Halaman dasar (*functional baseline*) sudah terpasang dan berfungsi. Tugas utamamu adalah **mempercantik antarmuka (UI/UX) sesuai desain Figma**, meningkatkan responsivitas, dan menyempurnakan interaksi pengguna:

### 1. Landing Page (`src/app/page.tsx`)
* [ ] Tambahkan elemen visual modern: ilustrasi kesiapsiagaan pemukiman tangguh bencana, visualisasi alur cara kerja (Asesmen $\rightarrow$ Deteksi Gap $\rightarrow$ Aksi Nyata $\rightarrow$ Peta Evakuasi).
* [ ] Sempurnakan section statistik kesiapan dan testimoni komunitas percontohan.

### 2. Formulir Asesmen & Hasil Evaluasi (`src/app/assessment/page.tsx`)
* [ ] **Formulir Asesmen:**
  - Tambahkan *progress bar* interaktif (misal: "Pertanyaan 4 dari 10").
  - Desain tombol pilihan **Ya / Tidak / Tidak Tahu** agar memiliki transisi warna yang jelas saat dipilih.
* [ ] **Laporan Hasil Asesmen:**
  - Desain visualisasi **Readiness Score** yang menarik (lingkaran persentase atau *speedometer gauge*).
  - Berikan tab pemisah antara **Kesenjangan Sarana Fisik (Facility Gaps)** dan **Kesenjangan Pemahaman (Awareness Gaps)**.
  - Tampilkan kartu rekomendasi **Rencana Aksi (Action Plan)** dengan label prioritas (*High, Medium, Low*).

### 3. Peta Evakuasi Lingkungan (`src/app/map/page.tsx` & `src/components/EvacuationMap.tsx`)
* [ ] Perbagus tampilan pop-up Leaflet dan legenda titik kumpul.
* [ ] Sediakan drawer atau panel samping daftar titik kumpul dan rute evakuasi dengan tombol *filter* (Titik Kumpul Saja / Posko Saja / Rute Saja).
* [ ] Percantik tombol kontak darurat agar saat dibuka di ponsel langsung memicu panggilan telepon (`tel:...`).

### 4. Asisten Cerdas AI (`src/app/ai/page.tsx`)
* [ ] Buat tampilan chat bubble yang rapi (mirip antarmuka ChatGPT/Gemini) dengan indikator pengetikan (*typing animation*).
* [ ] Sediakan badge informatif yang menunjukkan bahwa respon AI didasarkan pada data asesmen wilayah pengguna (*Context-Grounded*).
* [ ] Tambahkan tombol *Copy to Clipboard* pada saran mitigasi yang dihasilkan AI.

### 5. Dashboard Pengguna (`src/app/dashboard/page.tsx`)
* [ ] Sempurnakan kartu ringkasan untuk Warga (kartu skor lingkungan, status rute evakuasi).
* [ ] Untuk Pengurus Lingkungan: tambahkan ringkasan aksi cepat (tambah titik kumpul baru, sebar kontak darurat).
* [ ] Tambahkan modal konfirmasi interaktif pada tombol pengajuan verifikasi Pengurus.

### 6. Panel Administrator (`src/app/admin/page.tsx`)
* [ ] Percantik tabel peninjauan pengajuan pengurus dengan tombol aksi **Setujui** (hijau) dan **Tolak** (merah).
* [ ] Tambahkan modal pop-up untuk memasukkan catatan persetujuan/penolakan sebelum status dikirim.

---

## 🔑 4. Akun Cepat untuk Pengujian (Quick Login)

Saat menjalankan `npm run dev`, kamu bisa langsung masuk ke halaman `/login` dan klik tombol **Quick Fill** untuk berganti-ganti peran:

* **Administrator:** `admin@naraga.id` | Sandi: `admin123`
* **Pengurus Lingkungan:** `pengurus@naraga.id` | Sandi: `pengurus123`
* **Warga:** `warga@naraga.id` | Sandi: `warga123`

---

## 📋 5. Checklist Kesiapan Sebelum Serah Terima ke QA Engineer

Setelah selesai melakukan pekerjaan antarmuka, pastikan hal-hal berikut terpenuhi sebelum diserahkan kembali:

1. [ ] Jalankan `npm run build` dan pastikan statusnya **Compiled successfully** tanpa error TypeScript.
2. [ ] Jalankan `npm run lint` untuk memastikan tidak ada kesalahan format kode yang fatal.
3. [ ] Uji navigasi di resolusi mobile (360px - 414px) dan desktop (1280px+).
4. [ ] Pastikan alur: **Daftar Warga $\rightarrow$ Gabung Lingkungan $\rightarrow$ Isi Asesmen $\rightarrow$ Lihat Skor $\rightarrow$ Buka Peta $\rightarrow$ Tanya AI** berjalan mulus tanpa reload halaman yang macet.

*Selamat berkarya! Jika ada kontrak API atau logika data yang perlu disesuaikan, seluruh endpoint dan validasi skema ada di folder `src/app/api/` dan `src/validators/index.ts`.*
