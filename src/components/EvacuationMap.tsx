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

interface EvacuationMapProps {
  points: EvacuationPoint[];
  routes: EvacuationRoute[];
  userLocation?: {
    latitude: number;
    longitude: number;
    road?: string;
    village?: string;
    district?: string;
    city?: string;
    region?: string;
    ip?: string;
    accuracy?: number;
    displayName?: string;
  } | null;
  onPinpointLocation?: (lat: number, lng: number) => void;
  onTriggerGPS?: () => void;
  isDetectingGPS?: boolean;
}

export default function EvacuationMap({
  points,
  routes,
  userLocation,
  onPinpointLocation,
  onTriggerGPS,
  isDetectingGPS = false,
}: EvacuationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routesLayerRef = useRef<L.LayerGroup | null>(null);
  const pinpointRef = useRef(onPinpointLocation);
  pinpointRef.current = onPinpointLocation;

  // 1. Inisialisasi Map hanya SEKALI saat mount
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    // Bersihkan _leaflet_id jika ada sisa dari hot reload / fast refresh
    if ((container as any)._leaflet_id) {
      delete (container as any)._leaflet_id;
    }

    // Default center ke titik pertama atau default Sidoarjo (-7.4478, 112.7183)
    const initialLat = userLocation?.latitude || (points.length > 0 ? points[0].latitude : -7.4478);
    const initialLng = userLocation?.longitude || (points.length > 0 ? points[0].longitude : 112.7183);

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

    // Izinkan pengguna mengklik peta untuk meletakkan titik lokasi 100% tepat
    map.on("click", (e: L.LeafletMouseEvent) => {
      if (pinpointRef.current) {
        pinpointRef.current(e.latlng.lat, e.latlng.lng);
      }
    });

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

    // Tambahkan Marker Fasilitas Evakuasi
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

    // Tambahkan Marker Posisi Pengguna jika terdeteksi
    if (userLocation && userLocation.latitude && userLocation.longitude) {
      // Radius akurasi jika ada
      if (userLocation.accuracy && userLocation.accuracy > 0 && userLocation.accuracy <= 2000) {
        const accuracyCircle = L.circle([userLocation.latitude, userLocation.longitude], {
          radius: userLocation.accuracy,
          color: "#0e6f68",
          fillColor: "#10b981",
          fillOpacity: 0.12,
          weight: 1.5,
          dashArray: "4, 4",
        });
        markersGroup.addLayer(accuracyCircle);
      }

      const userMarkerIcon = L.divIcon({
        className: "custom-div-icon",
        html: `<div style="position:relative; width:40px; height:40px; display:flex; align-items:center; justify-content:center; cursor:grab;">
          <div style="position:absolute; width:100%; height:100%; border-radius:50%; background:rgba(14,111,104,0.35); animation:ping 1.8s cubic-bezier(0,0,0.2,1) infinite;"></div>
          <div style="background-color:#0e6f68; width:30px; height:30px; border-radius:50%; border:3px solid white; box-shadow:0 3px 10px rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; color:white; font-size:15px;">📍</div>
        </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20],
      });

      const userMarker = L.marker([userLocation.latitude, userLocation.longitude], {
        icon: userMarkerIcon,
        draggable: true,
        title: "Geser pin ini untuk menyesuaikan lokasi tepat Anda",
      });

      userMarker.on("dragend", (e: any) => {
        const newCoords = e.target.getLatLng();
        if (pinpointRef.current) {
          pinpointRef.current(newCoords.lat, newCoords.lng);
        }
      });

      const detailText = userLocation.displayName || [
        userLocation.road,
        userLocation.village ? `Desa ${userLocation.village}` : "",
        userLocation.district ? `Kec. ${userLocation.district}` : "",
        userLocation.city,
        userLocation.region,
      ].filter(Boolean).join(", ");

      userMarker.bindPopup(`
        <div style="font-family:sans-serif; padding:4px; max-width:240px;">
          <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
            <span style="font-size:16px;">📍</span>
            <h4 style="margin:0; font-size:13px; font-weight:bold; color:#0e6f68;">Titik Lokasi Anda</h4>
          </div>
          <p style="margin:0 0 4px; font-size:11px; line-height:1.4; color:#222; font-weight:600;">
            ${detailText || "Lokasi Anda Terkini"}
          </p>
          <div style="padding:4px 6px; background:#f3f4f6; border-radius:6px; margin-top:4px;">
            <p style="margin:0; font-size:10px; color:#555;">
              📐 <b>Presisi:</b> ${userLocation.latitude.toFixed(6)}, ${userLocation.longitude.toFixed(6)}
              ${userLocation.accuracy ? ` (±${userLocation.accuracy}m)` : ""}
            </p>
          </div>
          <p style="margin:6px 0 0; font-size:9.5px; color:#0e6f68; font-style:italic;">
            💡 Tip: Geser pin ini atau klik di peta untuk mengatur titik 100% presisi.
          </p>
        </div>
      `);

      markersGroup.addLayer(userMarker);

      // Fly map ke lokasi pengguna terdeteksi dan buka popup
      map.flyTo([userLocation.latitude, userLocation.longitude], 16, {
        animate: true,
        duration: 1.0,
      });
      userMarker.openPopup();
    } else if (points.length > 0) {
      map.panTo([points[0].latitude, points[0].longitude]);
    }
  }, [points, routes, userLocation]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-gray-200 shadow-inner group">
      <div
        ref={mapContainerRef}
        className="w-full h-[520px] rounded-2xl z-0"
      />

      {/* Floating Interactive Controls di atas peta */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Banner Panduan Presisi */}
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-gray-200/80 flex items-center gap-2 text-[11px] font-medium text-gray-700">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
          <span>
            <b>Klik di peta</b> atau <b>geser pin 📍</b> untuk titik 100% presisi
          </span>
        </div>

        {/* Tombol Ambil GPS Cepat */}
        {onTriggerGPS && (
          <button
            type="button"
            onClick={onTriggerGPS}
            disabled={isDetectingGPS}
            className="pointer-events-auto bg-white/95 hover:bg-white text-[#0e6f68] hover:text-[#0a524d] font-bold text-xs px-3 py-1.5 rounded-xl shadow-md border border-teal-200 flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            title="Deteksi langsung koordinat sensor GPS perangkat Anda"
          >
            <span className={isDetectingGPS ? "animate-spin" : ""}>🎯</span>
            <span>{isDetectingGPS ? "Mencari GPS..." : "GPS Presisi"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
