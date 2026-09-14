import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";
import {
  Shield,
  Activity,
  MapPin,
  Bot,
  AlertTriangle,
  CheckCircle2,
  Users,
  Building2,
  Phone,
  ArrowRight,
  ClipboardCheck,
} from "lucide-react";
import DashboardClientActions from "./DashboardClientActions";

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Profil & Ringkasan Peran */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                user.role === "ADMIN"
                  ? "bg-purple-100 text-purple-700 border border-purple-200"
                  : user.role === "PENGURUS"
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                  : "bg-emerald-100 text-emerald-700 border border-emerald-200"
              }`}
            >
              Role: {user.role}
            </span>
            <span className="text-xs text-gray-500 font-mono">
              Status: {user.status}
            </span>
          </div>
          <h1 className="text-2xl font-black text-gray-900">
            Selamat Datang, {user.name}
          </h1>
          <p className="text-sm text-gray-600 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-gray-400" />
            {user.community
              ? `Komunitas: ${user.community.name} (RT ${user.community.rt} / RW ${user.community.rw}, Kel. ${user.community.kelurahan})`
              : "Anda belum bergabung dengan lingkungan RT/RW mana pun"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/assessment"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition shadow-sm"
          >
            <ClipboardCheck className="w-4 h-4" />
            Isi Asesmen Kesiapsiagaan
          </Link>
          {user.role === "ADMIN" && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition shadow-sm"
            >
              <Shield className="w-4 h-4" />
              Panel Verifikasi Admin
            </Link>
          )}
        </div>
      </div>

      {/* Widget Pemilihan Lingkungan jika belum bergabung */}
      {!user.communityId && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-base font-bold text-amber-900">
                Pilih Lingkungan Pemukiman Anda
              </h2>
              <p className="text-xs text-amber-700 mt-1">
                Untuk melihat rute evakuasi, kontak darurat, dan mengukur kesiapsiagaan wilayah Anda, silakan pilih lingkungan RT/RW yang tersedia:
              </p>
            </div>
          </div>
          <DashboardClientActions
            communities={allCommunities}
            userId={user.id}
            isJoined={false}
          />
        </div>
      )}

      {/* Notifikasi Status Pengajuan Pengurus */}
      {pendingApplication && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-bold text-blue-900">
                Pengajuan Peran Pengurus Sedang Ditinjau Admin
              </p>
              <p className="text-xs text-blue-700 mt-0.5">
                Diajukan untuk jabatan <strong>{pendingApplication.position}</strong> pada {new Date(pendingApplication.createdAt).toLocaleDateString("id-ID")}.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-blue-100 text-blue-800 rounded-lg">
            Menunggu Verifikasi
          </span>
        </div>
      )}

      {/* Status Readiness Lingkungan Saat Ini */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card Skor Kesiapan */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Readiness Score
            </span>
            <Activity className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="text-4xl font-extrabold text-gray-900">
              {latestSession ? `${latestSession.score}%` : "--"}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {latestSession
                ? `${latestSession.metCount} dari ${latestSession.totalQuestions} indikator keselamatan terpenuhi`
                : "Belum ada data evaluasi lingkungan"}
            </p>
          </div>
          <div className="pt-2 border-t border-gray-100">
            <Link
              href="/assessment"
              className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1"
            >
              {latestSession ? "Perbarui Asesmen" : "Mulai Evaluasi Sekarang"} &rarr;
            </Link>
          </div>
        </div>

        {/* Card Kesenjangan Fasilitas Fisik */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Facility Gaps (Belum Ada)
            </span>
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <div className="text-4xl font-extrabold text-red-600">
              {latestSession ? latestSession.facilityGapCount : "--"}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Sarana fisik keselamatan yang belum tersedia di pemukiman
            </p>
          </div>
          <div className="pt-2 border-t border-gray-100">
            <Link
              href="/ai?topic=fasilitas"
              className="text-xs font-semibold text-red-600 hover:underline flex items-center gap-1"
            >
              Konsultasi Solusi Fasilitas via AI &rarr;
            </Link>
          </div>
        </div>

        {/* Card Kesenjangan Pemahaman / Sosialisasi */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Awareness Gaps (Tidak Tahu)
            </span>
            <CheckCircle2 className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <div className="text-4xl font-extrabold text-amber-600">
              {latestSession ? latestSession.awarenessGapCount : "--"}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Indikator yang belum tersosialisasikan dengan jelas ke warga
            </p>
          </div>
          <div className="pt-2 border-t border-gray-100">
            <Link
              href="/ai?topic=sosialisasi"
              className="text-xs font-semibold text-amber-600 hover:underline flex items-center gap-1"
            >
              Langkah Sosialisasi Efektif &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Rencana Aksi (Action Plan) Terakhir */}
      {latestSession?.actionPlanJson && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Daftar Rekomendasi Rencana Aksi (Action Plan Terkini)
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Dihasilkan secara otomatis oleh sistem berdasarkan deteksi kesenjangan kesiapan
              </p>
            </div>
            <Link
              href="/assessment"
              className="text-xs font-semibold text-emerald-600 hover:underline"
            >
              Lihat Detail Asesmen
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {JSON.parse(latestSession.actionPlanJson).map((item: any) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      item.gapType === "FACILITY_GAP"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {item.gapType === "FACILITY_GAP" ? "Kebutuhan Fisik" : "Kebutuhan Sosialisasi"}
                  </span>
                  <span className="text-[10px] font-semibold text-gray-500">
                    Prioritas: {item.priority}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-gray-900">{item.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Opsi Pengajuan Pengurus jika role masih WARGA dan belum ada pending request */}
      {user.role === "WARGA" && !pendingApplication && user.communityId && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-blue-950">
              Apakah Anda Pengurus RT/RW di Lingkungan Ini?
            </h2>
            <p className="text-xs text-blue-700 max-w-xl">
              Ajukan peningkatan hak akses menjadi Pengurus Lingkungan untuk dapat mengelola titik kumpul aman, menambah rute evakuasi pada peta, dan memantau kesiapan warga.
            </p>
          </div>
          <DashboardClientActions
            communities={allCommunities}
            userId={user.id}
            isJoined={true}
            userCommunityId={user.communityId}
          />
        </div>
      )}
    </div>
  );
}
