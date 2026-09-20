import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "src", "app", "api", "copy-avatars", "route.ts");
    const dirPath = path.join(process.cwd(), "src", "app", "api", "copy-avatars");
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    if (fs.existsSync(dirPath)) {
      fs.rmdirSync(dirPath);
    }
    return NextResponse.json({ success: true, deleted: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
