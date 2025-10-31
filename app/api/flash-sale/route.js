import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db.config";
import FlashModel from "@/models/flash.model";
import Product from "@/models/product.model";
import { adminOnlyMiddleware } from "@/lib/authMiddleware";



// ================= GET FLASH SALES =================
export async function GET() {
  try {
    await connectDB();
    const flashSales = await FlashModel.find()
      .populate({
        path: "products.productId",
        select:
          "productName brand price sku images discount flashSale type variant",
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
  const auth = await adminOnlyMiddleware(req);
  if (auth) return auth;

  try {
    await connectDB();
    const { title, endTime, products } = await req.json();

    const flashSale = await FlashModel.create({ title, endTime, products });

    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      const percentage = Number(item.discount || 0);

      if (product.type === "simple") {
        // discount = price after percentage
        product.discount = Math.round(product.price - (product.price * percentage) / 100);
        product.flashSale = true;
        await product.save();
      } else if (product.type === "variant" && Array.isArray(product.variant)) {
        product.flashSale = true;
        product.variant = product.variant.map((v) => ({
          ...v.toObject(),
          discount: Math.round(v.price - (v.price * percentage) / 100),
        }));
        await product.save();
      }
    }

    return NextResponse.json({ success: true, flashSale });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// ================= UPDATE FLASH SALE =================
export async function PUT(req) {
  const auth = await adminOnlyMiddleware(req);
  if (auth) return auth;

  try {
    await connectDB();
    const { id, title, endTime, products } = await req.json();

    // Reset old flash sale products
    const oldFlash = await FlashModel.findById(id);
    if (oldFlash) {
      for (const item of oldFlash.products) {
        const product = await Product.findById(item.productId);
        if (!product) continue;

        product.flashSale = false;
        product.discount = 0;

        if (product.type === "variant" && Array.isArray(product.variant)) {
          product.variant = product.variant.map((v) => ({ ...v.toObject(), discount: 0 }));
        }

        await product.save();
      }
    }

    // Update flash sale
    const updated = await FlashModel.findByIdAndUpdate(
      id,
      { title, endTime, products },
      { new: true }
    );

    // Apply new discount
    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) continue;

      const percentage = Number(item.discount || 0);

      if (product.type === "simple") {
        product.discount = Math.round(product.price - (product.price * percentage) / 100);
        product.flashSale = true;
        await product.save();
      } else if (product.type === "variant" && Array.isArray(product.variant)) {
        product.flashSale = true;
        product.variant = product.variant.map((v) => ({
          ...v.toObject(),
          discount: Math.round(v.price - (v.price * percentage) / 100),
        }));
        await product.save();
      }
    }

    return NextResponse.json({ success: true, updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

// ================= DELETE FLASH SALE =================
export async function DELETE(req) {
  const auth = await adminOnlyMiddleware(req);
  if (auth) return auth;

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

        if (product.type === "variant" && Array.isArray(product.variant)) {
          product.variant = product.variant.map((v) => ({ ...v.toObject(), discount: 0 }));
        }

        await product.save();
      }
    }

    await FlashModel.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}


