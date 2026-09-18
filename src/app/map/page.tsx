"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import {
  MapPin,
  Phone,
  Plus,
  X,
} from "lucide-react";

// Load Leaflet map component strictly on client side
const EvacuationMap = dynamic(() => import("@/components/EvacuationMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[460px] sm:h-[480px] rounded-2xl bg-gray-100 flex items-center justify-center text-xs text-gray-500">
      Memuat peta Leaflet & OpenStreetMap...
    </div>
  ),
});

interface EvacuationPoint {
  id: string;
  name: string;
  type: string;
  description?: string | null;
  latitude: number;
  longitude: number;
}

interface EmergencyContact {
  id: string;
  name: string;
  category: string;
  phoneNumber: string;
  isGlobal?: boolean;
}

export default function MapPage() {
  const { data: session } = useSession();
  const user = session?.user as any;

  const [points, setPoints] = useState<EvacuationPoint[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Tambah Titik (Khusus Pengurus & Admin)
  const [showAddPoint, setShowAddPoint] = useState(false);
  const [pointName, setPointName] = useState("");
  const [pointType, setPointType] = useState("ASSEMBLY_POINT");
  const [pointDesc, setPointDesc] = useState("");
  const [pointLat, setPointLat] = useState("-7.04921");
  const [pointLng, setPointLng] = useState("110.43825");
  const [addLoading, setAddLoading] = useState(false);
  const [addMsg, setAddMsg] = useState("");

  const fetchData = async () => {
    try {
      const [pRes, rRes, cRes] = await Promise.all([
        fetch("/api/evacuation-points"),
        fetch("/api/evacuation-routes"),
        fetch("/api/emergency-contacts"),
      ]);

      const pData = await pRes.json();
      const rData = await rRes.json();
      const cData = await cRes.json();

      setPoints(pData.points || []);
      setRoutes(rData.routes || []);
      setContacts(cData.contacts || []);
    } catch (e) {
      console.error("Gagal mengambil data peta", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddPoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.communityId) {
      alert("Anda harus tergabung dalam komunitas terlebih dahulu.");
      return;
    }

    setAddLoading(true);
    setAddMsg("");

    try {
      const res = await fetch("/api/evacuation-points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          communityId: user.communityId,
          name: pointName,
          type: pointType,
          description: pointDesc,
          latitude: parseFloat(pointLat),
          longitude: parseFloat(pointLng),
        }),
      });

      if (res.ok) {
        setAddMsg("Titik evakuasi berhasil ditambahkan!");
        setPointName("");
        setPointDesc("");
        setShowAddPoint(false);
        fetchData();
      } else {
        const err = await res.json();
        setAddMsg(err.error || "Gagal menambah titik");
      }
    } catch (err) {
      setAddMsg("Terjadi kesalahan server");
    } finally {
      setAddLoading(false);
    }
  };

  // Fallback data titik jika API kosong agar UI selalu presisi sesuai Figma
  const defaultPoints: EvacuationPoint[] = [
    {
      id: "pt-1",
      name: "Titik Kumpul Utama (Lapangan RW 05 Sekaran)",
      type: "ASSEMBLY_POINT",
      description:
        "Area terbuka berumput luas, bebas dari tiang listrik tinggi dan pohon rimbun yang rawan tumbang.",
      latitude: -7.04921,
      longitude: 110.43825,
    },
    {
      id: "pt-2",
      name: "Titik Kumpul Utama (Lapangan RW 05 Sekaran)",
      type: "AID_POST",
      description:
        "Area terbuka berumput luas, bebas dari tiang listrik tinggi dan pohon rimbun yang rawan tumbang.",
      latitude: -7.04921,
      longitude: 110.43825,
    },
    {
      id: "pt-3",
      name: "Titik Kumpul Utama (Lapangan RW 05 Sekaran)",
      type: "HAZARD_POINT",
      description:
        "Area terbuka berumput luas, bebas dari tiang listrik tinggi dan pohon rimbun yang rawan tumbang.",
      latitude: -7.04921,
      longitude: 110.43825,
    },
  ];

  const displayPoints = points.length > 0 ? points : defaultPoints;

  // Fallback data kontak darurat sesuai Figma screenshot
  const defaultContacts: EmergencyContact[] = [
    {
      id: "c-1",
      name: "BPBD Kota Semarang (Layanan Kedaruratan)",
      category: "BPBD",
      phoneNumber: "024-7629464",
      isGlobal: true,
    },
    {
      id: "c-2",
      name: "Dinas Pemadam Kebakaran Kota Semarang",
      category: "DAMKAR",
      phoneNumber: "024-113",
      isGlobal: true,
    },
    {
      id: "c-3",
      name: "Panggilan Darurat Terpadu Nasional (Bebas Pulsa)",
      category: "KEPOLISIAN",
      phoneNumber: "112",
      isGlobal: true,
    },
    {
      id: "c-4",
      name: "Puskesmas Pembantu Gunung Pati / Sekaran",
      category: "MEDIS",
      phoneNumber: "024-8508092",
      isGlobal: true,
    },
  ];

  // Prioritaskan 4 kontak darurat dari Figma
  const displayContacts =
    contacts.length > 0
      ? [
          ...contacts.filter((c) =>
            [
              "BPBD Kota Semarang (Layanan Kedaruratan)",
              "Dinas Pemadam Kebakaran Kota Semarang",
              "Panggilan Darurat Terpadu Nasional (Bebas Pulsa)",
              "Puskesmas Pembantu Gunung Pati / Sekaran",
            ].includes(c.name)
          ),
          ...contacts.filter(
            (c) =>
              ![
                "BPBD Kota Semarang (Layanan Kedaruratan)",
                "Dinas Pemadam Kebakaran Kota Semarang",
                "Panggilan Darurat Terpadu Nasional (Bebas Pulsa)",
                "Puskesmas Pembantu Gunung Pati / Sekaran",
              ].includes(c.name)
          ),
        ]
      : defaultContacts;

  return (
    <div className="min-h-screen bg-[#ebf4fa] py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10">
        {/* ======================================================== */}
        {/* 1. HEADER SECTION                                        */}
        {/* ======================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl sm:text-[34px] font-bold text-gray-900 tracking-tight">
            Peta Evakuasi & Titik Kumpul
          </h1>

          {/* Tombol aksi khusus Pengurus / Admin */}
          {(user?.role === "PENGURUS" || user?.role === "ADMIN") && (
            <button
              onClick={() => setShowAddPoint(!showAddPoint)}
              className="bg-[#0e6f68] hover:bg-[#0a524d] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition flex items-center gap-2 shadow-xs cursor-pointer self-start sm:self-auto"
            >
              {showAddPoint ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{showAddPoint ? "Tutup Form" : "Tambah Titik Kumpul"}</span>
            </button>
          )}
        </div>

        {/* Modal Form Tambah Titik (Khusus Pengurus/Admin) */}
        {showAddPoint && (
          <div className="bg-white rounded-3xl border border-teal-100 p-6 sm:p-7 shadow-sm space-y-4 animate-in fade-in">
            <h2 className="text-base font-bold text-gray-900">
              Tambah Titik Kumpul / Posko Baru pada Peta
            </h2>
            {addMsg && (
              <p className="text-xs text-[#0e6f68] font-semibold">{addMsg}</p>
            )}
            <form onSubmit={handleAddPoint} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nama Lokasi
                </label>
                <input
                  type="text"
                  required
                  value={pointName}
                  onChange={(e) => setPointName(e.target.value)}
                  placeholder="Contoh: Lapangan Voli RT 03"
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0e6f68]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Tipe Titik
                </label>
                <select
                  value={pointType}
                  onChange={(e) => setPointType(e.target.value)}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#0e6f68]"
                >
                  <option value="ASSEMBLY_POINT">
                    Titik Kumpul Aman (Assembly Point) - Hijau
                  </option>
                  <option value="AID_POST">
                    Posko Logistik / Medis (Aid Post) - Ungu
                  </option>
                  <option value="HAZARD_POINT">
                    Area Rawan / Bahaya (Hazard Point) - Merah
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={pointLat}
                  onChange={(e) => setPointLat(e.target.value)}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0e6f68]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={pointLng}
                  onChange={(e) => setPointLng(e.target.value)}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0e6f68]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Deskripsi / Keterangan Titik
                </label>
                <input
                  type="text"
                  value={pointDesc}
                  onChange={(e) => setPointDesc(e.target.value)}
                  placeholder="Contoh: Area terbuka berumput luas, bebas dari kabel listrik..."
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0e6f68]"
                />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-5 py-2.5 bg-[#0e6f68] hover:bg-[#0a524d] text-white text-xs font-bold rounded-xl transition disabled:opacity-50"
                >
                  {addLoading ? "Menyimpan..." : "Simpan Titik"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. GRID PETA & LOKASI TERDAFTAR (Sesuai Desain Figma)     */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Kolom Kiri: Lokasi Terdaftar */}
          <div className="lg:col-span-4 bg-white rounded-[32px] p-6 sm:p-7 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-gray-900 font-bold text-base sm:text-lg mb-2">
              <MapPin className="w-5 h-5 text-gray-900 flex-shrink-0" />
              <span>Lokasi Terdaftar</span>
            </div>

            <div className="space-y-3.5">
              {displayPoints.map((pt, idx) => (
                <div
                  key={pt.id || idx}
                  className="bg-[#edf8f6] rounded-2xl p-4 sm:p-5 border border-teal-100/60 shadow-xs space-y-1.5 transition hover:border-teal-200"
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${
                        pt.type === "ASSEMBLY_POINT"
                          ? "bg-[#10b981]"
                          : pt.type === "AID_POST"
                          ? "bg-[#8b5cf6]"
                          : "bg-[#ef4444]"
                      }`}
                    />
                    <h3 className="font-bold text-xs sm:text-sm text-gray-900 leading-snug">
                      {pt.name}
                    </h3>
                  </div>

                  <p className="text-[11px] text-gray-600 leading-relaxed pl-5 font-normal">
                    {pt.description ||
                      "Area terbuka berumput luas, bebas dari tiang listrik tinggi dan pohon rimbun yang rawan tumbang."}
                  </p>

                  <p className="text-[10px] text-gray-400 font-mono pl-5">
                    Koordinat: {pt.latitude}, {pt.longitude}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Kolom Kanan: Peta Leaflet & Legenda */}
          <div className="lg:col-span-8 bg-white rounded-[32px] p-6 sm:p-7 border border-gray-100 shadow-sm flex flex-col justify-between space-y-4">
            {/* Peta Interaktif Leaflet */}
            <div className="w-full h-[460px] sm:h-[480px] rounded-2xl overflow-hidden border border-gray-100 relative z-0 shadow-inner">
              <EvacuationMap points={displayPoints} routes={routes} />
            </div>

            {/* Legenda Peta (Sesuai Desain Figma) */}
            <div className="pt-3 px-1 space-y-2 text-xs font-medium text-gray-700">
              {/* Baris 1 Legenda: Titik Kumpul, Posko, Bahaya */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] flex-shrink-0" />
                  <span className="text-[11px] sm:text-xs text-gray-700">
                    Titik Kumpul Aman (Assembly Point)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#8b5cf6] flex-shrink-0" />
                  <span className="text-[11px] sm:text-xs text-gray-700">
                    Posko Logistik / Medis (Aid Post)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] flex-shrink-0" />
                  <span className="text-[11px] sm:text-xs text-gray-700">
                    Titik Bahaya / Rawan (Hazard Point)
                  </span>
                </div>
              </div>

              {/* Baris 2 Legenda: Jalur Evakuasi */}
              <div className="flex items-center gap-2 pt-0.5">
                <span className="font-bold tracking-widest text-gray-900 text-xs">
                  ▪ ▪ ▪
                </span>
                <span className="text-[11px] sm:text-xs text-gray-700">
                  Jalur Evakuasi Lingkungan
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. SECTION KONTAK DARURAT (Sesuai Desain Figma)           */}
        {/* ======================================================== */}
        <section className="space-y-4 pt-4">
          <h2 className="text-2xl sm:text-[30px] font-bold text-gray-900 tracking-tight">
            Kontak Darurat
          </h2>

          <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-gray-100 shadow-sm space-y-4">
            {displayContacts.map((c) => (
              <div
                key={c.id}
                className="bg-[#edf8f6] border border-teal-100/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs transition hover:border-teal-200"
              >
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900">
                    {c.name}
                  </h3>
                  <p className="text-xs text-gray-500 font-normal mt-1">
                    Kategori: {c.category}{" "}
                    {c.isGlobal ? "(Nasional/Kota)" : "(Lokal RT/RW)"}
                  </p>
                </div>

                <a
                  href={`tel:${c.phoneNumber.replace(/[^0-9+]/g, "")}`}
                  className="bg-[#f01d51] hover:bg-[#d91444] text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-xs transition transform active:scale-98 self-start sm:self-center whitespace-nowrap cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 fill-white" />
                  <span>{c.phoneNumber}</span>
                </a>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
