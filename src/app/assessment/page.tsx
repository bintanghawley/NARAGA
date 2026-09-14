"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Activity,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Bot,
  Building2,
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
  const { data: session, status } = useSession();
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState("");
  const [answers, setAnswers] = useState<Record<string, "YA" | "TIDAK" | "TIDAK_TAHU">>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommunity) {
      alert("Silakan pilih lingkungan terlebih dahulu.");
      return;
    }

    const unAnswered = questions.filter((q) => !answers[q.id]);
    if (unAnswered.length > 0) {
      const confirmSubmit = confirm(
        `Masih ada ${unAnswered.length} pertanyaan yang belum dijawab. Pertanyaan yang belum dijawab akan otomatis dianggap "Tidak Tahu". Lanjutkan?`
      );
      if (!confirmSubmit) return;
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
        setSessionId(data.sessionId);
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
      <div className="max-w-4xl mx-auto py-20 text-center space-y-3">
        <Activity className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
        <p className="text-sm text-gray-500">Memuat instrumen asesmen kesiapsiagaan...</p>
      </div>
    );
  }

  // JIKA HASIL SUDAH TERBIT: TAMPILKAN RINGKASAN SKOR & GAP
  if (result) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header Hasil Evaluasi */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <span className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-100 text-emerald-800">
                Hasil Evaluasi Asesmen Mandiri
              </span>
              <h1 className="text-2xl font-black text-gray-900 mt-2">
                Laporan Kesiapsiagaan Lingkungan
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Diproses secara rule-based berdasarkan indikator Perka BNPB Destana
              </p>
            </div>
            <button
              onClick={() => {
                setResult(null);
                setAnswers({});
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Ulangi Asesmen
            </button>
          </div>

          {/* 3 Metrik Skor */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Readiness Score */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-5 space-y-2">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                Readiness Score
              </span>
              <div className="text-4xl font-black text-emerald-700">{result.score}%</div>
              <p className="text-xs text-emerald-900">
                {result.metCount} dari {result.totalQuestions} indikator kesiapsiagaan terpenuhi.
              </p>
            </div>

            {/* Facility Gap */}
            <div className="rounded-xl border border-red-200 bg-red-50/60 p-5 space-y-2">
              <span className="text-xs font-bold text-red-800 uppercase tracking-wide">
                Kesenjangan Fasilitas (Tidak)
              </span>
              <div className="text-4xl font-black text-red-700">{result.facilityGapCount}</div>
              <p className="text-xs text-red-900">
                Kebutuhan fisik yang belum tersedia di pemukiman.
              </p>
            </div>

            {/* Awareness Gap */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-5 space-y-2">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">
                Kesenjangan Sosialisasi (Tidak Tahu)
              </span>
              <div className="text-4xl font-black text-amber-700">{result.awarenessGapCount}</div>
              <p className="text-xs text-amber-900">
                Aspek keselamatan yang belum dipahami secara merata oleh warga.
              </p>
            </div>
          </div>

          {/* CTA Diskusi dengan Context-Aware AI */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Bot className="w-6 h-6 text-purple-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-purple-950">
                  Konsultasikan Hasil Ini dengan Context-Aware AI
                </p>
                <p className="text-xs text-purple-700">
                  Asisten cerdas Gemini siap memberikan langkah penanganan mitigasi berdasarkan gap yang baru saja terdeteksi.
                </p>
              </div>
            </div>
            <Link
              href={`/ai?sessionId=${sessionId}`}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 whitespace-nowrap shadow-sm"
            >
              Diskusi dengan AI <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Daftar Rencana Aksi (Action Plan) */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Rekomendasi Rencana Tindak Lanjut (Action Plan)
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Daftar aksi konkrit yang disarankan untuk ditindaklanjuti oleh pengurus RT/RW dan warga:
            </p>
          </div>

          <div className="space-y-3">
            {result.actionPlan.map((plan, idx) => (
              <div
                key={plan.id}
                className="p-4 rounded-xl border border-gray-200 bg-gray-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        plan.gapType === "FACILITY_GAP"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {plan.gapType === "FACILITY_GAP" ? "Kebutuhan Fisik" : "Kebutuhan Sosialisasi"}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-200 text-gray-700 rounded">
                      Prioritas {plan.priority}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      Sasaran: {plan.targetRole}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">{plan.title}</h3>
                  <p className="text-xs text-gray-600">{plan.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // TAMPILAN FORMULIR ASESMEN
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Formulir */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">
              Asesmen Kesiapsiagaan Lingkungan
            </h1>
            <p className="text-xs text-gray-500">
              Jawab secara jujur dengan opsi Ya / Tidak / Tidak Tahu untuk mengukur kondisi nyata pemukiman Anda.
            </p>
          </div>
        </div>

        {/* Pemilihan Komunitas Target */}
        <div className="pt-3 border-t border-gray-100">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Pilih Lingkungan Pemukiman yang Dievaluasi:
          </label>
          <select
            value={selectedCommunity}
            onChange={(e) => setSelectedCommunity(e.target.value)}
            className="w-full sm:w-80 bg-white border border-gray-300 text-sm rounded-xl px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            {communities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Daftar Pertanyaan */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {questions.map((q, idx) => {
          const currentAns = answers[q.id];

          return (
            <div
              key={q.id}
              className={`p-5 rounded-2xl border transition bg-white shadow-sm space-y-3 ${
                currentAns ? "border-emerald-200" : "border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                    Indikator {idx + 1} &bull; {q.category}
                  </span>
                  <p className="text-sm font-semibold text-gray-900">{q.question}</p>
                </div>
              </div>

              {/* 3 Opsi Jawaban Terstruktur */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleSelectAnswer(q.id, "YA")}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition ${
                    currentAns === "YA"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-emerald-50 hover:text-emerald-700"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ya (Tersedia)
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectAnswer(q.id, "TIDAK")}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition ${
                    currentAns === "TIDAK"
                      ? "bg-red-600 text-white border-red-600 shadow-sm"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-red-50 hover:text-red-700"
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5" /> Tidak (Belum Ada)
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectAnswer(q.id, "TIDAK_TAHU")}
                  className={`py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition ${
                    currentAns === "TIDAK_TAHU"
                      ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                      : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-amber-50 hover:text-amber-700"
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" /> Tidak Tahu
                </button>
              </div>
            </div>
          );
        })}

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-2"
          >
            {submitting ? "Menganalisis Jawaban..." : "Kirim & Hitung Readiness Gap"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
