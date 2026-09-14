import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { emergencyContactSchema } from "@/validators";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const communityId = searchParams.get("communityId");

    const whereConditions: any[] = [{ isGlobal: true }];
    if (communityId) {
      whereConditions.push({ communityId });
    }

    const contacts = await prisma.emergencyContact.findMany({
      where: {
        OR: whereConditions,
      },
      orderBy: [{ isGlobal: "desc" }, { category: "asc" }],
    });

    return NextResponse.json({ contacts });
  } catch (error) {
    console.error("Error mengambil kontak darurat:", error);
    return NextResponse.json({ error: "Gagal memuat kontak darurat" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "PENGURUS" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Akses hanya untuk Pengurus atau Admin" }, { status: 403 });
    }

    const body = await req.json();
    const result = emergencyContactSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const contact = await prisma.emergencyContact.create({
      data: result.data,
    });

    return NextResponse.json(
      { message: "Kontak darurat berhasil ditambahkan", contact },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error menambah kontak darurat:", error);
    return NextResponse.json({ error: "Gagal menyimpan kontak darurat" }, { status: 500 });
  }
}
