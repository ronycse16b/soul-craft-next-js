import { userOnlyMiddleware } from "@/lib/authMiddleware";
import Order from "@/models/order.model";
import { connectDB } from "@/lib/db.config";
import { NextResponse } from "next/server";



export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Filters
    const search = searchParams.get("search") || "";
    const phone = searchParams.get("phone") || "";
    const status = searchParams.get("status") || "";

    // -------------------------------
    // 📌 1. Get Auth User by Phone
    // -------------------------------
    // const user = await userModel.findOne({ emailOrPhone: phone });

    // if (!user) {
    //   return NextResponse.json(
    //     { success: false, message: "User not found" },
    //     { status: 404 }
    //   );
    // }

    // -------------------------------
    // 📌 2. Build Order Query
    // -------------------------------
    const query = {
      mobile: phone,
    };

    // 🔍 Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
        { productName: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
      ];
    }

    // 🔵 Status Filter
    if (status) {
      query.status = status;
    }

    // -------------------------------
    // 📌 3. Count Total Orders
    // -------------------------------
    const total = await Order.countDocuments(query);

    // -------------------------------
    // 📌 4. Fetch Paginated Orders
    // -------------------------------
    const orders = await Order.find(query)
      .sort({ createdAt: -1 }) // latest first
      .skip((page - 1) * limit)
      .limit(limit);

    // -------------------------------
    // 📌 5. API Response
    // -------------------------------
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
    console.error("Order Fetch Error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

