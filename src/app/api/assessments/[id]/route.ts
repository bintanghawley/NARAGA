import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const assessmentSession = await prisma.assessmentSession.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, role: true } },
        community: true,
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!assessmentSession) {
      return NextResponse.json({ error: "Sesi asesmen tidak ditemukan" }, { status: 404 });
    }

    const actionPlan = assessmentSession.actionPlanJson
      ? JSON.parse(assessmentSession.actionPlanJson)
      : [];

    return NextResponse.json({
      session: assessmentSession,
      actionPlan,
    });
  } catch (error) {
    console.error("Error mengambil detail asesmen:", error);
    return NextResponse.json({ error: "Gagal memuat detail asesmen" }, { status: 500 });
  }
}
