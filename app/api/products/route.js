import { adminOnlyMiddleware } from "@/lib/authMiddleware";
import { connectDB } from "@/lib/db.config";
import ProductModel from "@/models/product.model";

// POST: Add new product
export async function POST(req) {
    const auth = await adminOnlyMiddleware(req);
    if (auth) return auth; // unauthorized
  try {
    await connectDB();
    const body = await req.json();

    // Convert string number fields to real numbers in `variant`
    if (body.variant && Array.isArray(body.variant)) {
      body.variant = body.variant.map((v) => ({
        variant: v.variant,
        price: Number(v.price),
        quantity: Number(v.quantity),
        sku: v.sku,
        discount: Number(v.discount),
      }));
    }

    // Optional: Also convert root level price, qty, discount
    if (body.price) body.price = Number(body.price);
    if (body.quantity) body.quantity = Number(body.quantity);
    if (body.discount) body.discount = Number(body.discount);

    // Create and save product
    const product = new ProductModel(body);
    await product.save();

    return new Response(
      JSON.stringify({ message: "Product uploaded", product }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Product POST Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}


// GET: Paginated product fetch
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const search = searchParams.get("search") || "";
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      const regex = new RegExp(search, "i"); // Case-insensitive search
      query = {
        $or: [{ productName: regex }, { sku: regex }],
      };
    }

    const total = await ProductModel.countDocuments(query);
    const products = await ProductModel.find(query).sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return new Response(
      JSON.stringify({
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
       result: products,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Product GET Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}









