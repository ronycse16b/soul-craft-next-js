import { connectDB } from "@/lib/db.config";
import { verifyAccess } from "@/lib/roleMiddleware";
import bannerModel from "@/models/banner.model";
import { NextResponse } from "next/server";

// ==========================
// GET: Get all banner images
// ==========================
export async function GET() {
  try {
    await connectDB();
    const banners = await bannerModel.find({});
    return NextResponse.json({ data: banners }, { status: 200 });
  } catch (error) {
    console.error("Error fetching banners:", error);
    return NextResponse.json(
      { error: "Failed to load banners" },
      { status: 500 }
    );
  }
}

// ============================
// POST: Add new image URLs (CDN)
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
        { error: "Invalid data format" },
        { status: 400 }
      );
    }

    // If a banner doc exists, update it; otherwise, create one
    const existingBanner = await bannerModel.findOne();
    if (existingBanner) {
      existingBanner.imageUrls.push(...body);
      await existingBanner.save();

      return NextResponse.json({
        success: true,
        message: "Banners updated successfully",
        data: existingBanner,
      });
    }

    const newBanner = new bannerModel({ imageUrls: body });
    await newBanner.save();

    return NextResponse.json({
      success: true,
      message: "Banner created successfully",
      data: newBanner,
    });
  } catch (error) {
    console.error("Error saving banner:", error);
    return NextResponse.json(
      { error: "Failed to save banner" },
      { status: 500 }
    );
  }
}

// ========================================
// DELETE: Remove image URL (CDN managed)
// ========================================
export async function DELETE(req) {
  const auth = await verifyAccess(req, {
    roles: ["admin", "moderator"],
    permission: "delete",
  });
  if (auth instanceof Response) return auth;

  try {
    await connectDB();
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: "Image URL not provided" },
        { status: 400 }
      );
    }

    const result = await bannerModel.updateMany(
      { imageUrls: url },
      { $pull: { imageUrls: url } }
    );

    return NextResponse.json({
      success: true,
      message: "Image removed successfully from database",
      result,
    });
  } catch (error) {
    console.error("Error deleting banner:", error);
    return NextResponse.json(
      { error: "Failed to delete banner" },
      { status: 500 }
    );
  }
}
