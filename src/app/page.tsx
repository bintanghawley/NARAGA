import Link from "next/link";
import { Shield, Activity, MapPin, Bot, CheckCircle2, ArrowRight, Users, Sparkles, Building2, AlertTriangle } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-emerald-50 via-white to-gray-50 border-b border-gray-200 pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Infinitera 2.0 Web Development &bull; UNISSULA HM TIF</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Kesiapsiagaan Komunitas Berbasis{" "}
            <span className="text-emerald-600 underline decoration-emerald-300 decoration-wavy">
              Readiness Gap
            </span>
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Menghubungkan fasilitas keselamatan fisik dan pemahaman warga di tingkat RT/RW melalui instrumen evaluasi mandiri terstruktur, visualisasi titik kumpul, dan asisten AI kontekstual.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/assessment"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold shadow-md hover:bg-emerald-700 transition"
            >
              Mulai Asesmen Lingkungan <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-gray-300 text-gray-800 font-semibold hover:bg-gray-50 transition shadow-sm"
            >
              Masuk ke Akun Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Akun Demo Bawaan untuk Pengujian Cepat */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-600" />
              Akun Bawaan untuk Uji Coba Tim & Evaluasi Juri (Seeded)
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Gunakan akun-akun di bawah ini untuk menguji hak akses berbasis peran (RBAC 3 Role) tanpa perlu mendaftar ulang:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Admin */}
            <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                  Role: ADMIN
                </span>
                <Building2 className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Administrator Internal</p>
                <p className="text-xs text-gray-600 mt-1 font-mono">admin@naraga.id</p>
                <p className="text-xs text-gray-500 font-mono">Password: admin123</p>
              </div>
              <p className="text-xs text-gray-600">
                Fitur utama: Memverifikasi pengajuan Warga menjadi Pengurus Lingkungan.
              </p>
              <Link
                href="/login?email=admin@naraga.id"
                className="inline-block text-xs font-semibold text-purple-700 hover:text-purple-900"
              >
                Masuk sebagai Admin &rarr;
              </Link>
            </div>

            {/* Pengurus Lingkungan */}
            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                  Role: PENGURUS
                </span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Ketua RT 03 Sekaran</p>
                <p className="text-xs text-gray-600 mt-1 font-mono">pengurus@naraga.id</p>
                <p className="text-xs text-gray-500 font-mono">Password: pengurus123</p>
              </div>
              <p className="text-xs text-gray-600">
                Fitur utama: Mengelola titik kumpul & rute evakuasi di peta, pantau action plan.
              </p>
              <Link
                href="/login?email=pengurus@naraga.id"
                className="inline-block text-xs font-semibold text-blue-700 hover:text-blue-900"
              >
                Masuk sebagai Pengurus &rarr;
              </Link>
            </div>

            {/* Warga */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                  Role: WARGA
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Siti Rahmawati (Warga)</p>
                <p className="text-xs text-gray-600 mt-1 font-mono">warga@naraga.id</p>
                <p className="text-xs text-gray-500 font-mono">Password: warga123</p>
              </div>
              <p className="text-xs text-gray-600">
                Fitur utama: Mengisi asesmen mandiri, lihat gap kesiapan, tanya asisten AI.
              </p>
              <Link
                href="/login?email=warga@naraga.id"
                className="inline-block text-xs font-semibold text-emerald-700 hover:text-emerald-900"
              >
                Masuk sebagai Warga &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tiga Pilar Solusi NARAGA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Fitur Inti Platform NARAGA</h2>
          <p className="text-sm text-gray-600 max-w-xl mx-auto">
            Dirancang secara rule-based dan terstruktur untuk menjawab tantangan kesiapsiagaan di tingkat komunitas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Asesmen & Readiness Gap</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Instrumen evaluasi dengan opsi <strong>Ya / Tidak / Tidak Tahu</strong>. Mendeteksi secara jelas kesenjangan sarana fisik (jawaban <em>Tidak</em>) vs kesenjangan sosialisasi warga (jawaban <em>Tidak Tahu</em>).
            </p>
            <Link href="/assessment" className="text-xs font-semibold text-emerald-600 hover:underline inline-flex items-center gap-1">
              Buka Asesmen <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Peta Evakuasi Lingkungan</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Visualisasi titik kumpul aman (assembly point), posko darurat, dan jalur evakuasi berbasis OpenStreetMap & Leaflet yang dikelola oleh Pengurus Lingkungan.
            </p>
            <Link href="/map" className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1">
              Lihat Peta <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Context-Aware AI Assistant</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Asisten AI terintegrasi Gemini API yang secara otomatis menerima injeksi konteks data kesenjangan kesiapsiagaan lingkungan pengguna, memberikan rekomendasi mitigasi yang realistis.
            </p>
            <Link href="/ai" className="text-xs font-semibold text-purple-600 hover:underline inline-flex items-center gap-1">
              Mulai Konsultasi AI <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
