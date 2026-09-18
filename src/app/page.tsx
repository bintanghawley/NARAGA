"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  MapPin,
  ClipboardCheck,
  Search,
  SlidersHorizontal,
  Navigation,
  ShieldCheck,
  AlertTriangle,
  Compass,
  ChevronLeft,
  ChevronRight,
  Shield,
  Building2,
  Users,
  CheckCircle2,
  X,
  ExternalLink
} from "lucide-react";

// Data simulasi komunitas untuk visualisasi interaktif "Lihat Seberapa Siap Lingkunganmu"
const communityPresets = [
  {
    id: "rt03",
    name: "RT 03 / RW 05 Sekaran",
    score: 72,
    statusLabel: "Cukup Siap",
    description: "Beberapa aspek sudah terpenuhi, namun masih ada yang perlu diperbaiki.",
    aspekSiap: 8,
    aspekPerluPerbaikan: 3,
    titikEvakuasi: 4,
    prioritasTitle: "Prioritas Utama",
    prioritasDesc: "Bersihkan akses rute evakuasi menuju Lapangan RT 03.",
    actionPlanLink: "/map",
  },
  {
    id: "rt01",
    name: "RT 01 / RW 02 Sekaran",
    score: 48,
    statusLabel: "Perlu Perhatian",
    description: "Kesenjangan pemahaman warga tinggi terkait rute darurat malam hari.",
    aspekSiap: 5,
    aspekPerluPerbaikan: 6,
    titikEvakuasi: 2,
    prioritasTitle: "Sosialisasi Mendesak",
    prioritasDesc: "Pemasangan rambu titik kumpul di pertigaan gang utama RW 02.",
    actionPlanLink: "/assessment",
  },
  {
    id: "rt04",
    name: "RT 04 / RW 01 Karanganyar",
    score: 89,
    statusLabel: "Sangat Tangguh",
    description: "Mayoritas sarana fisik & posko relawan warga telah siap siaga.",
    aspekSiap: 10,
    aspekPerluPerbaikan: 1,
    titikEvakuasi: 6,
    prioritasTitle: "Pemeliharaan Rutin",
    prioritasDesc: "Simulasi gladi evakuasi tahunan bersama posko darurat BPBD.",
    actionPlanLink: "/map",
  },
];

// Testimonial Data
const testimonials = [
  {
    name: "Evan Mahardika",
    role: "Warga RT 03 Sekaran",
    avatar: "/images/avatar-evan.png",
    quote: "Sangat bagus untuk warga yang kebingungan, menjadi terasa lebih aman sekarang",
  },
  {
    name: "Raffi Setiawan Putra",
    role: "Pengurus Komunitas RW 05",
    avatar: "/images/avatar-raffi.png",
    quote: "Sangat bagus untuk warga yang kebingungan, menjadi terasa lebih aman sekarang",
  },
  {
    name: "Firman Nugraha",
    role: "Koordinator Tim Relawan",
    avatar: "/images/avatar-firman.png",
    quote: "Sangat bagus untuk warga yang kebingungan, menjadi terasa lebih aman sekarang",
  },
];

