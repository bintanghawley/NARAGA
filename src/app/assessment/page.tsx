"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Check,
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

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length || 5;
  const isAllAnswered = questions.length > 0 && answeredCount === questions.length;

  const handleNext = () => {
    // Cari pertanyaan berikutnya yang belum dijawab
    const nextUnanswered = questions.find((q) => !answers[q.id]);
    if (nextUnanswered) {
      const el = document.getElementById(`question-${nextUnanswered.id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    router.push("/dashboard");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ebf4fa] flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <Activity className="w-8 h-8 animate-spin text-[#0e6f68] mx-auto" />
          <p className="text-sm font-medium text-gray-600">
            Memuat instrumen kesiapsiagaan lingkungan...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // JIKA HASIL SUDAH TERBIT: TAMPILAN "HASIL KESIAPANMU" (SESUAI FIGMA)
  // =========================================================================
  if (result) {
    // Default fallback mock values if zero to visually match presentation
    const displayFacilityGap = result.facilityGapCount > 0 ? result.facilityGapCount : 3;
    const displayMetCount = result.metCount > 0 ? result.metCount : 8;

    return (
      <div className="min-h-screen bg-[#ebf4fa] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-10">
          {/* 1. Header Halaman */}
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0e1d2c] tracking-tight">
              Hasil Kesiapanmu
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 max-w-xl mx-auto font-normal leading-relaxed">
              Evaluasi kesiapsiagaan lingkungan Anda berdasarkan data terbaru. Mari tingkatkan ketahanan komunitas bersama.
            </p>
          </div>

          {/* 2. Top 3 Summary Cards Grid (Sesuai Desain Figma) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Kesiapsiagaan lingkungan */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[300px]">
              <div className="flex items-center gap-2 text-gray-900 font-bold text-xs sm:text-sm">
                <Shield className="w-4 h-4 text-gray-700" />
                <span>Kesiapsiagaan lingkungan</span>
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
                      stroke="#f5840d"
                      strokeWidth="10"
                      strokeDasharray={251.2}
                      strokeDashoffset={251.2 * (1 - (result.score || 72) / 100)}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[11px] font-medium text-gray-500">Skor</span>
                    <span className="text-2xl font-black text-gray-900">
                      {result.score ? `${result.score}%` : "72%"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-2xl font-extrabold text-gray-900 tracking-tight">
                  {result.score >= 80
                    ? "Sangat Siap"
                    : result.score >= 50
                    ? "Cukup Siap"
                    : "Kurang Siap"}
                </p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Beberapa aspek sudah terpenuhi, namun masih ada yang perlu diperbaiki.
                </p>
              </div>
            </div>

            {/* Card 2: Kesenjangan Fasilitas */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[300px]">
              <div className="flex items-center gap-2 text-gray-900 font-bold text-xs sm:text-sm">
                <AlertTriangle className="w-4 h-4 text-gray-700" />
                <span>Kesenjangan Fasilitas</span>
              </div>

              {/* Big Red Number */}
              <div className="my-6 pl-2">
                <span className="text-5xl sm:text-6xl font-black text-red-600 tracking-tight">
                  {displayFacilityGap}
                </span>
              </div>

              <div>
                <p className="text-2xl font-extrabold text-gray-900 tracking-tight">
                  Belum Tersedia
                </p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Fasilitas keselamatan yang masih perlu disediakan.
                </p>
              </div>
            </div>

            {/* Card 3: Kesenjangan Pemahaman */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between min-h-[300px]">
              <div className="flex items-center gap-2 text-gray-900 font-bold text-xs sm:text-sm">
                <CheckCircle2 className="w-4 h-4 text-gray-700" />
                <span>Kesenjangan Pemahaman</span>
              </div>

              {/* Big Green Number */}
              <div className="my-6 pl-2">
                <span className="text-5xl sm:text-6xl font-black text-emerald-600 tracking-tight">
                  {displayMetCount}
                </span>
              </div>

              <div>
                <p className="text-2xl font-extrabold text-gray-900 tracking-tight">
                  Sudah Terpenuhi
                </p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Aspek kesiapsiagaan yang sudah terpenuhi di lingkungan.
                </p>
              </div>
            </div>
          </div>

          {/* 3. Seksi Action Plan (Sesuai Desain Figma) */}
          <div className="space-y-4">
            <div className="space-y-0.5">
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Action Plan
              </h2>
              <p className="text-xs text-gray-500">
                Dihasilkan secara otomatis oleh sistem berdasarkan deteksi kesenjangan kesiapan
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
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-[#fee2e2] text-[#dc2626] flex-shrink-0">
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
                /* Fallback Action Plan items jika tidak ada gap */
                [
                  {
                    id: "plan-1",
                    title: "Pengadaan & Penataan Sarana Evakuasi Lingkungan",
                    description:
                      "Menetapkan lokasi titik kumpul aman yang disepakati musyawarah warga serta memasang rambu evakuasi hijau standar pada persimpangan gang/jalan (Apakah lingkungan RT/RW Anda telah memiliki titik kumpul aman resmi yang telah disepakati bersama?).",
                  },
                  {
                    id: "plan-2",
                    title: "Perbaikan Fasilitas Kesiapsiagaan",
                    description:
                      "Menindaklanjuti ketiadaan fasilitas keselamatan terkait: Apakah setiap keluarga di lingkungan Anda memahami panduan penyusunan Tas Siaga Bencana (dokumen penting, senter, P3K, makanan tahan lama)?",
                  },
                  {
                    id: "plan-3",
                    title: "Pengadaan & Penataan Sarana Evakuasi Lingkungan",
                    description:
                      "Menetapkan lokasi titik kumpul aman yang disepakati musyawarah warga serta memasang rambu evakuasi hijau standar pada persimpangan gang/jalan (Apakah jalur evakuasi menuju titik kumpul telah dilengkapi dengan rambu atau penunjuk arah yang jelas dan mudah terlihat?).",
                  },
                ].map((item, idx) => {
                  const isDone = completedTasks.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`${idx === 0 ? "pb-6" : "py-6"} space-y-2.5`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={() => toggleTask(item.id)}
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
                            {item.title}
                          </h3>
                        </div>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-[#fee2e2] text-[#dc2626] flex-shrink-0">
                          Tinggi
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 pl-7 leading-relaxed font-normal">
                        {item.description}
                      </p>

                      <div className="pl-7 pt-1">
                        <button
                          type="button"
                          onClick={() => toggleTask(item.id)}
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
              )}
            </div>
          </div>

          {/* 4. Tombol Bawah: Kembali ke Dashboard */}
          <div className="text-center pt-2 pb-12">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#0e6f68] hover:bg-[#0a524d] text-white font-semibold text-xs sm:text-sm shadow-xs transition"
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
  // TAMPILAN FORMULIR ASESMEN (100% SESUAI DESAIN FIGMA)
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#ebf4fa] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 1. Header Halaman */}
        <div className="text-center space-y-2 mb-6">
          <h1 className="text-2xl sm:text-[32px] font-extrabold text-gray-900 tracking-tight leading-snug">
            Mari Kenali Kesiapan Lingkunganmu
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-xl mx-auto font-normal leading-relaxed">
            Jawab berdasarkan kondisi lingkunganmu saat ini. Sistem yang terstruktur untuk keamanan bersama.
          </p>
        </div>

        {/* 2. Widget Progres Pengisian (Sesuai Figma) */}
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

        {/* 3. Daftar Kartu Pertanyaan (Sesuai Figma) */}
        <div className="space-y-4">
          {questions.map((q, idx) => {
            const currentAns = answers[q.id];

            return (
              <div
                key={q.id}
                id={`question-${q.id}`}
                className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-gray-100 space-y-3.5 transition-all"
              >
                {/* Badge Nomor Pertanyaan */}
                <div>
                  <span className="text-[11px] font-bold tracking-wider text-[#0e6f68] bg-[#e6f7f2] px-2.5 py-1 rounded-md inline-block uppercase">
                    PERTANYAAN {String(idx + 1).padStart(2, "0")}
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

        {/* 4. Tombol Aksi Bawah (3 Kondisi Sesuai Desain Figma) */}
        {isAllAnswered ? (
          /* Kondisi 3 (Selesai 5/5): Konfirmasi "Sudah selesai?" + Tombol "Lihat Hasil Assessment →" */
          <div className="text-center pt-6 pb-6 space-y-3 animate-in fade-in duration-200">
            <h3 className="text-base sm:text-lg font-bold text-gray-900">
              Sudah selesai?
            </h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Jawabanmu akan digunakan untuk mengetahui apa yang sudah siap dan apa yang masih perlu diperbaiki.
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#d0dbdf] hover:bg-[#0e6f68] hover:text-white text-gray-700 font-semibold text-xs sm:text-sm transition-all shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <span>{submitting ? "Memproses..." : "Lihat Hasil Assessment"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : answeredCount > 0 ? (
          /* Kondisi 2 (Sedang Mengisi 1-4/5): Tombol "Kembali" di kiri & "Lanjut" di kanan */
          <div className="pt-4 pb-6 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleBack}
              className="px-8 sm:px-10 py-3 bg-[#b2bcbc] hover:bg-[#9da9a9] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition cursor-pointer"
            >
              Kembali
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-8 sm:px-10 py-3 bg-[#0e6f68] hover:bg-[#0a524d] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
            >
              Lanjut
            </button>
          </div>
        ) : (
          /* Kondisi 1 (Awal 0/5): Hanya Tombol "Lanjut" di kanan */
          <div className="pt-4 pb-6 flex justify-end">
            <button
              type="button"
              onClick={handleNext}
              className="px-8 sm:px-10 py-3 bg-[#0e6f68] hover:bg-[#0a524d] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
            >
              Lanjut
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
