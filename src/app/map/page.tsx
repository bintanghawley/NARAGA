"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  MapPin,
  Plus,
  X,
  RotateCcw,
  Check,
  Lock,
} from "lucide-react";
import {
  detectUserLocation,
  hasLocationPermission,
  saveLocationPermission,
  saveManualLocation,
  UserLocation,
  SIDOARJO_PRESET,
  LOCATION_PRESETS,
  reverseGeocodeCoords,
  getHighAccuracyGPSPosition,
} from "@/lib/location";
import LocationPickerModal from "@/components/LocationPickerModal";

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

export default function MapPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const user = session?.user as any;

  // Proteksi rute peta: hanya untuk user yang sudah login
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/map");
    }
  }, [status, router]);

  const [points, setPoints] = useState<EvacuationPoint[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [pinpointToast, setPinpointToast] = useState("");

  // Form Tambah Titik (Khusus Pengurus & Admin)
  const [showAddPoint, setShowAddPoint] = useState(false);
  const [pointName, setPointName] = useState("");
  const [pointType, setPointType] = useState("ASSEMBLY_POINT");
  const [pointDesc, setPointDesc] = useState("");
  const [pointLat, setPointLat] = useState("-7.4478");
  const [pointLng, setPointLng] = useState("112.7183");
  const [addLoading, setAddLoading] = useState(false);
  const [addMsg, setAddMsg] = useState("");

  const fetchData = async () => {
    try {
      const [pRes, rRes] = await Promise.all([
        fetch("/api/evacuation-points"),
        fetch("/api/evacuation-routes"),
      ]);

      const pData = await pRes.json();
      const rData = await rRes.json();

      setPoints(pData.points || []);
      setRoutes(rData.routes || []);
    } catch (e) {
      console.error("Gagal mengambil data peta", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Cek apakah ada izin atau lokasi tersimpan
    if (hasLocationPermission()) {
      detectUserLocation().then((loc) => {
        setUserLocation(loc);
        setPointLat(loc.latitude.toString());
        setPointLng(loc.longitude.toString());
      });
    }

    const handleLocChange = (e: any) => {
      if (e.detail) {
        setUserLocation(e.detail);
        setPointLat(e.detail.latitude.toString());
        setPointLng(e.detail.longitude.toString());
      } else {
        setUserLocation(null);
      }
    };
    window.addEventListener("naraga_location_changed", handleLocChange);
    return () => window.removeEventListener("naraga_location_changed", handleLocChange);
  }, []);

  const handleAllowLocation = async () => {
    setLocLoading(true);
    try {
      saveLocationPermission(true);
      const loc = await getHighAccuracyGPSPosition(10000, true);
      setUserLocation(loc);
      setPointLat(loc.latitude.toString());
      setPointLng(loc.longitude.toString());
      setPinpointToast("📍 Lokasi laptop berhasil terdeteksi dan dikunci stabil!");
      setTimeout(() => setPinpointToast(""), 3500);
    } catch (e) {
      console.warn("Deteksi sensor gagal, beralih ke titik stabil:", e);
      try {
        const loc = await detectUserLocation(false);
        setUserLocation(loc);
        setPointLat(loc.latitude.toString());
        setPointLng(loc.longitude.toString());
      } catch (err2) {
        console.error("Gagal mendeteksi lokasi:", err2);
      }
    } finally {
      setLocLoading(false);
    }
  };

  const handlePinpointLocation = async (lat: number, lng: number) => {
    const rev = await reverseGeocodeCoords(lat, lng);
    const updatedLoc: UserLocation = {
      ip: "Titik Presisi Peta",
      road: rev.road,
      village: rev.village,
      district: rev.district,
      city: rev.city || userLocation?.city || "Kabupaten Sidoarjo",
      region: rev.region || userLocation?.region || "Jawa Timur",
      country: "Indonesia",
      latitude: lat,
      longitude: lng,
      displayName: rev.displayName,
      accuracy: 5, // Presisi klik/drag manual ~5m
      isp: "Pinpoint Presisi Terkunci",
      source: "manual",
      isLocked: true,
    };

    saveManualLocation(updatedLoc);
    setUserLocation(updatedLoc);
    setPointLat(lat.toFixed(6));
    setPointLng(lng.toFixed(6));
    setPinpointToast("📍 Titik lokasi berhasil disesuaikan & dikunci 100% presisi!");
    setTimeout(() => setPinpointToast(""), 3500);
  };

  const handleSelectPreset = (preset: UserLocation) => {
    saveManualLocation(preset);
    setUserLocation(preset);
    setPointLat(preset.latitude.toString());
    setPointLng(preset.longitude.toString());
    setShowLocationModal(false);
  };

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

  // Titik evakuasi khusus Sidoarjo (Pusat Kabupaten Sidoarjo)
  const sidoarjoPoints: EvacuationPoint[] = [
    {
      id: "pt-sda-1",
      name: "Titik Kumpul Utama (Alun-Alun Kabupaten Sidoarjo)",
      type: "ASSEMBLY_POINT",
      description:
        "Area terbuka hijau Alun-Alun Sidoarjo (Jl. Gubernur Suryo), sangat luas dan aman dari risiko runtuhan gedung atau kabel listrik.",
      latitude: -7.4478,
      longitude: 112.7183,
    },
    {
      id: "pt-sda-2",
      name: "Posko Logistik & Medis Darurat (GOR Delta Sidoarjo)",
      type: "AID_POST",
      description:
        "Kompleks Gelora Delta Sidoarjo dengan fasilitas tenda darurat pengungsian, dapur umum, kran air bersih, dan posko medis PMI.",
      latitude: -7.445,
      longitude: 112.705,
    },
    {
      id: "pt-sda-3",
      name: "Titik Waspada Rawan Genangan (Kawasan Candi / Porong)",
      type: "HAZARD_POINT",
      description:
        "Zona cekungan rawan genangan banjir luapan saat musim hujan lebat dengan durasi tinggi. Harap hindari jalur underpass.",
      latitude: -7.472,
      longitude: 112.715,
    },
  ];

  const sidoarjoRoutes = [
    {
      id: "rt-sda-1",
      name: "Jalur Evakuasi Utama (Jl. Pahlawan menuju Alun-Alun Sidoarjo)",
      description: "Jalur jalan protokol beraspal 4 lajur menuju pusat titik kumpul aman Alun-Alun Sidoarjo.",
      coordinates: [
        [-7.4485, 112.705],
        [-7.448, 112.712],
        [-7.4478, 112.7183],
      ] as [number, number][],
      color: "#10b981",
    },
  ];

  // Fallback data titik Semarang jika API kosong
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

  const isSidoarjo = userLocation?.city?.toLowerCase().includes("sidoarjo");

  // Gabungkan seluruh titik evakuasi agar tidak ada titik yang hilang saat koordinat disesuaikan
  const displayPoints: EvacuationPoint[] = [
    ...points,
    ...(points.length === 0 ? defaultPoints : []),
    ...(isSidoarjo && !points.some((p) => p.name.includes("Sidoarjo")) ? sidoarjoPoints : []),
  ];

  const displayRoutes = isSidoarjo && sidoarjoRoutes.length > 0 ? sidoarjoRoutes : routes;

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-[#ebf4fa] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-9 h-9 border-3 border-[#0e6f68] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-gray-600">
            {status === "unauthenticated"
              ? "Mengarahkan ke halaman login..."
              : "Memuat peta evakuasi..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ebf4fa] py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
      {/* Toast Notifikasi Penyesuaian Presisi Lokasi */}
      {pinpointToast && (
        <div className="fixed top-24 right-6 z-50 flex items-center gap-2.5 bg-gray-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-gray-700 animate-in fade-in slide-in-from-top-2 text-sm font-medium">
          <Check className="w-4 h-4 text-teal-400 flex-shrink-0" />
          <span>{pinpointToast}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10">
        {/* ======================================================== */}
        {/* 1. HEADER SECTION                                        */}
        {/* ======================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-emerge">
          <div className="space-y-1.5">
            <h1 className="text-3xl sm:text-[34px] font-bold text-gray-900 tracking-tight">
              Peta Evakuasi & Titik Kumpul
            </h1>
            {userLocation && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-teal-100 shadow-2xs text-[#0e6f68] text-xs font-semibold animate-in fade-in">
                  <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                  <span>
                    📍 Lokasi Anda:{" "}
                    <strong>
                      {userLocation.road ? `${userLocation.road}, ` : ""}
                      {userLocation.village ? `Desa ${userLocation.village}, ` : ""}
                      {userLocation.district ? `Kec. ${userLocation.district}, ` : ""}
                      {userLocation.city}
                    </strong>
                  </span>
                  <span className="ml-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[10px] font-bold border border-emerald-200 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Terkunci Presisi</span>
                  </span>
                  {userLocation.accuracy && (
                    <span className="px-1.5 py-0.5 bg-teal-50 text-teal-700 rounded-md text-[10px] font-normal border border-teal-200/60">
                      ±{userLocation.accuracy}m
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleAllowLocation}
                  disabled={locLoading}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-teal-50 border border-teal-200/90 text-[#0e6f68] text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
                  title="Deteksi atau kalibrasi ulang koordinat sensor laptop"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${locLoading ? "animate-spin" : ""}`} />
                  <span>{locLoading ? "Mengkalibrasi..." : "Kalibrasi Ulang"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowLocationModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-teal-50 border border-teal-200/90 text-[#0e6f68] text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  title="Ubah atau pilih wilayah secara manual"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Pilih Wilayah Lain</span>
                </button>
              </div>
            )}
          </div>

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

        {/* Banner Izin Deteksi Lokasi (Jika belum diizinkan pengguna) */}
        {!userLocation && (
          <div className="bg-white rounded-2xl border border-teal-100/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-emerge stagger-1">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#0e6f68] flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-xs sm:text-sm font-bold text-gray-900">
                  Aktifkan Deteksi Lokasi Presisi Terkunci?
                </h3>
                <p className="text-[11px] sm:text-xs text-gray-500 max-w-xl leading-relaxed">
                  Sistem Naraga kini dilengkapi peredam fluktuasi sinyal laptop agar titik posisi Anda tetap stabil, presisi, dan tidak melompat-lompat.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
              <button
                type="button"
                onClick={handleAllowLocation}
                disabled={locLoading}
                className="px-4 py-2.5 bg-[#0e6f68] hover:bg-[#0a524d] text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{locLoading ? "Mengunci Koordinat..." : "🎯 Deteksi Lokasi Laptop (Stabil)"}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowLocationModal(true)}
                className="px-3.5 py-2.5 bg-white hover:bg-teal-50 border border-teal-200 text-[#0e6f68] text-xs font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <span>Pilih Wilayah Manual</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal Dialog Lengkap Pemilihan Lokasi Seluruh Indonesia */}
        <LocationPickerModal
          isOpen={showLocationModal}
          onClose={() => setShowLocationModal(false)}
          onSelectLocation={handleSelectPreset}
          currentLocation={userLocation}
          onDetectGPS={handleAllowLocation}
          isDetectingGPS={locLoading}
        />

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
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Deskripsi / Petunjuk
                </label>
                <input
                  type="text"
                  value={pointDesc}
                  onChange={(e) => setPointDesc(e.target.value)}
                  placeholder="Contoh: Lapangan rumput luas, aman dari kabel listrik"
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0e6f68]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Latitude
                </label>
                <input
                  type="text"
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
                  type="text"
                  value={pointLng}
                  onChange={(e) => setPointLng(e.target.value)}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0e6f68]"
                />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPoint(false)}
                  className="px-4 py-2 border border-gray-200 text-xs rounded-xl hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="bg-[#0e6f68] hover:bg-[#0a524d] text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-xs cursor-pointer disabled:opacity-50"
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
          {/* Kolom Kiri: Lokasi Terdaftar dengan Animasi Terbit Card & List */}
          <div className="lg:col-span-4 bg-white rounded-[32px] p-6 sm:p-7 border border-gray-100 shadow-sm space-y-4 animate-emerge stagger-1">
            <div className="flex items-center gap-2 text-gray-900 font-bold text-base sm:text-lg mb-2">
              <MapPin className="w-5 h-5 text-gray-900 flex-shrink-0" />
              <span>Lokasi Terdaftar</span>
            </div>

            <div className="space-y-3.5">
              {displayPoints.map((pt, idx) => (
                <div
                  key={pt.id || idx}
                  style={{ animationDelay: `${idx * 65 + 60}ms` }}
                  className="bg-[#edf8f6] rounded-2xl p-4 sm:p-5 border border-teal-100/60 shadow-xs space-y-1.5 transition hover:border-teal-200 animate-emerge"
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

          {/* Kolom Kanan: Peta Leaflet & Legenda dengan Animasi Terbit Card */}
          <div className="lg:col-span-8 bg-white rounded-[32px] p-6 sm:p-7 border border-gray-100 shadow-sm flex flex-col justify-between space-y-4 animate-emerge stagger-2">
            {/* Peta Interaktif Leaflet */}
            <div className="w-full h-[520px] rounded-2xl overflow-hidden border border-gray-100 relative z-0 shadow-inner">
              <EvacuationMap
                points={displayPoints}
                routes={displayRoutes}
                userLocation={userLocation}
                onPinpointLocation={handlePinpointLocation}
                onTriggerGPS={handleAllowLocation}
                isDetectingGPS={locLoading}
              />
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

                {/* Lokasi Terdeteksi Pengguna */}
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0e6f68] ring-2 ring-teal-300 flex-shrink-0 animate-pulse" />
                  <span className="text-[11px] sm:text-xs text-[#0e6f68] font-bold">
                    📍 Posisi Anda Saat Ini (via IP)
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
      </div>
    </div>
  );
}
