import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db.config";
import FlashModel from "@/models/flash.model";
import Product from "@/models/product.model";
import { adminOnlyMiddleware } from "@/lib/authMiddleware";
import { verifyAccess } from "@/lib/roleMiddleware";



// ================= GET FLASH SALES =================
export async function GET() {
  try {
    await connectDB();
    const flashSales = await FlashModel.find()
      .populate({
        path: "products.productId",
        select:
          "productName brand price sku slug quantity images discount flashSale type variants thumbnail",
      })
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, flashSales });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

// ================= CREATE FLASH SALE =================
export async function POST(req) {
   const auth = await verifyAccess(req, {
     roles: ["admin", "moderator"],
     permission: "create",
   });
   if (auth instanceof Response) return auth;

  try {
    await connectDB();
    const { title, endTime, products } = await req.json();

    const flashSale = await FlashModel.create({ title, endTime, products });

    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      const percentage = Number(item.discount || 0);

      if (product.type === "simple") {
        // ✅ Simple product discount
        product.discount = Math.round(product.price - (product.price * percentage) / 100);
        product.flashSale = true;
      } 
      else if (product.type === "variant" && Array.isArray(product.variants)) {
        // ✅ Apply discount to all variants
        product.flashSale = true;
        product.variants = product.variants.map((v) => ({
          ...v.toObject?.() || v,
          discount: Math.round(v.price - (v.price * percentage) / 100),
        }));
      }

      await product.save();
    }

    return NextResponse.json({ success: true, flashSale });
  } catch (err) {
    console.error("POST FLASH SALE ERROR:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}



// ================= UPDATE FLASH SALE =================
export async function PUT(req) {
    
   const auth = await verifyAccess(req, {
     roles: ["admin", "moderator"],
     permission: "update",
   });
   if (auth instanceof Response) return auth;

  try {
    await connectDB();
    const { id, title, endTime, products } = await req.json();

    // ✅ Reset old products before applying new discounts
    const oldFlash = await FlashModel.findById(id);
    if (oldFlash) {
      for (const item of oldFlash.products) {
        const product = await Product.findById(item.productId);
        if (!product) continue;

        product.flashSale = false;
        product.discount = 0;

        if (product.type === "variant" && Array.isArray(product.variants)) {
          product.variants = product.variants.map((v) => ({
            ...v.toObject?.() || v,
            discount: 0,
          }));
        }

        await product.save();
      }
    }

    // ✅ Update flash sale data
    const updated = await FlashModel.findByIdAndUpdate(
      id,
      { title, endTime, products },
      { new: true }
    );

    // ✅ Apply discounts to new product list
    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      const percentage = Number(item.discount || 0);

      if (product.type === "simple") {
        product.discount = Math.round(product.price - (product.price * percentage) / 100);
        product.flashSale = true;
      } 
      else if (product.type === "variant" && Array.isArray(product.variants)) {
        product.flashSale = true;
        product.variants = product.variants.map((v) => ({
          ...v.toObject?.() || v,
          discount: Math.round(v.price - (v.price * percentage) / 100),
        }));
      }

      await product.save();
    }

    return NextResponse.json({ success: true, updated });
  } catch (err) {
    console.error("PUT FLASH SALE ERROR:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}



// ================= DELETE FLASH SALE =================
export async function DELETE(req) {
   const auth = await verifyAccess(req, {
     roles: ["admin", "moderator"],
     permission: "delete",
   });
   if (auth instanceof Response) return auth;

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const flash = await FlashModel.findById(id);

    if (flash) {
      for (const item of flash.products) {
        const product = await Product.findById(item.productId);
        if (!product) continue;

        product.discount = 0;
        product.flashSale = false;

        if (product.type === "variant" && Array.isArray(product.variants)) {
          product.variants = product.variants.map((v) => ({
            ...v.toObject?.() || v,
            discount: 0,
          }));
        }

        await product.save();
      }
    }

    await FlashModel.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE FLASH SALE ERROR:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
