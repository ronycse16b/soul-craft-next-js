import productModel from "@/models/product.model";
import connectDB from "./db";

export async function getProductUrls() {
  await connectDB();

  const products = await productModel.find({ isActive: true }).select("slug");

  return products.map((product) => ({
    loc: `https://nobofit.com/products/${product.slug}`,
    changefreq: "daily",
    priority: 0.7,
    lastmod: new Date().toISOString(),
  }));
}
