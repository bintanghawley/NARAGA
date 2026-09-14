import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { evacuationPointSchema } from "@/validators";

// GET: Ambil titik kumpul & posko untuk komunitas tertentu
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const communityId = searchParams.get("communityId");

    const whereClause: any = {};
    if (communityId) {
      whereClause.communityId = communityId;
    }

    const points = await prisma.evacuationPoint.findMany({
      where: whereClause,
      include: {
        community: {
          select: { name: true, rt: true, rw: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ points });
  } catch (error) {
    console.error("Error mengambil titik evakuasi:", error);
    return NextResponse.json({ error: "Gagal memuat data titik evakuasi" }, { status: 500 });
  }
}

// POST: Tambah titik kumpul baru (Pengurus / Admin)
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "PENGURUS" && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Hanya Pengurus Lingkungan atau Admin yang berhak mengelola peta" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const result = evacuationPointSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validasi titik evakuasi gagal", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const point = await prisma.evacuationPoint.create({
      data: result.data,
    });

    return NextResponse.json(
      { message: "Titik evakuasi berhasil ditambahkan", point },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error menambahkan titik evakuasi:", error);
    return NextResponse.json({ error: "Gagal menyimpan titik evakuasi" }, { status: 500 });
  }
}
