// import { adminOnlyMiddleware } from "@/lib/authMiddleware";
// import { connectDB } from "@/lib/db.config";
// import productModel from "@/models/product.model";
// import { NextResponse } from "next/server";

// export async function PUT(req, { params }) {
//     const auth = await adminOnlyMiddleware(req);
//     if (auth) return auth; // unauthorized
//   try {
//     await connectDB();
//     const { id } = await params;
//     const body = await req.json();

//     const product = await productModel.findById(id);
//     if (!product) {
//       return new Response("Product not found", { status: 404 });
//     }

//     // Convert numeric fields in variant array
//     if (body.variant && Array.isArray(body.variant)) {
//       body.variant = body.variant.map((v) => ({
//         variant: v.variant,
//         price: Number(v.price),
//         quantity: Number(v.quantity),
//         sku: v.sku,
//         discount: Number(v.discount),
//       }));
//     }

//     // Convert root level numeric fields
//     if (body.price !== undefined) body.price = Number(body.price);
//     if (body.quantity !== undefined) body.quantity = Number(body.quantity);
//     if (body.discount !== undefined) body.discount = Number(body.discount);

//     // Update all fields from body to product (except _id)
//     for (const key in body) {
//       if (key !== "_id") {
//         product[key] = body[key];
//       }
//     }

//     await product.save();

//        return NextResponse.json(
//           { success: false, message: "Product updated Successfully" },
//           { status: 200 }
//         );;
//   } catch (error) {
//     console.error("Product PUT Error:", error);
//     return NextResponse.json(
//          { success: false, message: "Server error" },
//          { status: 500 }
//        );
//   }
// }

import { adminOnlyMiddleware } from "@/lib/authMiddleware";
import { connectDB } from "@/lib/db.config";
import productModel from "@/models/product.model";
import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";

export async function PUT(req, { params }) {
  const auth = await adminOnlyMiddleware(req);
  if (auth) return auth; // unauthorized

  try {
    await connectDB();
    const { id } = await params;
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
      // adjust this folder to your actual upload folder
      const relativePath = imgPath.startsWith("/")
        ? imgPath.substring(1)
        : imgPath;
      const fullPath = path.join(process.cwd(), relativePath);
      // equivalent to: project-root/uploads/1750489502573-description.jpg

      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
          console.log(`Deleted unused image: ${fullPath}`);
        } catch (err) {
          console.error(`Failed to delete ${fullPath}: ${err.message}`);
        }
      }
    }

    // --- Convert numeric fields in variant array ---
    if (body.variant && Array.isArray(body.variant)) {
      body.variant = body.variant.map((v) => ({
        variant: v.variant,
        price: Number(v.price),
        quantity: Number(v.quantity),
        sku: v.sku,
        discount: Number(v.discount),
      }));
    }

    // --- Convert root level numeric fields ---
    if (body.price !== undefined) body.price = Number(body.price);
    if (body.quantity !== undefined) body.quantity = Number(body.quantity);
    if (body.discount !== undefined) body.discount = Number(body.discount);

    // --- Update product fields ---
    for (const key in body) {
      if (key !== "_id") {
        product[key] = body[key];
      }
    }

    await product.save();

    return NextResponse.json(
      { success: true, message: "Product updated successfully" },
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
