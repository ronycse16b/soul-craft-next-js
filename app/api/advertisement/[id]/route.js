import Advertisement from "@/models/advertisement.model";
import { connectDB } from "@/lib/db.config";
import fs from "fs/promises";
import path from "path";

export async function PUT(req, { params }) {
  const {id} = await params;
  await connectDB();
  const data = await req.json();
  const updated = await Advertisement.findByIdAndUpdate(id, data, {
    new: true,
  });
  return Response.json(updated);
}

export async function DELETE(req, { params }) {
  const {id} = await params;
  await connectDB();

  // Find advertisement first
  const ad = await Advertisement.findById(id);
  if (!ad) {
    return Response.json({
      success: false,
      message: "Advertisement not found",
    });
  }

  // Delete image from server if exists
  if (ad.image) {
    try {
      // Extract filename only
      const filename = ad.image.split("/").pop();
      const imagePath = path.join(process.cwd(), "uploads", filename);
      await fs.unlink(imagePath);
    } catch (err) {
      console.warn("Failed to delete image:", err.message);
    }
  }

  // Delete ad from DB
  await Advertisement.findByIdAndDelete(id);

  return Response.json({ success: true });
}
