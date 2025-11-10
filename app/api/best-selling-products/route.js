// app/api/best-selling-products/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db.config";
import Order from "@/models/order.model";
import Product from "@/models/product.model";

export async function GET() {
  try {
    await connectDB();

    // Fetch only delivered orders
    const orders = await Order.find({ status: "Delivered" });

    const productSales = {};

    // Count sales per SKU
    orders.forEach((order) => {
      const sku = order.sku;
      if (!sku) return;

      if (!productSales[sku]) {
        productSales[sku] = { sku, sold: 0 };
      }
      productSales[sku].sold += order.qty || 0;
    });

    const skus = Object.keys(productSales);
    if (!skus.length) return NextResponse.json({ bestSelling: [] });

    // Fetch all products containing these SKUs
    const products = await Product.find({
      $or: [
        { sku: { $in: skus } }, // simple products
        { "variants.sku": { $in: skus } }, // variant products
      ],
    }).select("images thumbnail price discount quantity sku slug attributes variants type productName newArrival ");

    // Map sold quantities to products
    const bestSelling = products?.map((product) => {
      let sold = 0;

      if (product.type === "simple" && productSales[product.sku]) {
        sold = productSales[product.sku].sold;
      } else if (product.type === "variant" && product.variants?.length) {
        product.variants.forEach((v) => {
          if (productSales[v.sku]) sold += productSales[v.sku].sold;
        });
      }

      return { ...product.toObject(), sold };
    });

    // Sort by sold descending
    bestSelling.sort((a, b) => b.sold - a.sold);

    return NextResponse.json({ bestSelling });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch best-selling products" },
      { status: 500 }
    );
  }
}
