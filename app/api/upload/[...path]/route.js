import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

// Helper: Determine MIME type
function getMimeType(ext) {
  return (
    {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
    }[ext.toLowerCase()] || "application/octet-stream"
  );
}

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

  const stat = await fs.promises.stat(filePath);
  const fileBuffer = await fs.promises.readFile(filePath);
  const ext = path.extname(filePath);
  const mimeType = getMimeType(ext);

  const lastModified = stat.mtime.toUTCString();
  const etag = `"${stat.size}-${stat.mtime.getTime()}"`;

  // Conditional request check
  const ifNoneMatch = req.headers.get("if-none-match");
  const ifModifiedSince = req.headers.get("if-modified-since");

  if (
    (ifNoneMatch && ifNoneMatch === etag) ||
    (ifModifiedSince &&
      new Date(ifModifiedSince).getTime() >= stat.mtime.getTime())
  ) {
    return new NextResponse(null, { status: 304 }); // Not modified
  }

  // Decide cache strategy
  // Hashed/unique filenames => immutable
  const isHashed = /[0-9a-f]{6,}/i.test(path.basename(filePath));

  const cacheHeader = isHashed
    ? "public, max-age=31536000, immutable" // new/unique file
    : "public, max-age=3600, must-revalidate"; // existing file

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": mimeType,
      "Cache-Control": cacheHeader,
      "Last-Modified": lastModified,
      ETag: etag,
    },
  });
}

// import fs from "fs";
// import path from "path";
// import { NextResponse } from "next/server";

// export async function GET(req, context) {
//   const params = await context?.params;

//   if (!params?.path || !Array.isArray(params.path)) {
//     return new NextResponse("Bad Request", { status: 400 });
//   }

//   const filePath = path.join(process.cwd(), "uploads", ...params.path);

//   try {
//     await fs.promises.access(filePath);
//   } catch {
//     return new NextResponse("Not Found", { status: 404 });
//   }

//   const fileBuffer = await fs.promises.readFile(filePath);
//   const ext = path.extname(filePath).toLowerCase();
//   const mimeType =
//     {
//       ".jpg": "image/jpeg",
//       ".jpeg": "image/jpeg",
//       ".png": "image/png",
//       ".gif": "image/gif",
//       ".webp": "image/webp",
//     }[ext] || "application/octet-stream";

//   return new NextResponse(fileBuffer, {
//     headers: {
//       "Content-Type": mimeType,
//     },
//   });
// }
