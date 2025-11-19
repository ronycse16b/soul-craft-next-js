
import { connectDB } from "@/lib/db.config";
import flashModel from "@/models/flash.model";
import { NextResponse } from "next/server";

// ✅ Toggle Flash Sale Active State
export async function POST(req) {
 const auth = await verifyAccess(req, {
     roles: ["admin", "moderator"],
     permission: "create",
   });
  if (auth instanceof Response) return auth;
  try {
    await connectDB();

    const { id } = await req.json();
    if (!id)
      return NextResponse.json(
        { success: false, message: "ID is required" },
        { status: 400 }
      );

    // Find the flash sale
    const flash = await flashModel.findById(id);
    if (!flash)
      return NextResponse.json(
        { success: false, message: "Flash sale not found" },
        { status: 404 }
      );

    // Toggle isActive
    flash.isActive = !flash.isActive;

    const updated = await flash.save();

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
