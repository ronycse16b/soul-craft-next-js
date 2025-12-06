import Order from "@/models/order.model";
import { connectDB } from "@/lib/db.config";
import { NextResponse } from "next/server";
import userModel from "@/models/user.model";
import { verifyAccess } from "@/lib/roleMiddleware";

export async function GET(req) {


  const auth = await verifyAccess(req, {
    roles: ["user"],
    permission: "read",
  });

  if (auth instanceof Response) return auth;

  try {
    await connectDB();


    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const search = searchParams.get("search") || "";
    const identifier = searchParams.get("identifier") || "";
    const status = searchParams.get("status") || "";

  

    // 1️⃣ Identifier required
    if (!identifier) {
      console.log("❌ Missing identifier");
      return NextResponse.json(
        { success: false, message: "Phone or Email is required" },
        { status: 400 }
      );
    }



    // 3️⃣ Build Order Query
    const query = {
      identifier: identifier, // user submitted phone/email
    };

    // Search Filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
        { productName: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
      ];
    }

    // 4️⃣ Count
    const total = await Order.countDocuments(query);


    // 5️⃣ Paginate Orders
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);



    // 6️⃣ Response
    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Server Error", error: err.message },
      { status: 500 }
    );
  }
}
