export interface UserLocation {
  ip: string;
  road?: string; // Nama Jalan
  village?: string; // Nama Desa / Kelurahan
  district?: string; // Nama Kecamatan
  city: string; // Nama Kota / Kabupaten
  region: string; // Nama Provinsi
  country: string;
  latitude: number;
  longitude: number;
  accuracy?: number; // Estimasi akurasi dalam meter
  displayName?: string; // Alamat presisi lengkap
  isp?: string;
  source: "ip" | "gps" | "fallback" | "manual";
}

export const SIDOARJO_PRESET: UserLocation = {
  ip: "Presisi (Sidoarjo)",
  road: "Jl. Gubernur Suryo",
  village: "Sidokumpul",
  district: "Sidoarjo",
  city: "Kabupaten Sidoarjo",
  region: "Jawa Timur",
  country: "Indonesia",
  latitude: -7.4478,
  longitude: 112.7183,
  displayName: "Jl. Gubernur Suryo, Sidokumpul, Kec. Sidoarjo, Kabupaten Sidoarjo",
  isp: "Kesiapsiagaan Komunitas Sidoarjo",
  source: "manual",
};

export const SURABAYA_PRESET: UserLocation = {
  ip: "Presisi (Surabaya)",
  district: "Gubeng",
  city: "Kota Surabaya",
  region: "Jawa Timur",
  country: "Indonesia",
  latitude: -7.2575,
  longitude: 112.7521,
  displayName: "Kec. Gubeng, Kota Surabaya, Jawa Timur",
  isp: "Gateway Provider Surabaya",
  source: "manual",
};

export const SEMARANG_PRESET: UserLocation = {
  ip: "Presisi (Semarang)",
  district: "Gunungpati",
  city: "Kota Semarang",
  region: "Jawa Tengah",
  country: "Indonesia",
  latitude: -7.04921,
  longitude: 110.43825,
  displayName: "Kec. Gunungpati, Kota Semarang, Jawa Tengah",
  isp: "Komunitas Siaga Sekaran",
  source: "manual",
};

export const LOCATION_PRESETS: { label: string; location: UserLocation }[] = [
  { label: "Kabupaten Sidoarjo, Jawa Timur (Rekomendasi)", location: SIDOARJO_PRESET },
  { label: "Kota Surabaya, Jawa Timur", location: SURABAYA_PRESET },
  { label: "Kota Semarang, Jawa Tengah", location: SEMARANG_PRESET },
];

const DEFAULT_LOCATION: UserLocation = SIDOARJO_PRESET;

let cachedLocation: UserLocation | null = null;

/**
 * Cek apakah pengguna sudah memberi izin deteksi lokasi
 */
export function hasLocationPermission(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("naraga_location_permitted") === "true";
}

/**
 * Simpan atau hapus status izin lokasi
 */
export function saveLocationPermission(granted: boolean): void {
  if (typeof window === "undefined") return;
  if (granted) {
    localStorage.setItem("naraga_location_permitted", "true");
  } else {
    localStorage.removeItem("naraga_location_permitted");
    localStorage.removeItem("naraga_user_location");
    sessionStorage.removeItem("naraga_user_location");
    cachedLocation = null;
    window.dispatchEvent(new CustomEvent("naraga_location_changed", { detail: null }));
  }
}

/**
 * Simpan lokasi pilihan pengguna (misal jika IP provider meleset ke Surabaya)
 */
export function saveManualLocation(loc: UserLocation): void {
  cachedLocation = loc;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("naraga_location_permitted", "true");
      localStorage.setItem("naraga_user_location", JSON.stringify(loc));
      sessionStorage.setItem("naraga_user_location", JSON.stringify(loc));
      window.dispatchEvent(new CustomEvent("naraga_location_changed", { detail: loc }));
    } catch {}
  }
}

/**
 * Reverse geocode koordinat lat/lng menjadi alamat presisi (Jalan, Kelurahan, Kecamatan, Kota, Provinsi)
 * Menggunakan internal API proxy /api/location/reverse
 */
