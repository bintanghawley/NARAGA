import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";

export default async function RiwayatPage() {
  const session = await auth();

  if (!session || !session.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      community: true,
      assessmentSessions: {
        orderBy: { completedAt: "desc" },
        include: {
          community: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  // Format riwayat dari database
  let historyItems = (user.assessmentSessions || []).map((s) => {
    const dateObj = s.completedAt ? new Date(s.completedAt) : new Date();
    const formattedDate = dateObj.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const locationName =
      s.community?.kelurahan ||
      s.community?.name ||
      user.community?.kelurahan ||
      user.community?.name ||
      "Karanganyar Gunung";

    const roundedScore = Math.round(s.score);
    let statusLabel = "Cukup Siap";
    if (roundedScore >= 80) statusLabel = "Sangat Siap";
    else if (roundedScore < 60) statusLabel = "Kurang Siap";

    return {
      id: s.id,
      date: formattedDate,
      location: locationName,
      score: roundedScore,
      status: statusLabel,
    };
  });

  // Jika database belum memiliki banyak riwayat, lengkapi dengan data riwayat percontohan sesuai desain Figma
  if (historyItems.length === 0) {
    historyItems = [
      {
        id: "demo-1",
        date: "20 September 2026",
        location: "Karanganyar Gunung",
        score: 72,
        status: "Cukup Siap",
      },
      {
        id: "demo-2",
        date: "20 September 2026",
        location: "Karanganyar Gunung",
        score: 72,
        status: "Cukup Siap",
      },
      {
        id: "demo-3",
        date: "20 September 2026",
        location: "Karanganyar Gunung",
        score: 72,
        status: "Cukup Siap",
      },
      {
        id: "demo-4",
        date: "20 September 2026",
        location: "Karanganyar Gunung",
        score: 72,
        status: "Cukup Siap",
      },
    ];
  }

  return (
    <div className="min-h-screen bg-[#ebf4fa] py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start gap-6 lg:gap-8">
        {/* ======================================================== */}
        {/* 1. SIDEBAR KIRI UTAMA (Floating White Card Sesuai Figma) */}
        {/* ======================================================== */}
        {/* ======================================================== */}
        {/* 1. SIDEBAR KIRI UTAMA FIXED & SLIDING HIJAU               */}
        {/* ======================================================== */}
        <DashboardSidebar />

        {/* ======================================================== */}
        {/* 2. KONTEN UTAMA: HALAMAN RIWAYAT                         */}
        {/* ======================================================== */}
        <main className="flex-1 w-full space-y-6">
          {/* Header Bar: Tombol Kembali + Judul Riwayat + Tombol Kerjakan Lagi */}
          <div className="flex items-center justify-between gap-3 animate-emerge">
            <div className="flex items-center gap-3">
              <Link
                href="/settings"
                className="p-1.5 -ml-1.5 rounded-xl text-gray-900 hover:bg-white/70 transition flex items-center justify-center group"
                title="Kembali ke Pengaturan"
              >
                <ArrowLeft className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5] group-hover:-translate-x-0.5 transition-transform" />
              </Link>
              <h1 className="text-3xl sm:text-[34px] font-bold text-gray-900 tracking-tight">
                Riwayat
              </h1>
            </div>

            <Link
              href="/assessment?retake=true"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#0e6f68] hover:bg-[#0a524d] rounded-xl transition shadow-xs cursor-pointer"
              title="Kerjakan lagi tes kesiapsiagaan"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Kerjakan Lagi</span>
            </Link>
          </div>

          {/* Kontainer Putih Besar Kartu Riwayat */}
          <div className="bg-white rounded-[28px] p-5 sm:p-7 lg:p-8 shadow-sm border border-gray-100 space-y-3.5">
            {historyItems.map((item, idx) => (
              <div
                key={item.id}
                style={{ animationDelay: `${idx * 70 + 80}ms` }}
                className="p-4 sm:p-5 rounded-2xl border border-gray-200/80 bg-white hover:border-teal-200 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs group animate-emerge"
              >
                {/* Kolom Kiri: Tanggal & Lokasi Wilayah */}
                <div className="space-y-1.5 sm:min-w-[240px]">
                  <div className="flex items-center gap-2.5 text-sm sm:text-base font-bold text-gray-900">
                    <Calendar className="w-4 h-4 text-gray-600 flex-shrink-0" />
                    <span>{item.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span>{item.location}</span>
                  </div>
                </div>

                {/* Kolom Tengah: Skor & Status Kesiapan */}
                <div className="space-y-0.5 sm:min-w-[150px]">
                  <div className="text-sm sm:text-base font-bold text-gray-900">
                    {item.score}%
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-gray-900">
                    {item.status}
                  </div>
                </div>

                {/* Kolom Kanan: Tombol Aksi Lihat Hasil */}
                <div className="self-end sm:self-center">
                  <Link
                    href={`/settings/riwayat/${item.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 hover:border-[#0e6f68] hover:bg-teal-50/50 hover:text-[#0e6f68] text-xs sm:text-sm font-semibold text-gray-700 transition shadow-2xs group-hover:border-teal-300"
                  >
                    <span>Lihat Hasil</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#0e6f68] transition" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
