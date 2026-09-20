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
    const scope = searchParams.get("scope");
    const requestedCommunityId = searchParams.get("communityId");

    const whereClause: any = {};
    if (scope === "community" && (requestedCommunityId || session.user.communityId)) {
      whereClause.communityId = requestedCommunityId || session.user.communityId;
    } else {
      // Default: Isolasi per pengguna aktif
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

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Error memuat riwayat asesmen:", error);
    return NextResponse.json({ error: "Gagal memuat riwayat asesmen" }, { status: 500 });
  }
}
