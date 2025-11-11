import { adminOnlyMiddleware } from "@/lib/authMiddleware";
import { connectDB } from "@/lib/db.config";
import orderModel from "@/models/order.model";
import { NextResponse } from "next/server";
;


export async function GET(req) {
  await connectDB();

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const todayOrders = await orderModel.find({ createdAt: { $gte: start } })
    .sort({ createdAt: -1 })
    .limit(10)
    .select("orderNumber total name createdAt");

  return NextResponse.json(todayOrders);
}
