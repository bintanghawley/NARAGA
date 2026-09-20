import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { PENGURUS_QUESTIONS, WARGA_QUESTIONS } from "@/lib/assessment-questions";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const requestedRole = searchParams.get("role");
    const userRole = requestedRole || (session?.user as any)?.role || "WARGA";

    const targetRole = userRole === "PENGURUS" ? "PENGURUS" : "WARGA";

    // Pastikan database memiliki tepat 30 soal lengkap untuk targetRole
    const existingCount = await prisma.assessmentQuestion.count({
      where: { targetRole, isActive: true },
    });

    if (existingCount !== 30) {
      // Hapus data lama untuk targetRole ini jika belum berjumlah 30 butir
      await prisma.assessmentQuestion.deleteMany({
        where: { targetRole },
      });

      const questionsToSeed = targetRole === "PENGURUS" ? PENGURUS_QUESTIONS : WARGA_QUESTIONS;
      for (const q of questionsToSeed) {
        await prisma.assessmentQuestion.create({ data: q });
      }
    }

    const questions = await prisma.assessmentQuestion.findMany({
      where: {
        isActive: true,
        targetRole,
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({
      role: targetRole,
      count: questions.length,
      questions,
    });
  } catch (error) {
    console.error("Error memuat pertanyaan asesmen:", error);
    return NextResponse.json({ error: "Gagal memuat bank soal asesmen" }, { status: 500 });
  }
}
