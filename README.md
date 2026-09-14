# NARAGA: Platform Kesiapsiagaan Komunitas Berbasis Readiness Gap Menuju Pemukiman Tangguh Bencana

> **Karya untuk:** Infinitera 2.0 Web Development Competition  
> **Tema:** Inovasi Teknologi Berkelanjutan Menuju Ketahanan Pemukiman (SDG 11: Sustainable Cities and Communities)  
> **Tim Pengusul:** Backend & Fullstack Architecture  

---

## 📌 1. Gambaran Umum Proyek

**NARAGA** adalah platform berbasis web yang berfokus pada **kesiapsiagaan bencana pra-kejadian (*pre-disaster preparedness*)** di tingkat komunitas pemukiman (lingkungan RT, RW, atau desa). 

Mayoritas aplikasi kebencanaan yang beredar berfokus pada pemantauan makro atau tanggap darurat pasca-bencana. Kenyataannya di lapangan, banyak warga pemukiman yang tidak mengetahui titik kumpul resmi, tidak mengenal rute evakuasi yang aman, dan minim pemahaman tas siaga bencana. 

NARAGA hadir untuk mengukur dan memetakan **Readiness Gap** (kesenjangan kesiapsiagaan) yang terjadi di komunitas:
1. **Kesenjangan Sarana Fisik (*Facility Gap*):** Fasilitas keselamatan fisik memang belum tersedia di lingkungan pemukiman (misal: belum ada titik kumpul yang ditetapkan, belum ada APAR atau sirine peringatan).
2. **Kesenjangan Pemahaman & Sosialisasi (*Awareness Gap*):** Titik kumpul atau jalur evakuasi mungkin sudah ada, namun warga menjawab **"Tidak Tahu"** karena minimnya sosialisasi dan plang penunjuk arah di lapangan.

Melalui instrumen asesmen terstruktur dengan jawaban **Ya / Tidak / Tidak Tahu**, sistem menghasilkan **Readiness Score**, memetakan **Readiness Gap**, menyusun **Action Plan** terarah bagi pengurus lingkungan, menampilkan **Peta Evakuasi Interaktif**, serta menyediakan **Context-Aware AI Assistant** yang terhubung dengan data kesiapan wilayah.

---

## 🛠️ 2. Arsitektur & Teknologi yang Digunakan

Proyek ini dibangun menggunakan arsitektur monolit modern berbasis lapisan (*Layered Architecture*) yang cepat, stabil, dan type-safe:

