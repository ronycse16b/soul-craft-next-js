
import { connectDB } from "@/lib/db.config";
import orderModel from "@/models/order.model";

import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  await connectDB();
  const { id } = await params;

  const order = await orderModel.findById(id).select("statusHistory status");
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json(order);
}
