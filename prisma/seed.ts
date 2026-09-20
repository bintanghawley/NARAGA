import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { ALL_ASSESSMENT_QUESTIONS } from "../src/lib/assessment-questions";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Memulai seeding database NARAGA...");

  // 1. Bersihkan data lama (urutan sesuai relasi foreign key)
  await prisma.assessmentAnswer.deleteMany();
  await prisma.assessmentSession.deleteMany();
  await prisma.assessmentQuestion.deleteMany();
  await prisma.pengurusApplication.deleteMany();
  await prisma.evacuationPoint.deleteMany();
  await prisma.evacuationRoute.deleteMany();
  await prisma.emergencyContact.deleteMany();
  await prisma.user.deleteMany();
  await prisma.community.deleteMany();

  console.log("🧹 Data lama berhasil dibersihkan.");

  // ================================================================
  // 2. KOMUNITAS PERCONTOHAN (3 Lingkungan)
  // ================================================================
  const community1 = await prisma.community.create({
    data: {
      name: "Komunitas Siaga RT 03 / RW 05 Sekaran",
      rt: "03",
      rw: "05",
      kelurahan: "Sekaran",
      kecamatan: "Gunung Pati",
      kota: "Kota Semarang",
      province: "Jawa Tengah",
      description:
        "Wilayah pemukiman perbukitan dengan potensi risiko genangan air dan tanah gerak di area lereng. Memiliki 120 KK aktif.",
    },
  });

  const community2 = await prisma.community.create({
    data: {
      name: "Komunitas Siaga RT 01 / RW 02 Sekaran",
      rt: "01",
      rw: "02",
      kelurahan: "Sekaran",
      kecamatan: "Gunung Pati",
      kota: "Kota Semarang",
      province: "Jawa Tengah",
      description:
        "Wilayah pemukiman padat dekat kawasan kampus UNNES. Memiliki 85 KK aktif.",
    },
  });

  const community3 = await prisma.community.create({
    data: {
      name: "Komunitas Siaga RT 07 / RW 03 Patemon",
      rt: "07",
      rw: "03",
      kelurahan: "Patemon",
      kecamatan: "Gunung Pati",
      kota: "Kota Semarang",
      province: "Jawa Tengah",
      description:
        "Wilayah dataran rendah dekat aliran sungai Kaligarang, rawan banjir musiman saat intensitas hujan tinggi.",
    },
  });

  console.log("🏘️ 3 Komunitas percontohan berhasil dibuat.");

  // ================================================================
  // 3. AKUN DEMO (Admin=Evan, Pengurus=Raffi, Warga=Firman, +Bonus)
  // ================================================================
  const salt = await bcrypt.genSalt(10);
  const passwordAdmin = await bcrypt.hash("admin123", salt);
  const passwordPengurus = await bcrypt.hash("pengurus123", salt);
  const passwordWarga = await bcrypt.hash("warga123", salt);

  // Admin Internal — Evan Mahardika
  const userAdmin = await prisma.user.create({
    data: {
      name: "Evan Mahardika (Administrator Wilayah)",
      email: "admin@naraga.id",
      passwordHash: passwordAdmin,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  // Pengurus Lingkungan — Raffi Bintang Hawley
  const userPengurus = await prisma.user.create({
    data: {
      name: "Raffi Bintang Hawley (Ketua RT 03)",
      email: "pengurus@naraga.id",
      passwordHash: passwordPengurus,
      role: "PENGURUS",
      status: "ACTIVE",
      communityId: community1.id,
    },
  });

  // Warga — Firman Maulana
  const userWarga = await prisma.user.create({
    data: {
      name: "Firman Maulana (Warga RT 03)",
      email: "warga@naraga.id",
      passwordHash: passwordWarga,
      role: "WARGA",
      status: "ACTIVE",
      communityId: community1.id,
    },
  });

  // Warga Baru — belum bergabung lingkungan (untuk uji alur join)
  const userWargaBaru = await prisma.user.create({
    data: {
      name: "Dimas Pratama",
      email: "warga.baru@naraga.id",
      passwordHash: passwordWarga,
      role: "WARGA",
      status: "ACTIVE",
      communityId: null,
    },
  });

  // Warga tambahan di community2
  const userWarga2 = await prisma.user.create({
    data: {
      name: "Siti Rahmawati (Warga RT 01)",
      email: "siti@naraga.id",
      passwordHash: passwordWarga,
      role: "WARGA",
      status: "ACTIVE",
      communityId: community2.id,
    },
  });

  console.log(
    "👥 5 Akun demo (Admin Evan, Pengurus Raffi, Warga Firman, +2 bonus) berhasil dibuat."
  );

  // ================================================================
  // 4. BANK SOAL ASESMEN (60 Butir: 30 Pengurus + 30 Warga)
  // ================================================================
  const createdQuestions = [];
  for (const q of ALL_ASSESSMENT_QUESTIONS) {
    const created = await prisma.assessmentQuestion.create({ data: q });
    createdQuestions.push(created);
  }

  console.log(
    "📋 60 Butir pertanyaan asesmen kesiapsiagaan (30 Pengurus & 30 Warga) berhasil di-seed."
  );

  // ================================================================
  // 5. DATA DUMMY: SESI ASESMEN + JAWABAN (Pengurus & Warga)
  // ================================================================

  // --- Sesi Asesmen Pengurus (Raffi) ---
  const pengurusQuestions = createdQuestions.filter(
    (q) => q.targetRole === "PENGURUS"
  );
  // Simulasi: 22 YA, 5 TIDAK, 3 TIDAK_TAHU dari 30 soal
  const pengurusAnswers = pengurusQuestions.map((q, idx) => {
    if (idx < 22) return { questionId: q.id, answer: "YA" };
    if (idx < 27) return { questionId: q.id, answer: "TIDAK" };
    return { questionId: q.id, answer: "TIDAK_TAHU" };
  });

  const pengurusSession = await prisma.assessmentSession.create({
    data: {
      userId: userPengurus.id,
      communityId: community1.id,
      roleAtSubmit: "PENGURUS",
      score: 73.33,
      totalQuestions: 30,
      metCount: 22,
      facilityGapCount: 5,
      awarenessGapCount: 3,
      actionPlanJson: JSON.stringify([
        {
          id: "plan-p1",
          title: "Pengadaan & Penataan Sarana Evakuasi Lingkungan",
          priority: "HIGH",
          description:
            "Menetapkan lokasi titik kumpul aman yang disepakati musyawarah warga serta memasang rambu evakuasi hijau standar pada persimpangan gang/jalan.",
        },
        {
          id: "plan-p2",
          title: "Pelengkapan Alat Pemadam & Kotak P3K Komunal",
          priority: "HIGH",
          description:
            "Mengadakan minimal 2 unit APAR (Alat Pemadam Api Ringan) serta kotak P3K komunal di setiap pos RT.",
        },
        {
          id: "plan-p3",
          title: "Pembentukan Tim Relawan Tanggap Darurat",
          priority: "MEDIUM",
          description:
            "Membentuk tim relawan yang terlatih pertolongan pertama dan evakuasi, minimal 5 orang per RT.",
        },
        {
          id: "plan-p4",
          title: "Sosialisasi Prosedur Peringatan Dini",
          priority: "MEDIUM",
          description:
            "Melaksanakan sosialisasi berkala tentang bunyi sirine, jalur evakuasi, dan titik kumpul kepada seluruh warga.",
        },
        {
          id: "plan-p5",
          title: "Pembaruan Peta Rawan & Data Kontak Darurat",
          priority: "LOW",
          description:
            "Memperbarui data peta titik rawan bencana dan daftar kontak darurat setiap 6 bulan sekali.",
        },
      ]),
      completedAt: new Date("2026-09-18T10:30:00Z"),
    },
  });

  // Insert jawaban pengurus
  for (const ans of pengurusAnswers) {
    await prisma.assessmentAnswer.create({
      data: {
        sessionId: pengurusSession.id,
        questionId: ans.questionId,
        answer: ans.answer,
      },
    });
  }

  // --- Sesi Asesmen Warga (Firman) ---
  const wargaQuestions = createdQuestions.filter(
    (q) => q.targetRole === "WARGA"
  );
  // Simulasi: 18 YA, 7 TIDAK, 5 TIDAK_TAHU dari 30 soal
  const wargaAnswers = wargaQuestions.map((q, idx) => {
    if (idx < 18) return { questionId: q.id, answer: "YA" };
    if (idx < 25) return { questionId: q.id, answer: "TIDAK" };
    return { questionId: q.id, answer: "TIDAK_TAHU" };
  });

  const wargaSession = await prisma.assessmentSession.create({
    data: {
      userId: userWarga.id,
      communityId: community1.id,
      roleAtSubmit: "WARGA",
      score: 60.0,
      totalQuestions: 30,
      metCount: 18,
      facilityGapCount: 7,
      awarenessGapCount: 5,
      actionPlanJson: JSON.stringify([
        {
          id: "plan-w1",
          title: "Penyusunan Tas Siaga Bencana Keluarga",
          priority: "HIGH",
          description:
            "Setiap keluarga menyiapkan tas siaga berisi dokumen penting, senter, P3K, air minum, makanan tahan lama, dan obat-obatan rutin.",
        },
        {
          id: "plan-w2",
          title: "Pengenalan Jalur Evakuasi ke Seluruh Anggota Keluarga",
          priority: "HIGH",
          description:
            "Memastikan seluruh anggota keluarga, termasuk anak-anak dan lansia, mengetahui rute evakuasi terdekat menuju titik kumpul.",
        },
        {
          id: "plan-w3",
          title: "Penyimpanan Nomor Kontak Darurat di HP",
          priority: "HIGH",
          description:
            "Menyimpan nomor darurat (BPBD, Damkar, Ambulans, Ketua RT) di kontak ponsel seluruh anggota keluarga dewasa.",
        },
        {
          id: "plan-w4",
          title: "Ikut Simulasi Evakuasi Berkala",
          priority: "MEDIUM",
          description:
            "Berpartisipasi aktif dalam simulasi evakuasi bencana yang diselenggarakan pengurus lingkungan minimal 1x per tahun.",
        },
        {
          id: "plan-w5",
          title: "Pemeriksaan Instalasi Listrik & Gas Rumah",
          priority: "MEDIUM",
          description:
            "Memeriksa kondisi kabel listrik, stop kontak, dan selang kompor gas secara rutin untuk mencegah kebakaran.",
        },
        {
          id: "plan-w6",
          title: "Pemahaman Tanda Peringatan Dini Alam",
          priority: "LOW",
          description:
            "Mengenali tanda-tanda alam sebelum bencana: retakan tanah (longsor), air sungai keruh mendadak (banjir), hewan bergerak tidak wajar.",
        },
        {
          id: "plan-w7",
          title: "Asuransi & Proteksi Aset Rumah Tangga",
          priority: "LOW",
          description:
            "Mempertimbangkan asuransi bencana alam untuk melindungi aset dan properti rumah tangga dari kerugian.",
        },
      ]),
      completedAt: new Date("2026-09-19T14:15:00Z"),
    },
  });

  // Insert jawaban warga
  for (const ans of wargaAnswers) {
    await prisma.assessmentAnswer.create({
      data: {
        sessionId: wargaSession.id,
        questionId: ans.questionId,
        answer: ans.answer,
      },
    });
  }

  console.log(
    "📊 2 Sesi asesmen dummy (Pengurus: 73.33% & Warga: 60%) + jawaban detail berhasil di-seed."
  );

  // ================================================================
  // 6. DATA DUMMY: PENGAJUAN PENGURUS (1 Approved, 1 Pending)
  // ================================================================

  // Pengajuan yang sudah APPROVED (Raffi — sudah jadi pengurus)
  await prisma.pengurusApplication.create({
    data: {
      userId: userPengurus.id,
      communityId: community1.id,
      fullName: "Raffi Bintang Hawley",
      phoneNumber: "0812-3456-7890",
      position: "Ketua RT 03",
      reason:
        "Saya sebagai ketua RT ingin berkontribusi aktif dalam mengelola kesiapsiagaan bencana di lingkungan RT 03 RW 05 Sekaran, termasuk pengelolaan titik kumpul dan jalur evakuasi.",
      status: "APPROVED",
      adminNotes:
        "Disetujui. Pengurus aktif yang sudah divalidasi oleh kelurahan.",
      reviewedAt: new Date("2026-09-15T09:00:00Z"),
    },
  });

  // Pengajuan PENDING (Siti dari community2 mengajukan jadi pengurus)
  await prisma.pengurusApplication.create({
    data: {
      userId: userWarga2.id,
      communityId: community2.id,
      fullName: "Siti Rahmawati",
      phoneNumber: "0856-7890-1234",
      position: "Koordinator Keamanan RT 01",
      reason:
        "Saya ingin berkontribusi lebih untuk keselamatan warga di RT 01 RW 02, khususnya dalam pemetaan rute evakuasi kampus UNNES menuju titik kumpul aman.",
      status: "PENDING",
      adminNotes: null,
      reviewedAt: null,
    },
  });

  console.log(
    "📝 2 Pengajuan pengurus dummy (1 Approved, 1 Pending) berhasil di-seed."
  );

  // ================================================================
  // 7. TITIK GEOSPASIAL (Evacuation Points — 6 Titik)
  // ================================================================
  await prisma.evacuationPoint.createMany({
    data: [
      // Community 1 — RT 03/RW 05 Sekaran
      {
        communityId: community1.id,
        name: "Titik Kumpul Utama (Lapangan RW 05 Sekaran)",
        type: "ASSEMBLY_POINT",
        description:
          "Area terbuka berumput luas, bebas dari tiang listrik tinggi dan pohon rimbun yang rawan tumbang. Kapasitas ±200 orang.",
        latitude: -7.04921,
        longitude: 110.43825,
      },
      {
        communityId: community1.id,
        name: "Titik Kumpul Alternatif (Halaman Masjid Al-Ikhlas)",
        type: "ASSEMBLY_POINT",
        description:
          "Area parkir masjid yang cukup luas dan terbuka, dekat jalan utama. Kapasitas ±80 orang.",
        latitude: -7.04855,
        longitude: 110.43755,
      },
      {
        communityId: community1.id,
        name: "Posko Logistik & Medis Darurat (Balai Warga RT 03)",
        type: "AID_POST",
        description:
          "Bangunan serbaguna dengan kran air bersih dan ruang istirahat sementara untuk lansia dan anak-anak. Dilengkapi P3K & tandu.",
        latitude: -7.04875,
        longitude: 110.4379,
      },
      {
        communityId: community1.id,
        name: "Area Rawan Longsor Lereng Gang Kenanga",
        type: "HAZARD_POINT",
        description:
          "Tebing terjal tanpa retaining wall beton, rawan runtuh saat hujan lebat lebih dari 3 jam. Hindari area ini saat cuaca buruk.",
        latitude: -7.0501,
        longitude: 110.4395,
      },
      {
        communityId: community1.id,
        name: "Zona Genangan Air (Cekungan Jl. Cempaka)",
        type: "HAZARD_POINT",
        description:
          "Titik rendah yang sering tergenang air setinggi 30-50 cm saat hujan deras. Drainase tidak memadai.",
        latitude: -7.04965,
        longitude: 110.43685,
      },
      // Community 2 — RT 01/RW 02 Sekaran
      {
        communityId: community2.id,
        name: "Titik Kumpul Kampus UNNES (Parkiran FIS)",
        type: "ASSEMBLY_POINT",
        description:
          "Area parkir terbuka luas di kampus UNNES yang dapat digunakan sebagai titik kumpul darurat. Kapasitas ±500 orang.",
        latitude: -7.04725,
        longitude: 110.43545,
      },
    ],
  });

  // ================================================================
  // 8. RUTE EVAKUASI (3 Rute Polyline)
  // ================================================================
  await prisma.evacuationRoute.createMany({
    data: [
      {
        communityId: community1.id,
        name: "Jalur Evakuasi Barat (Gang Mawar → Lapangan RW 05)",
        description:
          "Jalur jalan aspal selebar 4 meter yang landai dan aman dilalui kendaraan roda dua maupun pejalan kaki. Waktu tempuh ±5 menit.",
        coordinates: JSON.stringify([
          [-7.0478, 110.4372],
          [-7.0482, 110.4376],
          [-7.04875, 110.4379],
          [-7.04921, 110.43825],
        ]),
        color: "#10b981",
      },
      {
        communityId: community1.id,
        name: "Jalur Evakuasi Timur (Gang Kenanga → Masjid Al-Ikhlas)",
        description:
          "Jalur alternatif melalui gang kecil selebar 2 meter. Hanya untuk pejalan kaki. Waktu tempuh ±7 menit.",
        coordinates: JSON.stringify([
          [-7.0499, 110.4391],
          [-7.0495, 110.4387],
          [-7.049, 110.4382],
          [-7.04855, 110.43755],
        ]),
        color: "#f59e0b",
      },
      {
        communityId: community2.id,
        name: "Jalur Evakuasi Kampus (Perumahan RT 01 → Parkiran UNNES)",
        description:
          "Jalur jalan utama selebar 6 meter menuju area kampus UNNES. Cocok untuk evakuasi massal dengan kendaraan.",
        coordinates: JSON.stringify([
          [-7.048, 110.4365],
          [-7.0478, 110.436],
          [-7.0475, 110.4355],
          [-7.04725, 110.43545],
        ]),
        color: "#3b82f6",
      },
    ],
  });

  console.log(
    "🗺️ 6 Titik evakuasi + 3 Jalur rute evakuasi berhasil di-seed."
  );

  // ================================================================
  // 9. KONTAK DARURAT (10 Kontak — Lokal + Nasional)
  // ================================================================
  await prisma.emergencyContact.createMany({
    data: [
      // Kontak Lokal — Community 1
      {
        communityId: community1.id,
        name: "Bpk. Raffi Bintang Hawley (Ketua RT 03)",
        category: "PENGURUS_RT",
        phoneNumber: "0812-3456-7890",
        isGlobal: false,
      },
      {
        communityId: community1.id,
        name: "Posko Siaga Bencana RW 05 Sekaran",
        category: "BPBD",
        phoneNumber: "0821-9876-5432",
        isGlobal: false,
      },
      {
        communityId: community1.id,
        name: "Bpk. Haryono (Koordinator Relawan RT 03)",
        category: "PENGURUS_RT",
        phoneNumber: "0813-5678-4321",
        isGlobal: false,
      },
      // Kontak Lokal — Community 2
      {
        communityId: community2.id,
        name: "Ibu Siti Rahmawati (Pengurus Keamanan RT 01)",
        category: "PENGURUS_RT",
        phoneNumber: "0856-7890-1234",
        isGlobal: false,
      },
      // Kontak Nasional / Global
      {
        communityId: null,
        name: "BPBD Kota Semarang (Layanan Kedaruratan)",
        category: "BPBD",
        phoneNumber: "024-7629464",
        isGlobal: true,
      },
      {
        communityId: null,
        name: "Panggilan Darurat Terpadu Nasional (Bebas Pulsa)",
        category: "KEPOLISIAN",
        phoneNumber: "112",
        isGlobal: true,
      },
      {
        communityId: null,
        name: "Puskesmas Pembantu Gunung Pati / Sekaran",
        category: "MEDIS",
        phoneNumber: "024-8508092",
        isGlobal: true,
      },
      {
        communityId: null,
        name: "Dinas Pemadam Kebakaran Kota Semarang",
        category: "DAMKAR",
        phoneNumber: "024-113",
        isGlobal: true,
      },
      {
        communityId: null,
        name: "RSUD Kota Semarang (IGD 24 Jam)",
        category: "MEDIS",
        phoneNumber: "024-8413476",
        isGlobal: true,
      },
      {
        communityId: null,
        name: "SAR / Basarnas Semarang",
        category: "BPBD",
        phoneNumber: "024-7623126",
        isGlobal: true,
      },
    ],
  });

  console.log("📞 10 Kontak darurat (lokal + nasional) berhasil di-seed.");
  console.log("");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("✅ SEEDING DATABASE NARAGA SELESAI DENGAN SUKSES!");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("");
  console.log("📊 Ringkasan Data yang Di-seed:");
  console.log("   • 3 Komunitas/Lingkungan percontohan");
  console.log("   • 5 Akun demo (Admin, Pengurus, 3 Warga)");
  console.log("   • 60 Butir soal asesmen (30 Pengurus + 30 Warga)");
  console.log("   • 2 Sesi asesmen lengkap + jawaban detail");
  console.log("   • 2 Pengajuan pengurus (1 Approved, 1 Pending)");
  console.log("   • 6 Titik evakuasi geospasial");
  console.log("   • 3 Rute evakuasi polyline");
  console.log("   • 10 Kontak darurat");
  console.log("");
  console.log("🔑 Akun Login Demo:");
  console.log("   Admin    → admin@naraga.id    / admin123");
  console.log("   Pengurus → pengurus@naraga.id  / pengurus123");
  console.log("   Warga    → warga@naraga.id     / warga123");
}

main()
  .catch((e) => {
    console.error("❌ Error saat seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
