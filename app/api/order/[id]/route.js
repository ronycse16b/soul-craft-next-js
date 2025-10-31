import { adminOnlyMiddleware } from "@/lib/authMiddleware";
import { connectDB } from "@/lib/db.config";

import orderModel from "@/models/order.model";
import productModel from "@/models/product.model";
import { NextResponse } from "next/server";

// PUT /api/orders/[id]
export async function PUT(req, { params }) {
    const auth = await adminOnlyMiddleware(req);
    if (auth) return auth; // unauthorized
  await connectDB();

  const { id } = params;
  const body = await req.json();
  const { status } = body;

  const order = await orderModel.findById(id);
  if (!order)
    return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const prevStatus = order.status;

  // Update order
  const updatedOrder = await orderModel.findByIdAndUpdate(
    id,
    {
      status,
      ...(status !== "Processing" && { read: true }),
    },
    { new: true }
  );

  const statusChanged = prevStatus !== status;
  const isSuccess = ["Delivered", "Shipped"].includes(status);
  const isFailed = ["Return", "Failed"].includes(status);

  if (statusChanged && (isSuccess || isFailed)) {
    const qty = order.qty;
    const stockChange = isSuccess ? -qty : qty;
    const soldChange = isSuccess ? qty : -qty;

    const product = await productModel.findOne({
      $or: [{ sku: order.sku }, { "variant.sku": order.sku }],
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found for given SKU" },
        { status: 404 }
      );
    }

    // SIMPLE PRODUCT UPDATE
    if (product.type === "simple" && product.sku === order.sku) {
      await productModel.updateOne(
        { sku: order.sku },
        {
          $inc: {
            quantity: stockChange,
            totalSold: soldChange,
          },
        }
      );
    }

    // VARIANT PRODUCT UPDATE
    else if (product.type === "variant") {
      const variantIndex = product.variant.findIndex(
        (v) => v.sku === order.sku
      );

      if (variantIndex === -1) {
        return NextResponse.json(
          { error: "Variant SKU not found in product" },
          { status: 404 }
        );
      }

      product.variant[variantIndex].quantity += stockChange;
      product.totalSold = (product.totalSold || 0) + soldChange;

      await product.save();
    }

    // Fallback
    else {
      return NextResponse.json(
        { error: "Product type/sku mismatch" },
        { status: 400 }
      );
    }
  }

  return NextResponse.json({ success: true, data: updatedOrder });
}
