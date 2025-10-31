
import Category from "@/models/Category";
import { NextResponse } from "next/server";

import { adminOnlyMiddleware } from "@/lib/authMiddleware";
import { connectDB } from "@/lib/db.config";




export async function PUT(req) {
    const auth = await adminOnlyMiddleware(req);
    if (auth) return auth;
    
     // unauthorized
  try {
    const { name,image } = await req.json();
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
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found." },
        { status: 404 }
      );
    }

    // Create slug
    const slug = name.trim().toLowerCase().replace(/\s+/g, "-");

    // Check for duplicate slug (excluding current category)
    const existing = await Category.findOne({
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
    const updated = await Category.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        slug,
        image,
        category: category._id, // Note: this line is redundant unless you are changing the parent
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Category updated successfully.",
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



