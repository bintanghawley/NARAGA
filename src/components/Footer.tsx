"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer({ showCtaBanner = true }: { showCtaBanner?: boolean }) {
  const pathname = usePathname();

  // Sembunyikan footer pada halaman autentikasi (login & register)
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  const isCleanFooterPage =
    pathname === "/dashboard" ||
    pathname.startsWith("/assessment") ||
    pathname === "/ai" ||
    pathname === "/map";
  const shouldShowCta = showCtaBanner && !isCleanFooterPage;

  return (
    <div className="relative w-full bg-white overflow-hidden">
      {/* 1. Wave SVG Header Divider (White to Deep Teal #0e6f68) */}
      {shouldShowCta && (
        <div className="w-full leading-none overflow-hidden bg-white">
          <svg
            className="w-full h-14 sm:h-20 lg:h-24 block"
            viewBox="0 0 1440 90"
            preserveAspectRatio="none"
          >
            {/* Background putih di atas */}
            <rect width="1440" height="90" fill="#ffffff" />
            {/* Gelombang Deep Teal #0e6f68 */}
            <path
              d="M 0,35 C 60,75, 120,75, 180,45 C 240,15, 300,15, 360,45 C 420,75, 480,75, 540,45 C 600,15, 660,15, 720,45 C 780,75, 840,75, 900,45 C 960,15, 1020,15, 1080,45 C 1140,75, 1200,75, 1260,45 C 1320,15, 1380,15, 1440,35 L 1440,90 L 0,90 Z"
              fill="#0e6f68"
            />
          </svg>
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
                href="/assessment"
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
              <Link href="/" className="inline-block group">
                <span className="text-2xl sm:text-3xl font-black tracking-tight text-white group-hover:opacity-95 transition">
                  NARAGA<span className="text-[#84f0dc]">.</span>
                </span>
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
                    <Link href="/map" className="text-teal-100/80 hover:text-white transition">
                      Peta Evakuasi
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Kolom 2: Bantuan */}
              <div className="space-y-3.5">
                <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide">Bantuan</h3>
                <ul className="space-y-2.5 text-xs">
                  <li>
                    <a
                      href="https://wa.me/6285876335559"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-100/80 hover:text-white transition"
                    >
                      Hubungi Kami
                    </a>
                  </li>
                  <li>
                    <Link href="/ai" className="text-teal-100/80 hover:text-white transition">
                      FAQ
                    </Link>
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
