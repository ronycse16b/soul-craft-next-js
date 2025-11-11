
import { connectDB } from "@/lib/db.config";
import { verifyAccess } from "@/lib/roleMiddleware";
import bannerModel from "@/models/banner.model";
import fs from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

// GET: Get all banner images
// ==========================
export async function GET() {

  try {
    await connectDB();

    const banners = await bannerModel.find({});
    // const imageUrls = banners.flatMap((banner) => banner.imageUrls || []);
    return NextResponse.json({ data: banners }, { status: 200 });
  } catch (error) {
    console.error("Error fetching banners:", error);
    return NextResponse.json(
      { error: "banner load fail" },
      { status: 500 }
    );
  }
}

// ============================
// POST: Add new image(s) to DB
// ============================
export async function POST(req) {
     const auth = await verifyAccess(req, {
       roles: ["admin", "moderator"],
       permission: "create",
     });
     if (auth instanceof Response) return auth;
  try {
    await connectDB();
    const body = await req.json();

    if (!body || !Array.isArray(body)) {
      return NextResponse.json(
        { error: "something went wrong" },
        { status: 400 }
      );
    }

    // Check if banner document exists
    const existingBanner = await bannerModel.findOne();
    if (existingBanner) {
      // Push new image URLs into existing array
      existingBanner.imageUrls.push(...body);
      await existingBanner.save();

      return NextResponse.json(
        {
          success: true,
          message: "Banner has been Successfully Uploaded",
          data: existingBanner,
        },
        { status: 200 }
      );
    } else {
      // Create new banner document
      const newBanner = new bannerModel({
        imageUrls: body,
      });

      await newBanner.save();

      return NextResponse.json(
        {
          success: true,
          message: "Banner has been Successfully Uploaded",
          data: newBanner,
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Error saving banner:", error);
    return NextResponse.json(
      { error: "Fail someting went wrong" },
      { status: 500 }
    );
  }
}

// ========================================
// DELETE: Remove image URL and file by name
// ========================================
export async function DELETE(req) {
 const auth = await verifyAccess(req, {
       roles: ["admin", "moderator"],
       permission: "create",
     });
     if (auth instanceof Response) return auth;

  try {
    await connectDB();

    const body = await req.json();
    const { filename } = body;

    if (!filename) {
      return NextResponse.json({ error: "File not provided" }, { status: 400 });
    }

    const imageUrl = `/uploads/${filename}`;

    // Step 1: Remove image URL from DB
    const result = await bannerModel.updateMany(
      { imageUrls: imageUrl },
      { $pull: { imageUrls: imageUrl } }
    );

    // Step 2: Delete file from filesystem
    const filePath = path.join(process.cwd(), "uploads", filename);

    try {
      await fs.unlink(filePath);
      console.log("File deleted from server:", filename);
    } catch (fileError) {
      if (fileError.code === "ENOENT") {
        console.warn("File not found or already deleted:", filename);
      } else {
        console.warn("Failed to delete file:", fileError.message);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Image deleted successfully",
        result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}
