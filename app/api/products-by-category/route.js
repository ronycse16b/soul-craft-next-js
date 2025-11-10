import { connectDB } from "@/lib/db.config";
import Category from "@/models/Category";
import SubCategory from "@/models/SubCategory";
import productModel from "@/models/product.model";
import { NextResponse } from "next/server";

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  const subCategoriesIdParam = searchParams.get("subCategoriesId");
  const filterParam = searchParams.get("filters");

  // Pagination
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 12;
  const skip = (page - 1) * limit;

  // Sorting
  const sortParam = searchParams.get("sort") || "newest";
  let sortOption = { createdAt: -1 }; // default newest

  switch (sortParam) {
    case "price_asc":
      sortOption = { price: 1 };
      break;
    case "price_desc":
      sortOption = { price: -1 };
      break;
    case "discount_desc":
      sortOption = { discount: -1 };
      break;
    case "discount_asc":
      sortOption = { discount: 1 };
      break;
    case "oldest":
      sortOption = { createdAt: 1 };
      break;
    default:
      sortOption = { createdAt: -1 };
  }

  if (!slug) {
    return NextResponse.json({ success: false, message: "Slug required" });
  }

  try {
    // 1️⃣ Find category
    const category = await Category.findOne({ slug }, "_id name").lean();
    if (!category) {
      return NextResponse.json({
        success: false,
        message: "Category not found",
      });
    }

    // 2️⃣ Fetch subcategories (minimal)
    const subCategories = await SubCategory.find(
      { category: category._id },
      "_id name"
    ).lean();
    const allSubCategoryIds = subCategories.map((sc) => sc._id.toString());

    // 3️⃣ Determine selected subcategories
    const selectedSubCategoryIds = subCategoriesIdParam
      ? subCategoriesIdParam.split(",")
      : allSubCategoryIds;

    // 4️⃣ Base query
    const productQuery = {
      $and: [
        subCategoriesIdParam
          ? { subCategory: { $in: selectedSubCategoryIds } }
          : {
              $or: [
                { subCategory: { $in: allSubCategoryIds } },
                { category: category._id },
              ],
            },
        { isActive: true },
      ],
    };

    // 5️⃣ Parse filters dynamically
    if (filterParam) {
      const filterPairs = filterParam.split("|");
      const filterConditions = [];

      filterPairs.forEach((pair) => {
        const [attrName, values] = pair.split(":");
        const valueList = values?.split(",").filter(Boolean);
        if (attrName && valueList?.length) {
          filterConditions.push({
            variants: {
              $elemMatch: {
                [`attributes.${attrName}`]: { $in: valueList },
              },
            },
          });
        }
      });

      if (filterConditions.length > 0) {
        productQuery.$and.push({ $and: filterConditions });
      }
    }

    // 6️⃣ Count total
    const totalProducts = await productModel.countDocuments(productQuery);
    const totalPages = Math.ceil(totalProducts / limit);

    // 7️⃣ Fetch paginated & sorted data
    const products = await productModel
      .find(productQuery)
      .select("images thumbnail price discount quantity sku slug attributes variants type productName newArrival ")
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();

    // 8️⃣ Fetch relevant products for filters
    const allRelevantProducts = await productModel
      .find(
        {
          $or: [
            { subCategory: { $in: allSubCategoryIds } },
            { category: category._id },
          ],
          isActive: true,
        },
        "variants"
      )
      .lean();

    // 9️⃣ Build dynamic filters
    const attributeOptions = {};
    for (const p of allRelevantProducts) {
      for (const variant of p.variants || []) {
        if (variant.attributes) {
          for (const [key, val] of Object.entries(variant.attributes)) {
            if (!attributeOptions[key]) attributeOptions[key] = new Set();
            attributeOptions[key].add(val);
          }
        }
      }
    }

    const filters = {};
    for (const [key, set] of Object.entries(attributeOptions)) {
      filters[key] = Array.from(set);
    }

    // ✅ Return final optimized result
    return NextResponse.json({
      success: true,
      result: products,
      subCategories,
      filters,
      pagination: {
        total: totalProducts,
        page,
        pages: totalPages,
        limit,
      },
      sortApplied: sortParam,
    });
  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
