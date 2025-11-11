
import Category from "@/models/Category";
import { NextResponse } from "next/server";

import SubCategory from "@/models/SubCategory";
import productModel from "@/models/product.model";

import { connectDB } from "@/lib/db.config";
import { verifyAccess } from "@/lib/roleMiddleware";




export async function POST(req) {
      const auth = await verifyAccess(req, {
        roles: ["admin", "moderator"],
        permission: "create",
      });
      if (auth instanceof Response) return auth;

  try {
    await connectDB();

    const { name,image } = await req.json();

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Category name is required" },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name.toLowerCase().trim().replace(/\s+/g, "-");

    // Check for existing category with the same slug
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return NextResponse.json(
        { success: false, message: "Category with this name already exists" },
        { status: 409 }
      );
    }

    // Create and save new category
    const category = new Category({ name, slug,image });
    await category.save();

    return NextResponse.json({ success: true, category , message: "Category created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}


// get categories with sub categories
export async function GET(req) {
   const auth = await verifyAccess(req, {
     roles: ["admin", "moderator"],
     permission: "read",
   });
   if (auth instanceof Response) return auth;
  try {
    await connectDB();

    const categories = await Category.find().lean();

    const result = await Promise.all(
      categories.map(async (category) => {
        const subCategories = await SubCategory.find({
          category: category._id,
        }).lean();

        const subCategoriesWithCount = await Promise.all(
          subCategories.map(async (sub) => {
            const count = await productModel.countDocuments({
              subCategory: sub._id,
            });

            return {
              ...sub,
              productCount: count,
            };
          })
        );

        return {
          ...category,
          subCategories: subCategoriesWithCount,
        };
      })
    );

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}


export async function PUT(req) {
 const auth = await verifyAccess(req, {
       roles: ["admin", "moderator"],
       permission: "create",
     });
     if (auth instanceof Response) return auth;

  const { name, selectedCategoryId } = await req.json();
  const id = req.url.split("/").pop();
  if (!id || !name?.trim() || !selectedCategoryId)
    return NextResponse.json(
      { success: false, message: "Invalid data" },
      { status: 400 }
    );
  await connectDB();
  const category = await Category.findById(selectedCategoryId);
  if (!category)
    return NextResponse.json(
      { success: false, message: "Category not found" },
      { status: 404 }
    );

  const slug = name.trim().toLowerCase().replace(/\s+/g, "-");
  const existing = await SubCategory.findOne({
    slug,
    category: category._id,
    _id: { $ne: id },
  });
  if (existing)
    return NextResponse.json(
      { success: false, message: "Exists" },
      { status: 409 }
    );

  const updated = await SubCategory.findByIdAndUpdate(
    id,
    { name: name.trim(), slug, category: category._id },
    { new: true }
  );
  return NextResponse.json({ success: true, sub: updated });
}



export async function POST_delete(req) {
 const auth = await verifyAccess(req, {
       roles: ["admin", "moderator"],
       permission: "create",
     });
     if (auth instanceof Response) return auth;
  try {
    const { subId, fallbackId } = await req.json();

    // Basic validation
    if (!subId || !fallbackId || subId === fallbackId) {
      return NextResponse.json(
        { success: false, message: "Invalid IDs" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if fallback subcategory exists
    const fallback = await SubCategory.findById(fallbackId);
    if (!fallback) {
      return NextResponse.json(
        { success: false, message: "Fallback subcategory does not exist" },
        { status: 404 }
      );
    }

    // Reassign all products from subId -> fallbackId
    await productModel.updateMany(
      { subCategory: subId },
      { $set: { subCategory: fallbackId } }
    );

    // Delete the subcategory
    await SubCategory.findByIdAndDelete(subId);

    return NextResponse.json({
      success: true,
      message: "Subcategory deleted and products reassigned.",
    });
  } catch (error) {
    console.error("Delete subcategory error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

