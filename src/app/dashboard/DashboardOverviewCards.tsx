"use client";

import { Shield, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useCountUp } from "@/hooks/useCountUp";

interface DashboardOverviewCardsProps {
  hasTakenTest: boolean;
  score: number;
  scoreTitle: string;
  scoreDesc: string;
  facilityGaps: number;
  metCount: number;
}

export default function DashboardOverviewCards({
  hasTakenTest,
  score,
  scoreTitle,
  scoreDesc,
  facilityGaps,
  metCount,
}: DashboardOverviewCardsProps) {
  const animatedScore = useCountUp(hasTakenTest ? score : 0, 1100);
  const animatedGaps = useCountUp(hasTakenTest ? facilityGaps : 0, 900);
  const animatedMet = useCountUp(hasTakenTest ? metCount : 0, 900);

  if (!hasTakenTest) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[300px] animate-emerge stagger-1">
          <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
            <Shield className="w-4 h-4 text-gray-700" />
            <span>Kesiapsiagaan lingkungan</span>
          </div>

          <div className="my-6 flex items-center justify-center">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#dbe7f2"
                  strokeWidth="10"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[11px] font-medium text-gray-500">Skor</span>
                <span className="text-xl sm:text-2xl font-black text-gray-900">--</span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-2xl font-extrabold text-gray-900 tracking-tight">Belum ada</p>
            <p className="text-xs text-gray-500 mt-1">Akan tampil skor kesiapan lingkunganmu</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[300px] animate-emerge stagger-2">
          <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-gray-700" />
            <span>Kesenjangan Fasilitas</span>
          </div>

          <div className="my-10 flex items-center justify-center">
            <div className="w-6 h-1.5 bg-red-500 rounded-full" />
          </div>

          <div>
            <p className="text-2xl font-extrabold text-gray-900 tracking-tight">Belum ada</p>
            <p className="text-xs text-gray-500 mt-1">Akan tampil jumlah kesenjangan fasilitas</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[300px] animate-emerge stagger-3">
          <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4 text-gray-700" />
            <span>Kesenjangan Pemahaman</span>
          </div>

          <div className="my-10 flex items-center justify-center">
            <div className="w-6 h-1.5 bg-[#0e6f68] rounded-full" />
          </div>

          <div>
            <p className="text-2xl font-extrabold text-gray-900 tracking-tight">Belum ada</p>
            <p className="text-xs text-gray-500 mt-1">Akan tampil aspek yang sudah terpenuhi</p>
          </div>
        </div>
      </div>
    );
  }

  // State B: Sudah Mengerjakan Asesmen dengan Animasi Hitung Data & Donut Bergerak
  const circumference = 238.76;
  const strokeDashoffset = circumference * (1 - animatedScore / 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Card 1: Kesiapsiagaan lingkungan (Orange Donut Meter dengan Animasi Hitung) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[300px] animate-emerge stagger-1">
        <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
          <Shield className="w-4 h-4 text-gray-700" />
          <span>Kesiapsiagaan lingkungan</span>
        </div>

        {/* Circular Orange Donut Sesuai Figma */}
        <div className="my-6 flex items-center justify-center">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke="#f3f4f6"
                strokeWidth="11"
              />
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke="#f5840d"
                strokeWidth="11"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-medium text-gray-400">Skor</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#f5840d]">
                {animatedScore}%
              </span>
            </div>
          </div>
        </div>

        <div>
          <p className="text-2xl font-black text-gray-900 tracking-tight">
            {scoreTitle}
          </p>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            {scoreDesc}
          </p>
        </div>
      </div>

      {/* Card 2: Kesenjangan Fasilitas (Animasi Hitung) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[300px] animate-emerge stagger-2">
        <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
          <AlertTriangle className="w-4 h-4 text-gray-700" />
          <span>Kesenjangan Fasilitas</span>
        </div>

        <div className="my-10 flex items-center justify-center">
          <span className="text-6xl sm:text-7xl font-black text-[#dc2626] tracking-tighter">
            {animatedGaps}
          </span>
        </div>

        <div>
          <p className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Perlu Diperbaiki
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Fasilitas keselamatan lingkungan yang belum tersedia
          </p>
        </div>
      </div>

      {/* Card 3: Sarana Terpenuhi (Animasi Hitung) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[300px] animate-emerge stagger-3">
        <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
          <CheckCircle2 className="w-4 h-4 text-gray-700" />
          <span>Sarana Terpenuhi</span>
        </div>

        <div className="my-10 flex items-center justify-center">
          <span className="text-6xl sm:text-7xl font-black text-[#0e6f68] tracking-tighter">
            {animatedMet}
          </span>
        </div>

        <div>
          <p className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Sudah Terpenuhi
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Aspek kesiapan dan sarana aman yang telah aktif
          </p>
        </div>
      </div>
    </div>
  );
}