export default function HomePage() {
  // State interaktif
  const [selectedCommunity, setSelectedCommunity] = useState(communityPresets[0]);
  const [activeStep, setActiveStep] = useState(1);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [showDemoModal, setShowDemoModal] = useState(false);

  // Navigasi testimonial carousel
  const nextTestimonial = () => {
    setCurrentTestimonialIndex((prev) => (prev + 1) % testimonials.length);
  };
  const prevTestimonial = () => {
    setCurrentTestimonialIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Step information modal / expanded highlight
  const stepDetails = [
    {
      num: "01",
      title: "Assessment Mandiri",
      desc: "Evaluasi infrastruktur dan kesiapan warga.",
      detail: "10 Butir pertanyaan objektif dengan opsi Ya, Tidak, dan Tidak Tahu untuk mengukur kesiapan tanpa asumsi.",
      link: "/assessment",
      actionText: "Coba Formulir Asesmen",
    },
    {
      num: "02",
      title: "Temukan Gap",
      desc: "Analisis titik lemah yang perlu perhatian segera.",
      detail: "Membedakan Facility Gap (kekurangan sarana fisik) dan Awareness Gap (kurangnya sosialisasi kepada warga).",
      link: "/assessment",
      actionText: "Pelajari Readiness Gap",
    },
    {
      num: "03",
      title: "Action Plan",
      desc: "Rencana tindak lanjut terstruktur untuk perbaikan.",
      detail: "Sistem meng-generate rekomendasi langkah mitigasi konkret dengan prioritas High, Medium, dan Low.",
      link: "/ai",
      actionText: "Konsultasikan dengan AI",
    },
    {
      num: "04",
      title: "Peta Evakuasi",
      desc: "Petakan jalur aman dan titik kumpul strategis.",
      detail: "Visualisasi titik kumpul aman (Assembly Point), posko, dan polyline rute evakuasi berbasis Leaflet & OpenStreetMap.",
      link: "/map",
      actionText: "Buka Peta Interaktif",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-teal-100 selection:text-teal-900">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#e8f6f4] via-[#f3faf8] to-white pt-12 sm:pt-20 pb-20 sm:pb-32">
        {/* Background Decorative Glow */}
        <div className="absolute -top-10 right-0 w-[520px] h-[520px] bg-teal-200/30 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-[440px] lg:min-h-[500px]">
            {/* Kolom Kiri: Copywriting & CTA */}
            <div className="lg:col-span-6 xl:col-span-6 space-y-6 sm:space-y-8 z-10 text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black text-[#111827] tracking-tight leading-[1.12]">
                Seberapa siap<br />
                lingkunganmu<br />
                menghadapi<br />
                bencana?
              </h1>

              <p className="text-sm sm:text-base text-gray-600 max-w-lg leading-relaxed font-normal">
                Kenali kesiapan lingkungan, temukan yang masih kurang, dan ketahui langkah yang perlu dilakukan. Sistem yang terstruktur untuk keamanan bersama.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/assessment"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#0e6f68] hover:bg-[#0a524d] text-white font-semibold text-sm shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  Mulai Assessment <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/map"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-teal-50/70 border border-gray-300 hover:border-[#0e6f68] text-gray-700 hover:text-[#0e6f68] font-semibold text-sm shadow-sm transition"
                >
                  <Compass className="w-4 h-4 text-[#0e6f68]" />
                  Lihat Peta Evakuasi
                </Link>
              </div>
            </div>

            {/* Spacer Kolom Kanan untuk Grid Desktop */}
            <div className="lg:col-span-6 hidden lg:block" />
          </div>
        </div>

        {/* Kolom Kanan: Visual Arch Hero Image - Menempel di Kanan & Lebih Panjang (Sesuai Figma) */}
        <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-[48vw] max-w-[800px] min-w-[520px] h-[460px] xl:h-[520px] rounded-tl-[360px] xl:rounded-tl-[420px] rounded-bl-[220px] xl:rounded-bl-[260px] rounded-tr-none rounded-br-none overflow-hidden shadow-2xl shadow-teal-950/10 z-0">
          <img
            src="/images/hero-disaster-wide.jpg"
            alt="Dampak Bencana dan Pemulihan Pemukiman"
            className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-teal-950/20 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Versi Mobile / Tablet (< lg) */}
        <div className="lg:hidden px-4 sm:px-6 mt-8 flex justify-center">
          <div className="relative w-full max-w-lg aspect-[16/10] rounded-tl-[160px] rounded-bl-[100px] overflow-hidden shadow-xl">
            <img
              src="/images/hero-disaster-wide.jpg"
              alt="Dampak Bencana dan Pemulihan Pemukiman"
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>
      </section>

      {/* 2. STATISTIK FLOATING METRIC BAR */}
      <section className="relative -mt-10 sm:-mt-14 max-w-5xl mx-auto px-4 sm:px-6 z-20">
        <div className="relative">
          {/* Dark Teal Half Circle poking from the right (sesuai gambar) */}
          <div className="absolute -right-8 -top-8 w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-[#0e6f68] -z-10 hidden md:block" />

          {/* Main Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-teal-950/5 border border-gray-100/90 py-8 px-6 sm:px-12 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 text-center">
            {/* Metric 1 */}
            <div className="md:border-r border-gray-200/80 px-4 py-2 hover:bg-teal-50/30 rounded-2xl transition">
              <p className="text-3xl sm:text-4xl lg:text-[40px] font-black text-gray-900 tracking-tight">
                1.2K+
              </p>
              <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1">
                Assessment Selesai
              </p>
            </div>

            {/* Metric 2 */}
            <div className="md:border-r border-gray-200/80 px-4 py-2 hover:bg-teal-50/30 rounded-2xl transition">
              <p className="text-3xl sm:text-4xl lg:text-[40px] font-black text-gray-900 tracking-tight">
                320+
              </p>
              <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1">
                Titik Kumpul Terdata
              </p>
            </div>

            {/* Metric 3 */}
            <div className="px-4 py-2 hover:bg-teal-50/30 rounded-2xl transition">
              <p className="text-3xl sm:text-4xl lg:text-[40px] font-black text-gray-900 tracking-tight">
                120+
              </p>
              <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1">
                Jalur Evakuasi Terpetakan
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ALUR KERJA SISTEMATIS: "Kenali. Perbaiki. Siapkan." */}
      <section className="py-24 sm:py-32 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-16 sm:mb-20">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0e6f68] tracking-tight">
            Kenali. Perbaiki. Siapkan.
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed font-normal">
            Langkah sistematis untuk membangun ketangguhan komunitas sebelum kondisi darurat terjadi.
          </p>
        </div>

        {/* 4 Connected Steps Grid */}
        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6 relative z-10">
            {stepDetails.map((step, idx) => {
              const isActive = activeStep === idx + 1;
              return (
                <div
                  key={step.num}
                  onClick={() => setActiveStep(idx + 1)}
                  className={`cursor-pointer group flex flex-col items-center text-center p-4 rounded-2xl transition-all ${
                    isActive ? "bg-teal-50/60 scale-105 shadow-sm" : "hover:bg-gray-50/80"
                  }`}
                >
                  {/* Step Icon with Number Badge */}
                  <div className="relative mb-5">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-110 ${
                        isActive ? "bg-[#0b5c56] ring-4 ring-teal-200" : "bg-[#0e6f68]"
                      }`}
                    >
                      {idx === 0 && <ClipboardCheck className="w-7 h-7" />}
                      {idx === 1 && <Search className="w-7 h-7" />}
                      {idx === 2 && <SlidersHorizontal className="w-7 h-7" />}
                      {idx === 3 && <Navigation className="w-7 h-7" />}
                    </div>
                    {/* Small number badge on top right */}
                    <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#111827] text-white text-[11px] font-bold flex items-center justify-center shadow-sm">
                      {step.num}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-gray-900 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-2 max-w-[200px] leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Horizontal Connecting Line between steps (desktop) */}
          <div className="hidden lg:block absolute top-[44px] left-[15%] right-[15%] h-[2px] bg-teal-200/80 -z-0" />
        </div>

        {/* Interactive Step Detail Card */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-teal-50/70 to-emerald-50/60 border border-teal-100 max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold">
            Tahap {stepDetails[activeStep - 1].num} dari 04: {stepDetails[activeStep - 1].title}
          </div>
          <p className="text-sm text-gray-700 max-w-xl mx-auto leading-relaxed">
            {stepDetails[activeStep - 1].detail}
          </p>
          <div className="pt-2">
            <Link
              href={stepDetails[activeStep - 1].link}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#0e6f68] hover:text-[#094c47] bg-white px-4 py-2 rounded-xl shadow-sm border border-teal-200 hover:border-teal-400 transition"
            >
              {stepDetails[activeStep - 1].actionText} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. LIHAT SEBERAPA SIAP LINGKUNGANMU (Persis sesuai screenshot) */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-b from-[#eef7fc]/60 via-[#f3f9f8]/40 to-white">
        {/* Soft Blue/Cyan Glow on Left Margin */}
        <div className="absolute left-0 top-0 bottom-0 w-48 bg-gradient-to-r from-[#d9eff9]/50 via-[#e0f3f8]/20 to-transparent pointer-events-none -z-10" />

        {/* Big Dark Teal Circular Ring Accent on Left Edge (Persis screenshot) */}
        <div className="absolute -left-36 top-10 w-72 h-72 rounded-full border-[26px] border-[#0e6f68] pointer-events-none hidden lg:block -z-0" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center space-y-2 max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold text-[#0e6f68] tracking-tight">
              Lihat Seberapa Siap Lingkunganmu
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-normal">
              Assessment membantu menemukan apa yang sudah siap dan apa yang masih perlu diperbaiki.
            </p>
          </div>

          {/* 3 Columns Cards Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center max-w-5xl mx-auto">
            {/* Kolom Kiri: 2 Kartu Putih (span 4) */}
            <div className="md:col-span-4 space-y-6">
              {/* Card 1: Aspek Sudah Siap */}
              <div className="bg-white rounded-[22px] p-6 shadow-md shadow-slate-200/50 border border-slate-100/80 hover:shadow-lg transition">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-bold text-[#0e6f68]">
                    8
                  </span>
                </div>
                <div className="mt-4 text-left">
                  <h4 className="text-sm font-bold text-gray-900">Aspek Sudah Siap</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Titik kumpul tersedia</p>
                </div>
              </div>

              {/* Card 2: Aspek Perlu Diperbaiki */}
              <div className="bg-white rounded-[22px] p-6 shadow-md shadow-slate-200/50 border border-slate-100/80 hover:shadow-lg transition">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-bold text-amber-500">
                    3
                  </span>
                </div>
                <div className="mt-4 text-left">
                  <h4 className="text-sm font-bold text-gray-900">Aspek Perlu Diperbaiki</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Jalur evakuasi perlu disosialisasikan</p>
                </div>
              </div>
            </div>

            {/* Kolom Tengah: Featured Card Skor 72% Cukup Siap (span 4) */}
            <div className="md:col-span-4">
              <div className="bg-white rounded-[28px] p-7 shadow-xl shadow-slate-200/60 border border-slate-100 relative">
                {/* Header Row */}
                <div className="flex items-center justify-between pb-3">
                  <div className="flex items-center gap-1.5 text-teal-800 text-xs font-semibold">
                    <Shield className="w-4 h-4 text-[#0e6f68]" />
                    <span>Kesiapsiagaan lingkungan</span>
                  </div>
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                    Preview
                  </span>
                </div>

                {/* Circular Progress Gauge */}
                <div className="relative my-6 flex items-center justify-center">
                  <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 120 120">
                    {/* Background Ring */}
                    <circle
                      cx="60"
                      cy="60"
                      r="46"
                      stroke="#e2e8f0"
                      strokeWidth="11"
                      fill="transparent"
                    />
                    {/* Teal Progress Ring (72%) */}
                    <circle
                      cx="60"
                      cy="60"
                      r="46"
                      stroke="#0e6f68"
                      strokeWidth="11"
                      strokeDasharray={2 * Math.PI * 46}
                      strokeDashoffset={2 * Math.PI * 46 * (1 - 0.72)}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>

                  {/* Text Inside Gauge */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[11px] text-gray-500 font-medium">
                      Skor
                    </span>
                    <span className="text-3xl font-extrabold text-[#0e6f68] tracking-tight">
                      72%
                    </span>
                  </div>
                </div>

                {/* Left-Aligned Status & Description (Sesuai Screenshot) */}
                <div className="text-left pt-2">
                  <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
                    Cukup Siap
                  </h3>
                  <p className="text-[11px] text-gray-500 leading-relaxed mt-1.5 max-w-[240px]">
                    Beberapa aspek sudah terpenuhi, namun masih ada yang perlu diperbaiki.
                  </p>
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Titik Evakuasi & Prioritas Utama (span 4) */}
            <div className="md:col-span-4 space-y-6">
              {/* Card 1: Titik Evakuasi Terdata */}
              <div className="bg-white rounded-[22px] p-6 shadow-md shadow-slate-200/50 border border-slate-100/80 hover:shadow-lg transition">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-bold text-[#0e6f68]">
                    4
                  </span>
                </div>
                <div className="mt-4 text-left">
                  <h4 className="text-sm font-bold text-gray-900">Titik Evakuasi Terdata</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Titik kumpul & jalur evakuasi</p>
                </div>
              </div>

              {/* Card 2: Dark Teal Prioritas Utama */}
              <div className="bg-[#0e6f68] text-white rounded-[22px] p-6 shadow-lg shadow-teal-950/15 text-left flex flex-col justify-between min-h-[140px]">
                <div>
                  <div className="flex items-center gap-2 text-white text-sm font-bold">
                    <Compass className="w-4 h-4 text-teal-200" />
                    <span>Prioritas Utama</span>
                  </div>
                  <p className="text-xs text-teal-50/95 mt-2.5 leading-relaxed">
                    Sosialisasikan jalur evakuasi kepada warga.
                  </p>
                </div>

                <div className="pt-4 flex justify-end">
                  <Link
                    href="/map"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#84f0dc] hover:bg-[#68e2cc] text-[#06423e] text-[10px] font-bold transition shadow-sm"
                  >
                    Lihat Action Plan &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. APA KATA MEREKA? (Persis sesuai screenshot) */}
      <section className="relative py-20 sm:py-24 bg-white overflow-hidden">
        {/* Decorative Wave Lines - Nempel di kanan dan proporsional */}
        <div className="absolute right-0 top-16 sm:top-20 md:top-24 lg:top-20 w-60 sm:w-72 md:w-[320px] lg:w-[380px] xl:w-[420px] h-14 sm:h-16 md:h-20 text-[#0e6f68] pointer-events-none hidden md:block z-0">
          <svg viewBox="0 0 260 55" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" preserveAspectRatio="none">
            {/* Wave 1 */}
            <path
              d="M 5 12 C 30 -2, 55 26, 80 12 C 105 -2, 130 26, 155 12 C 180 -2, 205 26, 230 12 C 245 4, 255 8, 260 12"
              stroke="currentColor"
              strokeWidth="5.5"
              strokeLinecap="round"
            />
            {/* Wave 2 */}
            <path
              d="M 5 26 C 30 12, 55 40, 80 26 C 105 12, 130 40, 155 26 C 180 12, 205 40, 230 26 C 245 18, 255 22, 260 26"
              stroke="currentColor"
              strokeWidth="5.5"
              strokeLinecap="round"
            />
            {/* Wave 3 */}
            <path
              d="M 5 40 C 30 26, 55 54, 80 40 C 105 26, 130 54, 155 40 C 180 26, 205 54, 230 40 C 245 32, 255 36, 260 40"
              stroke="currentColor"
              strokeWidth="5.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center space-y-2 mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-[32px] font-bold text-[#0e6f68] tracking-tight">
              Apa kata mereka?
            </h2>
          </div>

          {/* 3 Testimonials Cards Grid */}
          <div className="relative max-w-5xl mx-auto">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7 relative z-10">
            {testimonials.map((item, idx) => {
              const isActive = currentTestimonialIndex === idx;
              return (
                <div
                  key={item.name}
                  onClick={() => setCurrentTestimonialIndex(idx)}
                  className={`bg-white rounded-[26px] p-7 sm:p-8 text-left flex flex-col justify-between min-h-[220px] cursor-pointer transition-all duration-300 ${
                    isActive
                      ? "border-2 border-[#0e6f68] shadow-[0_16px_36px_rgba(14,111,104,0.12)] -translate-y-1"
                      : "border-2 border-transparent shadow-[0_12px_36px_rgba(0,0,0,0.06)] hover:border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className={`w-11 h-11 rounded-full object-cover shadow-sm transition-all duration-300 ${
                        isActive ? "ring-2 ring-[#0e6f68]" : "ring-1 ring-slate-100"
                      }`}
                    />
                    <h4 className="text-[15px] font-bold text-gray-900 tracking-tight">{item.name}</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mt-5">
                    {item.quote}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Carousel Navigation Track Below (Persis Screenshot) */}
        <div className="flex items-center justify-center gap-4 mt-10">
          {/* Previous Button */}
          <button
            onClick={prevTestimonial}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-200 ${
              currentTestimonialIndex === 0
                ? "bg-[#d1d5db]/80 text-[#4b5563] hover:bg-slate-300"
                : "bg-[#0e6f68] hover:bg-[#0a524d] text-white shadow-sm"
            }`}
            aria-label="Previous Testimonial"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Progress Bar Indicator Track */}
          <div className="relative w-44 sm:w-56 h-[5px] bg-[#e5e7eb] rounded-full overflow-hidden">
            <div
              className="absolute top-0 bottom-0 bg-[#0e6f68] transition-all duration-300 ease-out rounded-full"
              style={{
                left: `${(currentTestimonialIndex / testimonials.length) * 100}%`,
                width: `${100 / testimonials.length}%`,
              }}
            />
          </div>

          {/* Next Button */}
          <button
            onClick={nextTestimonial}
            className="w-7 h-7 rounded-full bg-[#0e6f68] hover:bg-[#0a524d] text-white flex items-center justify-center shadow-sm transition"
            aria-label="Next Testimonial"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        </div>
      </section>



      {/* 6. FLOATING QUICK DEMO BADGE (Untuk Kemudahan Juri & Evaluator RBAC) */}
      <div className="fixed bottom-6 left-6 z-40">
        <button
          onClick={() => setShowDemoModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#111827] hover:bg-[#0e6f68] text-white text-xs font-bold shadow-2xl border border-gray-700 hover:border-teal-400 transition-all hover:scale-105"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>🧪 Akun Uji Coba Demo (RBAC)</span>
        </button>
      </div>

      {/* Modal Quick Demo Accounts */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-6 relative">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#0e6f68]" />
                <h3 className="text-base font-bold text-gray-900">Akun Uji Coba Tim & Juri (Seeded)</h3>
              </div>
              <button
                onClick={() => setShowDemoModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              Pilih salah satu peran di bawah ini untuk langsung mengisi form login secara instan:
            </p>

            <div className="space-y-3">
              {/* Admin */}
              <Link
                href="/login?email=admin@naraga.id"
                onClick={() => setShowDemoModal(false)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-purple-50/70 hover:bg-purple-100/70 border border-purple-200 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Administrator (Panel Approval)</p>
                    <p className="text-[11px] text-gray-500 font-mono">admin@naraga.id &bull; admin123</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-purple-700 group-hover:translate-x-1 transition-transform">
                  Masuk &rarr;
                </span>
              </Link>

              {/* Pengurus */}
              <Link
                href="/login?email=pengurus@naraga.id"
                onClick={() => setShowDemoModal(false)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Pengurus RT 03 (Kelola Peta & Rute)</p>
                    <p className="text-[11px] text-gray-500 font-mono">pengurus@naraga.id &bull; pengurus123</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-700 group-hover:translate-x-1 transition-transform">
                  Masuk &rarr;
                </span>
              </Link>

              {/* Warga */}
              <Link
                href="/login?email=warga@naraga.id"
                onClick={() => setShowDemoModal(false)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#0e6f68] text-white flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Warga (Asesmen & Tanya AI)</p>
                    <p className="text-[11px] text-gray-500 font-mono">warga@naraga.id &bull; warga123</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700 group-hover:translate-x-1 transition-transform">
                  Masuk &rarr;
                </span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
