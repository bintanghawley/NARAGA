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
  isLocked?: boolean; // Apakah lokasi dikunci agar tidak bergeser sendiri
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
  isLocked: true,
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
  isLocked: true,
};

export const SEMARANG_PRESET: UserLocation = {
  ip: "Presisi (Semarang)",
  road: "Jl. Taman Siswa",
  village: "Sekaran",
  district: "Gunungpati",
  city: "Kota Semarang",
  region: "Jawa Tengah",
  country: "Indonesia",
  latitude: -7.04921,
  longitude: 110.43825,
  displayName: "Jl. Taman Siswa, Sekaran, Kec. Gunungpati, Kota Semarang",
  isp: "Komunitas Siaga Sekaran",
  source: "manual",
  isLocked: true,
};

export const LOCATION_PRESETS: { label: string; location: UserLocation }[] = [
  { label: "Kabupaten Sidoarjo, Jawa Timur (Rekomendasi)", location: SIDOARJO_PRESET },
  { label: "Kota Semarang, Jawa Tengah (Komunitas Sekaran)", location: SEMARANG_PRESET },
  { label: "Kota Surabaya, Jawa Timur", location: SURABAYA_PRESET },
];

const DEFAULT_LOCATION: UserLocation = SIDOARJO_PRESET;

let cachedLocation: UserLocation | null = null;
const reverseGeocodeCache = new Map<string, any>();

/**
 * Hitung jarak antar dua koordinat dalam meter (Haversine formula)
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // meter
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Cek apakah pengguna sudah memberi izin deteksi lokasi
 */
export function hasLocationPermission(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("naraga_location_permitted") === "true";
}

/**
 * Ambil lokasi tersimpan dari storage lokal
 */
export function getStoredLocation(): UserLocation | null {
  if (typeof window === "undefined") return null;
  try {
    const stored =
      localStorage.getItem("naraga_user_location") ||
      sessionStorage.getItem("naraga_user_location");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {}
  return null;
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
 * Simpan lokasi pilihan/presisi pengguna secara permanen (terkunci dari getaran Wi-Fi)
 */
export function saveManualLocation(loc: UserLocation): void {
  const lockedLoc: UserLocation = {
    ...loc,
    isLocked: true,
  };
  cachedLocation = lockedLoc;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("naraga_location_permitted", "true");
      localStorage.setItem("naraga_user_location", JSON.stringify(lockedLoc));
      sessionStorage.setItem("naraga_user_location", JSON.stringify(lockedLoc));
      window.dispatchEvent(
        new CustomEvent("naraga_location_changed", { detail: lockedLoc })
      );
    } catch {}
  }
}

/**
 * Reverse geocode koordinat lat/lng menjadi alamat presisi dengan in-memory cache
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
  // Key dibulatkan ke 4 desimal (~11 meter) untuk menghindari request berulang saat jitter
  const cacheKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (reverseGeocodeCache.has(cacheKey)) {
    return reverseGeocodeCache.get(cacheKey);
  }

  try {
    const res = await fetch(`/api/location/reverse?lat=${lat}&lon=${lng}`);
    if (res.ok) {
      const data = await res.json();
      const result = {
        road: data.road,
        village: data.village,
        district: data.district,
        city: data.city || "Kabupaten Sidoarjo",
        region: data.region || "Jawa Timur",
        displayName:
          data.displayName || `Koordinat ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
      };
      reverseGeocodeCache.set(cacheKey, result);
      return result;
    }
  } catch (err) {
    console.warn("Reverse geocode internal endpoint error:", err);
  }

  const fallback = {
    city: "Kabupaten Sidoarjo",
    region: "Jawa Timur",
    displayName: `Koordinat ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
  };
  reverseGeocodeCache.set(cacheKey, fallback);
  return fallback;
}

/**
 * Deteksi GPS/Wi-Fi dengan peredam jitter khusus laptop:
 * - Menggunakan multi-stage query (High Accuracy -> Standard Wi-Fi Fallback)
 * - Mencegah koordinat melompat-lompat akibat fluktuasi sinyal router Wi-Fi
 * - Menjaga titik stabil jika pergeseran sinyal < 80 meter
 */
