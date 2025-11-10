import { connectDB } from "@/lib/db.config";
import userModel from "@/models/user.model";
import bcrypt from "bcrypt";
import { auth } from "@/auth"; // ✅ new in v5
import { NextResponse } from "next/server";

export async function PUT(request) {
  try {
    await connectDB();

    const session = await auth(); // ✅ replaces getServerSession
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { name, password } = await request.json();

    const user = await userModel.findOne({ emailOrPhone: session.user.emailOrPhone });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (name) user.name = name;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
