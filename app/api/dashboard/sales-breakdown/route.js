
import { adminOnlyMiddleware } from "@/lib/authMiddleware";
import { connectDB } from "@/lib/db.config";

import orderModel from "@/models/order.model";
import { NextResponse } from "next/server";

export async function GET(req) {
  await connectDB();

  const statusCounts = await orderModel.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalSales: { $sum: "$total" },
      },
    },
  ]);

  // Normalize data
  const result = {
    Delivered: { count: 0, totalSales: 0 },
    Shipped: { count: 0, totalSales: 0 },
    Processing: { count: 0, totalSales: 0 },
    Returned: { count: 0, totalSales: 0 },
    Failed: { count: 0, totalSales: 0 },
  };

  statusCounts.forEach((item) => {
    const key = item._id;
    if (result[key]) {
      result[key].count = item.count;
      result[key].totalSales = item.totalSales;
    }
  });

  return NextResponse.json(result);
}
