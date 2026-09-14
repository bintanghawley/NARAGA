import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Akses hanya untuk Administrator internal" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const whereClause: any = {};
    if (status) {
      whereClause.status = status;
    }

    const applications = await prisma.pengurusApplication.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true, status: true },
        },
        community: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Error mengambil daftar pengajuan admin:", error);
    return NextResponse.json({ error: "Gagal memuat daftar pengajuan" }, { status: 500 });
  }
}
