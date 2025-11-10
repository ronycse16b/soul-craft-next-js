import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db.config";
import User from "@/models/user.model";
import bcrypt from "bcrypt";
import { adminOnlyMiddleware } from "@/lib/authMiddleware";
import { verifyAccess } from "@/lib/roleMiddleware";

// ✅ GET: All users (with pagination + search)
export async function GET(req) {
  const auth = await verifyAccess(req, {
    roles: ["admin", "moderator"],
    permission: "read",
  });
  if (auth instanceof Response) return auth;
  try {
    await connectDB();

    // Parse URL query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";

    // Build query
    const query = {
      ...(role ? { role } : {}),
      ...(search
        ? {
            $or: [
              { name: { $regex: search, $options: "i" } },
              { emailOrPhone: { $regex: search, $options: "i" } },
            ],
          }
        : {}),
    };

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find(query)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// ✅ POST: Create new user
export async function POST(req) {
  const auth = await adminOnlyMiddleware(req);
  if (auth) return auth;
  try {
    await connectDB();
    const { name, emailOrPhone, password, role, permissions, image } =
      await req.json();

    if (!name || !emailOrPhone || !password) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ emailOrPhone });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      emailOrPhone,
      password: hashedPassword,
      image,
      role,
      permissions,
    });

    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
