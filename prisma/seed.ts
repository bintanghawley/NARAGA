import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Memulai seeding database NARAGA...");

  // 1. Bersihkan data lama (jika ada)
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

  // 2. Buat Komunitas Percontohan
  const community1 = await prisma.community.create({
    data: {
      name: "Komunitas Siaga RT 03 / RW 05 Sekaran",
      rt: "03",
      rw: "05",
      kelurahan: "Sekaran",
      kecamatan: "Gunung Pati",
      kota: "Kota Semarang",
      province: "Jawa Tengah",
      description: "Wilayah pemukiman perbukitan dengan potensi risiko genangan air dan tanah gerak di area lereng.",
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
      description: "Wilayah pemukiman padat dekat kawasan kampus UNNES.",
    },
  });

  console.log("🏘️ Komunitas percontohan berhasil dibuat.");

  // 3. Buat User Bawaan (Admin, Pengurus, Warga)
  const salt = await bcrypt.genSalt(10);
  const passwordAdmin = await bcrypt.hash("admin123", salt);
  const passwordPengurus = await bcrypt.hash("pengurus123", salt);
  const passwordWarga = await bcrypt.hash("warga123", salt);

  // Admin Internal
  await prisma.user.create({
    data: {
      name: "Administrator NARAGA",
      email: "admin@naraga.id",
      passwordHash: passwordAdmin,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  // Pengurus Lingkungan
  await prisma.user.create({
    data: {
      name: "Bambang Sudarsono (Ketua RT 03)",
      email: "pengurus@naraga.id",
      passwordHash: passwordPengurus,
      role: "PENGURUS",
      status: "ACTIVE",
      communityId: community1.id,
    },
  });

  // Warga Lingkungan RT 03
  await prisma.user.create({
    data: {
      name: "Siti Rahmawati (Warga RT 03)",
      email: "warga@naraga.id",
      passwordHash: passwordWarga,
      role: "WARGA",
      status: "ACTIVE",
      communityId: community1.id,
    },
  });

  // Warga Baru (Belum bergabung lingkungan)
  await prisma.user.create({
    data: {
      name: "Dimas Pratama",
      email: "warga.baru@naraga.id",
      passwordHash: passwordWarga,
      role: "WARGA",
      status: "ACTIVE",
      communityId: null,
    },
  });

  console.log("👥 Akun default (Admin, Pengurus, Warga) berhasil dibuat.");

  // 4. Bank Soal Asesmen Kesiapsiagaan (Sesuai Desain Figma NARAGA)
  const questions = [
    {
      question: "Apakah lingkungan memiliki titik kumpul yang sudah ditentukan?",
      category: "EVACUATION",
      targetRole: "ALL",
      weight: 1.0,
      order: 1,
    },
    {
      question: "Apakah warga mengetahui jalur evakuasi yang harus digunakan?",
      category: "EVACUATION",
      targetRole: "ALL",
      weight: 1.0,
      order: 2,
    },
    {
      question: "Apakah informasi kontak darurat tersedia dan mudah ditemukan?",
      category: "EMERGENCY_CONTACT",
      targetRole: "ALL",
      weight: 1.0,
      order: 3,
    },
    {
      question: "Apakah akses menuju titik kumpul dapat digunakan dengan baik?",
      category: "EVACUATION",
      targetRole: "ALL",
      weight: 1.0,
      order: 4,
    },
    {
      question: "Apakah informasi kesiapsiagaan sudah disosialisasikan kepada warga?",
      category: "INFORMATION",
      targetRole: "ALL",
      weight: 1.0,
      order: 5,
    },
  ];

  for (const q of questions) {
    await prisma.assessmentQuestion.create({ data: q });
  }

  console.log("📋 10 Butir pertanyaan asesmen kesiapsiagaan berhasil di-seed.");

  // 5. Titik Geospasial Kesiapsiagaan (Evacuation Points)
  await prisma.evacuationPoint.createMany({
    data: [
      {
        communityId: community1.id,
        name: "Titik Kumpul Utama (Lapangan RW 05 Sekaran)",
        type: "ASSEMBLY_POINT",
        description: "Area terbuka berumput luas, bebas dari tiang listrik tinggi dan pohon rimbun yang rawan tumbang.",
        latitude: -7.04921,
        longitude: 110.43825,
      },
      {
        communityId: community1.id,
        name: "Posko Logistik & Medis Darurat (Balai Warga RT 03)",
        type: "AID_POST",
        description: "Bangunan serbaguna dengan kran air bersih dan ruang istirahat sementara untuk lansia dan anak-anak.",
        latitude: -7.04875,
        longitude: 110.4379,
      },
      {
        communityId: community1.id,
        name: "Area Rawan Longsor Lereng Gang Kenanga",
        type: "HAZARD_POINT",
        description: "Tebing terjal tanpa retaining wall beton, rawan runtuh saat hujan lebat lebih dari 3 jam.",
        latitude: -7.0501,
        longitude: 110.4395,
      },
    ],
  });

  // 6. Rute Evakuasi (Polyline Coordinates JSON)
  await prisma.evacuationRoute.create({
    data: {
      communityId: community1.id,
      name: "Jalur Evakuasi Barat (Gang Mawar menuju Lapangan RW 05)",
      description: "Jalur jalan aspal selebar 4 meter yang landai dan aman dilalui kendaraan roda dua maupun pejalan kaki.",
      coordinates: JSON.stringify([
        [-7.0478, 110.4372],
        [-7.0482, 110.4376],
        [-7.04875, 110.4379],
        [-7.04921, 110.43825],
      ]),
      color: "#10b981", // Hijau aman
    },
  });

  console.log("🗺️ Titik kumpul dan jalur evakuasi berhasil di-seed.");

  // 7. Kontak Darurat
  await prisma.emergencyContact.createMany({
    data: [
      {
        communityId: community1.id,
        name: "Bpk. Bambang Sudarsono (Ketua RT 03)",
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
    ],
  });

  console.log("📞 Daftar kontak darurat berhasil di-seed.");
  console.log("✅ Seeding database NARAGA selesai dengan sukses!");
}

main()
  .catch((e) => {
    console.error("❌ Error saat seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
