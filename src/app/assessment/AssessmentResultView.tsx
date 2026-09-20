"use client";

import Link from "next/link";
import {
  Calendar,
  Clock,
  ChevronRight,
  RotateCcw,
  Shield,
  AlertTriangle,
  CheckCircle2,
  X,
  Check,
  Map as MapIcon,
  ArrowRight,
} from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";

interface CompletedResultData {
  score: number;
  displayDate: string;
  displayLocation: string;
  statusTitle: string;
  statusDesc: string;
  gapItems: string[];
  metItems: string[];
}

interface AssessmentResultViewProps {
  data: CompletedResultData;
  onRetake: () => void;
}

export default function AssessmentResultView({
  data,
  onRetake,
}: AssessmentResultViewProps) {
  const {
    score,
    displayDate,
    displayLocation,
    statusTitle,
    statusDesc,
    gapItems,
    metItems,
  } = data;

  const animatedScore = useCountUp(score, 1200);

  // Perhitungan Donut Circular SVG Gauge Sesuai Riwayat Figma
  const radius = 54;
  const circumference = 2 * Math.PI * radius; // ~339.292
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="min-h-screen bg-[#ebf4fa] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        {/* Header Bar: Riwayat + Tanggal + Lokasi + Tombol Kerjakan Lagi & Ke Riwayat */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-emerge">
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Riwayat
            </h1>
            <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-gray-900 ml-1 sm:ml-2">
              <Calendar className="w-4 h-4 text-gray-600 flex-shrink-0" />
              <span>{displayDate}</span>
            </div>
            <span className="text-gray-400 font-bold">•</span>
            <span className="text-sm sm:text-base font-bold text-gray-900">
              {displayLocation}
            </span>
          </div>

          {/* Tombol Kerjakan Lagi & Tombol Ke Riwayat */}
          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <Link
              href="/settings/riwayat"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 hover:text-[#0e6f68] bg-white hover:bg-teal-50 border border-gray-200 rounded-xl transition cursor-pointer shadow-2xs group"
              title="Buka daftar riwayat lengkap"
            >
              <Clock className="w-4 h-4 text-gray-500 group-hover:text-[#0e6f68] transition" />
              <span>Lihat Riwayat</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#0e6f68] transition" />
            </Link>

            <button
              onClick={onRetake}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#0e6f68] hover:bg-[#0a524d] rounded-xl transition cursor-pointer shadow-xs"
              title="Kerjakan asesmen kesiapsiagaan lagi"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Kerjakan Lagi</span>
            </button>
          </div>
        </div>

        {/* Kontainer Putih Utama (Ringkasan Kesiapsiagaan Lingkungan Sesuai Riwayat) */}
        <div className="bg-white rounded-[28px] p-6 sm:p-8 md:p-10 shadow-sm border border-gray-100 space-y-6 sm:space-y-8 animate-emerge stagger-1">
          {/* Label Header Kartu */}
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0e6f68] flex-shrink-0">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-gray-900">
                Ringkasan Kesiapsiagaan lingkungan
              </span>
            </div>

            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-[#0e6f68] border border-teal-100">
              Selesai Dikerjakan
            </span>
          </div>

          {/* Visualisasi Donut Circular Gauge dengan Animasi Hitung Dinamis */}
          <div className="flex flex-col items-center justify-center pt-2 sm:pt-4">
            <div className="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 128 128"
              >
                {/* Lingkaran Background Abu-abu */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  stroke="#f3f4f6"
                  strokeWidth="12"
                  fill="transparent"
                />
                {/* Lingkaran Donut Orange Progresif */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  stroke="#f97316"
                  strokeWidth="12"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-300 ease-out"
                />
              </svg>

              {/* Konten Teks di Tengah Donut Chart dengan Animasi Count */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-semibold text-gray-500">Skor</span>
                <span className="text-3xl sm:text-[34px] font-extrabold text-gray-900 tracking-tight leading-none">
                  {animatedScore}%
                </span>
              </div>
            </div>

            {/* Judul & Deskripsi Kesiapsiagaan */}
            <div className="text-center mt-4 space-y-1">
              <h2 className="text-2xl sm:text-[26px] font-bold text-gray-900">
                {statusTitle}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                {statusDesc}
              </p>
            </div>
          </div>

          {/* Garis Pembatas Halus */}
          <hr className="border-gray-100" />

          {/* Grid Dua Kolom: Perlu Diperbaiki vs Sudah Diketahui */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 pt-2">
            {/* Kartu Kiri: Perlu Diperbaiki (Merah Lembut) */}
            <div className="rounded-2xl border border-gray-200/90 bg-[#fbfdfc] overflow-hidden shadow-2xs animate-emerge stagger-2">
              <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2.5 bg-gray-50/50">
                <AlertTriangle className="w-4 h-4 text-gray-700 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-gray-900">
                  Perlu Diperbaiki ({gapItems.length})
                </span>
              </div>

              <div className="p-5 space-y-4">
                {gapItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0 stroke-[2.5]" />
                    <span className="text-xs sm:text-sm font-semibold text-gray-900 leading-snug">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Kartu Kanan: Sudah Diketahui (Hijau Teal) */}
            <div className="rounded-2xl border border-gray-200/90 bg-[#fbfdfc] overflow-hidden shadow-2xs animate-emerge stagger-3">
              <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2.5 bg-gray-50/50">
                <CheckCircle2 className="w-4 h-4 text-gray-700 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-gray-900">
                  Sudah Diketahui ({metItems.length})
                </span>
              </div>

              <div className="p-5 space-y-4">
                {metItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-[#0e6f68] mt-0.5 flex-shrink-0 stroke-[2.5]" />
                    <span className="text-xs sm:text-sm font-semibold text-gray-900 leading-snug">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Row: Tombol Pintas ke Fitur Lain */}
          <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={onRetake}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0e6f68] hover:bg-[#0a524d] text-white font-semibold text-xs sm:text-sm shadow-xs transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Kerjakan Lagi</span>
            </button>

            <Link
              href="/settings/riwayat"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs sm:text-sm shadow-xs transition"
            >
              <Clock className="w-4 h-4 text-gray-600" />
              <span>Buka Riwayat Lengkap</span>
            </Link>

            <Link
              href="/map"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs sm:text-sm shadow-xs transition"
            >
              <MapIcon className="w-4 h-4 text-[#0e6f68]" />
              <span>Lihat Peta Evakuasi</span>
            </Link>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs sm:text-sm shadow-xs transition"
            >
              <span>Dashboard Utama</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
