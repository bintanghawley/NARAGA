import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { assessmentSubmissionSchema } from "@/validators";
import { evaluateAssessment } from "@/lib/assessment-engine";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized. Silakan masuk terlebih dahulu." }, { status: 401 });
    }

    const userId = session.user.id;
    const userRole = session.user.role || "WARGA";
    const userCommunityId = session.user.communityId;

    const body = await req.json();
    const result = assessmentSubmissionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validasi jawaban gagal", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { communityId, answers } = result.data;

    // Verifikasi keberadaan komunitas
    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!community) {
      return NextResponse.json({ error: "Komunitas tidak ditemukan" }, { status: 404 });
    }

    // Ambil seluruh pertanyaan aktif
    const questions = await prisma.assessmentQuestion.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });

    // Jalankan Rule-Based Evaluation Engine
    const evaluation = evaluateAssessment(questions, answers);

    // Simpan AssessmentSession dan AssessmentAnswers secara transaksional
    const savedSession = await prisma.$transaction(async (tx) => {
      const assessmentSession = await tx.assessmentSession.create({
        data: {
          userId,
          communityId,
          roleAtSubmit: userRole,
          score: evaluation.score,
          totalQuestions: evaluation.totalQuestions,
          metCount: evaluation.metCount,
          facilityGapCount: evaluation.facilityGapCount,
          awarenessGapCount: evaluation.awarenessGapCount,
          actionPlanJson: JSON.stringify(evaluation.actionPlan),
        },
      });

      // Simpan rincian jawaban per pertanyaan
      for (const ans of answers) {
        await tx.assessmentAnswer.create({
          data: {
            sessionId: assessmentSession.id,
            questionId: ans.questionId,
            answer: ans.answer,
          },
        });
      }

      // Pastikan user tertaut ke komunitas ini jika sebelumnya belum
      if (!userCommunityId) {
        await tx.user.update({
          where: { id: userId },
          data: { communityId },
        });
      }

      return assessmentSession;
    });

    return NextResponse.json(
      {
        message: "Asesmen kesiapsiagaan berhasil dievaluasi dan disimpan",
        sessionId: savedSession.id,
        communityName: community.name,
        evaluation,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submit asesmen:", error);
    return NextResponse.json({ error: "Gagal memproses hasil asesmen" }, { status: 500 });
  }
}
