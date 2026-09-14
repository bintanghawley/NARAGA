import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { evacuationRouteSchema } from "@/validators";

// GET: Ambil rute evakuasi (polyline) untuk komunitas
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const communityId = searchParams.get("communityId");

    const whereClause: any = {};
    if (communityId) {
      whereClause.communityId = communityId;
    }

    const routes = await prisma.evacuationRoute.findMany({
      where: whereClause,
      include: {
        community: {
          select: { name: true, rt: true, rw: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const parsedRoutes = routes.map((r) => {
      let coordinates = [];
      try {
        coordinates = JSON.parse(r.coordinates);
      } catch (e) {
        coordinates = [];
      }
      return {
        ...r,
        coordinates,
      };
    });

    return NextResponse.json({ routes: parsedRoutes });
  } catch (error) {
    console.error("Error mengambil rute evakuasi:", error);
    return NextResponse.json({ error: "Gagal memuat rute evakuasi" }, { status: 500 });
  }
}

// POST: Tambah rute evakuasi baru (Pengurus / Admin)
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "PENGURUS" && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Hanya Pengurus Lingkungan atau Admin yang berhak mengelola rute" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const result = evacuationRouteSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validasi rute gagal", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const route = await prisma.evacuationRoute.create({
      data: result.data,
    });

    return NextResponse.json(
      { message: "Rute evakuasi berhasil ditambahkan", route },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error menambah rute evakuasi:", error);
    return NextResponse.json({ error: "Gagal menyimpan rute evakuasi" }, { status: 500 });
  }
}
