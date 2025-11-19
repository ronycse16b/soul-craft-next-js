
import { connectDB } from "@/lib/db.config";
import Product from "@/models/product.model";
import SubCategory from "@/models/SubCategory.js";
import Category from "@/models/Category.js";
import { verifyAccess } from "@/lib/roleMiddleware";

// POST: Add new product

export async function POST(req){

     const auth = await verifyAccess(req, {
       roles: ["admin", "moderator"],
       permission: "create",
     });
     if (auth instanceof Response) return auth;
  
  try {
    await connectDB();
    const body = await req.json();

    const {
      productName,
      description,
      type,
      price,
      discount,
      quantity,
      sku,
      subCategory,
      category,
      images,
      thumbnail,
      video,
      features,
      colors,
      brand,
      attributes,
      variants,
    } = body;

    // Convert attributes' values string → array
    const parsedAttributes = (attributes || []).map((attr) => ({
      name: attr.name.trim(),
      values: attr.values
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
    }));

    // Clean up variant list
    const parsedVariants = (variants || []).map((v) => ({
      attributes: v.attributes,
      price: Number(v.price) || 0,
      discount: Number(v.discount) || 0,
      quantity: Number(v.quantity) || 0,
      sku: v.sku || "",
     
    }));

    const newProduct = new Product({
      productName,
      description,
      type,
      price: Number(price) || 0,
      discount: Number(discount) || 0,
      quantity: Number(quantity) || 0,
      sku,
      subCategory,
      category,
      images,
      thumbnail,
      video,
      features,
      colors,
      brand,
      attributes: parsedAttributes,
      variants: parsedVariants,
    });

    await newProduct.save();

    return new Response(
      JSON.stringify({ success: true, product: newProduct ,message:"Product created successfully"}),
      { status: 201 }
    );
  } catch (error) {
    console.error("Product create error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
      }
    );
  }
};




export async function GET(req) {
 const auth = await verifyAccess(req, {
   roles: ["admin", "moderator"],
   permission: "read",
 });
 if (auth instanceof Response) return auth;
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search")?.trim() || "";
    const skip = (page - 1) * limit;

    const query = {};

    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [
        { productName: regex },
        { sku: regex },
        { "variants.sku": regex }, // ✅ allow search inside variants
        { "attributes.name": regex }, // search by attribute names
        { "attributes.values": regex }, // search by attribute values
      ];
    }

    const total = await Product.countDocuments(query);

    // Populate optional fields for subCategory/category
    const products = await Product.find(query)
      .populate("subCategory", "name") // ✅ lowercase
      .populate("category", "name") // ✅ lowercase
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return new Response(
      JSON.stringify({
        success: true,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        result: products,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Product GET Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Internal Server Error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}










