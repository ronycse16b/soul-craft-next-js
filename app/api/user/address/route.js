
import { connectDB } from "@/lib/db.config";
import AddressBookModel from "@/models/address.book.model";
import { NextResponse } from "next/server";

// ✅ GET all addresses for logged-in user
export async function GET(req) {


  try {
    await connectDB();
    let book = await AddressBookModel.findOne({ userId: auth.id });

    if (!book) {
      book = await AddressBookModel.create({
        userId: auth.id,
        addresses: [],
      });
    }

    return NextResponse.json(
      { success: true, addresses: book.addresses },
      { status: 200 }
    );
  } catch (error) {
    console.error("Address GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch addresses" },
      { status: 500 }
    );
  }
}

// ✅ POST → Add new address
export async function POST(req) {


  try {
    await connectDB();
    const { name, deliveryAddress, phone, isDefault } = await req.json();

    let book = await AddressBookModel.findOne({ userId: auth.id });
    if (!book) {
      book = await AddressBookModel.create({
        userId: auth.id,
        addresses: [],
      });
    }

    // If this one is default, unset others
    if (isDefault) {
      book.addresses.forEach((addr) => (addr.isDefault = false));
    }

    // Auto default if first address
    const newAddress = {
      name: name || "",
      deliveryAddress: deliveryAddress || "",
      phone: phone || "",
      isDefault: isDefault || book.addresses.length === 0,
    };

    book.addresses.push(newAddress);
    await book.save();

    return NextResponse.json(
      { success: true, addresses: book.addresses },
      { status: 200 }
    );
  } catch (error) {
    console.error("Address POST Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add address" },
      { status: 500 }
    );
  }
}

// ✅ PUT → Update an address
export async function PUT(req) {


  try {
    await connectDB();
    const { id, name, deliveryAddress, phone, setDefault } = await req.json();

    const book = await AddressBookModel.findOne({ userId: auth.id });
    if (!book)
      return NextResponse.json(
        { success: false, message: "Address book not found" },
        { status: 404 }
      );

    const addr = book.addresses.id(id);
    if (!addr)
      return NextResponse.json(
        { success: false, message: "Address not found" },
        { status: 404 }
      );

    addr.name = name ?? addr.name;
    addr.deliveryAddress = deliveryAddress ?? addr.deliveryAddress;
    addr.phone = phone ?? addr.phone;

    if (setDefault) {
      book.addresses.forEach((a) => (a.isDefault = false));
      addr.isDefault = true;
    }

    await book.save();

    return NextResponse.json(
      { success: true, addresses: book.addresses },
      { status: 200 }
    );
  } catch (error) {
    console.error("Address PUT Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update address" },
      { status: 500 }
    );
  }
}

// ✅ DELETE → Remove address by ?id=
export async function DELETE(req) {


  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    const book = await AddressBookModel.findOne({ userId: auth.id });
    if (!book)
      return NextResponse.json(
        { success: false, message: "Address book not found" },
        { status: 404 }
      );

    const addr = book.addresses.id(id);
    if (!addr)
      return NextResponse.json(
        { success: false, message: "Address not found" },
        { status: 404 }
      );

    addr.deleteOne();

    // If default deleted → make first address default
    if (addr.isDefault && book.addresses.length > 0) {
      book.addresses[0].isDefault = true;
    }

    await book.save();

    return NextResponse.json(
      { success: true, addresses: book.addresses },
      { status: 200 }
    );
  } catch (error) {
    console.error("Address DELETE Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete address" },
      { status: 500 }
    );
  }
}
