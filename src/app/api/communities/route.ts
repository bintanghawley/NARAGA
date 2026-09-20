import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createCommunitySchema } from "@/validators";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const communities = await prisma.community.findMany({
      include: {
        _count: {
          select: {
            members: true,
            evacuationPoints: true,
            evacuationRoutes: true,
            assessmentSessions: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ communities });
  } catch (error) {
    console.error("Error mengambil daftar komunitas:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data komunitas" },
      { status: 500 }
    );
  }
}

// POST /api/communities: Buat komunitas baru (Pengurus / Admin)
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized. Silakan masuk terlebih dahulu." }, { status: 401 });
    }

    const body = await req.json();
    const result = createCommunitySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const community = await prisma.community.create({
      data: result.data,
    });

    // Jika user adalah Pengurus atau belum punya komunitas, otomatis tautkan
    if (!session.user.communityId) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { communityId: community.id },
      });
    }

    return NextResponse.json(
      { message: "Komunitas berhasil didaftarkan", community },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error membuat komunitas:", error);
    return NextResponse.json(
      { error: "Gagal mendaftarkan komunitas" },
      { status: 500 }
    );
  }
}
