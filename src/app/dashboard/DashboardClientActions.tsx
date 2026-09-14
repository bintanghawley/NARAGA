"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Check, AlertCircle, Send, X } from "lucide-react";

interface Community {
  id: string;
  name: string;
  rt: string;
  rw: string;
  kelurahan: string;
}

export default function DashboardClientActions({
  communities,
  userId,
  isJoined,
  userCommunityId,
}: {
  communities: Community[];
  userId: string;
  isJoined: boolean;
  userCommunityId?: string;
}) {
  const router = useRouter();

  // State Bergabung Lingkungan
  const [selectedCommunity, setSelectedCommunity] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState("");

  // State Modal Pengajuan Pengurus
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [position, setPosition] = useState("Ketua RT");
  const [reason, setReason] = useState("");
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState("");
  const [applySuccess, setApplySuccess] = useState(false);

  // Handle Gabung Lingkungan
  const handleJoin = async () => {
    if (!selectedCommunity) return;
    setJoinLoading(true);
    setJoinError("");

    try {
      const res = await fetch(`/api/communities/${selectedCommunity}/join`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        setJoinError(data.error || "Gagal bergabung");
      } else {
        router.refresh();
      }
    } catch (e) {
      setJoinError("Terjadi kendala jaringan");
    } finally {
      setJoinLoading(false);
    }
  };

  // Handle Pengajuan Pengurus
  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplyLoading(true);
    setApplyError("");

    try {
      const res = await fetch("/api/pengurus/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          communityId: userCommunityId,
          fullName,
          phoneNumber,
          position,
          reason,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setApplyError(data.error || "Gagal mengirim permohonan");
      } else {
        setApplySuccess(true);
        setTimeout(() => {
          setShowApplyModal(false);
          router.refresh();
        }, 1200);
      }
    } catch (e) {
      setApplyError("Gagal menghubungi server");
    } finally {
      setApplyLoading(false);
    }
  };

  if (!isJoined) {
    return (
      <div className="space-y-3">
        {joinError && (
          <p className="text-xs text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> {joinError}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedCommunity}
            onChange={(e) => setSelectedCommunity(e.target.value)}
            className="flex-1 bg-white border border-gray-300 text-sm rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="">-- Pilih Wilayah RT/RW Anda --</option>
            {communities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleJoin}
            disabled={!selectedCommunity || joinLoading}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {joinLoading ? "Menyimpan..." : "Bergabung ke Wilayah Ini"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowApplyModal(true)}
        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition shadow-sm flex items-center gap-2 whitespace-nowrap"
      >
        <Users className="w-4 h-4" />
        Ajukan Verifikasi Pengurus
      </button>

      {/* Modal Dialog Form Pengajuan Pengurus */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Formulir Pengajuan Pengurus Lingkungan
                </h3>
                <p className="text-xs text-gray-500">
                  Data ini akan ditinjau langsung oleh Administrator internal
                </p>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {applyError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{applyError}</span>
              </div>
            )}

            {applySuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>Pengajuan berhasil dikirim! Menunggu persetujuan Admin.</span>
              </div>
            )}

            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nama Lengkap (Sesuai KTP)
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Nomor WhatsApp / HP Aktif
                  </label>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="08123456789"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Jabatan di Komunitas
                  </label>
                  <input
                    type="text"
                    required
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="Ketua RT / Sekretaris RW / Sie Keamanan"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Alasan / Keterangan Pengajuan
                </label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Contoh: Selaku ketua RT 03 ingin melengkapi titik kumpul dan rute evakuasi warga untuk antisipasi musim hujan..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={applyLoading || applySuccess}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {applyLoading ? "Mengirim..." : "Kirim Pengajuan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