* **Framework Utama:** [Next.js 16 (App Router)](https://nextjs.org/) dengan React 19 & TypeScript
* **Styling & UI:** [Tailwind CSS v4](https://tailwindcss.com/) & [Lucide React](https://lucide.dev/)
* **ORM & Database:** 
  * [Prisma ORM](https://www.prisma.io/) v6
  * **Database Lokal (Development):** SQLite (`file:./dev.db`) &bull; *Zero manual setup, langsung jalan tanpa software eksternal*
  * **Database Produksi (Deployment):** Kompatibel 100% dengan Cloud PostgreSQL ([Neon](https://neon.tech/) atau [Supabase](https://supabase.com/))
* **Autentikasi & RBAC:** [Auth.js / NextAuth v5](https://authjs.dev/) dengan Credentials Provider (Email & Hash Password `bcryptjs`)
* **Validasi Skema:** [Zod](https://zod.dev/) untuk perlindungan input data di sisi server
* **Pemetaan Geospasial:** [Leaflet.js](https://leafletjs.com/) & [OpenStreetMap](https://www.openstreetmap.org/) (Tanpa API Key, gratis & open-source)
* **Kecerdasan Buatan (AI):** [Google Gemini API](https://ai.google.dev/) (@google/genai SDK) dengan fitur **Fallback Mock Cerdas** (langsung dapat dites tanpa API Key eksternal)

---

## 🔒 3. Sistem Hak Akses (RBAC 3 Role)

Sistem keamanan NARAGA menerapkan pembatasan hak akses berjenjang:

```
[ Pendaftaran Akun Baru ]
           │
           ▼
    ( Role: WARGA )
           │
           ├──► Mengisi Asesmen (Ya / Tidak / Tidak Tahu)
           ├──► Melihat Readiness Score & Action Plan
           ├──► Membuka Peta Evakuasi & Kontak Darurat
           ├──► Konsultasi dengan Context-Aware AI
           │
           ▼
[ Mengajukan Peran Pengurus Lingkungan ]
 (Isi data RT/RW, Jabatan, & No. WhatsApp)
           │
           ▼ (Status: PENDING)
[ Review oleh Admin Internal ]
    ├── Dititlak  ──► Tetap sebagai Warga
    └── Disetujui ──► Naik ke ( Role: PENGURUS )
                           │
                           ├──► Mengelola Titik Kumpul & Posko di Peta
                           ├──► Mengelola Jalur Evakuasi Lingkungan
                           └──► Memantau Kesiapan & Rencana Aksi Komunitas
```

---

## 🚀 4. Cara Menjalankan Aplikasi di Lokal

Proyek ini telah dikonfigurasi agar dapat langsung dijalankan oleh siapa pun yang meng-*clone* repositori tanpa konfigurasi manual yang rumit.

### Prasyarat:
* Node.js versi 18+ (Disarankan Node.js 20 atau 22+)
* npm

### Langkah Instalasi:

1. **Buka folder proyek di terminal:**
   ```bash
   cd C:\xampp\htdocs\naraga
   ```

2. **Install Dependensi:**
   ```bash
   npm install
   ```

3. **Inisialisasi Database Lokal (SQLite):**
   ```bash
   npm run db:push
   ```
   *Perintah ini akan membuat database lokal `dev.db` secara otomatis.*

4. **Isi Data Awal (Seeding Akun & Bank Soal):**
   ```bash
   npm run db:seed
   ```
   *Perintah ini mengisikan data percontohan: akun default, 10 indikator kesiapsiagaan Destana BNPB, titik peta, dan kontak darurat.*

5. **Jalankan Server Development:**
   ```bash
   npm run dev
   ```
   Buka peramban di: **[http://localhost:3000](http://localhost:3000)**

---

## 👥 5. Akun Uji Coba Default (Seeded Accounts)

Untuk mempermudah pengujian antarmuka dan hak akses peran oleh tim pengembang maupun dewan juri, telah disediakan 4 akun bawaan:

| Role | Nama | Email | Kata Sandi | Keterangan |
| :--- | :--- | :--- | :--- | :--- |
| **ADMIN** | Administrator NARAGA | `admin@naraga.id` | `admin123` | Akses penuh verifikasi pengajuan pengurus di `/admin` |
| **PENGURUS** | Bambang Sudarsono (Ketua RT 03) | `pengurus@naraga.id` | `pengurus123` | Mengelola titik kumpul & jalur evakuasi di peta |
| **WARGA** | Siti Rahmawati | `warga@naraga.id` | `warga123` | Terdaftar di Komunitas RT 03 Sekaran, asesmen mandiri |
| **WARGA (BARU)** | Dimas Pratama | `warga.baru@naraga.id` | `warga123` | Belum bergabung dengan lingkungan manapun (uji coba alur join) |

> 💡 **Tip:** Di halaman `/login` telah disediakan tombol **"Quick Fill"** untuk mengisi email dan password akun demo hanya dengan 1 kali klik.

---

## 📡 6. Dokumentasi API Endpoints

Seluruh API route telah teruji type-safe dan terlindungi validasi Zod:

### Autentikasi:
* `POST /api/auth/[...nextauth]` - Route handler sesi Auth.js (Login, Logout, Session)
* `POST /api/auth/register` - Pendaftaran user baru (default role: `WARGA`)

### Lingkungan & Komunitas:
* `GET /api/communities` - Mengambil daftar seluruh lingkungan RT/RW terdaftar
* `POST /api/communities` - Mendaftarkan lingkungan baru (Pengurus/Admin)
* `POST /api/communities/[id]/join` - Mengaitkan user Warga ke lingkungan tertentu

### Alur Verifikasi Pengurus (RBAC):
* `POST /api/pengurus/apply` - Warga mengajukan diri menjadi Pengurus Lingkungan
* `GET /api/pengurus/apply` - Mengecek status pengajuan milik user yang sedang login
* `GET /api/admin/applications` - Admin melihat daftar seluruh pengajuan pengurus
* `POST /api/admin/applications/[id]/review` - Admin menyetujui (`APPROVED`) atau menolak (`REJECTED`) pengajuan

### Asesmen & Readiness Gap Engine:
* `GET /api/assessments/questions` - Mengambil bank soal asesmen aktif (10 butir indikator)
* `POST /api/assessments/submit` - Mengirim jawaban asesmen, mengeksekusi rule-based engine, menghasilkan Readiness Score, Gap, dan Action Plan
* `GET /api/assessments/history` - Melihat riwayat asesmen user atau komunitas
* `GET /api/assessments/[id]` - Melihat rincian lengkap satu sesi asesmen

### Geospasial & Kedaruratan:
* `GET /api/evacuation-points` - Mengambil titik kumpul, posko, dan titik rawan di peta
* `POST /api/evacuation-points` - Menambahkan titik baru ke peta (Pengurus/Admin)
* `GET /api/evacuation-routes` - Mengambil rute evakuasi (koordinat polyline)
* `POST /api/evacuation-routes` - Menambahkan rute evakuasi baru (Pengurus/Admin)
* `GET /api/emergency-contacts` - Mengambil daftar nomor telepon darurat
* `POST /api/emergency-contacts` - Menambahkan kontak darurat (Pengurus/Admin)

### Asisten AI Kontekstual:
* `POST /api/ai/chat` - Mengirim pertanyaan ke Context-Aware AI. Server otomatis menginjeksi skor dan daftar gap lingkungan pengguna sebagai panduan (*grounding*).

---

## 🌐 7. Panduan Migrasi ke Cloud PostgreSQL (Tahap Deployment)

Saat aplikasi siap di-deploy ke Vercel untuk penilaian juri:
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
6. Aplikasi langsung beralih ke database cloud tanpa perlu mengubah kode aplikasi bisnis lainnya!
