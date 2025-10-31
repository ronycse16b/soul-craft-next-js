import { adminOnlyMiddleware } from "@/lib/authMiddleware";
import { connectDB } from "@/lib/db.config";
import SubCategory from "@/models/SubCategory";
import { NextResponse } from "next/server";

export async function POST(req) {
    const auth = await adminOnlyMiddleware(req);
    if (auth) return auth; // unauthorized
  try {
    await connectDB();
    const { name, selectedCategoryId } = await req.json();

    if (!name || !selectedCategoryId) {
      return NextResponse.json(
        { success: false, error: "Name and category ID are required" },
        { status: 400 }
      );
    }

    // Check for duplicate subcategory under same category
    const existing = await SubCategory.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
      category: selectedCategoryId,
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Subcategory already exists under this category",
        },
        { status: 409 }
      );
    }

    // Use constructor + .save() to apply default values like isActive
    const subCategory = new SubCategory({
      name,
      category: selectedCategoryId,
    });

    await subCategory.save();

    // console.log("SubCategory Saved:", subCategory);

    return NextResponse.json(
      {
        success: true,
        data: subCategory,
        message: "Subcategory created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating subcategory:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
