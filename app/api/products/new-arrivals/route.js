// new arrival product fetch only 

import { connectDB } from "@/lib/db.config";
import productModel from "@/models/product.model";
import { NextResponse } from "next/server";
export async function GET() {
  try {
    await connectDB();

    // Fetch only new arrival products
    const products = await productModel.find({ newArrival: true , isActive: true })
      .sort({ createdAt: -1 }) // Sort by creation date, newest first
      .limit(10); // Limit to 10 products

    return NextResponse.json({ data: products ,   }, { status: 200 } );
  } catch (error) {
    console.error("New Arrival Products GET Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}