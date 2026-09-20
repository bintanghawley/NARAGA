export interface SeedQuestion {
  question: string;
  category: "EVACUATION" | "FACILITY" | "INFORMATION" | "EMERGENCY_CONTACT";
  targetRole: "PENGURUS" | "WARGA";
  weight: number;
  order: number;
}

// ============================================================================
// 30 BUTIR SOAL KHUSUS PENGURUS LINGKUNGAN (TATA KELOLA & FASILITAS WILAYAH)
// ============================================================================
export const PENGURUS_QUESTIONS: SeedQuestion[] = [
  // Kategori: EVACUATION (8 Soal)
  {
    order: 1,
    category: "EVACUATION",
    targetRole: "PENGURUS",
    weight: 1.0,
    question: "Apakah pengurus telah menetapkan titik kumpul aman (assembly point) resmi yang telah disepakati bersama warga?",
  },
  {
    order: 2,
    category: "EVACUATION",
    targetRole: "PENGURUS",
    weight: 1.0,
    question: "Apakah jalur evakuasi utama di lingkungan telah bebas dari tumpukan material, parkir liar, atau portal yang terkunci saat darurat?",
  },
  {
    order: 3,
    category: "EVACUATION",
    targetRole: "PENGURUS",
    weight: 1.0,
    question: "Apakah lingkungan memiliki jalur evakuasi alternatif jika akses jalan utama terputus akibat genangan air atau pohon tumbang?",
  },
  {
    order: 4,
    category: "EVACUATION",
    targetRole: "PENGURUS",
    weight: 1.0,
    question: "Apakah telah terpasang rambu atau penunjuk arah evakuasi standar berwarna hijau di setiap persimpangan gang warga?",
  },
  {
    order: 5,
    category: "EVACUATION",
    targetRole: "PENGURUS",
    weight: 1.0,
    question: "Apakah lokasi titik kumpul aman dari ancaman reruntuhan atap bangunan, dinding rapuh, dan kabel/tiang listrik tegangan tinggi?",
  },
  {
    order: 6,
    category: "EVACUATION",
    targetRole: "PENGURUS",
    weight: 1.0,
    question: "Apakah pengurus memiliki rencana evakuasi khusus dan pendamping bagi warga rentan (lansia, balita, ibu hamil, disabilitas)?",
  },
  {
    order: 7,
    category: "EVACUATION",
    targetRole: "PENGURUS",
    weight: 1.0,
    question: "Apakah lingkungan pernah menyelenggarakan simulasi atau gladi evakuasi mandiri (drill) bersama warga dalam 1 tahun terakhir?",
  },
  {
    order: 8,
    category: "EVACUATION",
    targetRole: "PENGURUS",
    weight: 1.0,
    question: "Apakah rute evakuasi menuju titik kumpul memiliki penerangan jalan yang memadai saat malam hari?",
  },

  // Kategori: FACILITY (12 Soal)
  {
    order: 9,
    category: "FACILITY",
    targetRole: "PENGURUS",
    weight: 1.0,
    question: "Apakah di pos keamanan atau balai warga tersedia alat peringatan dini darurat (kentongan, sirine, megaphone, atau pengeras suara)?",
  },
  {
    order: 10,
    category: "FACILITY",
    targetRole: "PENGURUS",
    weight: 1.0,
    question: "Apakah pos keamanan atau balai warga dilengkapi kotak P3K umum lengkap dengan stok perban, antiseptik, dan obat darurat yang terawat?",
  },
  {
    order: 11,
    category: "FACILITY",
    targetRole: "PENGURUS",
    weight: 1.0,
    question: "Apakah lingkungan memiliki Alat Pemadam Api Ringan (APAR) atau karung goni di lokasi strategis yang masa kedaluwarsanya rutin dicek?",
  },
  {
    order: 12,
    category: "FACILITY",
    targetRole: "PENGURUS",
    weight: 1.0,
    question: "Apakah tersedia genset cadangan atau lampu darurat portabel yang siap difungsikan saat terjadi pemadaman listrik total?",
  },
  {
    order: 13,
    category: "FACILITY",
    targetRole: "PENGURUS",
    weight: 1.0,
    question: "Apakah saluran drainase dan gorong-gorong lingkungan rutin dibersihkan secara gotong royong sebelum musim hujan lebat?",
  },
  {
    order: 14,
    category: "FACILITY",
    targetRole: "PENGURUS",
    weight: 1.0,
    question: "Apakah posko lingkungan memiliki sumber air bersih darurat (tandon air/pompa manual) yang tetap berfungsi saat bencana?",
  },
  {
    order: 15,
    category: "FACILITY",
    targetRole: "PENGURUS",
    weight: 1.0,
    question: "Apakah posko darurat atau balai warga memiliki persediaan terpal, tikar, atau tenda darurat untuk pengungsian sementara?",
  },
  {
    order: 16,
    category: "FACILITY",
    targetRole: "PENGURUS",
    weight: 1.0,
    question: "Apakah lingkungan memiliki perlengkapan evakuasi air (seperti ban pelampung, tali keselamatan, atau perahu karet) jika wilayah rawan genangan/banjir?",
  },
  {
    order: 17,
    category: "FACILITY",
    targetRole: "PENGURUS",
    weight: 1.0,
    question: "Apakah dahan dan pohon-pohon rimbun yang membahayakan kabel listrik atau jalan gang rutin dipangkas oleh tim lingkungan?",
  },
  {
    order: 18,
    category: "FACILITY",
    targetRole: "PENGURUS",
    weight: 1.0,
    question: "Apakah tersedia perkakas kerja darurat (cangkul, sekop, gergaji mesin/manual, linggis, senter besar) di pos warga?",
  },
  {
    order: 19,
    category: "FACILITY",
    targetRole: "PENGURUS",
    weight: 1.0,
    question: "Apakah lingkungan memiliki pompa air portabel (alkon) untuk menyedot genangan banjir di titik-titik rawan?",
  },
  {
    order: 20,
    category: "FACILITY",
    targetRole: "PENGURUS",
    weight: 1.0,
    question: "Apakah tanggul penahan tanah atau tebing di sekitar pemukiman dalam kondisi kokoh tanpa retakan berbahaya?",
  },

  // Kategori: INFORMATION (6 Soal)
  {
    order: 21,
    category: "INFORMATION",
    targetRole: "PENGURUS",
    weight: 1.0,
    question: "Apakah pengurus RT/RW memiliki data sensus warga rentan (ibu hamil, disabilitas, lansia mandiri/non-mandiri) yang diperbarui berkala?",
  },
  {
    order: 22,
    category: "INFORMATION",
    targetRole: "PENGURUS",
    weight: 1.0,
    question: "Apakah pengurus mengadakan sosialisasi atau penyuluhan kebencanaan secara berkala dalam agenda rapat warga atau pertemuan RT?",
  },
  {
    order: 23,
    category: "INFORMATION",
    targetRole: "PENGURUS",
    weight: 1.0,
    question: "Apakah peta denah bahaya dan rute evakuasi lingkungan telah dicetak dan dipasang di papan informasi pos ronda atau balai warga?",
  },
  {
    order: 24,
    category: "INFORMATION",
    targetRole: "PENGURUS",
    weight: 1.0,
    question: "Apakah pengurus membagikan panduan penyusunan Tas Siaga Bencana (TSB) kepada setiap kepala keluarga di lingkungan?",
  },
  {
    order: 25,
    category: "INFORMATION",
    targetRole: "PENGURUS",
    weight: 1.0,
    question: "Apakah ada mekanisme ronda malam atau sistem piket keamanan lingkungan yang aktif memantau kondisi cuaca ekstrem?",
  },
  {
    order: 26,
    category: "INFORMATION",
    targetRole: "PENGURUS",
    weight: 1.0,
    question: "Apakah pengurus mengalokasikan pos dana kas darurat lingkungan untuk kebutuhan logistik penanganan pertama saat bencana?",
  },

  // Kategori: EMERGENCY_CONTACT (4 Soal)
  {
    order: 27,
    category: "EMERGENCY_CONTACT",
    targetRole: "PENGURUS",
    weight: 1.0,
    question: "Apakah terdapat penanggung jawab logistik yang bertugas mendata dan membagikan bantuan darurat secara adil saat musibah?",
  },
  {
    order: 28,
    category: "EMERGENCY_CONTACT",
    targetRole: "PENGURUS",
    weight: 1.0,
    question: "Apakah pengurus membentuk tim relawan siaga bencana RT/RW yang bertugas memandu proses evakuasi warga?",
  },
  {
    order: 29,
    category: "EMERGENCY_CONTACT",
    targetRole: "PENGURUS",
    weight: 1.0,
    question: "Apakah terdapat grup pesan singkat (WhatsApp/Telegram RT/RW) aktif khusus informasi kebencanaan dan peringatan dini BMKG/BPBD?",
  },
  {
    order: 30,
    category: "EMERGENCY_CONTACT",
    targetRole: "PENGURUS",
    weight: 1.0,
    question: "Apakah nomor kontak darurat penting (BPBD, Damkar, Polsek, Koramil, Ambulans) terpampang jelas di pos ronda/balai warga?",
  },
];

