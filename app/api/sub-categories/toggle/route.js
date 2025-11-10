import { adminOnlyMiddleware } from "@/lib/authMiddleware";
import { connectDB } from "@/lib/db.config";
import { verifyAccess } from "@/lib/roleMiddleware";
import productModel from "@/models/product.model";
import SubCategory from "@/models/SubCategory";

import { NextResponse } from "next/server";





export async function PUT(req) {
  const auth = await verifyAccess(req, {
    roles: ["admin", "moderator"],
    permission: "update",
  });
  if (auth instanceof Response) return auth;
  try {
    const { id, isActive } = await req.json();
    console.log("Toggle subcategory active status:", { id, isActive });

    if (!id || typeof isActive !== "boolean") {
      return NextResponse.json(
        { success: false, message: "Invalid data" },
        { status: 400 }
      );
    }

    await connectDB();

    // 1. Find subcategory and check if exists
    const subCategory = await SubCategory.findById(id).populate(
      "category",
      "name"
    );

    if (!subCategory) {
      return NextResponse.json(
        { success: false, message: "Subcategory not found." },
        { status: 404 }
      );
    }

    // 2. Update subcategory status
    await SubCategory.findByIdAndUpdate(id, { isActive });

    // 3. Update all products under this subcategory
    await productModel.updateMany({ subCategory: id }, { $set: { isActive } });

    return NextResponse.json({ success: true, subCategory });
  } catch (error) {
    console.error("Error toggling subcategory:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
