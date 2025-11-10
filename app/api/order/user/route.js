import { userOnlyMiddleware } from "@/lib/authMiddleware";
import { connectDB } from "@/lib/db.config";
import Order from "@/models/order.model";
import userModel from "@/models/user.model";
import { NextResponse } from "next/server";

export async function GET(req) {
//   console.log("[DEBUG] GET /order/user triggered");

  // Step 1: Validate user
  const token = await userOnlyMiddleware(req);
  if (token instanceof Response) return token; // unauthorized
//   console.log("[DEBUG] Auth token payload:", token);

  try {
    // Step 2: Connect to DB
    await connectDB();

    const { searchParams } = new URL(req.url);

    // Step 3: Pagination & filters
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status"); // e.g., Pending, Delivered, Cancelled

    // Step 4: Fetch the actual user from DB
    const user = await userModel.findOne({ emailOrPhone: token.emailOrPhone });
    if (!user) {
    //   console.log("[DEBUG] User not found in DB:", token.emailOrPhone);
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }
    // console.log("[DEBUG] Found user:", user.emailOrPhone);

    // Step 5: Build query
    const query = { emailOrPhone: user.emailOrPhone };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
        { productName: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      query.status = status;
    }

    // console.log("[DEBUG] Order query:", query);

    // Step 6: Fetch total count
    const total = await Order.countDocuments(query);
    // console.log("[DEBUG] Total orders found:", total);

    // Step 7: Fetch paginated orders
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    // console.log("[DEBUG] Orders fetched:", orders.length);

    // Step 8: Return response
    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("[DEBUG] Order Fetch Error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
