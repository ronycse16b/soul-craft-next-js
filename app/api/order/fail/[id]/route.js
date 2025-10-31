import { NextResponse } from "next/server";

import { adminOnlyMiddleware } from "@/lib/authMiddleware";
import { connectDB } from "@/lib/db.config";
import Order from "@/models/order.model";

export async function PUT(req, { params }) {
    const auth = await adminOnlyMiddleware(req);
    if (auth) return auth; // unauthorized
  await connectDB();

  try {
    const { id } = await params;
    const { status, note } = await req.json();

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // ✅ Ensure statusHistory exists
    if (!Array.isArray(order.statusHistory)) {
      order.statusHistory = [];
    }

    // ✅ Push to statusHistory
    order.statusHistory.push({
      status,
      note: note || "",
      changedAt: new Date(),
    });

    // ✅ Update the current status too
    order.status = status;

    await order.save();

    return NextResponse.json({ message: "Status updated", order });
  } catch (err) {
    console.error("Status Update Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
