import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";
import productModel from "@/models/product.model";
import { NextResponse } from "next/server";

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  const subCategoriesIdParam = searchParams.get("subCategoriesId");
  const colorFilter = searchParams.get("color")?.split(",") || [];
  const sizeFilter = searchParams.get("size")?.split(",") || [];

  if (!slug) {
    return NextResponse.json({ success: false, message: "Slug required" });
  }

  try {
    // 1. Find main category using slug
    const category = await Category.findOne({ slug }).lean();
    if (!category) {
      return NextResponse.json({
        success: false,
        message: "Category not found",
      });
    }

    // 2. Get all subcategories for that category
    const subCategories = await SubCategory.find({
      category: category._id,
    }).lean();
    const allSubCategoryIds = subCategories.map((sc) => sc._id.toString());

    // 3. Determine selected subcategory filter
    const selectedSubCategoryIds = subCategoriesIdParam
      ? subCategoriesIdParam.split(",") // from query param
      : allSubCategoryIds; // all under this category

    // 4. Build main query
    let productQuery = {};

    if (subCategoriesIdParam) {
      // only selected subcategory
      productQuery = {
        subCategory: { $in: selectedSubCategoryIds },
      };
    } else {
      // initial load: all products under the main category
      productQuery = {
        $or: [
          { subCategory: { $in: allSubCategoryIds } },
          { category: category._id },
        ],
      };
    }

    // 5. Add color filter
    if (colorFilter.length > 0 && colorFilter[0] !== "") {
      productQuery.colors = { $in: colorFilter };
    }

    // 6. Add size filter
    if (sizeFilter.length > 0 && sizeFilter[0] !== "") {
      productQuery["variant.variant"] = { $in: sizeFilter };
    }

    // 7. Get matching products
    const products = await productModel
      .find(productQuery)
      .populate("subCategory", "name")
      .lean();

    // 8. Get all products for filter options
    const allRelevantProducts = await productModel
      .find({
        $or: [
          { subCategory: { $in: allSubCategoryIds } },
          { category: category._id },
        ],
        isActive: true,
      })
      .lean();

    // 9. Extract available colors and sizes
    const allColors = [
      ...new Set(allRelevantProducts.flatMap((p) => p.colors || [])),
    ];
    const allSizes = [
      ...new Set(
        allRelevantProducts.flatMap(
          (p) => p.variant?.map((v) => v.variant?.toString()) || []
        )
      ),
    ];

    return NextResponse.json({
      success: true,
      result: products,
      category,
      subCategories,
      filters: {
        colors: allColors,
        sizes: allSizes,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}


