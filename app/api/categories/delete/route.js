import { adminOnlyMiddleware } from "@/lib/authMiddleware";
import { connectDB } from "@/lib/db.config";
import SubCategory from "@/models/SubCategory";
import productModel from "@/models/product.model";
import { NextResponse } from "next/server";

export async function POST(req) {
    const auth = await adminOnlyMiddleware(req);
    if (auth) return auth; // unauthorized
  try {
    const { subId, fallbackId } = await req.json();

    if (!subId) {
      return NextResponse.json(
        { success: false, message: "Subcategory ID is required." },
        { status: 400 }
      );
    }

    await connectDB();

    if (fallbackId) {
      // Reassign products if fallbackId is provided
      const fallback = await SubCategory.findById(fallbackId);
      if (!fallback) {
        return NextResponse.json(
          { success: false, message: "Fallback subcategory not found." },
          { status: 404 }
        );
      }

      // Update products linked to subId
      await productModel.updateMany(
        { subCategory: subId },
        { $set: { subCategory: fallbackId } }
      );
    }

    // Always delete the subcategory
    await SubCategory.findByIdAndDelete(subId);

    return NextResponse.json({
      success: true,
      message: fallbackId
        ? "Subcategory deleted and products reassigned."
        : "Subcategory deleted.",
    });
  } catch (error) {
    console.error("Delete subcategory error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
