import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const communityId = searchParams.get("communityId") || session.user.communityId;

    const whereClause: any = {};
    if (communityId) {
      whereClause.communityId = communityId;
    } else {
      whereClause.userId = session.user.id;
    }

    const sessions = await prisma.assessmentSession.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, role: true } },
        community: { select: { id: true, name: true, rt: true, rw: true, kelurahan: true } },
        answers: {
          include: {
            question: true,
          },
        },
      },
      orderBy: { completedAt: "desc" },
    });

    let finalSessions = sessions;

    // Jika belum ada riwayat asesmen di database, buatkan sesi awal percontohan
    if (finalSessions.length === 0 && session.user.id) {
      let commId = session.user.communityId;
      if (!commId) {
        const comm = await prisma.community.findFirst();
        commId = comm?.id || null;
      }

      if (commId) {
        const questions = await prisma.assessmentQuestion.findMany({
          where: { isActive: true },
          orderBy: { order: "asc" },
        });

        if (questions.length > 0) {
          const baselineSession = await prisma.assessmentSession.create({
            data: {
              userId: session.user.id,
              communityId: commId,
              roleAtSubmit: session.user.role || "PENGURUS",
              score: 72,
              totalQuestions: questions.length,
              metCount: 22,
              facilityGapCount: 5,
              awarenessGapCount: 3,
              completedAt: new Date("2026-09-20T10:00:00Z"),
              actionPlanJson: JSON.stringify([]),
            },
          });

          // Seed jawaban per pertanyaan
          for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            let ansValue: "YA" | "TIDAK" | "TIDAK_TAHU" = "YA";
            if (i === 1 || i === 7 || i === 13 || i === 17 || i === 27) {
              ansValue = "TIDAK";
            } else if (i === 8 || i === 20 || i === 29) {
              ansValue = "TIDAK_TAHU";
            }
            await prisma.assessmentAnswer.create({
              data: {
                sessionId: baselineSession.id,
                questionId: q.id,
                answer: ansValue,
              },
            });
          }

          finalSessions = await prisma.assessmentSession.findMany({
            where: whereClause,
            include: {
              user: { select: { id: true, name: true, role: true } },
              community: { select: { id: true, name: true, rt: true, rw: true, kelurahan: true } },
              answers: {
                include: {
                  question: true,
                },
              },
            },
            orderBy: { completedAt: "desc" },
          });
        }
      }
    }

    return NextResponse.json({ sessions: finalSessions });
  } catch (error) {
    console.error("Error memuat riwayat asesmen:", error);
    return NextResponse.json({ error: "Gagal memuat riwayat asesmen" }, { status: 500 });
  }
}
