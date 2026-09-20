"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ArrowRight, Menu, X, LogOut, ChevronDown, Shield, Sparkles, User, Settings, MapPin } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as any;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isResultView, setIsResultView] = useState(false);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [navAvatar, setNavAvatar] = useState<string>("/images/avatar-evan.jpg");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkResult = () => {
        const urlParams = new URLSearchParams(window.location.search);
        setIsResultView(pathname === "/assessment" && urlParams.get("view") === "result");
      };
      checkResult();
      window.addEventListener("popstate", checkResult);

      const saved = localStorage.getItem("naraga_user_avatar");
      if (saved) {
        setNavAvatar(saved);
      }
      const handleAvatar = (e: any) => {
        if (e.detail) {
          setNavAvatar(e.detail);
        }
      };
      window.addEventListener("naraga_avatar_changed", handleAvatar);

      return () => {
        window.removeEventListener("popstate", checkResult);
        window.removeEventListener("naraga_avatar_changed", handleAvatar);
      };
    }
  }, [pathname]);

  // Sembunyikan navbar pada halaman autentikasi (login & register)
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  const isAuthUser = !!session;

  // Nav links untuk user yang sedang login vs pengunjung umum
  const publicNavLinks = [
    { label: "Tes Kesiapsiagaan", href: "/" },
    { label: "Proses", href: "/#proses" },
    { label: "Hasil", href: "/#hasil" },
    { label: "Testimoni", href: "/#testimoni" },
  ];

  const authNavLinks = [
    { label: "Dashboard", href: "/dashboard" },
    {
      label: isResultView ? "Hasil Kesiapanmu" : "Tes Kesiapsiagaan",
      href: isResultView ? "/assessment?view=result" : "/assessment",
    },
    { label: "Peta Evakuasi", href: "/map" },
  ];

  const currentNavLinks = isAuthUser ? authNavLinks : publicNavLinks;

  // Fungsi penanganan navigasi smooth scroll ketika link ditekan
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Jika link mengarah ke anchor section atau home pada landing page
    if (href.startsWith("/#") || href === "/" || href.startsWith("#")) {
      if (pathname === "/") {
        e.preventDefault();
        if (href === "/" || href === "/#hero" || href === "#hero") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          const targetId = href.replace(/^\/?#/, "");
          const el = document.getElementById(targetId);
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          }
        }
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      // Tombol navbar saat ditekan langsung scroll paling atas
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between relative">
        {/* 1. Brand Logo (Kiri) - Smooth scroll ke paling atas */}
        <Link
          href="/"
          onClick={(e) => {
            if (pathname === "/") {
              e.preventDefault();
            }
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="flex items-center group py-1 z-10"
        >
          <img
            src="/images/naraga-logo.png"
            alt="NARAGA"
            className="h-[26px] sm:h-7 w-auto object-contain transition group-hover:opacity-90"
          />
        </Link>

        {/* 2. Center Navigation Links (Tengah Presisi Sempurna) */}
        <nav className="hidden md:flex items-center gap-8 lg:gap-10 text-sm absolute left-1/2 -translate-x-1/2">
          {currentNavLinks.map((link) => {
            const linkPath = link.href.split("?")[0];
            const isActive =
              pathname === linkPath ||
              (linkPath === "/dashboard" &&
                (pathname.startsWith("/ai") || pathname.startsWith("/settings"))) ||
              (linkPath !== "/" && pathname.startsWith(linkPath));

            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`py-1.5 transition-all text-sm cursor-pointer whitespace-nowrap ${
                  isActive && isAuthUser
                    ? "text-gray-900 font-bold border-b-[3px] border-[#0e6f68] pb-1"
                    : "text-gray-600 hover:text-[#0e6f68] font-medium"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* 3. Action / Profile (Kanan - Sesuai Figma) */}
        <div className="hidden md:flex items-center gap-4 z-10">
          {isAuthUser ? (() => {
            const rawName = user?.name || "Evan Mahardika";
            const nameMatch = rawName.match(/^(.*?)\s*\((.*?)\)\s*$/);
            const cleanNavName = nameMatch ? nameMatch[1].trim() : rawName;
            const roleTitleNav = nameMatch ? nameMatch[2].trim() : (user?.role || "WARGA");

            return (
              /* User Profile Pill Dropdown (Sesuai Desain Figma: Chevron ▼ + Nama + Avatar) */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 py-1.5 px-2 rounded-full hover:bg-gray-50 transition cursor-pointer group"
                  aria-expanded={profileDropdownOpen}
                >
                  <ChevronDown
                    className={`w-4 h-4 text-gray-700 group-hover:text-gray-900 transition-transform duration-300 ${
                      profileDropdownOpen ? "rotate-180" : "rotate-0"
                    }`}
                  />
                  <span className="text-sm font-bold text-gray-900 tracking-tight">
                    {cleanNavName}
                  </span>
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 bg-teal-50 flex-shrink-0 shadow-xs">
                    <img
                      src={navAvatar}
                      alt={cleanNavName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback jika gambar gagal termuat
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80";
                      }}
                    />
                  </div>
                </button>

                {/* Dropdown Menu Box dengan animasi halus (Smooth Spring Pop-up) */}
                <div
                  className={`absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50 origin-top-right transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    profileDropdownOpen
                      ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                      : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                  }`}
                >
                  <div className="px-4 py-2 border-b border-gray-100 space-y-1">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {cleanNavName}
                    </p>
                    {nameMatch && (
                      <p className="text-xs font-semibold text-[#0e6f68] truncate">
                        {roleTitleNav}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email || "warga@naraga.id"}
                    </p>
                    <div className="pt-1">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-[#0e6f68] border border-teal-100 uppercase">
                        {user?.role || "WARGA"}
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/dashboard"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-teal-50/60 hover:text-[#0e6f68] transition"
                    >
                      <User className="w-3.5 h-3.5" />
                      Dashboard Saya
                    </Link>
                    <Link
                      href="/map"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-teal-50/60 hover:text-[#0e6f68] transition"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#0e6f68]" />
                      Peta Evakuasi
                    </Link>
                    <Link
                      href="/ai"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-teal-50/60 hover:text-[#0e6f68] transition"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Tanya Asisten AI
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-teal-50/60 hover:text-[#0e6f68] transition"
                    >
                      <Settings className="w-3.5 h-3.5 text-[#0e6f68]" />
                      Pengaturan (Settings)
                    </Link>
                    {user?.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50 transition"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        Panel Admin Verifikasi
                      </Link>
                    )}
                  </div>

                  <div className="pt-1 border-t border-gray-100">
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Keluar (Sign Out)
                    </button>
                  </div>
                </div>
              </div>
            );
          })() : (
            <>
              <Link
                href="/login"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="px-6 lg:px-7 py-2 rounded-full border border-[#0e6f68] text-[#0e6f68] hover:bg-teal-50/70 font-semibold text-sm transition"
              >
                Masuk
              </Link>
              <Link
                href="/login?callbackUrl=/assessment"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="inline-flex items-center gap-2 px-6 lg:px-7 py-2 rounded-full bg-[#0e6f68] hover:bg-[#0a524d] text-white font-semibold text-sm shadow-sm hover:shadow transition transform active:scale-[0.98]"
              >
                <span>Mulai Tes</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>

        {/* Hamburger Mobile Toggle */}
        <div className="md:hidden flex items-center gap-2">
          {!isAuthUser ? (
            <Link
              href="/login"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="px-4 py-1.5 rounded-full border border-[#0e6f68] text-[#0e6f68] font-semibold text-xs"
            >
              Masuk
            </Link>
          ) : (
            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 shadow-2xs">
              <img
                src={navAvatar}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-700 hover:text-[#0e6f68] hover:bg-gray-100 rounded-xl transition"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-5 py-4 space-y-3 shadow-xl animate-in slide-in-from-top-2">
          {isAuthUser && (() => {
            const rawName = user?.name || "Evan Mahardika";
            const nameMatch = rawName.match(/^(.*?)\s*\((.*?)\)\s*$/);
            const cleanNavName = nameMatch ? nameMatch[1].trim() : rawName;
            const roleTitleNav = nameMatch ? nameMatch[2].trim() : (user?.role || "WARGA");

            return (
              <div className="pb-3 border-b border-gray-100 flex items-center gap-3">
                <img
                  src={navAvatar}
                  alt={cleanNavName}
                  className="w-10 h-10 rounded-full object-cover border border-teal-100 shadow-2xs"
                />
                <div>
                  <p className="text-sm font-bold text-gray-900">{cleanNavName}</p>
                  <p className="text-xs text-[#0e6f68] font-medium">{roleTitleNav}</p>
                </div>
              </div>
            );
          })()}

          <nav className="flex flex-col space-y-2">
            {currentNavLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:text-[#0e6f68] hover:bg-teal-50 transition cursor-pointer"
              >
                {link.label}
              </Link>
            ))}
            {isAuthUser && (
              <>
                <Link
                  href="/ai"
                  onClick={(e) => handleNavClick(e, "/ai")}
                  className="px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:text-[#0e6f68] hover:bg-teal-50 transition cursor-pointer"
                >
                  Tanya Asisten AI
                </Link>
                <Link
                  href="/settings"
                  onClick={(e) => handleNavClick(e, "/settings")}
                  className="px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:text-[#0e6f68] hover:bg-teal-50 transition cursor-pointer"
                >
                  Pengaturan
                </Link>
              </>
            )}
          </nav>
          <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
            {isAuthUser ? (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full py-2.5 rounded-full bg-red-50 text-red-600 font-semibold text-sm flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar</span>
              </button>
            ) : (
              <Link
                href="/login?callbackUrl=/assessment"
                onClick={() => {
                  setMobileMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="w-full py-2.5 rounded-full bg-[#0e6f68] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Mulai Tes</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
