import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon") || searchParams.get("lng");

  if (!lat || !lon) {
    return NextResponse.json(
      { error: "Parameter lat dan lon/lng wajib diisi" },
      { status: 400 }
    );
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lon);

  if (isNaN(latitude) || isNaN(longitude)) {
    return NextResponse.json(
      { error: "Koordinat latitude atau longitude tidak valid" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&zoom=18`,
      {
        headers: {
          "User-Agent": "NARAGA-Disaster-Preparedness-App/1.0 (contact@naraga.id)",
          "Accept-Language": "id,en",
        },
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) {
      return NextResponse.json({
        district: undefined,
        city: "Kabupaten Sidoarjo",
        region: "Jawa Timur",
        displayName: `Koordinat ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
      });
    }

    const data = await res.json();
    const addr = data.address || {};

    const road = addr.road || addr.street || addr.pedestrian || addr.path;
    const village =
      addr.suburb ||
      addr.neighbourhood ||
      addr.quarter ||
      addr.village ||
      addr.hamlet ||
      addr.residential;
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
      addr.regency ||
      "Kabupaten Sidoarjo";
    const region = addr.state || addr.province || "Jawa Timur";

    // Susun nama tampilan yang rapi dan presisi
    const parts: string[] = [];
    if (road) parts.push(road);
    if (village && village !== road) parts.push(`Desa/Kel. ${village}`);
    if (district && district !== village) parts.push(`Kec. ${district}`);
    if (city) parts.push(city);
    if (region) parts.push(region);

    const displayName = parts.length > 0 ? parts.join(", ") : data.display_name;

    return NextResponse.json({
      success: true,
      latitude,
      longitude,
      road,
      village,
      district,
      city,
      region,
      postcode: addr.postcode,
      displayName,
      rawAddress: addr,
    });
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return NextResponse.json(
      {
        district: undefined,
        city: "Kabupaten Sidoarjo",
        region: "Jawa Timur",
        displayName: `Koordinat ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
      },
      { status: 200 }
    );
  }
}
