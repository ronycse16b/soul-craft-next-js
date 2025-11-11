import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

const UPLOADS_DIR = process.env.NEXT_PUBLIC_UPLOADS_DIR;

export async function GET(req, context) {
  try {
    // ✅ context.params is a Promise
    const ctxParams = await context.params;
    let filePathParts = ctxParams?.path;

    // Catch: if string, convert to array
    if (!filePathParts) return new NextResponse("Bad Request", { status: 400 });
    if (typeof filePathParts === "string") filePathParts = [filePathParts];

    const filePath = path.join(UPLOADS_DIR, ...filePathParts);
    const fileBuffer = await fs.readFile(filePath);

    const ext = path.extname(filePath);
    const mimeType =
      {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
        ".gif": "image/gif",
      }[ext.toLowerCase()] || "application/octet-stream";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (err) {
    console.error("Serve error:", err);
    return new NextResponse("Not Found", { status: 404 });
  }
}
