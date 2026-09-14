import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized. Silakan masuk terlebih dahulu." }, { status: 401 });
    }

    const { id: communityId } = await params;

    const community = await prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!community) {
      return NextResponse.json({ error: "Komunitas/Lingkungan tidak ditemukan" }, { status: 404 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { communityId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        communityId: true,
      },
    });

    return NextResponse.json({
      message: `Berhasil bergabung dengan lingkungan ${community.name}`,
      user: updatedUser,
      community,
    });
  } catch (error) {
    console.error("Error bergabung ke komunitas:", error);
    return NextResponse.json(
      { error: "Gagal bergabung ke komunitas" },
      { status: 500 }
    );
  }
}
