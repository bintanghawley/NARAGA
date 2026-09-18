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
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routesLayerRef = useRef<L.LayerGroup | null>(null);

  // 1. Inisialisasi Map hanya SEKALI saat mount
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    // Bersihkan _leaflet_id jika ada sisa dari hot reload / fast refresh
    if ((container as any)._leaflet_id) {
      delete (container as any)._leaflet_id;
    }

    // Default center ke titik pertama atau default Semarang (-7.049, 110.438)
    const initialLat = points.length > 0 ? points[0].latitude : -7.04921;
    const initialLng = points.length > 0 ? points[0].longitude : 110.43825;

    const map = L.map(container, {
      center: [initialLat, initialLng],
      zoom: 16,
      scrollWheelZoom: true,
    });
    mapInstanceRef.current = map;

    // Tile layer OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> kontributor',
      maxZoom: 19,
    }).addTo(map);

    // Buat LayerGroup untuk Marker dan Rute
    const markersGroup = L.layerGroup().addTo(map);
    const routesGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    routesLayerRef.current = routesGroup;

    // Cleanup saat unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (container && (container as any)._leaflet_id) {
        delete (container as any)._leaflet_id;
      }
    };
  }, []);

  // 2. Update Marker dan Rute secara reaktif tanpa re-create map instance
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    const routesGroup = routesLayerRef.current;

    if (!map || !markersGroup || !routesGroup) return;

    // Bersihkan layer lama
    markersGroup.clearLayers();
    routesGroup.clearLayers();

    // Helper pembuat icon
    const createMarkerIcon = (type: string) => {
      let bgColor = "#10b981"; // Assembly point: hijau
      let label = "TK";

      if (type === "AID_POST") {
        bgColor = "#8b5cf6"; // Posko: ungu
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

    // Tambahkan Marker
    points.forEach((pt) => {
      const marker = L.marker([pt.latitude, pt.longitude], {
        icon: createMarkerIcon(pt.type),
      });

      marker.bindPopup(`
        <div style="font-family:sans-serif; padding:2px;">
          <h4 style="margin:0 0 4px; font-size:14px; font-weight:bold; color:#111;">${pt.name}</h4>
          <p style="margin:0 0 4px; font-size:11px; font-weight:bold; color:#666;">Tipe: ${pt.type}</p>
          <p style="margin:0; font-size:12px; color:#444;">${pt.description || "Tidak ada keterangan"}</p>
          <p style="margin:4px 0 0; font-size:10px; color:#888;">Koordinat: ${pt.latitude.toFixed(5)}, ${pt.longitude.toFixed(5)}</p>
        </div>
      `);

      markersGroup.addLayer(marker);
    });

    // Tambahkan Rute Evakuasi (Polylines)
    routes.forEach((route) => {
      if (route.coordinates && route.coordinates.length > 0) {
        const polyline = L.polyline(route.coordinates, {
          color: route.color || "#10b981",
          weight: 5,
          opacity: 0.85,
          dashArray: "6, 8",
        });

        polyline.bindPopup(`
          <div style="font-family:sans-serif; padding:2px;">
            <h4 style="margin:0 0 4px; font-size:14px; font-weight:bold; color:#111;">${route.name}</h4>
            <p style="margin:0; font-size:12px; color:#444;">${route.description || "Jalur Evakuasi Lingkungan"}</p>
          </div>
        `);

        routesGroup.addLayer(polyline);
      }
    });

    // Pan map jika ada titik
    if (points.length > 0) {
      map.panTo([points[0].latitude, points[0].longitude]);
    }
  }, [points, routes]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-[500px] rounded-2xl overflow-hidden border border-gray-200 z-0 shadow-inner"
    />
  );
}
