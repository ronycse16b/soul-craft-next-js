import Advertisement from "@/models/advertisement.model";
import { connectDB } from "@/lib/db.config";

import { verifyAccess } from "@/lib/roleMiddleware";
const CDN_URL =
  process.env.NEXT_PUBLIC_CDN_URL || "https://cdn.soulcraftbd.com";

export async function PUT(req, { params }) {
  const auth = await verifyAccess(req, {
    roles: ["admin", "moderator"],
    permission: "update",
  });
  if (auth instanceof Response) return auth;
  const { id } = await params;
  await connectDB();
  const data = await req.json();
  const updated = await Advertisement.findByIdAndUpdate(id, data, {
    new: true,
  });
  return Response.json(updated);
}

export async function DELETE(req, { params }) {
  const auth = await verifyAccess(req, {
    roles: ["admin", "moderator"],
    permission: "delete",
  });
  if (auth instanceof Response) return auth;

  const { id } = await params;
  await connectDB();

  // Find advertisement first
  const ad = await Advertisement.findById(id);
  if (!ad) {
    return Response.json({
      success: false,
      message: "Advertisement not found",
    });
  }

  // Delete image from CDN if exists
  if (ad.image) {
    try {
      const filename = ad.image.split("/uploads/")[1];
      if (filename) {
        const res = await fetch(`${CDN_URL}/images/${filename}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (!data.success) {
          console.warn("Failed to delete image from CDN:", ad.image);
        }
      }
    } catch (err) {
      console.warn("Error deleting image from CDN:", err);
    }
  }

  // Delete ad from DB
  await Advertisement.findByIdAndDelete(id);

  return Response.json({ success: true });
}
