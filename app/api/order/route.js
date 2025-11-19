
import { connectDB } from "@/lib/db.config";
import { verifyAccess } from "@/lib/roleMiddleware";
import AddressBookModel from "@/models/address.book.model";

import Order from "@/models/order.model";
import userModel from "@/models/user.model";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();

    const data = await req.json();

    // Required validation
    if (!data?.name || !data?.mobile || !data?.address || !data?.productName) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400 }
      );
    }

    // Create order
    const newOrder = new Order({
      name: data.name,
      mobile: data.mobile,
      address: data.address,
      deliveryCharge: data.deliveryCharge,
      paymentMethod: data.paymentMethod || "Cash on delivery",
      productName: data.productName,
      price: data.price,
      total: data.total,
      sku: data.sku,
      qty: data.qty,
      size: data.size,
      image: data.image || "",
      note: data.note || "",
      email: data.email || "",
    });

    newOrder.statusHistory.push({ status: "Processing", note: "Order placed" });
    await newOrder.save();

    // ------------------------
    // 🔥 UPDATE ADDRESS BOOK
    // ------------------------

    const emailOrPhone = data?.email || data?.mobile;

    const user = await userModel.findOne({
      emailOrPhone: emailOrPhone,
    });

    if (user) {
      let addressBook = await AddressBookModel.findOne({
        userId: user._id,
      });

      const newAddress = {
        name: data.name,
        deliveryAddress: data.address,
        phone: data.mobile,
        label: "Home",
        isDefault: false,
      };

      if (!addressBook) {
        addressBook = new AddressBookModel({
          userId: user._id,
          addresses: [newAddress],
        });
      } else {
        const isDuplicate = addressBook.addresses.some(
          (a) =>
            a.deliveryAddress === data.address &&
            a.phone === data.mobile &&
            a.name === data.name
        );

        if (!isDuplicate) {
          addressBook.addresses.push(newAddress);
        }
      }

      await addressBook.save();
    }

    return NextResponse.json({
      success: true,
      message: "Order submitted successfully",
      data: newOrder,
    });
  } catch (err) {
    console.error("Order Submit Error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}


// ✅ Get Orders (Search, Filter, Pagination)
export async function GET(req) {
  const auth = await verifyAccess(req, {
    roles: ["admin", "moderator"],
    permission: "read",
  });
 if (auth instanceof NextResponse) return auth;
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status"); // e.g., Pending, Delivered, Cancelled

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
        { productName: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      query.status = status;
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

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
    console.error("Order Fetch Error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
