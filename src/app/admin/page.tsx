"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  Building2,
  Users,
  AlertCircle,
  Phone,
} from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/admin/applications");
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
      }
    } catch (e) {
      console.error("Gagal memuat data pengajuan", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      const userRole = (session?.user as any)?.role;
      if (userRole !== "ADMIN") {
        router.push("/dashboard");
      } else {
        fetchApplications();
      }
    }
  }, [status, session]);

  const handleReview = async (appId: string, decision: "APPROVED" | "REJECTED") => {
    const notes = prompt(
      decision === "APPROVED"
        ? "Catatan persetujuan (opsional):"
        : "Alasan penolakan pengajuan (opsional):"
    );

    setActionLoading(appId);

    try {
      const res = await fetch(`/api/admin/applications/${appId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: decision,
          adminNotes: notes || undefined,
        }),
      });

      if (res.ok) {
        alert(`Pengajuan berhasil di-${decision.toLowerCase()}`);
        fetchApplications();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal memproses verifikasi");
      }
    } catch (err) {
      alert("Terjadi kendala jaringan");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ebf4fa] py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start gap-6 lg:gap-8">
          <DashboardSidebar />
          <main className="flex-1 w-full">
            <div className="py-20 text-center text-sm text-gray-500">
              Memverifikasi kredensial Administrator internal...
            </div>
          </main>
        </div>
      </div>
    );
  }

  const pendingApps = applications.filter((a) => a.status === "PENDING");
  const historyApps = applications.filter((a) => a.status !== "PENDING");

  return (
    <div className="min-h-screen bg-[#ebf4fa] py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start gap-6 lg:gap-8">
        {/* ======================================================== */}
        {/* 1. SIDEBAR KIRI FIXED & ANIMASI SLIDING HIJAU             */}
        {/* ======================================================== */}
        <DashboardSidebar />

        {/* ======================================================== */}
        {/* 2. KONTEN UTAMA PANEL ADMIN                               */}
        {/* ======================================================== */}
        <main className="flex-1 w-full space-y-8">
      {/* Header Panel Admin */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Panel Administrator Internal
            </h1>
            <p className="text-xs text-gray-500">
              Verifikasi permohonan peran Pengurus Lingkungan & Pengawasan Master Data
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 bg-amber-100 text-amber-800 rounded-xl">
            {pendingApps.length} Permohonan Menunggu
          </span>
        </div>
      </div>

      {/* Daftar Pengajuan yang Menunggu Verifikasi */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            Pengajuan Peran Pengurus yang Menunggu Verifikasi ({pendingApps.length})
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Sesuai alur RBAC NARAGA: Pendaftaran Warga &rarr; Pengajuan Pengurus &rarr; Verifikasi Admin.
          </p>
        </div>

        {pendingApps.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-gray-200 rounded-xl text-xs text-gray-400">
            Tidak ada permohonan pengurus yang sedang menunggu verifikasi saat ini.
          </div>
        ) : (
          <div className="space-y-4">
            {pendingApps.map((app) => (
              <div
                key={app.id}
                className="p-5 rounded-xl border border-amber-200 bg-amber-50/40 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      {app.fullName} ({app.position})
                    </h3>
                    <p className="text-xs text-gray-600">
                      Email Akun: <strong>{app.user.email}</strong> &bull; Nomor Kontak/WA:{" "}
                      <strong>{app.phoneNumber}</strong>
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 bg-amber-200 text-amber-900 rounded">
                    Diajukan pada: {new Date(app.createdAt).toLocaleDateString("id-ID")}
                  </span>
                </div>

                <div className="text-xs text-gray-700 space-y-1">
                  <p>
                    <strong>Wilayah Komunitas:</strong> {app.community.name} (RT {app.community.rt} / RW {app.community.rw})
                  </p>
                  <p>
                    <strong>Alasan / Keterangan Pengajuan:</strong> {app.reason}
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => handleReview(app.id, "REJECTED")}
                    disabled={actionLoading === app.id}
                    className="px-3.5 py-1.5 bg-white border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold rounded-xl transition flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Tolak
                  </button>
                  <button
                    onClick={() => handleReview(app.id, "APPROVED")}
                    disabled={actionLoading === app.id}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1 shadow-sm"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Setujui & Jadikan Pengurus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Riwayat Verifikasi yang Selesai */}
      {historyApps.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900">
            Riwayat Verifikasi Pengajuan ({historyApps.length})
          </h2>
          <div className="space-y-3">
            {historyApps.map((app) => (
              <div
                key={app.id}
                className="p-3 rounded-xl border border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <span className="font-bold text-gray-900">{app.fullName}</span>{" "}
                  <span className="text-gray-500">
                    - {app.position} di {app.community.name}
                  </span>
                  {app.adminNotes && (
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Catatan Admin: <em>{app.adminNotes}</em>
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      app.status === "APPROVED"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {app.status}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {app.reviewedAt ? new Date(app.reviewedAt).toLocaleDateString("id-ID") : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
    </div>
      )}
        </main>
      </div>
    </div>
  );
}
