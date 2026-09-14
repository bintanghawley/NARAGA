"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface EvacuationPoint {
  id: string;
  name: string;
  type: string;
  description?: string | null;
  latitude: number;
  longitude: number;
}

interface EvacuationRoute {
  id: string;
  name: string;
  description?: string | null;
  coordinates: [number, number][];
  color?: string;
}

export default function EvacuationMap({
  points,
  routes,
}: {
  points: EvacuationPoint[];
  routes: EvacuationRoute[];
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Bersihkan map instance lama jika ada
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Default center ke titik pertama atau default Semarang (-7.049, 110.438)
    const initialLat = points.length > 0 ? points[0].latitude : -7.04921;
    const initialLng = points.length > 0 ? points[0].longitude : 110.43825;

    const map = L.map(mapContainerRef.current).setView([initialLat, initialLng], 16);
    mapInstanceRef.current = map;

    // Tambahkan OpenStreetMap tile layer publik
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> kontributor',
      maxZoom: 19,
    }).addTo(map);

    // Custom Icon Maker
    const createMarkerIcon = (type: string) => {
      let bgColor = "#10b981"; // Assembly point: hijau
      let label = "TK";

      if (type === "AID_POST") {
        bgColor = "#3b82f6"; // Posko: biru
        label = "PK";
      } else if (type === "HAZARD_POINT") {
        bgColor = "#ef4444"; // Bahaya: merah
        label = "⚠️";
      }

      return L.divIcon({
        className: "custom-div-icon",
        html: `<div style="background-color:${bgColor}; width:32px; height:32px; border-radius:50%; border:3px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; color:white; font-size:12px; font-weight:bold;">${label}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
      });
    };

    // Render Markers
    points.forEach((pt) => {
      const marker = L.marker([pt.latitude, pt.longitude], {
        icon: createMarkerIcon(pt.type),
      }).addTo(map);

      marker.bindPopup(`
        <div style="font-family:sans-serif; padding:2px;">
          <h4 style="margin:0 0 4px; font-size:14px; font-weight:bold; color:#111;">${pt.name}</h4>
          <p style="margin:0 0 4px; font-size:11px; font-weight:bold; color:#666;">Tipe: ${pt.type}</p>
          <p style="margin:0; font-size:12px; color:#444;">${pt.description || "Tidak ada keterangan"}</p>
          <p style="margin:4px 0 0; font-size:10px; color:#888;">Koordinat: ${pt.latitude.toFixed(5)}, ${pt.longitude.toFixed(5)}</p>
        </div>
      `);
    });

    // Render Routes (Polylines)
    routes.forEach((route) => {
      if (route.coordinates && route.coordinates.length > 0) {
        const polyline = L.polyline(route.coordinates, {
          color: route.color || "#10b981",
          weight: 5,
          opacity: 0.8,
          dashArray: "6, 8",
        }).addTo(map);

        polyline.bindPopup(`
          <div style="font-family:sans-serif; padding:2px;">
            <h4 style="margin:0 0 4px; font-size:14px; font-weight:bold; color:#111;">${route.name}</h4>
            <p style="margin:0; font-size:12px; color:#444;">${route.description || "Jalur Evakuasi Lingkungan"}</p>
          </div>
        `);
      }
    });

    return () => {
      map.remove();
    };
  }, [points, routes]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-[500px] rounded-2xl overflow-hidden border border-gray-200 z-0"
    />
  );
}
