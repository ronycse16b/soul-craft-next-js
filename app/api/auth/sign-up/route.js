import { connectDB } from "@/lib/db.config";
import AddressBookModel from "@/models/address.book.model";

import userModel from "@/models/user.model";
import { NextResponse } from "next/server";



export async function POST(req) {
  try {
    await connectDB();
    const { name, emailOrPhone, password } = await req.json();

    const isUserExist = await userModel.findOne({
      emailOrPhone: emailOrPhone,
    });

    if (isUserExist) {
      return NextResponse.json(
        { message: "User already exist" },
        { status: 400 }
      );
    }

    const user = new userModel({
      name,
      emailOrPhone,
      password,
    });

    await user.save();

    // Create a new address book entry for the user
    const address = new AddressBookModel({
      userId: user._id,
      addresses: [
        {
          name: name || "",
          deliveryAddress: "",
          phone: "",
          isDefault: false,
        },
      ],
    });

    await address.save();

    const userData = {
      name: user?.name,
      emailOrPhone: emailOrPhone,
      role: user?.role,
    };

    return NextResponse.json(
      { message: "User created successfully", data: userData },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Registration Error:", error);
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

