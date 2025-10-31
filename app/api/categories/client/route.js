
import { connectDB } from "@/lib/db.config";
import Category from "@/models/Category";
import productModel from "@/models/product.model";
import SubCategory from "@/models/SubCategory";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    // Fetch only active categories
    const categories = await Category.find({ isActive: true }).lean();

    const result = await Promise.all(
      categories.map(async (category) => {
        // Fetch only active subcategories under this category
        const subCategories = await SubCategory.find({
          category: category._id,
          isActive: true,
        }).lean();

        // Add product count for each subcategory
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
