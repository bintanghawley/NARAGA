"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Compass, Bot, Settings, Sparkles, Shield } from "lucide-react";

interface SidebarItem {
  name: string;
  href: string;
  icon: typeof Compass;
  hasSparkles?: boolean;
}

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  const sidebarItems: SidebarItem[] = [
    {
      name: isAdmin ? "Panel Admin" : "Overview",
      href: isAdmin ? "/admin" : "/dashboard",
      icon: isAdmin ? Shield : Compass,
    },
    { name: "Tanya AI", href: "/ai", icon: Bot, hasSparkles: true },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  // Tentukan indeks target berdasarkan pathname
  const getTargetIndex = () => {
    if (pathname.startsWith("/ai")) return 1;
    if (pathname.startsWith("/settings")) return 2;
    return 0; // default /dashboard or /admin
  };

  const targetIndex = getTargetIndex();
  // Inisialisasi posisi dengan posisi sebelumnya agar terlihat efek "ikut geser" saat navigasi
  const [activeIndex, setActiveIndex] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("naraga_sidebar_active_idx");
      if (stored !== null) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 2) {
          return parsed;
        }
      }
    }
    return targetIndex;
  });

  useEffect(() => {
    // Geser ke targetIndex setelah mount
    const timer = setTimeout(() => {
      setActiveIndex(targetIndex);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("naraga_sidebar_active_idx", targetIndex.toString());
      }
    }, 40);

    return () => clearTimeout(timer);
  }, [targetIndex]);

  const scrollToTopMentok = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      document.documentElement.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      document.body.scrollTo({ top: 0, left: 0, behavior: "smooth" });
      setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      }, 250);
    }
  };

  return (
    <aside className="w-full lg:w-64 bg-white rounded-[28px] p-3 shadow-sm border border-gray-100 flex-shrink-0 lg:sticky lg:top-24 lg:self-start z-20 transition-all">
      <div className="relative flex flex-col gap-1.5">
        {/* Indikator Hijau Meluncur (Sliding Pill Animation) */}
        <div
          className="absolute left-0 right-0 h-[48px] rounded-xl bg-[#0e6f68] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none shadow-xs z-0"
          style={{
            transform: `translateY(${activeIndex * 54}px)`,
          }}
        />

        {sidebarItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = targetIndex === idx;

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={(e) => {
                setActiveIndex(idx);
                if (typeof window !== "undefined") {
                  sessionStorage.setItem("naraga_sidebar_active_idx", idx.toString());
                }
                const linkBase = item.href.split("?")[0];
                if (pathname === linkBase) {
                  e.preventDefault();
                }
                scrollToTopMentok();
              }}
              className={`relative z-10 w-full h-[48px] flex items-center gap-3 px-4 rounded-xl text-sm font-semibold transition-colors duration-200 cursor-pointer ${
                isActive
                  ? "text-white"
                  : "text-gray-700 hover:text-gray-900 hover:bg-gray-50/60"
              }`}
            >
              <div
                className={`w-5 h-5 flex items-center justify-center transition-colors ${
                  isActive ? "text-white" : "text-gray-500"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="flex items-center gap-1.5">
                {item.name}
                {item.hasSparkles && (
                  <Sparkles
                    className={`w-3.5 h-3.5 transition-colors ${
                      isActive ? "text-amber-300" : "text-amber-500"
                    }`}
                  />
                )}
              </span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
