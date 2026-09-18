import Link from "next/link";

export default function Footer({ showCtaBanner = true }: { showCtaBanner?: boolean }) {
  return (
    <div className="relative w-full bg-white">
      {/* 1. Wave SVG Header Divider (White to Deep Teal #0e6f68) */}
      {showCtaBanner && (
        <div className="w-full leading-none overflow-hidden bg-white">
          <svg
            className="w-full h-16 sm:h-20 lg:h-24 block"
            viewBox="0 0 1440 90"
            preserveAspectRatio="none"
          >
            {/* Background putih solid di atas gelombang */}
            <rect width="1440" height="90" fill="#ffffff" />
            {/* Gelombang Deep Teal menyatu dengan banner di bawahnya */}
            <path
              d="M 0,35 C 60,75, 120,75, 180,45 C 240,10, 300,10, 360,45 C 420,75, 480,75, 540,45 C 600,10, 660,10, 720,45 C 780,75, 840,75, 900,45 C 960,10, 1020,10, 1080,45 C 1140,75, 1200,75, 1260,45 C 1320,10, 1380,10, 1440,35 L 1440,90 L 0,90 Z"
              fill="#0e6f68"
            />
          </svg>
        </div>
      )}

      {/* 2. Main Section (CTA + Footer Navigation dalam satu kesatuan warna #0e6f68) */}
      <section className="bg-[#0e6f68] text-white">
        {showCtaBanner && (
          <div className="max-w-4xl mx-auto text-center pt-2 sm:pt-4 pb-16 px-4 sm:px-6 lg:px-8 space-y-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-snug">
              Karena lingkungan yang siap<br />
              dimulai sebelum bencana terjadi.
            </h2>

            <div>
              <Link
                href="/assessment"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-[#7ee7d2] hover:bg-[#68dec7] text-[#06423e] font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Mulai Evaluasi Lingkungan
              </Link>
            </div>
          </div>
        )}

        {/* Footer Navigation Columns */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 border-t border-teal-600/30">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 lg:gap-12 pb-12">
            {/* Logo & Social Media */}
            <div className="md:col-span-2 space-y-5">
              <Link href="/" className="inline-block">
                <span className="text-3xl font-black tracking-tight text-white">
                  NARAGA<span className="text-[#7ee7d2]">.</span>
                </span>
              </Link>
              <p className="text-xs text-teal-100/75 max-w-sm leading-relaxed">
                Platform kesiapsiagaan pra-bencana berbasis Readiness Gap untuk masyarakat dan pengurus lingkungan menuju komunitas tangguh bencana yang adaptif.
              </p>

              {/* Social Media Icons */}
              <div className="flex items-center gap-3 pt-1">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-8 h-8 rounded-full bg-teal-800/80 hover:bg-teal-700 flex items-center justify-center text-white transition hover:scale-110"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95C18.05 21.45 22 17.19 22 12z" />
                  </svg>
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="w-8 h-8 rounded-full bg-teal-800/80 hover:bg-teal-700 flex items-center justify-center text-white transition hover:scale-110"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-8 h-8 rounded-full bg-teal-800/80 hover:bg-teal-700 flex items-center justify-center text-white transition hover:scale-110"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Kolom 1: Kontak Kami */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white tracking-wide">Kontak Kami</h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <span className="text-teal-200/70 block">WhatsApp :</span>
                  <a
                    href="https://wa.me/6285876335559"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-teal-200 transition"
                  >
                    +62 858-7633-5559
                  </a>
                </li>
                <li>
                  <span className="text-teal-200/70 block">Email :</span>
                  <a
                    href="mailto:naraga@gmail.com"
                    className="text-white hover:text-teal-200 transition"
                  >
                    naraga@gmail.com
                  </a>
                </li>
              </ul>
            </div>

            {/* Kolom 2: Tentang Kami */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white tracking-wide">Tentang Kami</h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/" className="text-teal-100/90 hover:text-white transition">
                    Profile
                  </Link>
                </li>
                <li>
                  <Link href="/" className="text-teal-100/90 hover:text-white transition">
                    Visi & Misi
                  </Link>
                </li>
              </ul>
            </div>

            {/* Kolom 3: Bantuan */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white tracking-wide">Bantuan</h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/ai" className="text-teal-100/90 hover:text-white transition">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/map" className="text-teal-100/90 hover:text-white transition">
                    Kontak
                  </Link>
                </li>
              </ul>
            </div>

            {/* Kolom 4: Legal */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white tracking-wide">Legal</h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/" className="text-teal-100/90 hover:text-white transition">
                    Kebijakan Privasi
                  </Link>
                </li>
                <li>
                  <Link href="/" className="text-teal-100/90 hover:text-white transition">
                    Syarat & Ketentuan
                  </Link>
                </li>
                <li>
                  <Link href="/" className="text-teal-100/90 hover:text-white transition">
                    Hak Cipta
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="pt-8 text-center text-xs text-teal-200/60 font-medium">
            <p>© 2026 NARAGA. All rights reserved.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
