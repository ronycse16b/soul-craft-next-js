import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { adminOnlyMiddleware } from "@/lib/authMiddleware";

export async function POST(req) {
    const auth = await adminOnlyMiddleware(req);
    if (auth) return auth; // unauthorized
    
  const { filename } = await req.json();

  if (!filename) {
    return NextResponse.json(
      { error: "No filename provided" },
      { status: 400 }
    );
  }

  const filePath = path.join(process.cwd(), "uploads", filename);

  try {
    await fs.unlink(filePath);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete file", details: err.message },
      { status: 500 }
    );
  }
}
