import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db.config";
import Category from "@/models/Category";
import Product from "@/models/product.model";
import SubCategory from "@/models/SubCategory";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const slug = searchParams.get("slug"); // category slug
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const sortParam = searchParams.get("sort") || "createdAt:desc";

    const [sortField, sortOrder] = sortParam.split(":");
    const sort = { [sortField]: sortOrder === "asc" ? 1 : -1 };

    const query = {};

    // ✅ Always get category list
    const categoryData = await Category.find({ isActive: true }).lean();

    // 🔍 Filter by category slug
    if (slug && slug !== "all") {
      const parentCategory = await Category.findOne({ slug });
      if (!parentCategory) {
        return NextResponse.json({
          success: true,
          products: [],
          total: 0,
          grandTotal: 0,
          categories: categoryData,
          currentPage: page,
          totalPages: 0,
        });
      }

      const subCategories = await SubCategory.find({
        category: parentCategory._id,
      });

      if (!subCategories.length) {
        return NextResponse.json({
          success: true,
          products: [],
          total: 0,
          grandTotal: 0,
          categories: categoryData,
          currentPage: page,
          totalPages: 0,
        });
      }

      const subCategoryIds = subCategories.map((sc) => sc._id);
      query.subCategory = { $in: subCategoryIds };

    }

    // 🔍 Search by product name
    if (search) {
      query.productName = { $regex: search, $options: "i" };
    }

    // 🔄 Count total after filters
    const total = await Product.countDocuments(query);

    // 🔢 Count total products in DB (unfiltered)
    const grandTotal = await Product.countDocuments();

    // 🧾 Fetch paginated, sorted, populated data
    const products = await Product.find(query)
      .populate({
        path: "subCategory",
        select: "name slug category",
        populate: {
          path: "category",
          model: "Category",
          select: "name slug",
        },
      })
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .select("-description -__v -createdAt -updatedAt -video -images -brand");


    return NextResponse.json({
      success: true,
      categories: categoryData,
      products,
      total, // filtered total
      grandTotal, // all products
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
