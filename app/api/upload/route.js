import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

const UPLOADS_DIR = process.env.NEXT_PUBLIC_UPLOADS_DIR; // Persistent folder outside project root

export async function POST(req) {
  try {
    // Create uploads folder if not exists
    await mkdir(UPLOADS_DIR, { recursive: true });

    const formData = await req.formData();
    const files = formData.getAll("images"); // 'images' key from client

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const imageUrls = [];

    for (const file of files) {
      const bytes = await (file).arrayBuffer();
      const buffer = Buffer.from(bytes);

      const filename = `${Date.now()}-${(file).name.replace(/\s+/g, "-")}`;
      const filePath = path.join(UPLOADS_DIR, filename);

      await writeFile(filePath, buffer);

      // URL for client-side GET route
      imageUrls.push(`/uploads/${filename}`);
    }

    return NextResponse.json({ success: true, imageUrls });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}



// import { writeFile } from "fs/promises";
// import path from "path";
// import { NextResponse } from "next/server";

// export async function POST(req) {
  
//   const formData = await req.formData();
//   const files = formData.getAll("images"); // 'images' is key for all files

//   if (!files || files.length === 0) {
//     return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
//   }

//   const imageUrls = [];

//   for (const file of files) {
//     const bytes = await file.arrayBuffer();
//     const buffer = Buffer.from(bytes);

//     const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
//     const filePath = path.join(process.cwd(), "uploads", filename);

//     await writeFile(filePath, buffer);

//     imageUrls.push(`/uploads/${filename}`);
//   }

//   return NextResponse.json({ success: true, imageUrls });
// }

