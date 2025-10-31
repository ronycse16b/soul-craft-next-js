// app/api/orders/[id]/route.js

import { NextResponse } from "next/server";

import { adminOnlyMiddleware } from "@/lib/authMiddleware";
import { connectDB } from "@/lib/db.config";
import Order from "@/models/order.model";

export async function PUT(req, { params }) {
    const auth = await adminOnlyMiddleware(req);
    if (auth) return auth; // unauthorized
  await connectDB();

  const { id } = await params;
  const body = await req.json();

  try {
    const updatedOrder = await Order.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedOrder) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error) {
    console.error("PUT /api/orders/[id] Error:", error);
    return NextResponse.json(
      { message: "Failed to update order", error },
      { status: 500 }
    );
  }
}
