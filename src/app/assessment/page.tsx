"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ArrowLeft,
  Shield,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Check,
  RotateCcw,
} from "lucide-react";
import { AssessmentResult } from "@/types";

interface Question {
  id: string;
  question: string;
  category: string;
  order: number;
}

interface Community {
  id: string;
  name: string;
}

export default function AssessmentPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState("");
  const [answers, setAnswers] = useState<Record<string, "YA" | "TIDAK" | "TIDAK_TAHU">>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  // State pagination: 10 soal per halaman (3 halaman untuk 30 soal)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  useEffect(() => {
    async function fetchData() {
      try {
        const [qRes, cRes] = await Promise.all([
          fetch("/api/assessments/questions"),
          fetch("/api/communities"),
        ]);
        const qData = await qRes.json();
        const cData = await cRes.json();

        setQuestions(qData.questions || []);
        setCommunities(cData.communities || []);

        const userCommId = (session?.user as any)?.communityId;
        if (userCommId) {
          setSelectedCommunity(userCommId);
        } else if (cData.communities?.length > 0) {
          setSelectedCommunity(cData.communities[0].id);
        }

        // Cek apakah ada parameter URL ?view=result
        if (typeof window !== "undefined") {
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get("view") === "result") {
            const hRes = await fetch("/api/assessments/history");
            const hData = await hRes.json();
            if (hData.sessions && hData.sessions.length > 0) {
              const latest = hData.sessions[0];
              const parsedActionPlan = latest.actionPlanJson
                ? JSON.parse(latest.actionPlanJson)
                : [];
              setResult({
                score: latest.score,
                totalQuestions: latest.totalQuestions,
                metCount: latest.metCount,
                facilityGapCount: latest.facilityGapCount,
                awarenessGapCount: latest.awarenessGapCount,
                metIndicators: [],
                facilityGaps: [],
                awarenessGaps: [],
                actionPlan: parsedActionPlan,
              });
            }
          }
        }
      } catch (err) {
        console.error("Gagal memuat data asesmen", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [session]);

  const handleSelectAnswer = (questionId: string, value: "YA" | "TIDAK" | "TIDAK_TAHU") => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const totalQuestions = questions.length || 30;
  const answeredCount = Object.keys(answers).length;
  const totalPages = Math.max(1, Math.ceil(totalQuestions / pageSize));

  // Range soal untuk halaman aktif
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalQuestions);
  const currentQuestions = questions.slice(startIndex, endIndex);


  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      router.push("/dashboard");
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!selectedCommunity) {
      alert("Silakan tentukan lingkungan tempat tinggal terlebih dahulu di Dashboard.");
      return;
    }

    setSubmitting(true);

    try {
      const formattedAnswers = questions.map((q) => ({
        questionId: q.id,
        answer: answers[q.id] || "TIDAK_TAHU",
      }));

      const res = await fetch("/api/assessments/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          communityId: selectedCommunity,
          answers: formattedAnswers,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setResult(data.evaluation);
        if (typeof window !== "undefined") {
          window.history.pushState(null, "", "/assessment?view=result");
          window.dispatchEvent(new Event("popstate"));
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        alert(data.error || "Gagal memproses asesmen");
      }
    } catch (err) {
      alert("Terjadi kendala jaringan saat mengirim jawaban");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetakeAssessment = () => {
    setResult(null);
    setAnswers({});
    setCurrentPage(1);
    setCompletedTasks([]);
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/assessment");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ebf4fa] flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <Activity className="w-8 h-8 animate-spin text-[#0e6f68] mx-auto" />
          <p className="text-sm font-medium text-gray-600">
            Memuat instrumen kesiapsiagaan lingkungan (30 Pertanyaan)...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // JIKA HASIL SUDAH TERBIT: TAMPILAN "HASIL KESIAPANMU" (PERHITUNGAN NILAI 100% AKURAT)
  // =========================================================================
  if (result) {
    // Perhitungan nilai matematis yang sebenarnya tanpa fallback mock palsu
    const scoreVal = typeof result.score === "number" ? Math.round(result.score) : 0;
    const metVal = typeof result.metCount === "number" ? result.metCount : 0;
    const facilityGapVal = typeof result.facilityGapCount === "number" ? result.facilityGapCount : 0;
    const awarenessGapVal = typeof result.awarenessGapCount === "number" ? result.awarenessGapCount : 0;
    const totalQVal = result.totalQuestions || questions.length || 30;

    return (
      <div className="min-h-screen bg-[#ebf4fa] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-10">
          {/* 1. Header Halaman */}
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0e1d2c] tracking-tight">
              Hasil Kesiapanmu
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 max-w-xl mx-auto font-normal leading-relaxed">
              Evaluasi kesiapsiagaan lingkungan Anda berdasarkan {totalQVal} indikator standar ketahanan komunitas.
            </p>
          </div>

          {/* 2. Top Summary Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Kesiapsiagaan lingkungan */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[300px]">
              <div className="flex items-center gap-2 text-gray-900 font-bold text-xs sm:text-sm">
                <Shield className="w-4 h-4 text-[#0e6f68]" />
                <span>Kesiapsiagaan Lingkungan</span>
              </div>

              {/* Donut Circle Gauge Oranye */}
              <div className="my-6 flex items-center justify-center">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="#dbe7f2"
                      strokeWidth="10"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke={scoreVal >= 75 ? "#0e6f68" : scoreVal >= 50 ? "#f5840d" : "#ef4444"}
                      strokeWidth="10"
                      strokeDasharray={251.2}
                      strokeDashoffset={251.2 * (1 - scoreVal / 100)}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[11px] font-medium text-gray-500">Skor</span>
                    <span className="text-2xl font-black text-gray-900">
                      {scoreVal}%
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-2xl font-extrabold text-gray-900 tracking-tight">
                  {scoreVal >= 80
                    ? "Sangat Siap"
                    : scoreVal >= 50
                    ? "Cukup Siap"
                    : "Kurang Siap"}
                </p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {scoreVal >= 80
                    ? "Mayoritas sarana dan protokol keselamatan telah siap siaga."
                    : scoreVal >= 50
                    ? "Beberapa aspek terpenuhi, namun masih ada kesenjangan fasilitas atau pemahaman."
                    : "Diperlukan tindakan segera untuk melengkapi fasilitas dan sosialisasi rute evakuasi."}
                </p>
              </div>
            </div>

            {/* Card 2: Kesenjangan Fasilitas (Tidak) */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[300px]">
              <div className="flex items-center gap-2 text-gray-900 font-bold text-xs sm:text-sm">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Kesenjangan Fasilitas</span>
              </div>

              {/* Big Red Number */}
              <div className="my-6 pl-2">
                <span className="text-5xl sm:text-6xl font-black text-red-600 tracking-tight">
                  {facilityGapVal}
                </span>
                <span className="text-xs text-gray-400 ml-2 font-medium">/ {totalQVal} soal</span>
              </div>

              <div>
                <p className="text-2xl font-extrabold text-gray-900 tracking-tight">
                  Belum Tersedia
                </p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Sarana keselamatan fisik yang belum ada di lingkungan dan perlu segera diadakan.
                </p>
              </div>
            </div>

            {/* Card 3: Kesiapsiagaan Terpenuhi (Ya) */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[300px]">
              <div className="flex items-center gap-2 text-gray-900 font-bold text-xs sm:text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Kesiapsiagaan Terpenuhi</span>
              </div>

              {/* Big Green Number */}
              <div className="my-6 pl-2">
                <span className="text-5xl sm:text-6xl font-black text-emerald-600 tracking-tight">
                  {metVal}
                </span>
                <span className="text-xs text-gray-400 ml-2 font-medium">/ {totalQVal} soal</span>
              </div>

              <div>
                <p className="text-2xl font-extrabold text-gray-900 tracking-tight">
                  Sudah Terpenuhi
                </p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Indikator keselamatan penting yang telah terkonfirmasi siap di komunitas.
                </p>
              </div>
            </div>
          </div>

          {/* 2.1 Mini Banner: Kesenjangan Pemahaman jika ada */}
          {awarenessGapVal > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm">
                <p className="font-bold text-amber-900">
                  {awarenessGapVal} Indikator Memerlukan Sosialisasi Warga
                </p>
                <p className="text-amber-700 mt-0.5">
                  Anda menjawab &quot;Tidak tahu&quot; pada {awarenessGapVal} pertanyaan. Ini menandakan perlunya keterbukaan informasi, penyebaran peta jalur evakuasi, atau sosialisasi pengurus RT/RW kepada warga.
                </p>
              </div>
            </div>
          )}

          {/* 3. Seksi Action Plan */}
          <div className="space-y-4">
            <div className="space-y-0.5">
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Rencana Aksi Prioritas (Action Plan)
              </h2>
              <p className="text-xs text-gray-500">
                Dihasilkan secara otomatis oleh sistem berdasarkan {facilityGapVal + awarenessGapVal} kesenjangan yang terdeteksi
              </p>
            </div>

            {/* Large White Container Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 divide-y divide-gray-100">
              {result.actionPlan && result.actionPlan.length > 0 ? (
                result.actionPlan.map((plan, idx) => {
                  const isDone = completedTasks.includes(plan.id);
                  return (
                    <div
                      key={plan.id}
                      className={`${idx === 0 ? "pb-6" : "py-6"} space-y-2.5`}
                    >
                      {/* Baris 1: Circle Icon + Judul + Badge Prioritas */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={() => toggleTask(plan.id)}
                            className={`w-4 h-4 rounded-full border flex-shrink-0 mt-1 flex items-center justify-center transition cursor-pointer ${
                              isDone
                                ? "border-[#0e6f68] bg-[#0e6f68] text-white"
                                : "border-gray-300 hover:border-gray-400 bg-white"
                            }`}
                          >
                            {isDone && <Check className="w-2.5 h-2.5 text-white" />}
                          </button>
                          <h3
                            className={`text-sm sm:text-base font-bold text-gray-900 leading-snug ${
                              isDone ? "line-through text-gray-400" : ""
                            }`}
                          >
                            {plan.title}
                          </h3>
                        </div>

                        {/* Priority Badge */}
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md flex-shrink-0 ${
                            plan.priority === "HIGH"
                              ? "bg-[#fee2e2] text-[#dc2626]"
                              : plan.priority === "LOW"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {plan.priority === "HIGH" ? "Tinggi" : plan.priority === "LOW" ? "Rendah" : "Sedang"}
                        </span>
                      </div>

                      {/* Deskripsi */}
                      <p className="text-xs text-gray-500 pl-7 leading-relaxed font-normal">
                        {plan.description}
                      </p>

                      {/* Tombol Aksi: Tandai sebagai selesai */}
                      <div className="pl-7 pt-1">
                        <button
                          type="button"
                          onClick={() => toggleTask(plan.id)}
                          className={`border text-xs font-semibold px-4 py-1.5 rounded-lg transition cursor-pointer ${
                            isDone
                              ? "border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200"
                              : "border-[#0e6f68] text-[#0e6f68] hover:bg-teal-50"
                          }`}
                        >
                          {isDone ? "Tandai belum selesai" : "Tandai sebagai selesai"}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500 space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <p className="font-bold text-gray-800">Semua Indikator Terpenuhi!</p>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Selamat! Lingkungan Anda memiliki kesiapan tinggi terhadap ancaman bencana. Pertahankan kesiapsiagaan ini melalui simulasi berkala.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 4. Tombol Bawah */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 pb-12">
            <button
              type="button"
              onClick={handleRetakeAssessment}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs sm:text-sm shadow-xs transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Ulangi Asesmen</span>
            </button>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[#0e6f68] hover:bg-[#0a524d] text-white font-semibold text-xs sm:text-sm shadow-xs transition"
            >
              <span>Kembali ke Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // TAMPILAN FORMULIR ASESMEN DENGAN PAGINASI (10 SOAL PER HALAMAN - TOTAL 30 SOAL)
  // =========================================================================
  const isLastPage = currentPage === totalPages;
  const isFirstPage = currentPage === 1;

  return (
    <div className="min-h-screen bg-[#ebf4fa] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 1. Header Halaman */}
        <div className="text-center space-y-2 mb-6">
          <h1 className="text-2xl sm:text-[32px] font-extrabold text-gray-900 tracking-tight leading-snug">
            Mari Kenali Kesiapan Lingkunganmu
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-xl mx-auto font-normal leading-relaxed">
            Evaluasi menyeluruh 30 pertanyaan terstandar. Jawab berdasarkan kondisi lingkunganmu saat ini.
          </p>
        </div>

        {/* 2. Widget Progres Pengisian (Sesuai Desain Figma) */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-gray-100 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#0e6f68]">Progres Pengisian</span>
            <span className="font-bold text-gray-900">
              {answeredCount}/{totalQuestions}
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0e6f68] rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, Math.round((answeredCount / totalQuestions) * 100))}%`,
              }}
            />
          </div>
        </div>

        {/* 3. Daftar 10 Kartu Pertanyaan untuk Halaman Aktif */}
        <div className="space-y-4">
          {currentQuestions.map((q, idx) => {
            const currentAns = answers[q.id];
            const questionIndex = startIndex + idx + 1;

            return (
              <div
                key={q.id}
                id={`question-${q.id}`}
                className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-gray-100 space-y-3.5 transition-all"
              >
                {/* Badge Nomor Pertanyaan */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold tracking-wider text-[#0e6f68] bg-[#e6f7f2] px-2.5 py-1 rounded-md inline-block uppercase">
                    PERTANYAAN {String(questionIndex).padStart(2, "0")} / {totalQuestions}
                  </span>
                  <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                    {q.category.replace(/_/g, " ")}
                  </span>
                </div>

                {/* Teks Pertanyaan */}
                <h3 className="text-sm sm:text-[15px] font-bold text-gray-900 leading-snug">
                  {q.question}
                </h3>

                {/* 3 Opsi Pilihan (Ya / Tidak / Tidak tahu) */}
                <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 pt-1">
                  {[
                    { value: "YA", label: "Ya" },
                    { value: "TIDAK", label: "Tidak" },
                    { value: "TIDAK_TAHU", label: "Tidak tahu" },
                  ].map((opt) => {
                    const isSelected = currentAns === opt.value;

                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSelectAnswer(q.id, opt.value as any)}
                        className={`flex items-center gap-2 sm:gap-3 px-3.5 py-3 rounded-xl border text-xs sm:text-sm font-medium transition cursor-pointer text-left ${
                          isSelected
                            ? "border-[#0e6f68] bg-teal-50/20 text-gray-900 shadow-2xs"
                            : "border-gray-200 bg-white hover:border-gray-300 text-gray-800"
                        }`}
                      >
                        {/* Custom Radio Button Circle */}
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                            isSelected
                              ? "border-2 border-[#0e6f68]"
                              : "border border-gray-300"
                          }`}
                        >
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-[#0e6f68]" />
                          )}
                        </div>
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* 4. Navigasi Bawah & Konfirmasi Submit */}
        {isLastPage ? (
          /* Halaman Terakhir (Halaman 3: Soal 21-30) */
          <div className="space-y-6 pt-4 pb-12">
            {/* Box Konfirmasi Selesai */}
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 text-center space-y-3">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">
                Sudah selesai menjawab?
              </h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                {answeredCount === totalQuestions
                  ? "Seluruh 30 pertanyaan telah terjawab lengkap! Klik tombol di bawah untuk melihat skor kesiapan dan rekomendasi aksi komunitasmu."
                  : `Anda telah menjawab ${answeredCount} dari ${totalQuestions} pertanyaan. Pertanyaan yang belum diisi akan otomatis dicatat sebagai kesenjangan pemahaman (Tidak Tahu).`}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#0e6f68] hover:bg-[#0a524d] text-white font-semibold text-xs sm:text-sm transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <span>{submitting ? "Menganalisis Jawaban..." : "Lihat Hasil Assessment"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tombol Kembali ke Halaman Sebelumnya */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handlePrevPage}
                className="px-8 sm:px-10 py-3 bg-[#b2bcbc] hover:bg-[#9da9a9] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition cursor-pointer"
              >
                Kembali
              </button>
            </div>
          </div>
        ) : (
          /* Halaman 1 & 2: Tombol Navigasi Kembali & Lanjut */
          <div className="pt-4 pb-12 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handlePrevPage}
              className="px-8 sm:px-10 py-3 bg-[#b2bcbc] hover:bg-[#9da9a9] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition cursor-pointer"
            >
              Kembali
            </button>

            <button
              type="button"
              onClick={handleNextPage}
              className="px-8 sm:px-10 py-3 bg-[#0e6f68] hover:bg-[#0a524d] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
            >
              <span>Lanjut</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
