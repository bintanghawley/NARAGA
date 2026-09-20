import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  Compass,
  Bot,
  Settings,
  ClipboardList,
  ArrowRight,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import DashboardClientActions from "./DashboardClientActions";
import ActionPlanSection, { ActionPlanItem } from "./ActionPlanSection";

export default async function DashboardPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      community: true,
      pengurusApplications: { orderBy: { createdAt: "desc" } },
      assessmentSessions: {
        orderBy: { completedAt: "desc" },
        take: 1,
        include: {
          answers: { include: { question: true } },
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const allCommunities = await prisma.community.findMany({
    orderBy: { name: "asc" },
  });

  const latestSession = user.assessmentSessions[0];
  const pendingApplication = user.pengurusApplications.find(
    (a) => a.status === "PENDING"
  );

  const firstName = user.name ? user.name.split(" ")[0] : "Evan";
  const hasTakenTest = Boolean(latestSession);

  // Komunitas detail
  const communityName =
    user.community?.name || "Komunitas Siaga RT 03 / RW 05 Sekaran";
  const communityDetail = user.community
    ? `RT ${user.community.rt} / RW ${user.community.rw}, Kel. ${user.community.kelurahan}`
    : "RT 03 / RW 05, Kel. Sekaran";

  // Data Skor & Metrik
  const displayScore = latestSession ? Math.round(latestSession.score) : 72;
  const displayFacilityGaps = latestSession ? latestSession.facilityGapCount : 3;
  const displayMetCount = latestSession ? (latestSession.metCount || 8) : 8;

  let scoreTitle = "Cukup Siap";
  let scoreDesc =
    "Beberapa aspek sudah terpenuhi, namun masih ada yang perlu diperbaiki.";
  if (displayScore >= 80) {
    scoreTitle = "Sangat Siap";
    scoreDesc = "Sebagian besar aspek kesiapsiagaan telah terpenuhi dengan sangat baik.";
  } else if (displayScore < 50) {
    scoreTitle = "Kurang Siap";
    scoreDesc = "Perlu banyak perbaikan sarana keselamatan dan sosialisasi warga.";
  }

  // Data Action Plan Rekomendasi
  const defaultActionPlans: ActionPlanItem[] = [
    {
      id: "action-1",
      title: "Pengadaan & Penataan Sarana Evakuasi Lingkungan",
      priority: "Tinggi",
      description:
        "Menetapkan lokasi titik kumpul aman yang disepakati musyawarah warga serta memasang rambu evakuasi hijau standar pada persimpangan gang/jalan (Apakah lingkungan RT/RW Anda telah memiliki titik kumpul aman (assembly point) resmi yang telah disepakati bersama?).",
    },
    {
      id: "action-2",
      title: "Perbaikan Fasilitas Kesiapsiagaan",
      priority: "Tinggi",
      description:
        "Menindaklanjuti ketiadaan fasilitas keselamatan terkait: Apakah setiap keluarga di lingkungan Anda memahami panduan penyusunan Tas Siaga Bencana (dokumen penting, senter, P3K, makanan tahan lama)?",
    },
    {
      id: "action-3",
      title: "Pengadaan & Penataan Sarana Evakuasi Lingkungan",
      priority: "Tinggi",
      description:
        "Menetapkan lokasi titik kumpul aman yang disepakati musyawarah warga serta memasang rambu evakuasi hijau standar pada persimpangan gang/jalan (Apakah jalur evakuasi menuju titik kumpul telah dilengkapi dengan rambu atau penunjuk arah yang jelas dan mudah terlihat?).",
    },
  ];

  let actionPlanItems: ActionPlanItem[] = defaultActionPlans;
  if (latestSession?.actionPlanJson) {
    try {
      const parsed = JSON.parse(latestSession.actionPlanJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        actionPlanItems = parsed.map((item: any, idx: number) => ({
          id: item.id || `plan-${idx}`,
          title: item.title || "Tindakan Kesiapsiagaan",
          priority:
            item.priority === "HIGH"
              ? "Tinggi"
              : item.priority === "MEDIUM"
              ? "Sedang"
              : item.priority || "Tinggi",
          description: item.description || "",
        }));
      }
    } catch (e) {
      actionPlanItems = defaultActionPlans;
    }
  }

  return (
    <div className="min-h-screen bg-[#ebf4fa] py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start gap-6 lg:gap-8">
        {/* ======================================================== */}
        {/* 1. SIDEBAR KIRI (Floating White Card Sesuai Desain Figma) */}
        {/* ======================================================== */}
        <aside className="w-full lg:w-64 bg-white rounded-[28px] p-4 shadow-sm border border-gray-100 flex-shrink-0 space-y-2">
          {/* Menu 1: Overview (Aktif - Deep Teal Pill) */}
          <Link
            href="/dashboard"
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-[#0e6f68] text-white font-semibold text-sm shadow-xs transition"
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <Compass className="w-5 h-5 text-white" />
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

          {/* Menu 3: Settings */}
          <Link
            href="/settings"
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-50 font-medium text-sm transition"
          >
            <div className="w-5 h-5 flex items-center justify-center text-gray-600">
              <Settings className="w-5 h-5" />
            </div>
            <span>Settings</span>
          </Link>
        </aside>

        {/* ======================================================== */}
        {/* 2. KONTEN UTAMA KANAN                                     */}
        {/* ======================================================== */}
        <main className="flex-1 w-full space-y-6">
          {/* ---------------------------------------------------- */}
          {/* STATE A: SEBELUM MELAKUKAN TES                       */}
          {/* ---------------------------------------------------- */}
          {!hasTakenTest ? (
            <>
              {/* Sapaan Awal */}
              <h1 className="text-3xl sm:text-[34px] font-bold text-gray-900 tracking-tight">
                Welcome , {firstName}
              </h1>

              {/* Banner 1: Lakukan Tes (Mint Green Card) */}
              <div className="bg-[#d7f5ef] border border-[#a2ecd8] rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#bbf0e4] flex items-center justify-center flex-shrink-0 text-[#0e6f68] mt-0.5">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                      Lakukan Tes
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed max-w-2xl font-normal">
                      Lakukan tes kesiapan lingkungan untuk melihat seberapa siap lingkunganmu menghadapi bencana alam
                    </p>
                  </div>
                </div>

                <Link
                  href="/assessment"
                  className="bg-[#0e6f68] hover:bg-[#0a524d] text-white font-medium text-xs sm:text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 whitespace-nowrap transition transform active:scale-98 shadow-sm flex-shrink-0 self-start md:self-center"
                >
                  <span>Mulai Tes Kesiapanmu</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Banner 2: Tentukan Lingkungan Tempat Tinggal Anda (Peach Card) */}
              <DashboardClientActions
                communities={allCommunities}
                userId={user.id}
                userCommunity={user.community}
                userRole={user.role}
                pendingApplication={pendingApplication}
                showLocationBanner={true}
                showPengurusBanner={false}
              />

              {/* 3 Summary Cards Placeholder State */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1: Kesiapsiagaan lingkungan */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[300px]">
                  <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                    <Shield className="w-4 h-4 text-gray-700" />
                    <span>Kesiapsiagaan lingkungan</span>
                  </div>

                  <div className="my-6 flex items-center justify-center">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke="#dbe7f2"
                          strokeWidth="10"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-[11px] font-medium text-gray-500">Skor</span>
                        <span className="text-xl sm:text-2xl font-black text-gray-900">--</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-2xl font-extrabold text-gray-900 tracking-tight">Belum ada</p>
                    <p className="text-xs text-gray-500 mt-1">Akan tampil skor kesiapan lingkunganmu</p>
                  </div>
                </div>

                {/* Card 2: Kesenjangan Fasilitas */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[300px]">
                  <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4 text-gray-700" />
                    <span>Kesenjangan Fasilitas</span>
                  </div>

                  <div className="my-10 flex items-center justify-center">
                    <div className="w-6 h-1.5 bg-red-500 rounded-full" />
                  </div>

                  <div>
                    <p className="text-2xl font-extrabold text-gray-900 tracking-tight">Belum ada</p>
                    <p className="text-xs text-gray-500 mt-1">Akan tampil jumlah kesenjangan fasilitas</p>
                  </div>
                </div>

                {/* Card 3: Kesenjangan Pemahaman */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[300px]">
                  <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-gray-700" />
                    <span>Kesenjangan Pemahaman</span>
                  </div>

                  <div className="my-10 flex items-center justify-center">
                    <div className="w-6 h-1.5 bg-[#0e6f68] rounded-full" />
                  </div>

                  <div>
                    <p className="text-2xl font-extrabold text-gray-900 tracking-tight">Cukup Siap</p>
                    <p className="text-xs text-gray-500 mt-1">Akan tampil jumlah kesenjangan pemahaman</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* ---------------------------------------------------- */
            /* STATE B: SETELAH MELAKUKAN TES (Sesuai Desain Figma)  */
            /* ---------------------------------------------------- */
            <>
              {/* Sapaan Welcome back & Detail Komunitas */}
              <div className="space-y-1">
                <h1 className="text-3xl sm:text-[34px] font-bold text-gray-900 tracking-tight">
                  Welcome back, {firstName}
                </h1>
                <p className="text-sm sm:text-base font-bold text-gray-900">
                  {communityName} ({communityDetail})
                </p>
              </div>

              {/* 3 Summary Cards State Hasil Tes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1: Kesiapsiagaan lingkungan (Orange Donut Meter) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[300px]">
                  <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                    <Shield className="w-4 h-4 text-gray-700" />
                    <span>Kesiapsiagaan lingkungan</span>
                  </div>

                  {/* Circular Orange Donut Sesuai Figma */}
                  <div className="my-6 flex items-center justify-center">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="38"
                          fill="transparent"
                          stroke="#f3f4f6"
                          strokeWidth="11"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="38"
                          fill="transparent"
                          stroke="#f5840d"
                          strokeWidth="11"
                          strokeDasharray={238.76}
                          strokeDashoffset={238.76 * (1 - displayScore / 100)}
                          strokeLinecap="round"
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-xs font-medium text-gray-400">Skor</span>
                        <span className="text-2xl sm:text-3xl font-extrabold text-[#f5840d]">
                          {displayScore}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-2xl font-black text-gray-900 tracking-tight">
                      {scoreTitle}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      {scoreDesc}
                    </p>
                  </div>
                </div>

                {/* Card 2: Kesenjangan Fasilitas (Big Red 3 Number Sesuai Figma) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[300px]">
                  <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4 text-gray-700" />
                    <span>Kesenjangan Fasilitas</span>
                  </div>

                  {/* Red Big Number Left Aligned */}
                  <div className="my-6 flex items-center justify-start">
                    <span className="text-4xl sm:text-5xl font-extrabold text-red-500 tracking-tight">
                      {displayFacilityGaps}
                    </span>
                  </div>

                  <div>
                    <p className="text-2xl font-black text-gray-900 tracking-tight">
                      Belum Tersedia
                    </p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      Fasilitas keselamatan yang masih perlu disediakan.
                    </p>
                  </div>
                </div>

                {/* Card 3: Kesenjangan Pemahaman (Big Teal 8 Number Sesuai Figma) */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[300px]">
                  <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-gray-700" />
                    <span>Kesenjangan Pemahaman</span>
                  </div>

                  {/* Teal Big Number Left Aligned */}
                  <div className="my-6 flex items-center justify-start">
                    <span className="text-4xl sm:text-5xl font-extrabold text-[#0e6f68] tracking-tight">
                      {displayMetCount}
                    </span>
                  </div>

                  <div>
                    <p className="text-2xl font-black text-gray-900 tracking-tight">
                      Sudah Terpenuhi
                    </p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      Aspek kesiapsiagaan yang sudah terpenuhi di lingkungan.
                    </p>
                  </div>
                </div>
              </div>

              {/* Seksi Action Plan Interaktif */}
              <ActionPlanSection initialItems={actionPlanItems} />

              {/* Banner Pengurus Lingkungan & Modal Actions */}
              <DashboardClientActions
                communities={allCommunities}
                userId={user.id}
                userCommunity={user.community}
                userRole={user.role}
                pendingApplication={pendingApplication}
                showLocationBanner={false}
                showPengurusBanner={true}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
