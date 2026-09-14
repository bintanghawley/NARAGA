"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Shield, MapPin, ClipboardCheck, Bot, User, LogOut, LogIn, Lock } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const user = session?.user as any;

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-sm">
            N
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-gray-900">NARAGA</span>
            <span className="hidden sm:inline-block ml-2 text-xs font-medium px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
              Kesiapsiagaan Komunitas
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/dashboard" className="hover:text-emerald-600 transition flex items-center gap-1.5">
            <User className="w-4 h-4" /> Dashboard
          </Link>
          <Link href="/assessment" className="hover:text-emerald-600 transition flex items-center gap-1.5">
            <ClipboardCheck className="w-4 h-4" /> Asesmen
          </Link>
          <Link href="/map" className="hover:text-emerald-600 transition flex items-center gap-1.5">
            <MapPin className="w-4 h-4" /> Peta Evakuasi
          </Link>
          <Link href="/ai" className="hover:text-emerald-600 transition flex items-center gap-1.5">
            <Bot className="w-4 h-4" /> Tanya AI
          </Link>
          {user?.role === "ADMIN" && (
            <Link href="/admin" className="text-purple-700 hover:text-purple-900 transition flex items-center gap-1.5 font-semibold">
              <Lock className="w-4 h-4" /> Admin Panel
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {session ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-gray-900">{user?.name}</p>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  user?.role === "ADMIN"
                    ? "bg-purple-100 text-purple-700"
                    : user?.role === "PENGURUS"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}>
                  {user?.role}
                </span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Keluar"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-sm font-semibold text-gray-700 hover:text-emerald-600 px-3 py-1.5 rounded-lg transition"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg shadow-sm transition"
              >
                Daftar Warga
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
