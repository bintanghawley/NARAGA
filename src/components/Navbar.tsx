"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Bell, User, LogOut, Shield, Compass, Sparkles } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [showNotification, setShowNotification] = useState(false);

  return (
    <header className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-1 group">
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#0e6f68] group-hover:opacity-90 transition">
            NARAGA<span className="text-[#14b8a6]">.</span>
          </span>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
          <Link
            href="/assessment"
            className="hover:text-[#0e6f68] transition-colors py-1 hover:font-semibold"
          >
            Assessment
          </Link>
          <Link
            href="/map"
            className="hover:text-[#0e6f68] transition-colors py-1 hover:font-semibold"
          >
            Peta Evakuasi
          </Link>
          <Link
            href="/ai"
            className="hover:text-[#0e6f68] transition-colors py-1 flex items-center gap-1 text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full text-xs font-semibold"
          >
            <Sparkles className="w-3 h-3 text-teal-600" /> Tanya AI
          </Link>
          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="text-purple-700 hover:text-purple-900 transition flex items-center gap-1 font-semibold text-xs bg-purple-50 px-2.5 py-1 rounded-full"
            >
              <Shield className="w-3 h-3" /> Admin Panel
            </Link>
          )}
        </nav>

        {/* Right Section: Notification, User Profile, CTA */}
        <div className="flex items-center gap-4">
          {/* Notification Bell with interactive popover */}
          <div className="relative">
            <button
              onClick={() => setShowNotification(!showNotification)}
              className="p-2 text-gray-600 hover:text-[#0e6f68] hover:bg-teal-50 rounded-full transition relative"
              aria-label="Notifikasi"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
            </button>

            {showNotification && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="text-xs font-bold text-gray-800">Pemberitahuan</span>
                  <span className="text-[10px] text-teal-600 font-semibold bg-teal-50 px-2 py-0.5 rounded-full">Baru</span>
                </div>
                <div className="mt-2 space-y-2">
                  <div className="p-2 rounded-xl bg-teal-50/70 border border-teal-100/60">
                    <p className="text-xs font-semibold text-teal-900">Asesmen Siaga Baru</p>
                    <p className="text-[11px] text-teal-700 mt-0.5">Komunitas RT 03 Sekaran baru saja memperbarui rute evakuasi darurat.</p>
                  </div>
                  <div className="p-2 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="text-xs font-semibold text-gray-800">Peta Jalur Aman</p>
                    <p className="text-[11px] text-gray-600 mt-0.5">Posko darurat utama telah diverifikasi oleh BPBD setempat.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Session Status */}
          {session ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 p-1.5 pr-3 rounded-full hover:bg-gray-100 transition text-gray-700"
              >
                <div className="w-8 h-8 rounded-full bg-[#0e6f68] text-white flex items-center justify-center font-bold text-xs">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-gray-900 leading-tight">{user?.name?.split(" ")[0]}</p>
                  <span className="text-[10px] font-semibold text-teal-700">{user?.role}</span>
                </div>
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                title="Keluar"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="p-2 text-gray-600 hover:text-[#0e6f68] hover:bg-teal-50 rounded-full transition"
                title="Masuk Akun"
              >
                <User className="w-5 h-5" />
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#0e6f68] hover:bg-[#0a524d] text-white text-sm font-semibold shadow-sm hover:shadow transition transform active:scale-95"
              >
                Daftar
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
