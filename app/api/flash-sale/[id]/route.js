
import { connectDB } from "@/lib/db.config";
import { verifyAccess } from "@/lib/roleMiddleware";
import flashModel from "@/models/flash.model";
import { NextResponse } from "next/server";

// ✅ Update Flash Sale
export async function PUT(req, { params }) {
   const auth = await verifyAccess(req, {
     roles: ["admin", "moderator"],
     permission: "update",
   });
   if (auth instanceof Response) return auth;
  try {
    await connectDB();
    const { id } = await params;
    const data = await req.json();
    const updated = await flashModel.findByIdAndUpdate(id, data, { new: true });
    return NextResponse.json({ success: true, updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// ✅ Delete Flash Sale
export async function DELETE(req, { params }) {

   const auth = await verifyAccess(req, {
     roles: ["admin", "moderator"],
     permission: "delete",
   });
   if (auth instanceof Response) return auth;

  try {
    await connectDB();
    const { id } = await params;
    await flashModel.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Flash Sale deleted" });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}





