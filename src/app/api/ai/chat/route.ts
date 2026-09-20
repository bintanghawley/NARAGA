import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { aiChatSchema } from "@/validators";
import { askGeminiAssistant } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();
    const result = aiChatSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validasi pesan gagal", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { message, sessionId, communityId, userLocation } = result.data;

    let targetCommunityId = communityId || (session?.user as any)?.communityId;
    let readinessScore: number | undefined = undefined;
    let facilityGaps: string[] = [];
    let awarenessGaps: string[] = [];
    let communityName: string | undefined = undefined;

    // 1. Jika ada sessionId spesifik, ambil konteks dari sesi tersebut
    if (sessionId) {
      const assessSession = await prisma.assessmentSession.findUnique({
        where: { id: sessionId },
        include: {
          community: true,
          answers: { include: { question: true } },
        },
      });

      if (assessSession) {
        communityName = assessSession.community.name;
        readinessScore = assessSession.score;
        facilityGaps = assessSession.answers
          .filter((a) => a.answer === "TIDAK")
          .map((a) => a.question.question);
        awarenessGaps = assessSession.answers
          .filter((a) => a.answer === "TIDAK_TAHU")
          .map((a) => a.question.question);
      }
    } else if (targetCommunityId) {
      // 2. Jika tidak ada sessionId, ambil sesi asesmen terbaru untuk komunitas ini
      const community = await prisma.community.findUnique({
        where: { id: targetCommunityId },
      });
      if (community) {
        communityName = community.name;
      }

      let latestSession = null;
      if (session?.user?.id) {
        latestSession = await prisma.assessmentSession.findFirst({
          where: { userId: session.user.id },
          orderBy: { completedAt: "desc" },
          include: { answers: { include: { question: true } } },
        });
      }
      if (!latestSession && targetCommunityId) {
        latestSession = await prisma.assessmentSession.findFirst({
          where: { communityId: targetCommunityId },
          orderBy: { completedAt: "desc" },
          include: { answers: { include: { question: true } } },
        });
      }

      if (latestSession) {
        readinessScore = latestSession.score;
        facilityGaps = latestSession.answers
          .filter((a) => a.answer === "TIDAK")
          .map((a) => a.question.question);
        awarenessGaps = latestSession.answers
          .filter((a) => a.answer === "TIDAK_TAHU")
          .map((a) => a.question.question);
      }
    }

    const reply = await askGeminiAssistant(message, {
      communityName,
      readinessScore,
      facilityGaps,
      awarenessGaps,
      userRole: (session?.user as any)?.role || "Warga",
      userLocation,
    });

    return NextResponse.json({
      reply,
      contextGrounded: {
        communityName: communityName || "Umum",
        readinessScore: readinessScore ?? null,
        facilityGapCount: facilityGaps.length,
        awarenessGapCount: awarenessGaps.length,
        userLocation: userLocation || null,
      },
    });
  } catch (error) {
    console.error("Error pada AI chat assistant:", error);
    return NextResponse.json(
      { error: "Gagal memproses percakapan asisten AI" },
      { status: 500 }
    );
  }
}
