// /app/api/products/search/route.ts
import productModel from "@/models/product.model";
import { NextResponse } from "next/server";


export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query) return NextResponse.json({ products: [] });

  const products = await productModel.find({
    productName: { $regex: query, $options: "i" },
    isActive: true,
  })
    .select("productName slug thumbnail")
    .limit(8);

  return NextResponse.json({ data:products });
}
