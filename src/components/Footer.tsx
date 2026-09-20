"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Mail, Phone } from "lucide-react";

export default function Footer({ showCtaBanner = true }: { showCtaBanner?: boolean }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAuthUser = !!session;

  // Sembunyikan footer pada halaman autentikasi (login & register)
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  const isCleanFooterPage =
    pathname === "/dashboard" ||
    pathname.startsWith("/assessment") ||
    pathname === "/ai" ||
    pathname === "/map" ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/admin");
  const shouldShowCta = showCtaBanner && !isCleanFooterPage;

  return (
    <div className="relative w-full bg-transparent overflow-hidden">
      {/* 1. Dynamic Fluid Ocean Wave Divider (White to Deep Teal #0e6f68) - Ombak Lebih Bergelombang */}
      {shouldShowCta && (
        <div className="relative w-full h-24 sm:h-32 lg:h-44 overflow-hidden bg-white pointer-events-none select-none">
          {/* Layer 1: Deep Back Wave (Slow Swell, 6 Siklus) */}
          <div className="absolute inset-y-0 left-0 w-[200%] h-full animate-wave-flow-slow opacity-30">
            <svg
              className="w-full h-full block"
              viewBox="0 0 2880 140"
              preserveAspectRatio="none"
            >
              <path
                d="M 0,70 C 120,20 200,20 240,70 C 280,120 360,120 480,70 C 600,20 680,20 720,70 C 760,120 840,120 960,70 C 1080,20 1160,20 1200,70 C 1240,120 1320,120 1440,70 C 1560,20 1640,20 1680,70 C 1720,120 1800,120 1920,70 C 2040,20 2120,20 2160,70 C 2200,120 2280,120 2400,70 C 2520,20 2600,20 2640,70 C 2680,120 2760,120 2880,70 L 2880,140 L 0,140 Z"
                fill="#15837b"
              />
            </svg>
          </div>

          {/* Layer 2: Mid Wave (Froth / Accent Teal, 8 Siklus Berlawanan Arah) */}
          <div className="absolute inset-y-0 left-0 w-[200%] h-full animate-wave-flow-slow opacity-45" style={{ animationDuration: "15s", animationDirection: "reverse" }}>
            <svg
              className="w-full h-full block"
              viewBox="0 0 2880 140"
              preserveAspectRatio="none"
            >
              <path
                d="M 0,65 C 80,125 140,125 180,65 C 220,15 300,15 360,65 C 440,125 500,125 540,65 C 580,15 660,15 720,65 C 800,125 860,125 900,65 C 940,15 1020,15 1080,65 C 1160,125 1220,125 1260,65 C 1300,15 1380,15 1440,65 C 1520,125 1580,125 1620,65 C 1660,15 1740,15 1800,65 C 1880,125 1940,125 1980,65 C 2020,15 2100,15 2160,65 C 2240,125 2300,125 2340,65 C 2380,15 2460,15 2520,65 C 2600,125 2660,125 2700,65 C 2740,15 2820,15 2880,65 L 2880,140 L 0,140 Z"
                fill="#20a398"
              />
            </svg>
          </div>

          {/* Layer 3: Main Front Crest Wave (Deep Teal #0e6f68 - Amplitudo Ekstra Melengkung) */}
          <div className="absolute inset-y-0 left-0 w-[200%] h-full animate-wave-flow">
            <svg
              className="w-full h-full block"
              viewBox="0 0 2880 140"
              preserveAspectRatio="none"
            >
              <path
                d="M 0,70 C 70,10 110,10 180,70 C 250,130 290,130 360,70 C 430,10 470,10 540,70 C 610,130 650,130 720,70 C 790,10 830,10 900,70 C 970,130 1010,130 1080,70 C 1150,10 1190,10 1260,70 C 1330,130 1370,130 1440,70 C 1510,10 1550,10 1620,70 C 1690,130 1730,130 1800,70 C 1870,10 1910,10 1980,70 C 2050,130 2090,130 2160,70 C 2230,10 2270,10 2340,70 C 2410,130 2450,130 2520,70 C 2590,10 2630,10 2700,70 C 2770,130 2810,130 2880,70 L 2880,140 L 0,140 Z"
                fill="#0e6f68"
              />
            </svg>
          </div>
        </div>
      )}

      {/* 2. Main Section: CTA + Footer Navigation (Sesuai Desain Figma) */}
      <footer className="bg-[#0e6f68] text-white relative overflow-hidden">
        {/* Decorative Circle Disc Accent di sudut kanan bawah */}
        <div className="absolute -bottom-24 -right-16 w-80 h-80 rounded-full bg-[#0a5851]/45 pointer-events-none" />

        {/* CTA Banner Bagian Atas Footer */}
        {shouldShowCta && (
          <div className="max-w-4xl mx-auto text-center pt-4 sm:pt-6 pb-20 sm:pb-24 px-4 sm:px-6 lg:px-8 space-y-7 relative z-10">
            <h2 className="text-2xl sm:text-3xl md:text-[36px] font-extrabold text-white tracking-tight leading-snug">
              Karena lingkungan yang siap<br />
              dimulai sebelum bencana terjadi.
            </h2>

            <div>
              <Link
                href={isAuthUser ? "/assessment" : "/login?callbackUrl=/assessment"}
                className="inline-flex items-center justify-center px-7 sm:px-8 py-3.5 rounded-xl bg-[#84f0dc] hover:bg-[#6ce9d1] text-[#06423e] font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Mulai Evaluasi Lingkungan
              </Link>
            </div>
          </div>
        )}

        {/* Footer Navigation Columns (Sesuai Desain Figma: Kiri Deskripsi, Kanan Navigasi & Bantuan) */}
        <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 ${shouldShowCta ? 'pb-14 sm:pb-16' : 'pt-12 sm:pt-14 pb-12 sm:pb-14'} relative z-10`}>
          <div className="flex flex-col md:flex-row justify-between items-start gap-10 lg:gap-16">
            {/* Kolom Kiri: Logo + Deskripsi + Copyright */}
            <div className="max-w-md space-y-3.5 text-left">
              <Link href="/" className="inline-block group py-1">
                <img
                  src="/images/naraga-logo-white.png?v=2"
                  alt="NARAGA"
                  className="h-[26px] sm:h-7 w-auto object-contain transition group-hover:opacity-90"
                />
              </Link>
              <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed max-w-sm font-normal">
                Platform untuk membantu masyarakat mengenali dan meningkatkan kesiapsiagaan lingkungan.
              </p>
              <p className="text-xs text-teal-100/75 pt-2">
                &copy;2026 NARAGA. Membangun Ketangguhan Komunitas Bersama.
              </p>
            </div>

            {/* Kolom Kanan: Navigasi & Bantuan */}
            <div className="flex items-start gap-16 sm:gap-24 text-left">
              {/* Kolom 1: Navigasi */}
              <div className="space-y-3.5">
                <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide">Navigasi</h3>
                <ul className="space-y-2.5 text-xs">
                  <li>
                    <Link href="/#proses" className="text-teal-100/80 hover:text-white transition">
                      Proses
                    </Link>
                  </li>
                  <li>
                    <Link href="/#hasil" className="text-teal-100/80 hover:text-white transition">
                      Hasil
                    </Link>
                  </li>
                  <li>
                    <Link href="/#testimoni" className="text-teal-100/80 hover:text-white transition">
                      Testimoni
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={isAuthUser ? "/map" : "/login?callbackUrl=/map"}
                      className="text-teal-100/80 hover:text-white transition"
                    >
                      Peta Evakuasi
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Kolom 2: Hubungi Kami */}
              <div className="space-y-3.5">
                <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide">Hubungi Kami</h3>
                <ul className="space-y-2.5 text-xs">
                  <li>
                    <a
                      href="mailto:kontak@naraga.id"
                      className="inline-flex items-center gap-2 text-teal-100/80 hover:text-white transition"
                    >
                      <Mail className="w-3.5 h-3.5 text-teal-300 flex-shrink-0" />
                      <span>kontak@naraga.id</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="tel:+6285876335559"
                      className="inline-flex items-center gap-2 text-teal-100/80 hover:text-white transition"
                    >
                      <Phone className="w-3.5 h-3.5 text-teal-300 flex-shrink-0" />
                      <span>+62 858-7633-5559</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
