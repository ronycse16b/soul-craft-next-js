
import { connectDB } from "@/lib/db.config";
import productModel from "@/models/product.model";
import { NextResponse } from "next/server";

// GET: /api/products/related?category=xxx&exclude=xxx
export async function GET(request) {
  await connectDB();

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const exclude = searchParams.get("exclude");

  if (!category) {
    return NextResponse.json(
      { success: false, message: "Category is required" },
      { status: 400 }
    );
  }

  try {
    const relatedProducts = await productModel
      .find({
        subCategory: category,
        _id: { $ne: exclude }, // exclude current product
        isActive: true,
      })
      .sort({ createdAt: -1 }) // newest first
      .limit(10);

    return NextResponse.json({ success: true, data: relatedProducts });
  } catch (err) {
    console.error("Related products fetch error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch related products" },
      { status: 500 }
    );
  }
}
