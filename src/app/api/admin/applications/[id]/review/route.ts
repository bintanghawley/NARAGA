import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { reviewApplicationSchema } from "@/validators";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Akses hanya untuk Administrator internal" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const result = reviewApplicationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { status, adminNotes } = result.data;

    const application = await prisma.pengurusApplication.findUnique({
      where: { id },
    });

    if (!application) {
      return NextResponse.json({ error: "Pengajuan tidak ditemukan" }, { status: 404 });
    }

    // Jalankan transaksi database: perbarui pengajuan & perbarui role user jika APPROVED
    const updatedApplication = await prisma.$transaction(async (tx) => {
      const app = await tx.pengurusApplication.update({
        where: { id },
        data: {
          status,
          adminNotes,
          reviewedAt: new Date(),
        },
      });

      if (status === "APPROVED") {
        // Naikkan role user menjadi PENGURUS dan kaitkan ke komunitas tersebut
        await tx.user.update({
          where: { id: application.userId },
          data: {
            role: "PENGURUS",
            communityId: application.communityId,
          },
        });
      }

      return app;
    });

    return NextResponse.json({
      message: `Pengajuan berhasil di-${status.toLowerCase()}`,
      application: updatedApplication,
    });
  } catch (error) {
    console.error("Error meninjau pengajuan admin:", error);
    return NextResponse.json({ error: "Gagal memproses verifikasi pengajuan" }, { status: 500 });
  }
}
