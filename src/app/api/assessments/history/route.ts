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
        community: { select: { id: true, name: true, rt: true, rw: true } },
      },
      orderBy: { completedAt: "desc" },
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Error memuat riwayat asesmen:", error);
    return NextResponse.json({ error: "Gagal memuat riwayat asesmen" }, { status: 500 });
  }
}
