"use client";

import { useState, useEffect, useTransition } from "react";
import {
  MapPin,
  Search,
  ChevronRight,
  Sparkles,
  X,
  Compass,
  Check,
  Building2,
  Navigation,
} from "lucide-react";
import {
  UserLocation,
  SIDOARJO_PRESET,
  SURABAYA_PRESET,
  SEMARANG_PRESET,
} from "@/lib/location";
import {
  INDONESIA_REGIONS,
  getProvinces,
  getCitiesByProvince,
  getDistrictsByCity,
  findCityCoordinates,
} from "@/lib/indonesia-regions";

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (location: UserLocation) => void;
  currentLocation?: UserLocation | null;
  onDetectGPS?: () => Promise<void>;
  isDetectingGPS?: boolean;
}

interface SearchResult {
  displayName: string;
  road?: string;
  village?: string;
  district?: string;
  city: string;
  region: string;
  latitude: number;
  longitude: number;
}

export default function LocationPickerModal({
  isOpen,
  onClose,
  onSelectLocation,
  currentLocation,
  onDetectGPS,
  isDetectingGPS = false,
}: LocationPickerModalProps) {
  const [activeTab, setActiveTab] = useState<"dropdown" | "search" | "presets">("dropdown");
  const [isApplyingDropdown, setIsApplyingDropdown] = useState(false);

  // State untuk Dropdown Berjenjang (Provinsi -> Kota -> Kecamatan)
  const provinces = getProvinces();
  const [selectedProvince, setSelectedProvince] = useState<string>(
    currentLocation?.region || "Jawa Timur"
  );
  const [selectedCity, setSelectedCity] = useState<string>(
    currentLocation?.city || "Kabupaten Sidoarjo"
  );
  const [selectedDistrict, setSelectedDistrict] = useState<string>(
    currentLocation?.district || "Sidoarjo"
  );
  const [customDistrict, setCustomDistrict] = useState<string>("");

  // State untuk Pencarian Cepat
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(null);

  // Perbarui list kota saat provinsi berubah
  const cities = getCitiesByProvince(selectedProvince);
  const districts = getDistrictsByCity(selectedCity);

  const handleProvinceChange = (prov: string) => {
    setSelectedProvince(prov);
    const newCities = getCitiesByProvince(prov);
    if (newCities.length > 0) {
      setSelectedCity(newCities[0].name);
      const newDistricts = getDistrictsByCity(newCities[0].name);
      setSelectedDistrict(newDistricts.length > 0 ? newDistricts[0] : "");
    }
    setCustomDistrict("");
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    const newDistricts = getDistrictsByCity(city);
    setSelectedDistrict(newDistricts.length > 0 ? newDistricts[0] : "");
    setCustomDistrict("");
  };

  // Handle pencarian debounce ke /api/location/search
  const handleSearchInput = (value: string) => {
    setSearchQuery(value);
    if (searchDebounce) clearTimeout(searchDebounce);

    if (value.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/location/search?q=${encodeURIComponent(value.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
        }
      } catch (err) {
        console.warn("Gagal mencari lokasi:", err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    setSearchDebounce(timer);
  };

  // Terapkan pilihan dari Dropdown Berjenjang (dengan geocoding presisi kecamatan)
  const handleApplyDropdown = async () => {
    setIsApplyingDropdown(true);
    let coords = findCityCoordinates(selectedCity) || {
      latitude: -7.4478,
      longitude: 112.7183,
    };

    const finalDistrict = customDistrict.trim() || selectedDistrict || undefined;

    // Jika ada kecamatan dipilih, lakukan pencarian koordinat spesifik kecamatan
    if (finalDistrict) {
      try {
        const query = `${finalDistrict} ${selectedCity} ${selectedProvince}`;
        const res = await fetch(`/api/location/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.results && data.results.length > 0) {
            coords = {
              latitude: data.results[0].latitude,
              longitude: data.results[0].longitude,
            };
          }
        }
      } catch (e) {
        console.warn("Gagal geocode kecamatan, gunakan koordinat kota:", e);
      }
    }

    const loc: UserLocation = {
      ip: "Pilihan Mandiri Presisi",
      district: finalDistrict,
      city: selectedCity,
      region: selectedProvince,
      country: "Indonesia",
      latitude: coords.latitude,
      longitude: coords.longitude,
      displayName: `${finalDistrict ? `Kec. ${finalDistrict}, ` : ""}${selectedCity}, ${selectedProvince}`,
      isp: `Wilayah Terpilih (${finalDistrict ? `Kec. ${finalDistrict}, ` : ""}${selectedCity})`,
      source: "manual",
    };

    setIsApplyingDropdown(false);
    onSelectLocation(loc);
    onClose();
  };

  // Terapkan pilihan dari Pencarian Cepat
  const handleSelectSearchResult = (item: SearchResult) => {
    const loc: UserLocation = {
      ip: "Pencarian Presisi",
      road: item.road,
      village: item.village,
      district: item.district,
      city: item.city,
      region: item.region,
      country: "Indonesia",
      latitude: item.latitude,
      longitude: item.longitude,
      accuracy: 10,
      displayName: item.displayName,
      isp: `Pencarian Presisi (${item.district ? `Kec. ${item.district}, ` : ""}${item.city})`,
      source: "manual",
    };

    onSelectLocation(loc);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-teal-50 text-[#0e6f68] flex items-center justify-center flex-shrink-0 shadow-2xs">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm sm:text-base leading-snug">
                Pilih Lokasi Tempat Tinggal
              </h2>
              <p className="text-[11px] text-gray-500">
                Mencakup 38 Provinsi, 514 Kota/Kabupaten & Kecamatan se-Indonesia
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigasi Pemilihan */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100/90 rounded-2xl mt-4 flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("dropdown")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer text-center ${
              activeTab === "dropdown"
                ? "bg-white text-[#0e6f68] shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Pilih Berjenjang
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("search")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer text-center ${
              activeTab === "search"
                ? "bg-white text-[#0e6f68] shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Cari Cepat (Kec/Desa)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("presets")}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer text-center ${
              activeTab === "presets"
                ? "bg-white text-[#0e6f68] shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Preset & GPS
          </button>
        </div>

        {/* Konten Tab (Scrollable) */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* TAB 1: DROPDOWN BERJENJANG (PROVINSI -> KOTA -> KECAMATAN) */}
          {activeTab === "dropdown" && (
            <div className="space-y-3.5">
              {/* 1. Provinsi */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  1. Pilih Provinsi (38 Provinsi)
                </label>
                <select
                  value={selectedProvince}
                  onChange={(e) => handleProvinceChange(e.target.value)}
                  className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0e6f68] font-medium text-gray-800"
                >
                  {provinces.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Kota / Kabupaten */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  2. Pilih Kota / Kabupaten
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0e6f68] font-medium text-gray-800"
                >
                  {cities.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Kecamatan */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  3. Pilih / Tentukan Kecamatan
                </label>
                {districts.length > 0 ? (
                  <div className="space-y-2">
                    <select
                      value={selectedDistrict}
                      onChange={(e) => {
                        setSelectedDistrict(e.target.value);
                        setCustomDistrict("");
                      }}
                      className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0e6f68] font-medium text-gray-800"
                    >
                      {districts.map((d) => (
                        <option key={d} value={d}>
                          Kecamatan {d}
                        </option>
                      ))}
                    </select>

                    <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
                      <span>Atau ketik nama kecamatan/kelurahan kustom:</span>
                    </div>
                    <input
                      type="text"
                      value={customDistrict}
                      onChange={(e) => setCustomDistrict(e.target.value)}
                      placeholder="Contoh: Kelurahan Sidokumpul / Dusun ..."
                      className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0e6f68]"
                    />
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      value={customDistrict}
                      onChange={(e) => setCustomDistrict(e.target.value)}
                      placeholder="Ketik nama Kecamatan / Kelurahan Anda..."
                      className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0e6f68]"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                      Ketik nama kecamatan Anda di {selectedCity}.
                    </p>
                  </div>
                )}
              </div>

              {/* Pratinjau Wilayah Terpilih */}
              <div className="p-3.5 bg-[#edf8f6] rounded-2xl border border-teal-100 flex items-start gap-2.5 text-xs text-[#0e6f68]">
                <Navigation className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="space-y-0.5">
                  <p className="font-bold">Wilayah Terpilih:</p>
                  <p className="text-gray-700">
                    {customDistrict ? `Kec. ${customDistrict}, ` : selectedDistrict ? `Kec. ${selectedDistrict}, ` : ""}
                    <strong>{selectedCity}</strong>, {selectedProvince}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PENCARIAN CEPAT (LIVE SEARCH NOMINATIM SE-INDONESIA) */}
          {activeTab === "search" && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  placeholder="Ketik nama kecamatan, desa, atau kota (contoh: Waru Sidoarjo, Lowokwaru)..."
                  className="w-full text-xs pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0e6f68]"
                />
              </div>

              {isSearching && (
                <div className="p-4 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-[#0e6f68] border-t-transparent rounded-full animate-spin" />
                  <span>Mencari data wilayah di Indonesia...</span>
                </div>
              )}

              {!isSearching && searchResults.length > 0 && (
                <div className="space-y-1.5 max-h-56 overflow-y-auto">
                  {searchResults.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSearchResult(item)}
                      className="w-full text-left p-3 rounded-2xl hover:bg-[#edf8f6] border border-gray-100 hover:border-teal-200 transition flex items-center justify-between gap-3 cursor-pointer group"
                    >
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-[#0e6f68] flex-shrink-0" />
                          <p className="text-xs font-bold text-gray-900 group-hover:text-[#0e6f68] truncate">
                            {item.district ? `Kec. ${item.district}` : item.city}
                          </p>
                        </div>
                        <p className="text-[11px] text-gray-500 truncate">
                          {item.city}, {item.region}
                        </p>
                        <p className="text-[9px] text-gray-400 font-mono">
                          {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#0e6f68] flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
                <div className="p-4 text-center text-xs text-gray-500 bg-gray-50 rounded-2xl">
                  Wilayah tidak ditemukan dalam pencarian cepat. Silakan gunakan tab <strong>Pilih Berjenjang</strong>.
                </div>
              )}

              {searchQuery.length < 2 && (
                <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-100 text-[11px] text-gray-600 space-y-1">
                  <p className="font-bold text-[#0e6f68]">💡 Tips Pencarian:</p>
                  <p>
                    Ketik nama kecamatan diikuti kota, misalnya <em>&quot;Waru Sidoarjo&quot;</em>, <em>&quot;Gedangan Sidoarjo&quot;</em>, atau <em>&quot;Lowokwaru Malang&quot;</em> untuk hasil paling presisi.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PRESET & GPS OTOMATIS */}
          {activeTab === "presets" && (
            <div className="space-y-3">
              <p className="text-xs text-gray-600 leading-relaxed">
                Pilih cepat lokasi rekomendasi atau gunakan sensor GPS perangkat Anda:
              </p>

              {/* Tombol GPS */}
              {onDetectGPS && (
                <button
                  type="button"
                  onClick={async () => {
                    await onDetectGPS();
                    onClose();
                  }}
                  disabled={isDetectingGPS}
                  className="w-full p-3.5 rounded-2xl bg-[#0e6f68] hover:bg-[#0a524d] text-white transition flex items-center justify-between cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <Compass className="w-4 h-4 animate-spin" style={{ animationDuration: "3s" }} />
                    <div className="text-left">
                      <p className="text-xs font-bold">Deteksi via GPS Perangkat</p>
                      <p className="text-[10px] text-teal-100">
                        {isDetectingGPS ? "Sedang mendeteksi sinyal GPS..." : "Akurasi tinggi sensor perangkat"}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-teal-200" />
                </button>
              )}

              {/* Preset Sidoarjo */}
              <button
                type="button"
                onClick={() => {
                  onSelectLocation(SIDOARJO_PRESET);
                  onClose();
                }}
                className="w-full text-left p-3.5 rounded-2xl border border-teal-200 bg-[#edf8f6] hover:bg-teal-100/60 transition flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <p className="text-xs font-bold text-[#0e6f68]">
                      Kabupaten Sidoarjo, Jawa Timur (Rekomendasi)
                    </p>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    Pusat Kota (Alun-Alun & GOR Delta) • Lat -7.4478, Lng 112.7183
                  </p>
                </div>
                <Check className="w-4 h-4 text-[#0e6f68]" />
              </button>

              {/* Preset Surabaya */}
              <button
                type="button"
                onClick={() => {
                  onSelectLocation(SURABAYA_PRESET);
                  onClose();
                }}
                className="w-full text-left p-3.5 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition flex items-center justify-between cursor-pointer"
              >
                <div>
                  <p className="text-xs font-bold text-gray-800">Kota Surabaya, Jawa Timur</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Pusat Kota (Kapasari / Gubeng) • Lat -7.2575, Lng 112.7521
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </button>

              {/* Preset Semarang */}
              <button
                type="button"
                onClick={() => {
                  onSelectLocation(SEMARANG_PRESET);
                  onClose();
                }}
                className="w-full text-left p-3.5 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition flex items-center justify-between cursor-pointer"
              >
                <div>
                  <p className="text-xs font-bold text-gray-800">Kota Semarang, Jawa Tengah</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    Kawasan Sekaran / Gunungpati • Lat -7.0492, Lng 110.4382
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Batal
          </button>

          {activeTab === "dropdown" && (
            <button
              type="button"
              onClick={handleApplyDropdown}
              disabled={isApplyingDropdown}
              className="px-5 py-2.5 bg-[#0e6f68] hover:bg-[#0a524d] text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs flex items-center gap-1.5 disabled:opacity-60"
            >
              {isApplyingDropdown ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Mengecek Koordinat...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Terapkan Lokasi</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
