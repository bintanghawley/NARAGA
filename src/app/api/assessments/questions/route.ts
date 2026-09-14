import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const questions = await prisma.assessmentQuestion.findMany({
      where: { isActive: true },
      orderBy: [{ category: "asc" }, { order: "asc" }],
    });

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Error memuat pertanyaan asesmen:", error);
    return NextResponse.json({ error: "Gagal memuat bank soal asesmen" }, { status: 500 });
  }
}