export async function reverseGeocodeCoords(
  lat: number,
  lng: number
): Promise<{
  road?: string;
  village?: string;
  district?: string;
  city: string;
  region: string;
  displayName: string;
}> {
  try {
    const res = await fetch(`/api/location/reverse?lat=${lat}&lon=${lng}`);
    if (res.ok) {
      const data = await res.json();
      return {
        road: data.road,
        village: data.village,
        district: data.district,
        city: data.city || "Kabupaten Sidoarjo",
        region: data.region || "Jawa Timur",
        displayName:
          data.displayName || `Koordinat ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      };
    }
  } catch (err) {
    console.warn("Reverse geocode internal endpoint error:", err);
  }

  return {
    city: "Kabupaten Sidoarjo",
    region: "Jawa Timur",
    displayName: `Koordinat ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
  };
}

/**
 * Deteksi GPS langsung dengan akurasi tinggi (Hardware GPS / Wi-Fi trilateration)
 */
export async function getHighAccuracyGPSPosition(
  timeoutMs = 15000
): Promise<UserLocation> {
  if (typeof window === "undefined" || !navigator.geolocation) {
    throw new Error("Perangkat atau peramban tidak mendukung sensor geolokasi GPS");
  }

  const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (p) => resolve(p),
      (err) => reject(err),
      {
        enableHighAccuracy: true,
        timeout: timeoutMs,
        maximumAge: 0,
      }
    );
  });

  const { latitude, longitude, accuracy } = pos.coords;
  const rev = await reverseGeocodeCoords(latitude, longitude);

  const loc: UserLocation = {
    ip: "GPS Perangkat Presisi",
    road: rev.road,
    village: rev.village,
    district: rev.district,
    city: rev.city || "Kabupaten Sidoarjo",
    region: rev.region || "Jawa Timur",
    country: "Indonesia",
    latitude,
    longitude,
    accuracy: Math.round(accuracy || 0),
    displayName: rev.displayName,
    isp: `Sensor GPS (Akurasi ±${Math.round(accuracy || 0)}m)`,
    source: "gps",
  };

  saveManualLocation(loc);
  return loc;
}

/**
 * Deteksi lokasi pengguna:
 * 1. Jika force=true: Langsung coba sensor GPS akurasi tinggi tanpa membaca cache lama
 * 2. Jika tidak force: Baca cache tersimpan
 * 3. Fallback ke IP Geolocation
 */
export async function detectUserLocation(force = false): Promise<UserLocation> {
  // Jika tidak force, gunakan cache memori jika ada
  if (cachedLocation && !force) {
    return cachedLocation;
  }

  // 0. Cek localStorage & sessionStorage jika TIDAK force
  if (!force && typeof window !== "undefined") {
    try {
      const stored =
        localStorage.getItem("naraga_user_location") ||
        sessionStorage.getItem("naraga_user_location");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed) {
          cachedLocation = parsed;
          return parsed;
        }
      }
    } catch {
      // Abaikan error storage
    }
  }

  // 1. PRIORITAS UTAMA: Coba Sensor GPS Akurasi Tinggi
  if (typeof window !== "undefined" && navigator.geolocation) {
    try {
      const loc = await getHighAccuracyGPSPosition(10000);
      return loc;
    } catch (gpsError) {
      console.warn("GPS browser tidak aktif atau ditolak, beralih ke deteksi IP:", gpsError);
    }
  }

  // 2. FALLBACK KE IP GEOLOCATION (ipwho.is)
  try {
    const res = await fetch("https://ipwho.is/", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        const loc: UserLocation = {
          ip: data.ip,
          city: data.city || "Kabupaten Sidoarjo",
          region: data.region || "Jawa Timur",
          country: data.country || "Indonesia",
          latitude: Number(data.latitude) || DEFAULT_LOCATION.latitude,
          longitude: Number(data.longitude) || DEFAULT_LOCATION.longitude,
          isp: data.connection?.isp || data.connection?.org,
          displayName: `${data.city || "Kabupaten Sidoarjo"}, ${data.region || "Jawa Timur"}`,
          source: "ip",
        };
        cachedLocation = loc;
        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem("naraga_user_location", JSON.stringify(loc));
          } catch {}
        }
        return loc;
      }
    }
  } catch (e) {
    console.warn("ipwho.is detection failed, trying fallback:", e);
  }

  // 3. Backup provider: ipapi.co
  try {
    const res = await fetch("https://ipapi.co/json/", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.ip) {
        const loc: UserLocation = {
          ip: data.ip,
          city: data.city || "Kabupaten Sidoarjo",
          region: data.region || "Jawa Timur",
          country: data.country_name || "Indonesia",
          latitude: Number(data.latitude) || DEFAULT_LOCATION.latitude,
          longitude: Number(data.longitude) || DEFAULT_LOCATION.longitude,
          isp: data.org,
          displayName: `${data.city || "Kabupaten Sidoarjo"}, ${data.region || "Jawa Timur"}`,
          source: "ip",
        };
        cachedLocation = loc;
        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem("naraga_user_location", JSON.stringify(loc));
          } catch {}
        }
        return loc;
      }
    }
  } catch (e) {
    console.warn("ipapi.co detection failed:", e);
  }

  return SIDOARJO_PRESET;
}

