import { adminOnlyMiddleware } from "@/lib/authMiddleware";
import { connectDB } from "@/lib/db.config";

import orderModel from "@/models/order.model";
import {
  addDays,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { NextResponse } from "next/server";

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter") || "week";

  let fromDate = new Date();
  let daysCount = 1; // default for today

  if (filter === "today") {
    fromDate = startOfDay(new Date());
    daysCount = 1;
  } else if (filter === "week") {
    fromDate = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday start
    daysCount = 7;
  } else if (filter === "month") {
    fromDate = startOfMonth(new Date());
    daysCount = 30;
  }

  // Fetch orders created from fromDate till now
  const orders = await orderModel.find({ createdAt: { $gte: fromDate } });

  // Aggregate sales totals by day key 'yyyy-MM-dd'
  const dailyTotals = {};
  orders.forEach((order) => {
    const day = format(order.createdAt, "yyyy-MM-dd");
    dailyTotals[day] = (dailyTotals[day] || 0) + order.total;
  });

  // Prepare labels and sales arrays
  const labels = [];
  const sales = [];

  for (let i = 0; i < daysCount; i++) {
    const currentDay = addDays(fromDate, i);
    const dayKey = format(currentDay, "yyyy-MM-dd");
    labels.push(format(currentDay, "MMM d")); // e.g. "Jun 17"
    sales.push(dailyTotals[dayKey] || 0);
  }

  return NextResponse.json({ labels, sales });
}
