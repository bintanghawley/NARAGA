"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import TypewriterHeading from "@/components/TypewriterHeading";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal mendaftar");
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login?email=" + encodeURIComponent(email));
        }, 1500);
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white">
      {/* 1. SISI KIRI: Deep Teal Branding & Visual Accents (Sesuai Desain Figma: "Selamat Datang") */}
      <div className="lg:col-span-5 xl:col-span-5 bg-[#0e6f68] relative overflow-hidden flex flex-col justify-between p-8 sm:p-12 lg:p-16 min-h-[380px] lg:min-h-screen text-white">
        {/* Decorative Circle Ring Top Right */}
        <div className="absolute -top-16 -right-20 w-80 h-80 rounded-full border-[28px] border-[#09544f] pointer-events-none animate-float-gentle" />
        <div className="absolute top-4 -right-8 w-56 h-56 rounded-full bg-[#0a5a54]/50 pointer-events-none animate-float-gentle-reverse" />

        {/* Decorative Circle Ring Mid Left */}
        <div className="absolute top-1/3 -left-32 w-72 h-72 rounded-full border-[24px] border-[#09544f]/80 pointer-events-none animate-float-gentle" />

        {/* Decorative Circle Disk Bottom Right */}
        <div className="absolute -bottom-16 right-6 w-64 h-64 rounded-full bg-[#0a5650]/70 pointer-events-none animate-float-gentle-reverse" />

        {/* Decorative 3 Wave Lines Bottom Left */}
        <div className="absolute bottom-10 left-8 sm:left-12 w-40 h-10 text-[#09544f] pointer-events-none hidden sm:block animate-float-soft">
          <svg viewBox="0 0 200 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M 0 8 C 20 -2, 40 18, 60 8 C 80 -2, 100 18, 120 8 C 140 -2, 160 18, 180 8 C 190 3, 195 5, 200 8" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
            <path d="M 0 24 C 20 14, 40 34, 60 24 C 80 14, 100 34, 120 24 C 140 14, 160 34, 180 24 C 190 19, 195 21, 200 24" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
            <path d="M 0 40 C 20 30, 40 50, 60 40 C 80 30, 100 50, 120 40 C 140 30, 160 50, 180 40 C 190 35, 195 37, 200 40" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
          </svg>
        </div>

        {/* Brand Header */}
        <div className="relative z-10 animate-emerge">
          <Link href="/" className="inline-block group py-1">
            <img
              src="/images/naraga-logo-white.png?v=2"
              alt="NARAGA"
              className="h-[25px] sm:h-7 w-auto object-contain transition group-hover:opacity-90"
            />
          </Link>
        </div>

        {/* Hero Typography Sisi Kiri: "Selamat Datang" dengan Animasi Typing */}
        <div className="relative z-10 my-auto py-12 lg:py-0">
          <TypewriterHeading lines={["Selamat", "Datang"]} />
          <p className="text-xs sm:text-sm text-teal-100/85 font-normal leading-relaxed max-w-sm mt-6 animate-emerge stagger-2">
            Akses hasil assessment, pantau perkembangan kesiapsiagaan, dan kelola langkah perbaikan lingkunganmu
          </p>
        </div>

        {/* Bottom spacing / placeholder */}
        <div className="relative z-10 hidden lg:block text-[11px] text-teal-200/50">
          &copy; 2026 NARAGA Indonesia
        </div>
      </div>

      {/* 2. SISI KANAN: Soft Blue Gradient Background dengan Floating White Card */}
      <div className="lg:col-span-7 xl:col-span-7 bg-gradient-to-br from-[#ebf5fb] via-[#f1f7fc] to-[#e4f1fa] flex flex-col justify-between p-6 sm:p-8 lg:p-12 min-h-[600px] lg:min-h-screen relative">
        {/* Tombol Kembali di Bagian Atas Sisi Kanan (Area Putih/Terang) */}
        <div className="w-full flex items-center justify-start z-10 animate-emerge">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-gray-50 text-gray-700 hover:text-[#0e6f68] text-xs sm:text-sm font-semibold transition shadow-xs border border-gray-200/80 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1 text-gray-500 group-hover:text-[#0e6f68]" />
            <span>Kembali</span>
          </Link>
        </div>

        {/* Floating White Card di Tengah (Animasi Terbit / Emerge) */}
        <div className="my-auto flex justify-center py-4 w-full">
          <div className="bg-white rounded-[28px] sm:rounded-[34px] shadow-[0_20px_50px_rgba(15,80,75,0.07)] border border-slate-100/90 p-8 sm:p-12 w-full max-w-[460px] space-y-6 animate-emerge stagger-1">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                Daftar
              </h2>
            </div>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-[#0e6f68] text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Pendaftaran berhasil! Mengalihkan ke login...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Username"
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0e6f68]/25 focus:border-[#0e6f68] transition bg-white text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="username@gmail.com"
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0e6f68]/25 focus:border-[#0e6f68] transition bg-white text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 pr-11 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0e6f68]/25 focus:border-[#0e6f68] transition bg-white text-gray-900 placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || success}
                className="w-full py-3 px-4 bg-[#0e6f68] hover:bg-[#0a524d] text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition transform active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? "Mendaftarkan..." : "Daftar"}
              </button>
            </div>
          </form>

          <div className="text-center text-xs text-gray-500 pt-1">
            Sudah memiliki akun?{" "}
            <Link href="/login" className="font-bold text-[#0e6f68] hover:underline">
              Masuk di sini
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom spacer to keep card perfectly balanced */}
      <div className="hidden lg:block h-6 pointer-events-none" />
    </div>
  </div>
);
}