// ============================================================================
// 30 BUTIR SOAL KHUSUS WARGA (KESIAPSIAGAAN MANDIRI KELUARGA & HUNIAN)
// ============================================================================
export const WARGA_QUESTIONS: SeedQuestion[] = [
  // Kategori: EVACUATION (8 Soal)
  {
    order: 1,
    category: "EVACUATION",
    targetRole: "WARGA",
    weight: 1.0,
    question: "Apakah keluarga Anda mengetahui lokasi titik kumpul aman (assembly point) resmi yang telah ditetapkan di lingkungan RT/RW?",
  },
  {
    order: 2,
    category: "EVACUATION",
    targetRole: "WARGA",
    weight: 1.0,
    question: "Apakah Anda dan keluarga mengetahui minimal dua rute jalan yang dapat dilalui menuju titik kumpul jika salah satunya terhalang?",
  },
  {
    order: 3,
    category: "EVACUATION",
    targetRole: "WARGA",
    weight: 1.0,
    question: "Apakah keluarga Anda telah menentukan tempat bertemu darurat jika terjadi bencana saat anggota keluarga sedang terpencar?",
  },
  {
    order: 4,
    category: "EVACUATION",
    targetRole: "WARGA",
    weight: 1.0,
    question: "Apakah pintu dan jalur keluar utama di dalam rumah Anda bebas dari barang-barang yang dapat menghalangi evakuasi cepat?",
  },
  {
    order: 5,
    category: "EVACUATION",
    targetRole: "WARGA",
    weight: 1.0,
    question: "Apakah anggota keluarga Anda yang berusia anak-anak atau lansia memahami bunyi tanda bahaya (kentongan/sirine) darurat?",
  },
  {
    order: 6,
    category: "EVACUATION",
    targetRole: "WARGA",
    weight: 1.0,
    question: "Apakah Anda mengetahui langkah penyelamatan diri saat terjadi gempa bumi (Drop, Cover, Hold On / Berlutut, Lindungi Kepala, Bertahan)?",
  },
  {
    order: 7,
    category: "EVACUATION",
    targetRole: "WARGA",
    weight: 1.0,
    question: "Apakah keluarga Anda memiliki rencana evakuasi mandiri untuk anggota keluarga yang membutuhkan pendampingan khusus (bayi/lansia)?",
  },
  {
    order: 8,
    category: "EVACUATION",
    targetRole: "WARGA",
    weight: 1.0,
    question: "Apakah Anda mengetahui waktu tercepat yang dibutuhkan seluruh anggota keluarga untuk keluar rumah secara aman saat darurat?",
  },

  // Kategori: FACILITY (12 Soal)
  {
    order: 9,
    category: "FACILITY",
    targetRole: "WARGA",
    weight: 1.0,
    question: "Apakah keluarga Anda telah menyiapkan Tas Siaga Bencana (TSB) yang diletakkan di tempat yang mudah dijangkau saat darurat?",
  },
  {
    order: 10,
    category: "FACILITY",
    targetRole: "WARGA",
    weight: 1.0,
    question: "Apakah di dalam rumah Anda tersedia persediaan air minum dan makanan tahan lama (biskuit, makanan kaleng) minimal untuk 3 hari?",
  },
  {
    order: 11,
    category: "FACILITY",
    targetRole: "WARGA",
    weight: 1.0,
    question: "Apakah di rumah tersedia kotak P3K mandiri lengkap dengan plester, antiseptik, perban, dan obat-obatan pribadi keluarga?",
  },
  {
    order: 12,
    category: "FACILITY",
    targetRole: "WARGA",
    weight: 1.0,
    question: "Apakah di rumah Anda tersedia senter, lampu darurat (emergency lamp), atau baterai cadangan yang selalu siap digunakan?",
  },
  {
    order: 13,
    category: "FACILITY",
    targetRole: "WARGA",
    weight: 1.0,
    question: "Apakah di rumah tersedia alat pemadam darurat (APAR rumah tangga, selimut tebal, atau karung yang mudah dibasahi)?",
  },
  {
    order: 14,
    category: "FACILITY",
    targetRole: "WARGA",
    weight: 1.0,
    question: "Apakah Anda menyimpan peluit di dekat tempat tidur atau di Tas Siaga Bencana untuk meminta pertolongan saat terjebak reruntuhan?",
  },
  {
    order: 15,
    category: "FACILITY",
    targetRole: "WARGA",
    weight: 1.0,
    question: "Apakah perabotan rumah tangga berbobot berat (lemari tinggi, rak buku) telah dipasang pengunci/pengaman agar tidak roboh saat gempa?",
  },
  {
    order: 16,
    category: "FACILITY",
    targetRole: "WARGA",
    weight: 1.0,
    question: "Apakah instalasi kabel listrik di rumah Anda rutin dicek untuk mencegah risiko korsleting listrik penyebab kebakaran?",
  },
  {
    order: 17,
    category: "FACILITY",
    targetRole: "WARGA",
    weight: 1.0,
    question: "Apakah di rumah tersedia jas hujan, sepatu boots, atau pakaian ganti kedap air jika sewaktu-waktu harus evakuasi saat hujan badai?",
  },
  {
    order: 18,
    category: "FACILITY",
    targetRole: "WARGA",
    weight: 1.0,
    question: "Apakah Anda memiliki powerbank terisi penuh atau radio bertenaga baterai untuk memantau informasi saat listrik padam total?",
  },
  {
    order: 19,
    category: "FACILITY",
    targetRole: "WARGA",
    weight: 1.0,
    question: "Apakah di rumah Anda tersedia cadangan masker penutup hidung dan mulut untuk melindungi dari asap kebakaran atau debu runtuhan?",
  },
  {
    order: 20,
    category: "FACILITY",
    targetRole: "WARGA",
    weight: 1.0,
    question: "Apakah saluran air pembuangan di halaman rumah Anda bebas dari sampah dan endapan pasir agar tidak memicu genangan?",
  },

  // Kategori: INFORMATION (7 Soal)
  {
    order: 21,
    category: "INFORMATION",
    targetRole: "WARGA",
    weight: 1.0,
    question: "Apakah dokumen berharga keluarga (Akta Kelahiran, KK, Ijazah, Surat Tanah/Kendaraan) disimpan dalam map kedap air yang mudah dibawa?",
  },
  {
    order: 22,
    category: "INFORMATION",
    targetRole: "WARGA",
    weight: 1.0,
    question: "Apakah seluruh anggota keluarga dewasa mengetahui letak dan cara mematikan tuas sekring/MCB listrik utama di rumah?",
  },
  {
    order: 23,
    category: "INFORMATION",
    targetRole: "WARGA",
    weight: 1.0,
    question: "Apakah seluruh anggota keluarga dewasa mengetahui cara melepas regulator tabung gas elpiji dengan aman saat bencana?",
  },
  {
    order: 24,
    category: "INFORMATION",
    targetRole: "WARGA",
    weight: 1.0,
    question: "Apakah Anda mengetahui riwayat potensi bencana yang paling sering mengancam wilayah tempat tinggal Anda (banjir, gempa, angin kencang)?",
  },
  {
    order: 25,
    category: "INFORMATION",
    targetRole: "WARGA",
    weight: 1.0,
    question: "Apakah Anda rutin memantau prakiraan cuaca dan informasi peringatan dini dari aplikasi resmi BMKG atau BPBD?",
  },
  {
    order: 26,
    category: "INFORMATION",
    targetRole: "WARGA",
    weight: 1.0,
    question: "Apakah Anda mengetahui tetangga sekitar rumah Anda yang merupakan lansia sebatang kara atau penyandang disabilitas yang butuh pertolongan?",
  },
  {
    order: 27,
    category: "INFORMATION",
    targetRole: "WARGA",
    weight: 1.0,
    question: "Apakah Anda dan keluarga pernah mendiskusikan rencana penyelamatan diri jika terjadi kebakaran atau gempa bumi di malam hari?",
  },

  // Kategori: EMERGENCY_CONTACT (3 Soal)
  {
    order: 28,
    category: "EMERGENCY_CONTACT",
    targetRole: "WARGA",
    weight: 1.0,
    question: "Apakah Anda menyimpan nomor telepon darurat penting (Posko BPBD, Pemadam Kebakaran, Ambulans, Polisi) di kontak ponsel Anda?",
  },
  {
    order: 29,
    category: "EMERGENCY_CONTACT",
    targetRole: "WARGA",
    weight: 1.0,
    question: "Apakah Anda menyimpan nomor kontak pengurus RT/RW dan pos keamanan lingkungan di ponsel Anda?",
  },
  {
    order: 30,
    category: "EMERGENCY_CONTACT",
    targetRole: "WARGA",
    weight: 1.0,
    question: "Apakah Anda tergabung aktif dalam grup pesan warga (WhatsApp RT/RW) untuk menerima pembaruan informasi kedaruratan lingkungan?",
  },
];

export const ALL_ASSESSMENT_QUESTIONS = [
  ...PENGURUS_QUESTIONS,
  ...WARGA_QUESTIONS,
];
