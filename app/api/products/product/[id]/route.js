
import { connectDB } from "@/lib/db.config";
import { verifyAccess } from "@/lib/roleMiddleware";
import productModel from "@/models/product.model";
import { NextResponse } from "next/server";
const CDN_URL =
  process.env.NEXT_PUBLIC_CDN_URL || "https://cdn.soulcraftbd.com";


export async function PUT(req, { params }) {
  const auth = await verifyAccess(req, {
    roles: ["admin", "moderator"],
    permission: "update",
  });
  if (auth instanceof Response) return auth;
  await connectDB();
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const field = searchParams.get("field");

  try {
    const product = await productModel.findById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    if (!["isActive", "flashSale", "newArrival"].includes(field)) {
      return NextResponse.json(
        { success: false, message: "Invalid field" },
        { status: 400 }
      );
    }

    // Toggle the field value
    product[field] = !(product[field] === true || product[field] === "true");

    await product.save();

    return NextResponse.json({ success: true, result: product });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  const auth = await verifyAccess(req, {
    roles: ["admin", "moderator"],
    permission: "delete",
  });
  if (auth instanceof Response) return auth;

  await connectDB();
  const { id } = await params;

  try {
    const product = await productModel.findById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // Delete images from CDN (wait for all to finish)
    const deletePromises = product.images.map(async (imageUrl) => {
      try {
        const filename = imageUrl.split("/uploads/")[1];
        if (!filename) return;

        const res = await fetch(`${CDN_URL}/images/${filename}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (!data.success) {
          console.warn("Failed to delete image from CDN:", imageUrl);
        }
      } catch (err) {
        console.warn("Error deleting image from CDN:", imageUrl, err);
      }
    });

    await Promise.all(deletePromises);

    // Delete product document from DB
    await productModel.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Product and images deleted",
    });
  } catch (error) {
    console.error("Product DELETE Error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}


