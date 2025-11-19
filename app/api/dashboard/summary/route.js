
import { connectDB } from "@/lib/db.config";
import orderModel from "@/models/order.model";
import { NextResponse } from "next/server";


export async function GET(req) {
   
  await connectDB();

  const totalOrders = await orderModel.countDocuments();
  const pendingOrders = await orderModel.countDocuments({
    status: "Processing",
  });

  const totalSalesAgg = await orderModel.aggregate([
    { $match: { status: "Delivered" } },
    { $group: { _id: null, total: { $sum: "$total" } } },
  ]);
  const totalSales = totalSalesAgg[0]?.total || 0;

  // ✅ New logic to count customers created in last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const newCustomers = await orderModel.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
  });

  return NextResponse.json({
    totalOrders,
    pendingOrders,
    totalSales,
    newCustomers,
  });
}
