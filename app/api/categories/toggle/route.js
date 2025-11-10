import { adminOnlyMiddleware } from "@/lib/authMiddleware";
import { connectDB } from "@/lib/db.config";
import { verifyAccess } from "@/lib/roleMiddleware";
import Category from "@/models/Category";
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
    if (!id || typeof isActive !== "boolean") {
      return NextResponse.json(
        { success: false, message: "Invalid data" },
        { status: 400 }
      );
    }

    await connectDB();

    // 1. Update the parent category's isActive
    await Category.findByIdAndUpdate(id, { isActive });

    // 2. Find all subcategories under this parent
    const subCategories = await SubCategory.find({ category: id });

    // 3. Update all subcategories' isActive status
    await SubCategory.updateMany({ category: id }, { $set: { isActive } });

    // 4. Update all related products under those subcategories
    const subCategoryIds = subCategories.map((sub) => sub._id);

    await productModel.updateMany(
      { subCategory: { $in: subCategoryIds } },
      { $set: { isActive } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error toggling category:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

