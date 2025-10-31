import ProductModel from "@/models/product.model";




// GET: Paginated product fetch
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const search = searchParams.get("search") || "";
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    let query = {isActive:true};
    if (search) {
      const regex = new RegExp(search, "i"); // Case-insensitive search
      query = {
        $or: [{ productName: regex }, { sku: regex }],
      };
    }

    const total = await ProductModel.countDocuments(query);
    const products = await ProductModel.find(query).populate({
      path: 'subCategory',
        // Automatically pulls the parent category
    }).sort({ createdAt: -1 })
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









