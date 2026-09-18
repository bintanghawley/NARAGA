"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Check,
  AlertCircle,
  Send,
  X,
  MapPin,
  Search,
  Building2,
  CheckCircle2,
  User,
} from "lucide-react";

export interface Community {
  id: string;
  name: string;
  rt: string;
  rw: string;
  kelurahan: string;
}

export default function DashboardClientActions({
  communities,
  userId,
  userCommunity,
  userRole,
  pendingApplication,
  showLocationBanner = true,
  showPengurusBanner = false,
}: {
  communities: Community[];
  userId: string;
  userCommunity?: Community | null;
  userRole?: string;
  pendingApplication?: any;
  showLocationBanner?: boolean;
  showPengurusBanner?: boolean;
}) {
  const router = useRouter();

  // State Modal Pilih Lingkungan
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedCommunityId, setSelectedCommunityId] = useState(
    userCommunity?.id || (communities.length > 0 ? communities[0].id : "")
  );
  const [searchFilter, setSearchFilter] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [joinSuccess, setJoinSuccess] = useState(false);

  // State Modal Pengajuan Pengurus
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [position, setPosition] = useState("Ketua RT");
  const [reason, setReason] = useState("");
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState("");
  const [applySuccess, setApplySuccess] = useState(false);

  // Handle Pilih & Simpan Lingkungan
  const handleSaveCommunity = async () => {
    if (!selectedCommunityId) return;
    setJoinLoading(true);
    setJoinError("");
    setJoinSuccess(false);

    try {
      const res = await fetch(`/api/communities/${selectedCommunityId}/join`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        setJoinError(data.error || "Gagal memperbarui lingkungan");
      } else {
        setJoinSuccess(true);
        setTimeout(() => {
          setShowLocationModal(false);
          setJoinSuccess(false);
          router.refresh();
        }, 800);
      }
    } catch (e) {
      setJoinError("Terjadi kendala jaringan saat menyimpan lingkungan");
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
          communityId: userCommunity?.id || selectedCommunityId,
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

  const filteredCommunities = communities.filter(
    (c) =>
      c.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.kelurahan.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.rt.includes(searchFilter) ||
      c.rw.includes(searchFilter)
  );

  return (
    <>
      {/* 1. Peach Banner: Tentukan Lingkungan Tempat Tinggal Anda (Hanya jika belum tes) */}
      {showLocationBanner && (
        <div className="bg-[#fef0dd] border border-[#fbdcb2] rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#fae3c3] flex items-center justify-center flex-shrink-0 text-[#f5840d] mt-0.5">
              <Search className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                Tentukan Lingkungan Tempat Tinggal Anda
              </h2>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed max-w-2xl font-normal">
                Untuk melihat rute evakuasi, kontak darurat, dan mengukur kesiapsiagaan wilayah Anda, silakan pilih lingkungan RT/RW yang tersedia:
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0 self-start md:self-center">
            <button
              type="button"
              onClick={() => setShowLocationModal(true)}
              className="bg-[#f5840d] hover:bg-[#df7507] text-white font-medium text-xs sm:text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 transition transform active:scale-98 shadow-sm cursor-pointer"
            >
              <span>Pilih lokasi anda</span>
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                <MapPin className="w-3.5 h-3.5 text-white" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* 1b. Blue Banner: Apakah Anda Pengurus RT/RW di Lingkungan Ini? (Sesuai Desain Figma Setelah Tes) */}
      {showPengurusBanner && (
        userRole === "WARGA" ? (
          pendingApplication ? (
            <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-gray-900">
                  Pengajuan Pengurus Sedang Ditinjau
                </h3>
                <p className="text-xs text-[#2563eb] leading-relaxed max-w-2xl font-normal">
                  Permohonan peran Pengurus Lingkungan Anda telah dikirim dan sedang menunggu konfirmasi Administrator internal.
                </p>
              </div>
              <span className="px-4 py-2 bg-blue-100 text-blue-800 text-xs font-bold rounded-xl whitespace-nowrap self-start sm:self-center">
                Menunggu Verifikasi Admin
              </span>
            </div>
          ) : (
            <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-gray-900">
                  Apakah Anda Pengurus RT/RW di Lingkungan Ini?
                </h3>
                <p className="text-xs text-[#2563eb] leading-relaxed max-w-2xl font-normal">
                  Ajukan peningkatan hak akses menjadi Pengurus Lingkungan untuk dapat mengelola titik kumpul aman, menambah rute evakuasi pada peta, dan memantau kesiapan warga.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowApplyModal(true)}
                className="bg-[#1d64f2] hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 transition shadow-xs flex-shrink-0 cursor-pointer self-start sm:self-center"
              >
                <User className="w-4 h-4" />
                <span>Ajukan verifikasi pengurus</span>
              </button>
            </div>
          )
        ) : null
      )}

      {/* 2. Modal Pilih / Ganti Wilayah RT/RW */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#f5840d] flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Pilih Lingkungan Tempat Tinggal
                  </h3>
                  <p className="text-xs text-gray-500">
                    Daftar pemukiman RT/RW yang terdaftar di NARAGA
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLocationModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {joinError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{joinError}</span>
              </div>
            )}

            {joinSuccess && (
              <div className="p-3 bg-teal-50 border border-teal-200 text-teal-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0e6f68] flex-shrink-0" />
                <span>Berhasil memilih lingkungan! Memperbarui data...</span>
              </div>
            )}

            {/* Input Pencarian */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Cari nama RT, RW, atau Kelurahan..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* List Pilihan Lingkungan */}
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {filteredCommunities.map((c) => {
                const isSelected = selectedCommunityId === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCommunityId(c.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "border-[#f5840d] bg-orange-50/50 shadow-xs ring-1 ring-[#f5840d]/30"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/70"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-gray-900">{c.name}</p>
                      <p className="text-[11px] text-gray-500">
                        RT {c.rt} / RW {c.rw}, Kel. {c.kelurahan}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-[#f5840d] text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredCommunities.length === 0 && (
                <p className="text-center text-xs text-gray-500 py-6">
                  Tidak ada lingkungan yang cocok dengan kata kunci.
                </p>
              )}
            </div>

            {/* Tombol Simpan */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowLocationModal(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveCommunity}
                disabled={!selectedCommunityId || joinLoading || joinSuccess}
                className="px-5 py-2.5 bg-[#f5840d] hover:bg-[#df7507] text-white text-xs font-semibold rounded-xl transition disabled:opacity-50 flex items-center gap-2 shadow-sm"
              >
                {joinLoading ? "Menyimpan..." : "Simpan Lokasi Lingkungan"}
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Modal Dialog Form Pengajuan Pengurus */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Formulir Pengajuan Pengurus Lingkungan
                </h3>
                <p className="text-xs text-gray-500">
                  Data ini akan ditinjau langsung oleh Administrator internal
                </p>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg"
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
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                    placeholder="Ketua RT / Sekretaris RW"
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                  placeholder="Contoh: Selaku ketua RT ingin melengkapi titik kumpul dan peta evakuasi warga..."
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-gray-100">
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
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm disabled:opacity-50"
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
