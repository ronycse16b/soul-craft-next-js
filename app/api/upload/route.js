
import { writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export async function POST(req) {
  
  const formData = await req.formData();
  const files = formData.getAll("images"); // 'images' is key for all files

  if (!files || files.length === 0) {
    return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
  }

  const imageUrls = [];

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const filePath = path.join(process.cwd(), "uploads", filename);

    await writeFile(filePath, buffer);

    imageUrls.push(`/uploads/${filename}`);
  }

  return NextResponse.json({ success: true, imageUrls });
}

