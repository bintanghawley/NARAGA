"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ArrowRight,
  MapPin,
  ClipboardCheck,
  Search,
  SlidersHorizontal,
  Navigation,
  ShieldCheck,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Shield,
  ExternalLink,
  Compass
} from "lucide-react";

// Hook deteksi elemen masuk ke viewport layar saat scroll
function useInView(options?: IntersectionObserverInit) {
  const [inView, setInView] = useState(false);
  const ref = useRef<any>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px", ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);

  return [ref, inView] as const;
}

// Hook animasi hitung angka naik secara halus (Ease-Out Cubic)
function useCountUp(target: number, duration: number = 1800, start: boolean = true) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    let startTimestamp: number | null = null;
    let frameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * target));

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [target, duration, start]);

  return count;
}

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
    quote: "Sangat membantu warga yang awalnya bingung saat darurat. Sekarang kami tahu jelas titik kumpul terdekat dan rute evakuasi yang aman.",
  },
  {
    name: "Raffi Setiawan Putra",
    role: "Pengurus Komunitas RW 05",
    avatar: "/images/avatar-raffi.png",
    quote: "Memudahkan pengurus mengukur kesiapsiagaan lingkungan secara objektif, mulai dari gap sarana fisik hingga rencana aksi nyata.",
  },
  {
    name: "Firman Nugraha",
    role: "Koordinator Tim Relawan",
    avatar: "/images/avatar-firman.png",
    quote: "Koordinasi evakuasi dan pendataan titik kumpul jadi jauh lebih cepat serta terarah saat simulasi tanggap darurat warga.",
  },
];

