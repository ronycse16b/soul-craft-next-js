
import { adminOnlyMiddleware } from "@/lib/authMiddleware";
import { connectDB } from "@/lib/db.config";
import SubCategory from "@/models/SubCategory";
import { NextResponse } from "next/server";




export async function PUT(req) {
    const auth = await adminOnlyMiddleware(req);
    if (auth) return auth; // unauthorized
  try {
    const { name, selectedCategoryId } = await req.json();
    const id = req.url.split("/").pop();

    // Validate input
    if (!id || !name || typeof name !== "string") {
      return NextResponse.json(
        { success: false, message: "Invalid category ID or name." },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if category exists
    const subCategory = await SubCategory.findById(id);
    if (!subCategory) {
      return NextResponse.json(
        { success: false, message: "Category not found." },
        { status: 404 }
      );
    }

    // Create slug
    const slug = name.trim().toLowerCase().replace(/\s+/g, "-");

    // Check for duplicate slug (excluding current category)
    const existing = await SubCategory.findOne({
      slug,
      _id: { $ne: id },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "This name already exists." },
        { status: 409 }
      );
    }

    // Update category
    const updated = await SubCategory.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        slug,
        category: selectedCategoryId, // Note: this line is redundant unless you are changing the parent
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Sub Category updated successfully.",
      category: updated,
    });
  } catch (error) {
    console.error("PUT /category error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong.", error: error.message },
      { status: 500 }
    );
  }
}



