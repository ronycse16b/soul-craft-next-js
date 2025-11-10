// app/api/featured-section/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db.config";
import productModel from "@/models/product.model";
import { verifyAccess } from "@/lib/roleMiddleware";


export async function GET() {
  try {
    await connectDB();
    const featuredProducts = await productModel
      .find({
        featured: true,
        isActive: true,
      })
      .sort({ featuredPosition: 1 })
      .limit(4)
      .select(
        "images thumbnail  slug  productName newArrival features featuredPosition"
      );

    return NextResponse.json({ success: true, products: featuredProducts });
  } catch (error) {
    console.error("Featured section error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load featured section" },
      { status: 500 }
    );
  }
}


export async function POST(req) {
  try {
      const auth = await verifyAccess(req, {
        roles: ["admin", "moderator"],
        permission: "create",
      });
      if (auth instanceof Response) return auth;
    await connectDB();
    // console.log("DB connected");

    const { productId, featured, featuredPosition } = await req.json();
    // console.log("Received data:", { productId, featured, featuredPosition });

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID required" },
        { status: 400 }
      );
    }

    const product = await productModel.findByIdAndUpdate(
      productId,
      { featured, featuredPosition },
      { new: true, runValidators: true }
    );

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // console.log("Updated product:", product);

    return NextResponse.json({
      success: true,
      message: "Featured status updated successfully",
      product,
    });
  } catch (error) {
    console.error("Feature update error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

