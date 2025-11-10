import { adminOnlyMiddleware } from "@/lib/authMiddleware";
import { connectDB } from "@/lib/db.config";
import { verifyAccess } from "@/lib/roleMiddleware";

import Order from "@/models/order.model";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();

    const data = await req.json();

    // Basic validation
    if (!data?.name || !data?.mobile || !data?.address || !data?.productName) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400 }
      );
    }

    const newOrder = new Order({
      name: data.name,
      mobile: data.mobile,
      address: data.address,
      deliveryCharge: data.deliveryCharge,
      paymentMethod: data.paymentMethod || "Cash on delivery",
      productName: data.productName,
      price: data.price,
      total: data.total,
      sku: data.sku,
      qty: data.qty,
      size: data.size,
      image: data.image || "",
      note: data.note || "",
    });

    newOrder.statusHistory.push({ status: "Processing", note: "Order placed" });
    await newOrder.save();

    //  here address name update

    return NextResponse.json({
      success: true,
      message: "Order submitted successfully",
      data: newOrder,
    });
  } catch (err) {
    console.error("Order Submit Error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

// ✅ Get Orders (Search, Filter, Pagination)
export async function GET(req) {
  const auth = await verifyAccess(req, {
    roles: ["admin", "moderator"],
    permission: "read",
  });
 if (auth instanceof NextResponse) return auth;
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status"); // e.g., Pending, Delivered, Cancelled

    const query = {};

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

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

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
