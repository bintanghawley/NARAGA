"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import {
  MapPin,
  Route as RouteIcon,
  Phone,
  Shield,
  Plus,
  AlertCircle,
  CheckCircle2,
  Building2,
} from "lucide-react";

// Load Leaflet map component strictly on the client side
const EvacuationMap = dynamic(() => import("@/components/EvacuationMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] rounded-2xl bg-gray-100 flex items-center justify-center text-sm text-gray-500">
      Memuat peta Leaflet & OpenStreetMap...
    </div>
  ),
});

export default function MapPage() {
  const { data: session } = useSession();
  const user = session?.user as any;

  const [points, setPoints] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form tambah titik (Pengurus/Admin)
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Peta Evakuasi & Titik Kumpul Lingkungan
            </h1>
            <p className="text-xs text-gray-500">
              Visualisasi geospasial berbasis Leaflet.js & OpenStreetMap
            </p>
          </div>
        </div>

        {(user?.role === "PENGURUS" || user?.role === "ADMIN") && (
          <button
            onClick={() => setShowAddPoint(!showAddPoint)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            {showAddPoint ? "Tutup Form" : "Tambah Titik Kumpul"}
          </button>
        )}
      </div>

      {/* Form Tambah Titik (Pengurus / Admin) */}
      {showAddPoint && (
        <div className="bg-white rounded-2xl border border-blue-200 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900">
            Tambah Titik Kumpul / Posko Baru pada Peta
          </h2>
          {addMsg && <p className="text-xs text-blue-600">{addMsg}</p>}
          <form onSubmit={handleAddPoint} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Lokasi</label>
              <input
                type="text"
                required
                value={pointName}
                onChange={(e) => setPointName(e.target.value)}
                placeholder="Contoh: Lapangan Voli RT 03"
                className="w-full text-xs p-2.5 border rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Tipe Titik</label>
              <select
                value={pointType}
                onChange={(e) => setPointType(e.target.value)}
                className="w-full text-xs p-2.5 border rounded-xl bg-white"
              >
                <option value="ASSEMBLY_POINT">Titik Kumpul Aman (Assembly Point)</option>
                <option value="AID_POST">Posko Logistik / Medis (Aid Post)</option>
                <option value="HAZARD_POINT">Area Rawan / Bahaya (Hazard Point)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                required
                value={pointLat}
                onChange={(e) => setPointLat(e.target.value)}
                className="w-full text-xs p-2.5 border rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                required
                value={pointLng}
                onChange={(e) => setPointLng(e.target.value)}
                className="w-full text-xs p-2.5 border rounded-xl"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Deskripsi / Akses</label>
              <input
                type="text"
                value={pointDesc}
                onChange={(e) => setPointDesc(e.target.value)}
                placeholder="Contoh: Akses melalui gerbang timur gang Mawar..."
                className="w-full text-xs p-2.5 border rounded-xl"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={addLoading}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl"
              >
                {addLoading ? "Menyimpan..." : "Simpan Titik"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Komponen Peta Interaktif Leaflet */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm space-y-4">
        <EvacuationMap points={points} routes={routes} />

        {/* Legend Peta */}
        <div className="flex flex-wrap items-center gap-6 pt-2 px-2 text-xs font-medium text-gray-600">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 inline-block border border-white shadow-sm" />
            <span>Titik Kumpul Aman (Assembly Point)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-blue-500 inline-block border border-white shadow-sm" />
            <span>Posko Logistik / Medis (Aid Post)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-red-500 inline-block border border-white shadow-sm" />
            <span>Titik Bahaya / Rawan (Hazard Point)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-1 border-t-2 border-dashed border-emerald-500 inline-block" />
            <span>Jalur Evakuasi Lingkungan</span>
          </div>
        </div>
      </div>

      {/* Grid: Detail Titik & Kontak Darurat */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Titik Lokasi Terdaftar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            Daftar Lokasi Terdaftar ({points.length})
          </h2>
          <div className="space-y-3">
            {points.map((pt) => (
              <div
                key={pt.id}
                className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">{pt.name}</h3>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      pt.type === "ASSEMBLY_POINT"
                        ? "bg-emerald-100 text-emerald-800"
                        : pt.type === "AID_POST"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {pt.type}
                  </span>
                </div>
                <p className="text-gray-600">{pt.description}</p>
                <p className="text-gray-400 font-mono text-[10px]">
                  Koordinat: {pt.latitude}, {pt.longitude}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Kontak Darurat Terpadu */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Phone className="w-4 h-4 text-red-600" />
            Kontak Darurat Terpadu ({contacts.length})
          </h2>
          <div className="space-y-3">
            {contacts.map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs"
              >
                <div>
                  <h3 className="font-bold text-gray-900">{c.name}</h3>
                  <span className="text-[10px] text-gray-500 font-semibold uppercase">
                    Kategori: {c.category} {c.isGlobal ? "(Nasional/Kota)" : "(Lokal RT/RW)"}
                  </span>
                </div>
                <a
                  href={`tel:${c.phoneNumber}`}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs transition"
                >
                  {c.phoneNumber}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
