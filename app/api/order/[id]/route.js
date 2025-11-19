
import { connectDB } from "@/lib/db.config";
import { verifyAccess } from "@/lib/roleMiddleware";
import orderModel from "@/models/order.model";
import productModel from "@/models/product.model";
import { NextResponse } from "next/server";

// PUT /api/orders/[id]
export async function PUT(req, { params }) {
   const auth = await verifyAccess(req, {
     roles: ["admin", "moderator"],
     permission: "update",
   });
   if (auth instanceof Response) return auth;
  await connectDB();

  const { id } = params;
  const { status } = await req.json();

  const order = await orderModel.findById(id);
  if (!order)
    return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const prevStatus = order.status;

  // Update order status
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
    const qty = order.qty || 0;
    const stockChange = isSuccess ? -qty : qty;
    const soldChange = isSuccess ? qty : -qty;

    // Find product (simple or variant)
    const product = await productModel.findOne({
      $or: [{ sku: order.sku }, { "variants.sku": order.sku }],
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found for given SKU" },
        { status: 404 }
      );
    }

    // SIMPLE PRODUCT
    if (product.type === "simple" && product.sku === order.sku) {
      await productModel.updateOne(
        { sku: order.sku },
        { $inc: { quantity: stockChange, totalSold: soldChange } }
      );
    }

    // VARIANT PRODUCT
    else if (product.type === "variant") {
      const variantIndex = product.variants.findIndex(
        (v) => v.sku === order.sku
      );

      if (variantIndex === -1) {
        return NextResponse.json(
          { error: "Variant SKU not found in product" },
          { status: 404 }
        );
      }

      product.variants[variantIndex].quantity += stockChange;
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
