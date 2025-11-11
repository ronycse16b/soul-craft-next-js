import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

const UPLOADS_DIR = process.env.NEXT_PUBLIC_UPLOADS_DIR;

export async function GET(req, context) {
  try {
    const ctxParams = await context.params;
    let filePathParts = ctxParams?.path;
    if (!filePathParts) return new NextResponse("Bad Request", { status: 400 });
    if (typeof filePathParts === "string") filePathParts = [filePathParts];

    const filePath = path.join(UPLOADS_DIR, ...filePathParts);
    const stat = await fs.stat(filePath); // get file info
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

    // ✅ caching headers
    const lastModified = stat.mtime.toUTCString();
    const etag = `"${stat.size}-${stat.mtime.getTime()}"`;

    const ifNoneMatch = req.headers.get("if-none-match");
    const ifModifiedSince = req.headers.get("if-modified-since");

    if (
      (ifNoneMatch && ifNoneMatch === etag) ||
      (ifModifiedSince &&
        new Date(ifModifiedSince).getTime() >= stat.mtime.getTime())
    ) {
      return new NextResponse(null, { status: 304 }); // Not Modified
    }

    // Decide cache strategy: hashed filenames => long-term cache
    const isHashed = /[0-9a-f]{6,}/i.test(path.basename(filePath));
    const cacheHeader = isHashed
      ? "public, max-age=31536000, immutable" // 1 year cache
      : "public, max-age=3600, must-revalidate"; // 1 hour cache

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": cacheHeader,
        "Last-Modified": lastModified,
        ETag: etag,
      },
    });
  } catch (err) {
    console.error("Serve error:", err);
    return new NextResponse("Not Found", { status: 404 });
  }
}

// import fs from "fs/promises";
// import path from "path";
// import { NextResponse } from "next/server";

// const UPLOADS_DIR = process.env.NEXT_PUBLIC_UPLOADS_DIR;

// export async function GET(req, context) {
//   try {
//     // ✅ context.params is a Promise
//     const ctxParams = await context.params;
//     let filePathParts = ctxParams?.path;

//     // Catch: if string, convert to array
//     if (!filePathParts) return new NextResponse("Bad Request", { status: 400 });
//     if (typeof filePathParts === "string") filePathParts = [filePathParts];

//     const filePath = path.join(UPLOADS_DIR, ...filePathParts);
//     const fileBuffer = await fs.readFile(filePath);

//     const ext = path.extname(filePath);
//     const mimeType =
//       {
//         ".jpg": "image/jpeg",
//         ".jpeg": "image/jpeg",
//         ".png": "image/png",
//         ".webp": "image/webp",
//         ".gif": "image/gif",
//       }[ext.toLowerCase()] || "application/octet-stream";

//     return new NextResponse(fileBuffer, {
//       headers: {
//         "Content-Type": mimeType,
//         "Cache-Control": "no-cache, no-store, must-revalidate",
//       },
//     });
//   } catch (err) {
//     console.error("Serve error:", err);
//     return new NextResponse("Not Found", { status: 404 });
//   }
// }
