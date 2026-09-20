"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowRight,
  AlertCircle,
  X,
} from "lucide-react";
import AssessmentResultView from "./AssessmentResultView";

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

interface CompletedResultData {
  score: number;
  displayDate: string;
  displayLocation: string;
  statusTitle: string;
  statusDesc: string;
  gapItems: string[];
  metItems: string[];
}

export default function AssessmentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect ke login jika unauthenticated, dan alihkan Admin ke /admin
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/assessment");
    } else if (status === "authenticated" && (session?.user as any)?.role === "ADMIN") {
      router.push("/admin");
    }
  }, [status, session, router]);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState("");
  const [answers, setAnswers] = useState<Record<string, "YA" | "TIDAK" | "TIDAK_TAHU">>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Tampilan hasil riwayat vs formulir
  const [completedResult, setCompletedResult] = useState<CompletedResultData | null>(null);
  const [showForm, setShowForm] = useState(false);

  // State validasi wajib mengisi soal
  const [validationError, setValidationError] = useState<string | null>(null);
  const [attemptedAction, setAttemptedAction] = useState(false);

  // State pagination: 10 soal per halaman (3 halaman untuk 30 soal)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  useEffect(() => {
    async function fetchData() {
      try {
        const userRole = (session?.user as any)?.role || "WARGA";
        const [qRes, cRes, hRes] = await Promise.all([
          fetch(`/api/assessments/questions?role=${encodeURIComponent(userRole)}`),
          fetch("/api/communities"),
          fetch("/api/assessments/history"),
        ]);
        const qData = await qRes.json();
        const cData = await cRes.json();
        const hData = await hRes.json();

        setQuestions(qData.questions || []);
        setCommunities(cData.communities || []);

        const userCommId = (session?.user as any)?.communityId;
        if (userCommId) {
          setSelectedCommunity(userCommId);
        } else if (cData.communities?.length > 0) {
          setSelectedCommunity(cData.communities[0].id);
        }

        // Cek parameter URL apakah user meminta untuk retake / kerjakan lagi
        const urlParams =
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search)
            : null;
        const isRetakeRequested = urlParams?.get("retake") === "true";

        if (isRetakeRequested) {
          setCompletedResult(null);
          setShowForm(true);
        } else if (hData.sessions && hData.sessions.length > 0) {
          const latest = hData.sessions[0];
          const dateObj = latest.completedAt ? new Date(latest.completedAt) : new Date();
          const displayDate = dateObj.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });
          const displayLocation =
            latest.community?.kelurahan ||
            latest.community?.name ||
            (session?.user as any)?.communityName ||
            "Karanganyar Gunung";
          const roundedScore = Math.round(latest.score);

          let statusTitle = "Cukup Siap";
          let statusDesc =
            "Beberapa aspek sudah terpenuhi, namun masih ada yang perlu diperbaiki.";
          if (roundedScore >= 80) {
            statusTitle = "Sangat Siap";
            statusDesc =
              "Sebagian besar aspek kesiapsiagaan lingkungan telah terpenuhi dengan sangat baik.";
          } else if (roundedScore < 60) {
            statusTitle = "Kurang Siap";
            statusDesc =
              "Perlu perhatian intensif untuk sarana evakuasi dan sosialisasi keselamatan warga.";
          }

          const dbGaps = (latest.answers || [])
            .filter((a: any) => a.answer === "TIDAK" || a.answer === "TIDAK_TAHU")
            .map((a: any) => a.question?.question || "Aspek kesiapsiagaan belum terpenuhi");

          const dbMets = (latest.answers || [])
            .filter((a: any) => a.answer === "YA")
            .map((a: any) => a.question?.question || "Aspek kesiapsiagaan telah terpenuhi");

          setCompletedResult({
            score: roundedScore,
            displayDate,
            displayLocation,
            statusTitle,
            statusDesc,
            gapItems:
              dbGaps.length > 0
                ? dbGaps
                : [
                    "Jalur evakuasi belum diketahui",
                    "Titik kumpul darurat belum terpasang rambu",
                    "Nomor kontak darurat belum tersosialisasi",
                  ],
            metItems:
              dbMets.length > 0
                ? dbMets
                : [
                    "Mengetahui lokasi titik kumpul",
                    "Tersedia posko evakuasi lingkungan",
                    "Ada pengurus siaga bencana",
                  ],
          });

          // Langsung tampilkan hasil asesmen milik akun ini
          setShowForm(false);
        } else {
          // Akun pengguna belum pernah tes -> Tampilkan formulir tes baru langsung!
          setCompletedResult(null);
          setShowForm(true);
        }
      } catch (err) {
        console.error("Gagal memuat data asesmen", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [session]);

  const handleSelectAnswer = (
    questionId: string,
    value: "YA" | "TIDAK" | "TIDAK_TAHU"
  ) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setValidationError(null);

    // Auto-scroll mulus ke pertanyaan berikutnya saat memilih jawaban
    const currentIdx = currentQuestions.findIndex((q) => q.id === questionId);
    if (currentIdx !== -1) {
      if (currentIdx < currentQuestions.length - 1) {
        const nextQuestion = currentQuestions[currentIdx + 1];
        setTimeout(() => {
          const nextEl = document.getElementById(`question-${nextQuestion.id}`);
          if (nextEl) {
            nextEl.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 160);
      } else {
        // Soal terakhir di halaman aktif, scroll ke action bar navigasi
        setTimeout(() => {
          const actionBar = document.getElementById("assessment-action-bar");
          if (actionBar) {
            actionBar.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 180);
      }
    }
  };

  const totalQuestions = questions.length || 30;
  const answeredCount = Object.keys(answers).length;
  const totalPages = Math.max(1, Math.ceil(totalQuestions / pageSize));

  // Range soal untuk halaman aktif
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalQuestions);
  const currentQuestions = questions.slice(startIndex, endIndex);

  // Pindah halaman berikutnya dengan validasi wajib isi
  const handleNextPage = () => {
    const unansweredOnPage = currentQuestions.filter((q) => !answers[q.id]);
    if (unansweredOnPage.length > 0) {
      setValidationError(
        `Wajib menjawab seluruh pertanyaan pada halaman ini! Masih ada ${unansweredOnPage.length} soal yang belum dijawab.`
      );
      setAttemptedAction(true);
      const firstUnanswered = unansweredOnPage[0];
      const el = document.getElementById(`question-${firstUnanswered.id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setValidationError(null);
    setAttemptedAction(false);
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handlePrevPage = () => {
    setValidationError(null);
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      router.push("/dashboard");
    }
  };

  // Submit asesmen dengan validasi wajib isi semua soal
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!selectedCommunity) {
      alert("Silakan tentukan lingkungan tempat tinggal terlebih dahulu di Dashboard.");
      return;
    }

    // Validasi WAJIB mengisi semua pertanyaan (total 30 soal)
    const unansweredTotal = questions.filter((q) => !answers[q.id]);
    if (unansweredTotal.length > 0) {
      const firstUnanswered = unansweredTotal[0];
      const qIndex = questions.findIndex((q) => q.id === firstUnanswered.id);
      const targetPage = Math.floor(qIndex / pageSize) + 1;

      setAttemptedAction(true);
      setValidationError(
        `Wajib mengisi seluruh pertanyaan! Masih ada ${unansweredTotal.length} pertanyaan yang belum Anda jawab.`
      );

      if (targetPage !== currentPage) {
        setCurrentPage(targetPage);
      }

      setTimeout(() => {
        const el = document.getElementById(`question-${firstUnanswered.id}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 150);
      return;
    }

    setSubmitting(true);
    setValidationError(null);

    try {
      const formattedAnswers = questions.map((q) => ({
        questionId: q.id,
        answer: answers[q.id],
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
        const evaluation = data.evaluation;
        const roundedScore = Math.round(evaluation.score);
        let statusTitle = "Cukup Siap";
        let statusDesc =
          "Beberapa aspek sudah terpenuhi, namun masih ada yang perlu diperbaiki.";
        if (roundedScore >= 80) {
          statusTitle = "Sangat Siap";
          statusDesc =
            "Sebagian besar aspek kesiapsiagaan lingkungan telah terpenuhi dengan sangat baik.";
        } else if (roundedScore < 60) {
          statusTitle = "Kurang Siap";
          statusDesc =
            "Perlu perhatian intensif untuk sarana evakuasi dan sosialisasi keselamatan warga.";
        }

        const gapList: string[] = [
          ...(evaluation.facilityGaps || []).map((g: any) => g.question),
          ...(evaluation.awarenessGaps || []).map((g: any) => g.question),
        ];
        const metList: string[] = (evaluation.metIndicators || []).map(
          (m: any) => m.question
        );

        const now = new Date();
        const displayDate = now.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });

        setCompletedResult({
          score: roundedScore,
          displayDate,
          displayLocation: data.communityName || "Karanganyar Gunung",
          statusTitle,
          statusDesc,
          gapItems: gapList,
          metItems: metList,
        });

        setShowForm(false);
        if (typeof window !== "undefined") {
          window.history.pushState(null, "", "/assessment?view=result");
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

  // Mulai mengisi ulang asesmen (Kerjakan Lagi)
  const handleRetakeAssessment = () => {
    setShowForm(true);
    setAnswers({});
    setCurrentPage(1);
    setValidationError(null);
    setAttemptedAction(false);
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/assessment?retake=true");
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
  // JIKA SUDAH MENGERJAKAN SOAL: TAMPILAN PERSIS SEPERTI DI RIWAYAT
  // DENGAN ANIMASI HITUNG DATA & CARD EMERGE
  // =========================================================================
  if (!showForm && completedResult) {
    return (
      <AssessmentResultView
        data={completedResult}
        onRetake={handleRetakeAssessment}
      />
    );
  }

  // =========================================================================
  // TAMPILAN FORMULIR ASESMEN DENGAN PAGINASI (10 SOAL PER HALAMAN - TOTAL 30 SOAL)
  // DILENGKAPI DENGAN VALIDASI WAJIB MENGISI SOAL
  // =========================================================================
  const isLastPage = currentPage === totalPages;

  return (
    <div className="min-h-screen bg-[#ebf4fa] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 1. Header Halaman */}
        <div className="text-center space-y-2.5 mb-6 animate-emerge">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-[#0e6f68] text-xs font-bold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#0e6f68] animate-pulse" />
            <span>
              {(session?.user as any)?.role === "PENGURUS"
                ? "Asesmen Pengurus: Tata Kelola & Fasilitas Wilayah"
                : (session?.user as any)?.role === "ADMIN"
                ? "Asesmen Administrator: Evaluasi Lengkap"
                : "Asesmen Warga: Kesiapsiagaan Mandiri Keluarga"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-[32px] font-extrabold text-gray-900 tracking-tight leading-snug">
            Mari Kenali Kesiapan Lingkunganmu
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-xl mx-auto font-normal leading-relaxed">
            {(session?.user as any)?.role === "PENGURUS"
              ? `Evaluasi tata kelola RT/RW, kesiapan sarana logistik, dan fasilitas umum (${questions.length} butir pertanyaan).`
              : `Evaluasi kesiapsiagaan mandiri keluarga, hunian, dan pemahaman evakuasi (${questions.length} butir pertanyaan).`}
          </p>
        </div>

        {/* Notifikasi Validasi Wajib Isi */}
        {validationError && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-start gap-3 text-xs sm:text-sm shadow-xs animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Pertanyaan Wajib Diisi!</p>
              <p className="font-normal text-rose-700 mt-0.5">{validationError}</p>
            </div>
            <button
              onClick={() => setValidationError(null)}
              className="text-rose-500 hover:text-rose-800 p-1 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 2. Widget Progres Pengisian (Sesuai Desain Figma) */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-gray-100 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#0e6f68]">Progres Pengisian</span>
              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200/80 px-2 py-0.5 rounded-full">
                Wajib Diisi Semua
              </span>
            </div>
            <span className="font-bold text-gray-900">
              {answeredCount}/{totalQuestions} Soal
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0e6f68] rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(
                  100,
                  Math.round((answeredCount / totalQuestions) * 100)
                )}%`,
              }}
            />
          </div>
        </div>

        {/* 3. Daftar 10 Kartu Pertanyaan untuk Halaman Aktif */}
        <div className="space-y-4">
          {currentQuestions.map((q, idx) => {
            const currentAns = answers[q.id];
            const questionIndex = startIndex + idx + 1;
            const isUnanswered = !currentAns;
            const isErrorTarget = attemptedAction && isUnanswered;

            return (
              <div
                key={q.id}
                id={`question-${q.id}`}
                style={{ animationDelay: `${idx * 55 + 50}ms` }}
                className={`bg-white rounded-2xl p-5 sm:p-6 shadow-xs border transition-all space-y-3.5 animate-emerge ${
                  isErrorTarget
                    ? "border-rose-300 ring-2 ring-rose-100 bg-rose-50/10"
                    : "border-gray-100"
                }`}
              >
                {/* Badge Nomor Pertanyaan + Label Wajib */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold tracking-wider text-[#0e6f68] bg-[#e6f7f2] px-2.5 py-1 rounded-md inline-block uppercase">
                      PERTANYAAN {String(questionIndex).padStart(2, "0")} / {totalQuestions}
                    </span>
                    <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                      * Wajib
                    </span>
                  </div>
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
                            ? "border-[#0e6f68] bg-teal-50/30 text-gray-900 shadow-2xs font-semibold"
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

                {/* Peringatan jika belum dijawab saat lanjut */}
                {isErrorTarget && (
                  <p className="text-xs font-semibold text-rose-600 flex items-center gap-1.5 pt-0.5 animate-in fade-in">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Pertanyaan ini wajib dijawab</span>
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* 4. Navigasi Bawah & Konfirmasi Submit */}
        {isLastPage ? (
          /* Halaman Terakhir (Halaman 3: Soal 21-30) */
          <div id="assessment-action-bar" className="space-y-6 pt-4 pb-12">
            {/* Box Konfirmasi Selesai */}
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 text-center space-y-3">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">
                Sudah selesai menjawab?
              </h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                {answeredCount === totalQuestions
                  ? "Seluruh 30 pertanyaan telah terjawab lengkap! Klik tombol di bawah untuk melihat hasil evaluasi kesiapan lingkungan Anda."
                  : `Anda baru menjawab ${answeredCount} dari ${totalQuestions} pertanyaan. Seluruh 30 soal wajib diisi sebelum Anda dapat melihat hasil evaluasi.`}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={submitting}
                  className={`inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-xs cursor-pointer ${
                    answeredCount === totalQuestions
                      ? "bg-[#0e6f68] hover:bg-[#0a524d] text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
                  }`}
                >
                  <span>
                    {submitting
                      ? "Menganalisis Jawaban..."
                      : answeredCount === totalQuestions
                      ? "Lihat Hasil Assessment"
                      : `Lengkapi Pertanyaan (${answeredCount}/${totalQuestions})`}
                  </span>
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
          <div id="assessment-action-bar" className="pt-4 pb-12 flex items-center justify-between gap-4">
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
