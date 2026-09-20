import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  Compass,
  Bot,
  Settings,
  Sparkles,
  ArrowLeft,
  Calendar,
  Shield,
  AlertTriangle,
  CheckCircle2,
  X,
  Check,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RiwayatDetailPage({ params }: PageProps) {
  const session = await auth();

  if (!session || !session.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  // Coba ambil sesi asesmen dari database
  let dbSession: any = null;
  if (!id.startsWith("demo-")) {
    dbSession = await prisma.assessmentSession.findUnique({
      where: { id },
      include: {
        community: true,
        answers: {
          include: {
            question: true,
          },
        },
      },
    });
  }

  // Jika tidak ditemukan atau ID demo, gunakan data percontohan sesuai desain Figma
  const isDemo = !dbSession;

  let displayDate = "20 Agustus 2026";
  let displayLocation = "Karanganyar Gunung";
  let score = 72;
  let statusTitle = "Cukup Siap";
  let statusDesc =
    "Beberapa aspek sudah terpenuhi, namun masih ada yang perlu diperbaiki.";

  let gapItems: string[] = [
    "Jalur evakuasi belum diketahui",
    "Jalur evakuasi belum diketahui",
    "Jalur evakuasi belum diketahui",
  ];

  let metItems: string[] = [
    "Mengetahui lokasi titik kumpul",
    "Mengetahui lokasi titik kumpul",
    "Mengetahui lokasi titik kumpul",
  ];

  if (dbSession) {
    const dateObj = dbSession.completedAt
      ? new Date(dbSession.completedAt)
      : new Date();
    displayDate = dateObj.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    displayLocation =
      dbSession.community?.kelurahan ||
      dbSession.community?.name ||
      "Karanganyar Gunung";

    score = Math.round(dbSession.score);

    if (score >= 80) {
      statusTitle = "Sangat Siap";
      statusDesc =
        "Sebagian besar aspek kesiapsiagaan lingkungan telah terpenuhi dengan sangat baik.";
    } else if (score >= 60) {
      statusTitle = "Cukup Siap";
      statusDesc =
        "Beberapa aspek sudah terpenuhi, namun masih ada yang perlu diperbaiki.";
    } else {
      statusTitle = "Kurang Siap";
      statusDesc =
        "Perlu perhatian intensif untuk sarana evakuasi dan sosialisasi keselamatan warga.";
    }

    const dbGaps = (dbSession.answers || [])
      .filter((a: any) => a.answer === "TIDAK" || a.answer === "TIDAK_TAHU")
      .map((a: any) => a.question?.question || "Aspek kesiapsiagaan belum terpenuhi");

    const dbMets = (dbSession.answers || [])
      .filter((a: any) => a.answer === "YA")
      .map((a: any) => a.question?.question || "Aspek kesiapsiagaan telah terpenuhi");

    if (dbGaps.length > 0) gapItems = dbGaps;
    if (dbMets.length > 0) metItems = dbMets;
  }

  // Perhitungan circular donut SVG gauge
  const radius = 54;
  const circumference = 2 * Math.PI * radius; // ~339.292
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="min-h-screen bg-[#ebf4fa] py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start gap-6 lg:gap-8">
        {/* ======================================================== */}
        {/* 1. SIDEBAR KIRI UTAMA (Floating White Card Sesuai Figma) */}
        {/* ======================================================== */}
        <aside className="w-full lg:w-64 bg-white rounded-[28px] p-4 shadow-sm border border-gray-100 flex-shrink-0 space-y-2">
          {/* Menu 1: Overview */}
          <Link
            href="/dashboard"
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium text-sm transition"
          >
            <div className="w-5 h-5 flex items-center justify-center text-gray-600">
              <Compass className="w-5 h-5" />
            </div>
            <span>Overview</span>
          </Link>

          {/* Menu 2: Tanya AI ✨ */}
          <Link
            href="/ai"
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium text-sm transition"
          >
            <div className="w-5 h-5 flex items-center justify-center text-gray-600">
              <Bot className="w-5 h-5" />
            </div>
            <span className="flex items-center gap-1.5">
              Tanya AI <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </span>
          </Link>

          {/* Menu 3: Settings (ACTIVE - Deep Teal Pill) */}
          <Link
            href="/settings"
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-[#0e6f68] text-white font-semibold text-sm shadow-xs transition"
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <span>Settings</span>
          </Link>
        </aside>

        {/* ======================================================== */}
        {/* 2. KONTEN UTAMA: DETAIL RIWAYAT HASIL                    */}
        {/* ======================================================== */}
        <main className="flex-1 w-full space-y-6">
          {/* Header Bar: Tombol Kembali + Riwayat + Tanggal + Dot + Lokasi */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5">
            <Link
              href="/settings/riwayat"
              className="p-1.5 -ml-1.5 rounded-xl text-gray-900 hover:bg-white/70 transition flex items-center justify-center group"
              title="Kembali ke Riwayat"
            >
              <ArrowLeft className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5] group-hover:-translate-x-0.5 transition-transform" />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Riwayat
            </h1>
            <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-gray-900 ml-1 sm:ml-2">
              <Calendar className="w-4 h-4 text-gray-600 flex-shrink-0" />
              <span>{displayDate}</span>
            </div>
            <span className="text-gray-400 font-bold">•</span>
            <span className="text-sm sm:text-base font-bold text-gray-900">
              {displayLocation}
            </span>
          </div>

          {/* Kontainer Putih Utama (Ringkasan Kesiapsiagaan Lingkungan) */}
          <div className="bg-white rounded-[28px] p-6 sm:p-8 md:p-10 shadow-sm border border-gray-100 space-y-6 sm:space-y-8">
            {/* Label Header Kartu */}
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0e6f68] flex-shrink-0">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-gray-900">
                Ringkasan Kesiapsiagaan lingkungan
              </span>
            </div>

            {/* Visualisasi Donut Circular Gauge (Orange Circle) */}
            <div className="flex flex-col items-center justify-center pt-2 sm:pt-4">
              <div className="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
                  {/* Lingkaran Background Abu-abu */}
                  <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    stroke="#f3f4f6"
                    strokeWidth="12"
                    fill="transparent"
                  />
                  {/* Lingkaran Donut Orange Progresif */}
                  <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    stroke="#f97316"
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>

                {/* Konten Teks di Tengah Donut Chart */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-semibold text-gray-500">Skor</span>
                  <span className="text-3xl sm:text-[34px] font-extrabold text-gray-900 tracking-tight leading-none">
                    {score}%
                  </span>
                </div>
              </div>

              {/* Judul & Deskripsi Kesiapsiagaan */}
              <div className="text-center mt-4 space-y-1">
                <h2 className="text-2xl sm:text-[26px] font-bold text-gray-900">
                  {statusTitle}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                  {statusDesc}
                </p>
              </div>
            </div>

            {/* Grid Dua Kolom: Perlu Diperbaiki vs Sudah Diketahui */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 pt-2">
              {/* Kartu Kiri: Perlu Diperbaiki */}
              <div className="rounded-2xl border border-gray-200/90 bg-[#fbfdfc] overflow-hidden shadow-2xs">
                {/* Header bar kartu */}
                <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2.5 bg-gray-50/50">
                  <AlertTriangle className="w-4 h-4 text-gray-700 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-bold text-gray-900">
                    Perlu Diperbaiki
                  </span>
                </div>

                {/* Daftar item */}
                <div className="p-5 space-y-4">
                  {gapItems.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0 stroke-[2.5]" />
                      <span className="text-xs sm:text-sm font-semibold text-gray-900 leading-snug">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Kartu Kanan: Sudah Diketahui */}
              <div className="rounded-2xl border border-gray-200/90 bg-[#fbfdfc] overflow-hidden shadow-2xs">
                {/* Header bar kartu */}
                <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2.5 bg-gray-50/50">
                  <CheckCircle2 className="w-4 h-4 text-gray-700 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-bold text-gray-900">
                    Sudah Diketahui
                  </span>
                </div>

                {/* Daftar item */}
                <div className="p-5 space-y-4">
                  {metItems.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-[#0e6f68] mt-0.5 flex-shrink-0 stroke-[2.5]" />
                      <span className="text-xs sm:text-sm font-semibold text-gray-900 leading-snug">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
