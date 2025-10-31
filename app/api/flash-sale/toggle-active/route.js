
import { connectDB } from "@/lib/db.config";
import flashModel from "@/models/flash.model";
import { NextResponse } from "next/server";

// ✅ Update toggle Flash Sale
export async function POST(req, { params }) {
  try {
    await connectDB();
   

    const {id,active} = await req.json();
    const data = { isActive: active };

    const updated = await flashModel.findByIdAndUpdate(id, data, { new: true });
    return NextResponse.json({ success: true, updated });
   
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

