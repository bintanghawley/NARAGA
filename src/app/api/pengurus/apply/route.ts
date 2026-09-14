import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { pengurusApplicationSchema } from "@/validators";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized. Silakan masuk terlebih dahulu." }, { status: 401 });
    }

    const userId = session.user.id;

    const body = await req.json();
    const result = pengurusApplicationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { communityId, fullName, phoneNumber, position, reason } = result.data;

    // Cek apakah komunitas valid
    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!community) {
      return NextResponse.json({ error: "Komunitas/Lingkungan tidak ditemukan" }, { status: 404 });
    }

    // Cek apakah sudah ada pengajuan pending dari user ini
    const existingPending = await prisma.pengurusApplication.findFirst({
      where: {
        userId,
        status: "PENDING",
      },
    });

    if (existingPending) {
      return NextResponse.json(
        { error: "Anda masih memiliki permohonan pengurus yang menunggu verifikasi Admin." },
        { status: 409 }
      );
    }

    const application = await prisma.pengurusApplication.create({
      data: {
        userId,
        communityId,
        fullName,
        phoneNumber,
        position,
        reason,
        status: "PENDING",
      },
      include: {
        community: true,
      },
    });

    return NextResponse.json(
      {
        message: "Pengajuan peran Pengurus Lingkungan berhasil dikirim dan menunggu verifikasi Admin.",
        application,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error mengirim pengajuan pengurus:", error);
    return NextResponse.json(
      { error: "Gagal memproses pengajuan pengurus" },
      { status: 500 }
    );
  }
}

// GET: Ambil status pengajuan user yang sedang login
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const applications = await prisma.pengurusApplication.findMany({
      where: { userId: session.user.id },
      include: { community: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Error mengecek pengajuan pengurus:", error);
    return NextResponse.json({ error: "Gagal mengambil data pengajuan" }, { status: 500 });
  }
}
