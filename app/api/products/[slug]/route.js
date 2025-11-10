// single product get

import { connectDB } from "@/lib/db.config";
import ProductModel from "@/models/product.model";
import { NextResponse } from "next/server";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";
export async function GET(req, { params }) {
  try {
    await connectDB();
    const { slug } = await params;

    // Fetch product by slug
    const product = await ProductModel.findOne({ slug })
      .populate("subCategory", "name")
      .lean();
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product }, { status: 200 });
  } catch (error) {
    console.error("Product GET Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
