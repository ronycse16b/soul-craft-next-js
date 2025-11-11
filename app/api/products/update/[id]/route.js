import { adminOnlyMiddleware } from "@/lib/authMiddleware";
import { connectDB } from "@/lib/db.config";
import { verifyAccess } from "@/lib/roleMiddleware";
import productModel from "@/models/product.model";
import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";



export async function PUT(req, { params }) {
 const auth = await verifyAccess(req, {
   roles: ["admin", "moderator"],
   permission: "update",
 });
 if (auth instanceof Response) return auth;

  try {
    await connectDB();
    const { id } = await params; // corrected
    const body = await req.json();

    const product = await productModel.findById(id);
    if (!product) {
      return new Response("Product not found", { status: 404 });
    }

    // --- Extract image paths from HTML description ---
    const extractImagePaths = (html) => {
      if (!html) return [];
      const matches = [...html.matchAll(/<img[^>]+src="([^">]+)"/g)];
      return matches.map((m) => m[1]);
    };

    // --- Delete unused images in description ---
    const oldImages = new Set(extractImagePaths(product.description));
    const newImages = new Set(extractImagePaths(body.description));

    const removedImages = [...oldImages].filter((img) => !newImages.has(img));

    for (const imgPath of removedImages) {
      const relativePath = imgPath.startsWith("/")
        ? imgPath.substring(1)
        : imgPath;
      const fullPath = path.join(process.cwd(), relativePath);

      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
          console.log(`Deleted unused image: ${fullPath}`);
        } catch (err) {
          console.error(`Failed to delete ${fullPath}: ${err.message}`);
        }
      }
    }

    // --- Convert numeric fields in variants array ---
    if (body.variants && Array.isArray(body.variants)) {
      body.variants = body.variants.map((v) => ({
        ...v,
        price: Number(v.price) || 0,
        quantity: Number(v.quantity) || 0,
        discount: Number(v.discount) || 0,
      }));
    }

    // --- Convert root level numeric fields ---
    if (body.price !== undefined) body.price = Number(body.price) || 0;
    if (body.quantity !== undefined) body.quantity = Number(body.quantity) || 0;
    if (body.discount !== undefined) body.discount = Number(body.discount) || 0;

    // --- Update product fields ---
    for (const key in body) {
      if (key !== "_id") {
        product[key] = body[key];
      }
    }

    await product.save();

    return NextResponse.json(
      { success: true, message: "Product updated successfully", product },
      { status: 200 }
    );
  } catch (error) {
    console.error("Product PUT Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
