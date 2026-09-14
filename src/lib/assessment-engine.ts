import { AssessmentResult, ActionPlanItem, AssessmentAnswerType, QuestionCategory } from "@/types";

interface QuestionData {
  id: string;
  question: string;
  category: string;
  targetRole: string;
  weight: number;
}

interface SubmittedAnswer {
  questionId: string;
  answer: AssessmentAnswerType | string;
}

export function evaluateAssessment(
  questions: QuestionData[],
  submittedAnswers: SubmittedAnswer[]
): AssessmentResult {
  const answerMap = new Map<string, string>();
  submittedAnswers.forEach((a) => answerMap.set(a.questionId, a.answer));

  const totalQuestions = questions.length;
  let metCount = 0;
  let facilityGapCount = 0;
  let awarenessGapCount = 0;

  const metIndicators: AssessmentResult["metIndicators"] = [];
  const facilityGaps: AssessmentResult["facilityGaps"] = [];
  const awarenessGaps: AssessmentResult["awarenessGaps"] = [];
  const actionPlan: ActionPlanItem[] = [];

  for (const q of questions) {
    const ans = answerMap.get(q.id) || "TIDAK_TAHU";

    if (ans === "YA") {
      metCount++;
      metIndicators.push({
        questionId: q.id,
        question: q.question,
        category: q.category,
      });
    } else if (ans === "TIDAK") {
      facilityGapCount++;
      const actionNeeded = getFacilityActionRecommendation(q);
      facilityGaps.push({
        questionId: q.id,
        question: q.question,
        category: q.category,
        actionNeeded,
      });

      actionPlan.push({
        id: `plan-facility-${q.id}`,
        category: q.category as QuestionCategory,
        gapType: "FACILITY_GAP",
        title: getActionTitle(q.category, "FACILITY_GAP"),
        description: actionNeeded,
        priority: q.category === "EVACUATION" || q.category === "FACILITY" ? "HIGH" : "MEDIUM",
        targetRole: "PENGURUS",
      });
    } else {
      // TIDAK_TAHU -> Kesenjangan Sosialisasi / Informasi
      awarenessGapCount++;
      const actionNeeded = getAwarenessActionRecommendation(q);
      awarenessGaps.push({
        questionId: q.id,
        question: q.question,
        category: q.category,
        actionNeeded,
      });

      actionPlan.push({
        id: `plan-awareness-${q.id}`,
        category: q.category as QuestionCategory,
        gapType: "AWARENESS_GAP",
        title: getActionTitle(q.category, "AWARENESS_GAP"),
        description: actionNeeded,
        priority: q.category === "EVACUATION" || q.category === "EMERGENCY_CONTACT" ? "HIGH" : "MEDIUM",
        targetRole: "ALL",
      });
    }
  }

  // Hitung Readiness Score: (Jumlah Indikator Terpenuhi / Total Indikator) * 100%
  const score = totalQuestions > 0 ? Math.round((metCount / totalQuestions) * 100) : 0;

  return {
    score,
    totalQuestions,
    metCount,
    facilityGapCount,
    awarenessGapCount,
    metIndicators,
    facilityGaps,
    awarenessGaps,
    actionPlan,
  };
}

function getActionTitle(category: string, gapType: "FACILITY_GAP" | "AWARENESS_GAP"): string {
  if (gapType === "FACILITY_GAP") {
    switch (category) {
      case "EVACUATION":
        return "Pengadaan & Penataan Sarana Evakuasi Lingkungan";
      case "FACILITY":
        return "Pengadaan Fasilitas Tanggap Bencana Fisik";
      case "EMERGENCY_CONTACT":
        return "Penyusunan Struktur & Tim Tanggap Darurat RT/RW";
      default:
        return "Perbaikan Fasilitas Kesiapsiagaan";
    }
  } else {
    switch (category) {
      case "EVACUATION":
        return "Sosialisasi Jalur & Titik Kumpul Aman Warga";
      case "FACILITY":
        return "Edukasi Lokasi & Penggunaan Alat Keselamatan Bersama";
      case "INFORMATION":
        return "Penyuluhan Mandiri & Sosialisasi Tas Siaga Bencana";
      case "EMERGENCY_CONTACT":
        return "Penyebaran Brosur / Stiker Nomor Kontak Darurat";
      default:
        return "Peningkatan Sosialisasi Keselamatan";
    }
  }
}

function getFacilityActionRecommendation(q: QuestionData): string {
  switch (q.category) {
    case "EVACUATION":
      return `Menetapkan lokasi titik kumpul aman yang disepakati musyawarah warga serta memasang rambu evakuasi hijau standar pada persimpangan gang/jalan (${q.question}).`;
    case "FACILITY":
      return `Menganggarkan dana kas RT/RW atau mengajukan ke kelurahan untuk pengadaan APAR, sirine peringatan dini, dan kotak P3K komunal (${q.question}).`;
    case "EMERGENCY_CONTACT":
      return `Membentuk relawan siaga bencana tingkat RT/RW dan menyusun daftar kontak darurat formal.`;
    default:
      return `Menindaklanjuti ketiadaan fasilitas keselamatan terkait: ${q.question}`;
  }
}

function getAwarenessActionRecommendation(q: QuestionData): string {
  switch (q.category) {
    case "EVACUATION":
      return `Menyebarkan peta jalur evakuasi resmi melalui grup WhatsApp warga dan memasang denah di pos ronda (${q.question}).`;
    case "FACILITY":
      return `Memberikan sosialisasi mengenai titik letak APAR dan alat darurat serta simulasi penggunaan untuk warga.`;
    case "INFORMATION":
      return `Menyelenggarakan simulasi tanggap bencana singkat saat pertemuan bulanan RT dan membagikan leaflet panduan Tas Siaga Bencana.`;
    case "EMERGENCY_CONTACT":
      return `Mencetak stiker kontak darurat penting untuk ditempelkan di pintu/kulkas setiap rumah warga.`;
    default:
      return `Meningkatkan keterbukaan informasi dan sosialisasi berkala mengenai: ${q.question}`;
  }
}
