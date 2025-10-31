
import { connectDB } from "@/lib/db.config";
import productModel from "@/models/product.model";
import { NextResponse } from "next/server";


export async function GET() {
  await connectDB();

  const topProducts = await productModel.find({})
    .sort({ totalSold: -1 })
    .limit(5)
    .select("productName totalSold price");

  const result = topProducts.map((p) => ({
    name: p.productName,
    totalSales: p.totalSold * p.price,
  }));

  return NextResponse.json(result);
}
