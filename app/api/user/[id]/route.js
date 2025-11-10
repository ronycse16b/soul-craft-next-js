import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db.config";
import User from "@/models/user.model";
import { verifyAccess } from "@/lib/roleMiddleware";

// ✅ GET user by ID
export async function GET(req, { params }) {
    const auth = await verifyAccess(req, {
      roles: ["admin", "moderator"],
      permission: "read",
    });
    if (auth instanceof Response) return auth;
  try {

    await connectDB();
    const { id } = await params;
    const user = await User.findById(id).select("-password");
    if (!user)
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// ✅ PUT update user (role or permissions)
export async function PUT(req, { params }) {
    const auth = await verifyAccess(req, {
      roles: ["admin"],
      permission: "update",
    });
    if (auth instanceof Response) return auth;
  try {
    await connectDB();
    const { name, image, role, permissions } = await req.json();

    const {id} = await params;

    const updatedUser = await User.findByIdAndUpdate(
     id,
      { name, image, role, permissions },
      { new: true }
    ).select("-password");

    if (!updatedUser)
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// ✅ DELETE user
export async function DELETE(req, { params }) {
    const auth = await verifyAccess(req, {
      roles: ["admin"],
      permission: "delete",
    });
    if (auth instanceof Response) return auth;
  try {
    await connectDB();
    const { id } = await params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser)
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    return NextResponse.json({ success: true, message: "User deleted" });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