export default function HomePage() {
  const { data: session } = useSession();
  const isAuthUser = !!session;

  // State terbit / mount
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Animasi Typing pada kata kunci hero
  const wordsToType = ["bencana?", "banjir?", "gempa bumi?", "situasi darurat?"];
  const [wordIdx, setWordIdx] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = wordsToType[wordIdx];
    let timer: NodeJS.Timeout;

    if (!isDeleting) {
      if (currentText.length < currentWord.length) {
        timer = setTimeout(() => {
          setCurrentText(currentWord.slice(0, currentText.length + 1));
        }, 110);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2200);
      }
    } else {
      if (currentText.length > 0) {
        timer = setTimeout(() => {
          setCurrentText(currentWord.slice(0, currentText.length - 1));
        }, 60);
      } else {
        setIsDeleting(false);
        setWordIdx((prev) => (prev + 1) % wordsToType.length);
      }
    }

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, wordIdx]);

  // Scroll In-View triggers (Animasi Terbit & Muncul Satu-Satu saat scroll)
  const [statsRef, statsInView] = useInView();
  const [prosesRef, prosesInView] = useInView();
  const [hasilRef, hasilInView] = useInView();
  const [testimoniRef, testimoniInView] = useInView();

  // Animasi Count Angka (Hanya mulai saat section di-scroll masuk ke layar)
  const countAssessment = useCountUp(1200, 1800, statsInView);
  const countTitikKumpul = useCountUp(320, 1800, statsInView);
  const countJalur = useCountUp(120, 1800, statsInView);

  const countAspekSiap = useCountUp(8, 1400, hasilInView);
  const countAspekPerbaikan = useCountUp(3, 1400, hasilInView);
  const countScoreGauge = useCountUp(72, 1600, hasilInView);
  const countTitikHasil = useCountUp(4, 1400, hasilInView);

  // State interaktif
  const [selectedCommunity, setSelectedCommunity] = useState(communityPresets[0]);
  const [activeStep, setActiveStep] = useState(1);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);

  // Navigasi testimonial carousel
  const nextTestimonial = () => {
    setCurrentTestimonialIndex((prev) => (prev + 1) % testimonials.length);
  };
  const prevTestimonial = () => {
    setCurrentTestimonialIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // 4 Langkah sistematis
  const stepDetails = [
    {
      num: "01",
      title: "Assessment Mandiri",
      desc: "Evaluasi infrastruktur dan kesiapan warga.",
      detail: "10 Butir pertanyaan objektif dengan opsi Ya, Tidak, dan Tidak Tahu untuk mengukur kesiapan tanpa asumsi.",
    },
    {
      num: "02",
      title: "Temukan Gap",
      desc: "Analisis titik lemah yang perlu perhatian segera.",
      detail: "Membedakan Facility Gap (kekurangan sarana fisik) dan Awareness Gap (kurangnya sosialisasi kepada warga).",
    },
    {
      num: "03",
      title: "Action Plan",
      desc: "Rencana tindak lanjut terstruktur untuk perbaikan.",
      detail: "Sistem meng-generate rekomendasi langkah mitigasi konkret dengan prioritas High, Medium, dan Low.",
    },
    {
      num: "04",
      title: "Peta Evakuasi",
      desc: "Petakan jalur aman dan titik kumpul strategis.",
      detail: "Visualisasi titik kumpul aman (Assembly Point), posko, dan polyline rute evakuasi berbasis Leaflet & OpenStreetMap.",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-teal-100 selection:text-teal-900 overflow-x-hidden">
      {/* 1. HERO SECTION (Animasi Terbit + Typing + Hover Tombol) */}
      <section id="hero" className="relative overflow-hidden bg-gradient-to-b from-[#e8f6f4] via-[#f3faf8] to-white pt-12 sm:pt-20 pb-20 sm:pb-32 scroll-mt-20">
        {/* Background Decorative Glow */}
        <div className="absolute -top-10 right-0 w-[520px] h-[520px] bg-teal-200/30 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-glow" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-[440px] lg:min-h-[500px]">
            {/* Kolom Kiri: Copywriting & CTA (Animasi Terbit) */}
            <div
              className={`lg:col-span-6 xl:col-span-6 space-y-6 sm:space-y-8 z-10 text-left transition-all duration-1000 ease-out ${
                isMounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black text-[#111827] tracking-tight leading-[1.12]">
                Seberapa siap<br />
                lingkunganmu<br />
                menghadapi<br />
                <span className="text-[#0e6f68] inline-flex items-center min-h-[1.12em]">
                  {currentText || "\u00A0"}
                  <span className="inline-block w-[3px] h-[0.8em] bg-[#0e6f68] ml-1.5 align-middle animate-blink" />
                </span>
              </h1>

              <p className="text-sm sm:text-base text-gray-600 max-w-lg leading-relaxed font-normal">
                Kenali kesiapan lingkungan, temukan yang masih kurang, dan ketahui langkah yang perlu dilakukan. Sistem yang terstruktur untuk keamanan bersama.
              </p>

              {/* Action Buttons (Animasi Hover di Tombol) */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href={isAuthUser ? "/assessment" : "/login?callbackUrl=/assessment"}
                  className="group relative inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#0e6f68] hover:bg-[#0a524d] text-white font-semibold text-sm shadow-md hover:shadow-xl hover:shadow-teal-900/25 transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.03] active:scale-95 overflow-hidden"
                >
                  {/* Subtle shimmer streak on hover */}
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                  <span className="relative z-10">Mulai Assessment</span>
                  <ArrowRight className="w-4 h-4 relative z-10 transition-transform duration-300 group-hover:translate-x-1.5" />
                </Link>
              </div>
            </div>

            {/* Spacer Kolom Kanan untuk Grid Desktop */}
            <div className="lg:col-span-6 hidden lg:block" />
          </div>
        </div>

        {/* Kolom Kanan: Visual Arch Hero Image (Animasi Terbit) */}
        <div
          className={`hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-[48vw] max-w-[800px] min-w-[520px] h-[460px] xl:h-[500px] rounded-l-full rounded-r-none overflow-hidden shadow-2xl shadow-teal-950/10 z-0 transition-all duration-1000 delay-200 ease-out ${
            isMounted ? "opacity-100 translate-x-0 scale-100" : "opacity-0 translate-x-12 scale-95"
          }`}
        >
          <img
            src="/images/hero-disaster-wide.jpg"
            alt="Dampak Bencana dan Pemulihan Pemukiman"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-teal-950/20 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Versi Mobile / Tablet (< lg) */}
        <div
          className={`lg:hidden px-4 sm:px-6 mt-8 flex justify-center transition-all duration-1000 delay-200 ${
            isMounted ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          <div className="relative w-full max-w-lg aspect-[16/10] rounded-l-full rounded-r-2xl overflow-hidden shadow-xl">
            <img
              src="/images/hero-disaster-wide.jpg"
              alt="Dampak Bencana dan Pemulihan Pemukiman"
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>
      </section>

      {/* 2. STATISTIK FLOATING METRIC BAR (Animasi Terbit + Animasi Count Saat Scroll) */}
      <section ref={statsRef} className="relative -mt-10 sm:-mt-14 max-w-5xl mx-auto px-4 sm:px-6 z-20">
        <div
          className={`relative transition-all duration-1000 ease-out transform ${
            statsInView ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-12 scale-95"
          }`}
        >
          {/* Dark Teal Half Circle poking from the right */}
          <div className="absolute -right-8 -top-8 w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-[#0e6f68] -z-10 hidden md:block animate-float-soft" />

          {/* Main Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-teal-950/5 border border-gray-100/90 py-8 px-6 sm:px-12 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 text-center">
            {/* Metric 1 */}
            <div
              style={{ transitionDelay: statsInView ? "100ms" : "0ms" }}
              className={`md:border-r border-gray-200/80 px-4 py-2 hover:bg-teal-50/40 rounded-2xl transition-all duration-500 transform hover:scale-105 group cursor-default ${
                statsInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <p className="text-3xl sm:text-4xl lg:text-[40px] font-black text-gray-900 tracking-tight transition-colors group-hover:text-[#0e6f68]">
                {countAssessment >= 1000
                  ? (countAssessment / 1000).toFixed(1) + "K+"
                  : countAssessment + "+"}
              </p>
              <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1">
                Assessment Selesai
              </p>
            </div>

            {/* Metric 2 */}
            <div
              style={{ transitionDelay: statsInView ? "250ms" : "0ms" }}
              className={`md:border-r border-gray-200/80 px-4 py-2 hover:bg-teal-50/40 rounded-2xl transition-all duration-500 transform hover:scale-105 group cursor-default ${
                statsInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <p className="text-3xl sm:text-4xl lg:text-[40px] font-black text-gray-900 tracking-tight transition-colors group-hover:text-[#0e6f68]">
                {countTitikKumpul}+
              </p>
              <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1">
                Titik Kumpul Terdata
              </p>
            </div>

            {/* Metric 3 */}
            <div
              style={{ transitionDelay: statsInView ? "400ms" : "0ms" }}
              className={`px-4 py-2 hover:bg-teal-50/40 rounded-2xl transition-all duration-500 transform hover:scale-105 group cursor-default ${
                statsInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <p className="text-3xl sm:text-4xl lg:text-[40px] font-black text-gray-900 tracking-tight transition-colors group-hover:text-[#0e6f68]">
                {countJalur}+
              </p>
              <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1">
                Jalur Evakuasi Terpetakan
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ALUR KERJA SISTEMATIS: "Kenali. Perbaiki. Siapkan." (Animasi Terbit + Muncul Satu Satu Saat Scroll) */}
      <section id="proses" ref={prosesRef} className="py-24 sm:py-32 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div
          className={`text-center space-y-3 max-w-2xl mx-auto mb-16 sm:mb-20 transition-all duration-800 ease-out ${
            prosesInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0e6f68] tracking-tight">
            Kenali. Perbaiki. Siapkan.
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed font-normal">
            Langkah sistematis untuk membangun ketangguhan komunitas sebelum kondisi darurat terjadi.
          </p>
        </div>

        {/* 4 Connected Steps Grid (Animasi Muncul Satu-Satu saat scroll) */}
        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6 relative z-10">
            {stepDetails.map((step, idx) => {
              const isActive = activeStep === idx + 1;
              return (
                <div
                  key={step.num}
                  onClick={() => setActiveStep(idx + 1)}
                  style={{ transitionDelay: prosesInView ? `${(idx + 1) * 160}ms` : "0ms" }}
                  className={`cursor-pointer group flex flex-col items-center text-center p-4 sm:p-5 rounded-2xl transition-all duration-700 ease-out transform hover:-translate-y-2 hover:shadow-lg ${
                    prosesInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                  } ${
                    isActive
                      ? "bg-teal-50/70 border border-teal-200/80 shadow-xs"
                      : "hover:bg-gray-50/80 border border-transparent"
                  }`}
                >
                  {/* Step Icon with Number Badge */}
                  <div className="relative mb-5">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-md transition-all duration-300 transform group-hover:scale-110 group-hover:shadow-teal-900/20 ${
                        isActive ? "bg-[#0b5c56] ring-4 ring-teal-200 scale-105" : "bg-[#0e6f68]"
                      }`}
                    >
                      {idx === 0 && <ClipboardCheck className="w-7 h-7" />}
                      {idx === 1 && <Search className="w-7 h-7" />}
                      {idx === 2 && <SlidersHorizontal className="w-7 h-7" />}
                      {idx === 3 && <Navigation className="w-7 h-7" />}
                    </div>
                    {/* Small number badge on top right */}
                    <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#111827] text-white text-[11px] font-bold flex items-center justify-center shadow-sm transition-transform group-hover:rotate-12">
                      {step.num}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-bold text-gray-900 tracking-tight group-hover:text-[#0e6f68] transition-colors">
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

        {/* Step Information Card with smooth appearance */}
        <div
          key={activeStep}
          style={{ transitionDelay: prosesInView ? "700ms" : "0ms" }}
          className={`mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-teal-50/70 to-emerald-50/60 border border-teal-100 max-w-3xl mx-auto text-center space-y-3 transition-all duration-700 ease-out ${
            prosesInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold shadow-2xs">
            Tahap {stepDetails[activeStep - 1].num} dari 04: {stepDetails[activeStep - 1].title}
          </div>
          <p className="text-sm text-gray-700 max-w-xl mx-auto leading-relaxed">
            {stepDetails[activeStep - 1].detail}
          </p>
        </div>
      </section>

      {/* 4. LIHAT SEBERAPA SIAP LINGKUNGANMU (Card Terbit + Animasi Hitung Data Saat Scroll) */}
      <section id="hasil" ref={hasilRef} className="relative py-20 overflow-hidden bg-gradient-to-b from-[#eef7fc]/60 via-[#f3f9f8]/40 to-white scroll-mt-20">
        {/* Soft Blue/Cyan Glow on Left Margin */}
        <div className="absolute left-0 top-0 bottom-0 w-48 bg-gradient-to-r from-[#d9eff9]/50 via-[#e0f3f8]/20 to-transparent pointer-events-none -z-10" />

        {/* Big Dark Teal Circular Ring Accent on Left Edge */}
        <div className="absolute -left-36 top-10 w-72 h-72 rounded-full border-[26px] border-[#0e6f68] pointer-events-none hidden lg:block -z-0 animate-pulse-glow" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div
            className={`text-center space-y-2 max-w-2xl mx-auto mb-12 transition-all duration-700 ease-out ${
              hasilInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <h2 className="text-2xl sm:text-3xl md:text-[34px] font-bold text-[#0e6f68] tracking-tight">
              Lihat Seberapa Siap Lingkunganmu
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-normal">
              Assessment membantu menemukan apa yang sudah siap dan apa yang masih perlu diperbaiki.
            </p>
          </div>

          {/* 3 Columns Cards Layout (Card Terbit Saat Scroll) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center max-w-5xl mx-auto">
            {/* Kolom Kiri: 2 Kartu Putih (span 4) */}
            <div
              style={{ transitionDelay: hasilInView ? "120ms" : "0ms" }}
              className={`md:col-span-4 space-y-6 transition-all duration-700 ease-out transform ${
                hasilInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
              }`}
            >
              {/* Card 1: Aspek Sudah Siap (Animasi Hitung Data) */}
              <div className="bg-white rounded-[22px] p-6 shadow-md shadow-slate-200/50 border border-slate-100/80 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group cursor-default">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center transition-transform group-hover:scale-110">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-bold text-[#0e6f68] transition-transform group-hover:scale-110">
                    {countAspekSiap}
                  </span>
                </div>
                <div className="mt-4 text-left">
                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#0e6f68] transition-colors">Aspek Sudah Siap</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Titik kumpul tersedia</p>
                </div>
              </div>

              {/* Card 2: Aspek Perlu Diperbaiki (Animasi Hitung Data) */}
              <div className="bg-white rounded-[22px] p-6 shadow-md shadow-slate-200/50 border border-slate-100/80 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group cursor-default">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center transition-transform group-hover:scale-110">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-bold text-amber-500 transition-transform group-hover:scale-110">
                    {countAspekPerbaikan}
                  </span>
                </div>
                <div className="mt-4 text-left">
                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-amber-600 transition-colors">Aspek Perlu Diperbaiki</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Jalur evakuasi perlu disosialisasikan</p>
                </div>
              </div>
            </div>

            {/* Kolom Tengah: Featured Card Skor (span 4) */}
            <div
              style={{ transitionDelay: hasilInView ? "260ms" : "0ms" }}
              className={`md:col-span-4 transition-all duration-800 ease-out transform ${
                hasilInView ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-12 scale-95"
              }`}
            >
              <div className="bg-white rounded-[28px] p-7 shadow-xl shadow-slate-200/60 border border-slate-100 relative hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group">
                {/* Header Row */}
                <div className="flex items-center justify-between pb-3">
                  <div className="flex items-center gap-1.5 text-teal-800 text-xs font-semibold">
                    <Shield className="w-4 h-4 text-[#0e6f68] transition-transform group-hover:rotate-12" />
                    <span>Kesiapsiagaan lingkungan</span>
                  </div>
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                    Preview
                  </span>
                </div>

                {/* Circular Progress Gauge (Animasi Mengisi Ring & Hitung Angka) */}
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
                    {/* Animated Teal Progress Ring */}
                    <circle
                      cx="60"
                      cy="60"
                      r="46"
                      stroke="#0e6f68"
                      strokeWidth="11"
                      strokeDasharray={2 * Math.PI * 46}
                      strokeDashoffset={2 * Math.PI * 46 * (1 - countScoreGauge / 100)}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-300 ease-out"
                    />
                  </svg>

                  {/* Text Inside Gauge */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[11px] text-gray-500 font-medium">
                      Skor
                    </span>
                    <span className="text-3xl font-extrabold text-[#0e6f68] tracking-tight">
                      {countScoreGauge}%
                    </span>
                  </div>
                </div>

                {/* Left-Aligned Status & Description */}
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
            <div
              style={{ transitionDelay: hasilInView ? "400ms" : "0ms" }}
              className={`md:col-span-4 space-y-6 transition-all duration-700 ease-out transform ${
                hasilInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
              }`}
            >
              {/* Card 1: Titik Evakuasi Terdata (Animasi Hitung Data) */}
              <div className="bg-white rounded-[22px] p-6 shadow-md shadow-slate-200/50 border border-slate-100/80 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group cursor-default">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center transition-transform group-hover:scale-110">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-bold text-[#0e6f68] transition-transform group-hover:scale-110">
                    {countTitikHasil}
                  </span>
                </div>
                <div className="mt-4 text-left">
                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#0e6f68] transition-colors">Titik Evakuasi Terdata</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Titik kumpul & jalur evakuasi</p>
                </div>
              </div>

              {/* Card 2: Dark Teal Prioritas Utama */}
              <div className="bg-[#0e6f68] text-white rounded-[22px] p-6 shadow-lg shadow-teal-950/15 text-left flex flex-col justify-between min-h-[140px] hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group">
                <div>
                  <div className="flex items-center gap-2 text-white text-sm font-bold">
                    <Compass className="w-4 h-4 text-teal-200 transition-transform duration-500 group-hover:rotate-45" />
                    <span>Prioritas Utama</span>
                  </div>
                  <p className="text-xs text-teal-50/95 mt-2.5 leading-relaxed">
                    Sosialisasikan jalur evakuasi kepada warga.
                  </p>
                </div>

                <div className="pt-4 flex justify-end">
                  <Link
                    href={isAuthUser ? "/map" : "/login?callbackUrl=/map"}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#84f0dc] hover:bg-[#68e2cc] text-[#06423e] text-[10px] font-bold transition-all duration-200 shadow-sm transform hover:scale-105 active:scale-95"
                  >
                    Lihat Action Plan &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. APA KATA MEREKA? (Animasi Terbit + Card + Hover + Saat Pindah Kanan Kiri Saat Scroll) */}
      <section id="testimoni" ref={testimoniRef} className="relative py-20 sm:py-24 bg-white overflow-hidden scroll-mt-20">
        {/* Decorative Wave Lines with gentle floating animation */}
        <div className="absolute right-0 top-16 sm:top-20 md:top-24 lg:top-20 w-60 sm:w-72 md:w-[320px] lg:w-[380px] xl:w-[420px] h-14 sm:h-16 md:h-20 text-[#0e6f68] pointer-events-none hidden md:block z-0 animate-float-soft">
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
          {/* Section Header (Animasi Terbit Saat Scroll) */}
          <div
            className={`text-center space-y-2 mb-10 sm:mb-12 transition-all duration-700 ease-out ${
              testimoniInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <h2 className="text-2xl sm:text-3xl md:text-[32px] font-bold text-[#0e6f68] tracking-tight">
              Apa kata mereka?
            </h2>
          </div>

          {/* 3 Testimonials Cards Grid (Animasi Card Muncul Satu-Satu Saat Scroll + Hover + Transisi Pindah) */}
          <div className="relative max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7 relative z-10">
              {testimonials.map((item, idx) => {
                const isActive = currentTestimonialIndex === idx;
                return (
                  <div
                    key={item.name}
                    onClick={() => setCurrentTestimonialIndex(idx)}
                    style={{ transitionDelay: testimoniInView ? `${(idx + 1) * 160}ms` : "0ms" }}
                    className={`bg-white rounded-[26px] p-7 sm:p-8 text-left flex flex-col justify-between min-h-[220px] cursor-pointer transition-all duration-700 ease-out transform ${
                      testimoniInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                    } ${
                      isActive
                        ? "border-2 border-[#0e6f68] shadow-[0_18px_40px_rgba(14,111,104,0.16)] -translate-y-2 scale-[1.02]"
                        : "border-2 border-transparent shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:border-slate-200 hover:-translate-y-1 hover:shadow-md scale-100"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="relative">
                        <img
                          src={item.avatar}
                          alt={item.name}
                          className={`w-12 h-12 rounded-full object-cover shadow-sm transition-all duration-300 ${
                            isActive ? "ring-3 ring-[#0e6f68] scale-105" : "ring-1 ring-slate-200"
                          }`}
                        />
                        {isActive && (
                          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#10b981] border-2 border-white animate-pulse" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-[15px] font-bold text-gray-900 tracking-tight">{item.name}</h4>
                        <p className="text-[11px] text-gray-400 font-medium">{item.role}</p>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mt-5 italic">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Carousel Navigation Track (Animasi Tombol & Progress Bar Geser) */}
          <div
            style={{ transitionDelay: testimoniInView ? "600ms" : "0ms" }}
            className={`flex items-center justify-center gap-4 mt-10 transition-all duration-700 ease-out ${
              testimoniInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            {/* Previous Button */}
            <button
              onClick={prevTestimonial}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 active:scale-90 cursor-pointer ${
                currentTestimonialIndex === 0
                  ? "bg-[#d1d5db]/80 text-[#4b5563] hover:bg-slate-300"
                  : "bg-[#0e6f68] hover:bg-[#0a524d] text-white shadow-md shadow-teal-900/20"
              }`}
              aria-label="Previous Testimonial"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Progress Bar Indicator Track */}
            <div className="relative w-44 sm:w-56 h-[6px] bg-[#e5e7eb] rounded-full overflow-hidden shadow-inner">
              <div
                className="absolute top-0 bottom-0 bg-[#0e6f68] transition-all duration-500 ease-out rounded-full shadow-xs"
                style={{
                  left: `${(currentTestimonialIndex / testimonials.length) * 100}%`,
                  width: `${100 / testimonials.length}%`,
                }}
              />
            </div>

            {/* Next Button */}
            <button
              onClick={nextTestimonial}
              className="w-8 h-8 rounded-full bg-[#0e6f68] hover:bg-[#0a524d] text-white flex items-center justify-center shadow-md shadow-teal-900/20 transition-all duration-200 transform hover:scale-110 active:scale-90 cursor-pointer"
              aria-label="Next Testimonial"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
