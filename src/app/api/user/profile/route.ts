import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { updateProfileSchema } from "@/validators";

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = updateProfileSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, communityId } = result.data;

    // Cek jika email diganti dan sudah digunakan oleh akun lain
    if (email && email !== session.user.email) {
      const existing = await prisma.user.findUnique({
        where: { email },
      });
      if (existing && existing.id !== session.user.id) {
        return NextResponse.json(
          { error: "Email sudah digunakan oleh akun lain" },
          { status: 409 }
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name ? { name } : {}),
        ...(email ? { email } : {}),
        ...(communityId !== undefined ? { communityId } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        communityId: true,
        community: true,
      },
    });

    return NextResponse.json({
      message: "Profil berhasil diperbarui",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Gagal memperbarui profil:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server saat memperbarui profil" },
      { status: 500 }
    );
  }
}
