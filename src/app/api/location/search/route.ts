import { NextRequest, NextResponse } from "next/server";
import { INDONESIA_REGIONS } from "@/lib/indonesia-regions";

export interface LocationSearchResult {
  displayName: string;
  road?: string;
  village?: string;
  district?: string;
  city: string;
  region: string;
  latitude: number;
  longitude: number;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  // 1. Coba OpenStreetMap Nominatim (Gratis, Resmi, se-Indonesia)
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&countrycodes=id&addressdetails=1&limit=8&q=${encodeURIComponent(
        query
      )}`,
      {
        headers: {
          "User-Agent": "NARAGA-Kesiapsiagaan-Komunitas/1.0",
          Accept: "application/json",
        },
        next: { revalidate: 3600 },
      }
    );

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const results: LocationSearchResult[] = data.map((item: any) => {
          const addr = item.address || {};
          const road = addr.road || addr.street || addr.pedestrian;
          const village =
            addr.suburb ||
            addr.neighbourhood ||
            addr.quarter ||
            addr.village ||
            addr.hamlet;
          const district =
            addr.city_district ||
            addr.subdistrict ||
            addr.town ||
            addr.municipality ||
            village;
          const city =
            addr.county ||
            addr.city ||
            addr.municipality ||
            addr.state_district ||
            "Wilayah Indonesia";
          const region = addr.state || "Indonesia";

          return {
            displayName: item.display_name,
            road: road || undefined,
            village: village || undefined,
            district: district || undefined,
            city,
            region,
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
          };
        });

        return NextResponse.json({ results });
      }
    }
  } catch (err) {
    console.warn("Nominatim search error, fallback to local dataset:", err);
  }

  // 2. Fallback pencarian lokal jika Nominatim tidak merespon
  const qLower = query.toLowerCase();
  const localResults: LocationSearchResult[] = [];

  for (const prov of INDONESIA_REGIONS) {
    for (const city of prov.cities) {
      // Cek apakah nama kota cocok
      if (city.name.toLowerCase().includes(qLower)) {
        localResults.push({
          displayName: `${city.name}, ${prov.name}`,
          city: city.name,
          region: prov.name,
          latitude: city.latitude,
          longitude: city.longitude,
        });
      }

      // Cek apakah kecamatan cocok
      if (city.districts) {
        for (const dist of city.districts) {
          if (dist.toLowerCase().includes(qLower)) {
            localResults.push({
              displayName: `Kecamatan ${dist}, ${city.name}, ${prov.name}`,
              district: dist,
              city: city.name,
              region: prov.name,
              latitude: city.latitude,
              longitude: city.longitude,
            });
          }
        }
      }

      if (localResults.length >= 8) break;
    }
    if (localResults.length >= 8) break;
  }

  return NextResponse.json({ results: localResults });
}
