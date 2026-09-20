"use client";

import { Shield, AlertTriangle, CheckCircle2, X, Check } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";

interface RiwayatDetailCardsProps {
  score: number;
  statusTitle: string;
  statusDesc: string;
  gapItems: string[];
  metItems: string[];
}

export default function RiwayatDetailCards({
  score,
  statusTitle,
  statusDesc,
  gapItems,
  metItems,
}: RiwayatDetailCardsProps) {
  const animatedScore = useCountUp(score, 1200);

  const radius = 54;
  const circumference = 2 * Math.PI * radius; // ~339.292
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Kontainer Putih Utama (Ringkasan Kesiapsiagaan Lingkungan) */}
      <div className="bg-white rounded-[28px] p-6 sm:p-8 md:p-10 shadow-sm border border-gray-100 space-y-6 sm:space-y-8 animate-emerge stagger-1">
        {/* Label Header Kartu */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-[#0e6f68] flex-shrink-0">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-gray-900">
            Ringkasan Kesiapsiagaan lingkungan
          </span>
        </div>

        {/* Visualisasi Donut Circular Gauge dengan Animasi Hitung (Orange Circle) */}
        <div className="flex flex-col items-center justify-center pt-2 sm:pt-4">
          <div className="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
              {/* Lingkaran Background Abu-abu */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                stroke="#f3f4f6"
                strokeWidth="12"
                fill="transparent"
              />
              {/* Lingkaran Donut Orange Progresif Dinamis */}
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
            <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto leading-relaxed">
              {statusDesc}
            </p>
          </div>
        </div>

        {/* Garis Pembatas Lembut */}
        <hr className="border-gray-100" />

        {/* Dua Kolom Kartu Evaluasi: Perlu Diperbaiki vs Sudah Diketahui */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {/* Kolom 1: Perlu Diperbaiki (Merah Lembut) */}
          <div className="bg-[#fef2f2] rounded-2xl p-5 border border-red-100/80 space-y-3.5">
            <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>Perlu diperbaiki ({gapItems.length})</span>
            </div>
            <ul className="space-y-2.5">
              {gapItems.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-800 font-normal leading-relaxed"
                >
                  <span className="w-4 h-4 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                    <X className="w-3 h-3 stroke-[2.5]" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 2: Sudah Diketahui (Hijau Teal Lembut) */}
          <div className="bg-[#f0fdf9] rounded-2xl p-5 border border-teal-100/80 space-y-3.5">
            <div className="flex items-center gap-2 text-[#0e6f68] font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 text-[#0e6f68] flex-shrink-0" />
              <span>Sudah diketahui ({metItems.length})</span>
            </div>
            <ul className="space-y-2.5">
              {metItems.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-800 font-normal leading-relaxed"
                >
                  <span className="w-4 h-4 rounded-full bg-teal-100 text-[#0e6f68] flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
