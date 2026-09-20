import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  RotateCcw,
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import RiwayatDetailCards from "./RiwayatDetailCards";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RiwayatDetailPage({ params }: PageProps) {
  const session = await auth();

  if (!session || !session.user?.id) {
    redirect("/login");
  }

  // Khusus Akun Admin, alihkan ke Panel Admin Verifikasi
  if (session.user.role === "ADMIN") {
    redirect("/admin");
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

  return (
    <div className="min-h-screen bg-[#ebf4fa] py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start gap-6 lg:gap-8">
        {/* ======================================================== */}
        {/* 1. SIDEBAR KIRI UTAMA FIXED & SLIDING HIJAU               */}
        {/* ======================================================== */}
        <DashboardSidebar />

        {/* ======================================================== */}
        {/* 2. KONTEN UTAMA: DETAIL RIWAYAT HASIL                    */}
        {/* ======================================================== */}
        <main className="flex-1 w-full space-y-6">
          {/* Header Bar: Tombol Kembali + Riwayat + Tanggal + Dot + Lokasi + Tombol Kerjakan Lagi */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-emerge">
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

            <Link
              href="/assessment?retake=true"
              className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#0e6f68] hover:bg-[#0a524d] rounded-xl transition shadow-xs cursor-pointer"
              title="Kerjakan lagi tes kesiapsiagaan"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Kerjakan Lagi</span>
            </Link>
          </div>

          {/* Kartu Detail Riwayat Interaktif dengan Animasi Count & Emerge */}
          <RiwayatDetailCards
            score={score}
            statusTitle={statusTitle}
            statusDesc={statusDesc}
            gapItems={gapItems}
            metItems={metItems}
          />
        </main>
      </div>
    </div>
  );
}
