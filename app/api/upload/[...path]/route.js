import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET(req, context) {
  const params = await context?.params;

  if (!params?.path || !Array.isArray(params.path)) {
    return new NextResponse("Bad Request", { status: 400 });
  }

  const filePath = path.join(process.cwd(), "uploads", ...params.path);

  try {
    await fs.promises.access(filePath);
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }

  const fileBuffer = await fs.promises.readFile(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mimeType =
    {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
    }[ext] || "application/octet-stream";

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": mimeType,
    },
  });
}
  
  
  
