// /api/order/summary
import Order from "@/models/order.model";
import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db.config";
import { verifyAccess } from "@/lib/roleMiddleware";

export async function GET(req) {
      const auth = await verifyAccess(req, {
        roles: ["admin", "moderator"],
        permission: "read",
      });
      if (auth instanceof Response) return auth;
  await connectDB();

  const pipeline = [
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ];

  const result = await Order.aggregate(pipeline);

  const summary = {
    total: result.reduce((acc, cur) => acc + cur.count, 0),
    processing: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };

  result.forEach(({ _id, count }) => {
    summary[_id?.toLowerCase()] = count;
  });

  return NextResponse.json(summary);
}
