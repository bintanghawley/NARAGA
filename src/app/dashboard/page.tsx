import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  ClipboardList,
  ArrowRight,
} from "lucide-react";
import DashboardClientActions from "./DashboardClientActions";
import ActionPlanSection, { ActionPlanItem } from "./ActionPlanSection";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardOverviewCards from "./DashboardOverviewCards";

export default async function DashboardPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/login");
  }

  // Khusus Akun Admin, dashboard digantikan langsung oleh Panel Admin Verifikasi
  if (session.user.role === "ADMIN") {
    redirect("/admin");
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
        {/* ======================================================== */}
        {/* 1. SIDEBAR KIRI FIXED & ANIMASI SLIDING HIJAU             */}
        {/* ======================================================== */}
        <DashboardSidebar />

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
              <h1 className="text-3xl sm:text-[34px] font-bold text-gray-900 tracking-tight animate-emerge">
                Welcome , {firstName}
              </h1>

              {/* Banner 1: Lakukan Tes (Mint Green Card) */}
              <div className="bg-[#d7f5ef] border border-[#a2ecd8] rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all animate-emerge stagger-1">
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
              <div className="animate-emerge stagger-2">
                <DashboardClientActions
                  communities={allCommunities}
                  userId={user.id}
                  userCommunity={user.community}
                  userRole={user.role}
                  pendingApplication={pendingApplication}
                  showLocationBanner={true}
                  showPengurusBanner={false}
                />
              </div>

              {/* 3 Summary Cards Placeholder State dengan Animasi Terbit */}
              <DashboardOverviewCards
                hasTakenTest={false}
                score={0}
                scoreTitle=""
                scoreDesc=""
                facilityGaps={0}
                metCount={0}
              />
            </>
          ) : (
            /* ---------------------------------------------------- */
            /* STATE B: SETELAH MELAKUKAN TES (Sesuai Desain Figma)  */
            /* ---------------------------------------------------- */
            <>
              {/* Sapaan Welcome back & Detail Komunitas */}
              <div className="space-y-1 animate-emerge">
                <h1 className="text-3xl sm:text-[34px] font-bold text-gray-900 tracking-tight">
                  Welcome back, {firstName}
                </h1>
                <p className="text-sm sm:text-base font-bold text-gray-900">
                  {communityName} ({communityDetail})
                </p>
              </div>

              {/* 3 Summary Cards State Hasil Tes dengan Animasi Terbit & Count-Up */}
              <DashboardOverviewCards
                hasTakenTest={true}
                score={displayScore}
                scoreTitle={scoreTitle}
                scoreDesc={scoreDesc}
                facilityGaps={displayFacilityGaps}
                metCount={displayMetCount}
              />

              {/* Seksi Action Plan Interaktif dengan Animasi Terbit Bertahap */}
              <div className="animate-emerge stagger-4">
                <ActionPlanSection initialItems={actionPlanItems} />
              </div>

              {/* Banner Pengurus Lingkungan & Modal Actions */}
              <div className="animate-emerge stagger-5">
                <DashboardClientActions
                  communities={allCommunities}
                  userId={user.id}
                  userCommunity={user.community}
                  userRole={user.role}
                  pendingApplication={pendingApplication}
                  showLocationBanner={false}
                  showPengurusBanner={true}
                />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
