import { connectDB } from "@/lib/db.config";
import userModel from "@/models/user.model";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const body = await req.json();
  
    const { name, address, currentPassword, newPassword, setPassword } = body;
    const user = await userModel.findById(id);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (address) updateData.address = address;

    // ===== Google user first-time password set =====
    if (user.isGoogle) {
      if (user.hasPassword && setPassword) {
     
        return NextResponse.json(
          {
            success: false,
            message:
              "You have already set a password. Use 'Change Password' instead.",
          },
          { status: 400 }
        );
      }

      if (setPassword && newPassword) {
        const hashed = await bcrypt.hash(newPassword, 10);
        updateData.password = hashed;
        updateData.hasPassword = true;
      
      }
    }

    // ===== Normal user changing password =====
    else if (newPassword) {
      if (!currentPassword) {
       
        return NextResponse.json(
          {
            success: false,
            message: "Current password is required to change password",
          },
          { status: 400 }
        );
      }

      const isMatch = await bcrypt.compare(
        currentPassword,
        user.password || ""
      );
   
      if (!isMatch) {
        return NextResponse.json(
          { success: false, message: "Current password is incorrect" },
          { status: 400 }
        );
      }

      const hashed = await bcrypt.hash(newPassword, 10);
      updateData.password = hashed;
     
    }

    // ===== Update user in DB =====
    const updatedUser = await userModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    const forceLogout = newPassword || (setPassword && user.isGoogle);

    return NextResponse.json(
      { success: true, user: updatedUser, forceLogout },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