export async function getHighAccuracyGPSPosition(
  timeoutMs = 10000,
  forceFresh = false
): Promise<UserLocation> {
  if (typeof window === "undefined" || !navigator.geolocation) {
    throw new Error("Perangkat atau peramban tidak mendukung sensor geolokasi");
  }

  // Jika sebelumnya lokasi sudah dikunci oleh pengguna (manual/pinpoint), dan tidak diminta paksa:
  const stored = getStoredLocation();
  if (!forceFresh && stored && stored.isLocked) {
    cachedLocation = stored;
    return stored;
  }

  let pos: GeolocationPosition | null = null;

  // Tahap 1: Coba High Accuracy Wi-Fi / GPS dengan toleransi cache 1 menit
  try {
    pos = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (p) => resolve(p),
        (err) => reject(err),
        {
          enableHighAccuracy: true,
          timeout: timeoutMs,
          maximumAge: 60000, // Cegah scan Wi-Fi berulang setiap detik yang bikin koordinat bergetar
        }
      );
    });
  } catch (errHigh) {
    // Tahap 2: Fallback Laptop - Standard Network Triangulation (Sangat andal & cepat di laptop Windows/Mac)
    try {
      pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (p) => resolve(p),
          (err) => reject(err),
          {
            enableHighAccuracy: false,
            timeout: 6000,
            maximumAge: 120000,
          }
        );
      });
    } catch (errLow) {
      throw errHigh;
    }
  }

  if (!pos) {
    throw new Error("Gagal memperoleh koordinat perangkat");
  }

  let { latitude, longitude, accuracy } = pos.coords;

  // Tahap 3: Jitter Stabilization Filter (Peredam Getaran Sinyal Laptop)
  // Jika sebelumnya sudah ada lokasi, dan perbedaannya di bawah 80 meter:
  // JANGAN geser pin! Tetap gunakan koordinat yang sudah stabil agar tidak berubah-ubah.
  if (stored && stored.latitude && stored.longitude) {
    const dist = calculateDistanceMeters(
      stored.latitude,
      stored.longitude,
      latitude,
      longitude
    );

    if (dist < 80) {
      latitude = stored.latitude;
      longitude = stored.longitude;

      const stabilizedLoc: UserLocation = {
        ...stored,
        accuracy: Math.round(accuracy || stored.accuracy || 15),
        source: "gps",
      };
      cachedLocation = stabilizedLoc;
      return stabilizedLoc;
    }
  }

  const rev = await reverseGeocodeCoords(latitude, longitude);

  const loc: UserLocation = {
    ip: "Sensor Laptop (Stabil)",
    road: rev.road,
    village: rev.village,
    district: rev.district,
    city: rev.city || "Kabupaten Sidoarjo",
    region: rev.region || "Jawa Timur",
    country: "Indonesia",
    latitude,
    longitude,
    accuracy: Math.round(accuracy || 15),
    displayName: rev.displayName,
    isp: `Sensor Perangkat Laptop (±${Math.round(accuracy || 15)}m)`,
    source: "gps",
    isLocked: true,
  };

  saveManualLocation(loc);
  return loc;
}

/**
 * Deteksi lokasi pengguna yang stabil:
 * 1. Prioritaskan cache tersimpan di localStorage (bebas lompatan)
 * 2. Coba geolokasi terstabilkan browser
 * 3. Fallback ke preset terpercaya (tanpa memanggil IP luar yang bisa melompat ke Jakarta/Surabaya)
 */
export async function detectUserLocation(force = false): Promise<UserLocation> {
  if (cachedLocation && !force) {
    return cachedLocation;
  }

  // Cek localStorage jika tidak force
  if (!force && typeof window !== "undefined") {
    const stored = getStoredLocation();
    if (stored) {
      cachedLocation = stored;
      return stored;
    }
  }

  // Coba sensor geolokasi browser
  if (typeof window !== "undefined" && navigator.geolocation) {
    try {
      const loc = await getHighAccuracyGPSPosition(8000, force);
      return loc;
    } catch (e) {
      console.warn("Geolokasi browser ditolak atau offline, gunakan titik tersimpan:", e);
    }
  }

  // Jika pernah ada titik tersimpan, gunakan itu
  const existing = getStoredLocation();
  if (existing) {
    cachedLocation = existing;
    return existing;
  }

  return DEFAULT_LOCATION;
}
