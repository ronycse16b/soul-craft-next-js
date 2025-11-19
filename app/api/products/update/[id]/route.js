
import { connectDB } from "@/lib/db.config";
import { verifyAccess } from "@/lib/roleMiddleware";
import productModel from "@/models/product.model";
import { NextResponse } from "next/server";




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
