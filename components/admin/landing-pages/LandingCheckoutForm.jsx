"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function CheckoutPage() {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "original leather shoes",
      color: "Black colour",
      price: 2050,
      image: "/black-shoe.png",
      selected: true,
      quantity: 1,
    },
    {
      id: 2,
      name: "original leather shoes",
      color: "Brown colour",
      price: 2050,
      image: "/brown-shoe.png",
      selected: true,
      quantity: 1,
    },
  ]);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    district: "",
    subDistrict: "",
    size: "40",
    shipping: "Dhaka Inside",
  });

  const deliveryCharges = {
    "Dhaka Inside": 130,
    "Dhaka Outside": 150,
  };

  const subtotal = products
    .filter((p) => p.selected)
    .reduce((sum, p) => sum + p.price * p.quantity, 0);

  const total = subtotal + deliveryCharges[form.shipping];

  const handleInput = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const toggleProduct = (index) => {
    const updated = [...products];
    updated[index].selected = !updated[index].selected;
    setProducts(updated);
  };

  const changeQuantity = (index, delta) => {
    const updated = [...products];
    const newQty = updated[index].quantity + delta;
    updated[index].quantity = newQty > 0 ? newQty : 1;
    setProducts(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("অর্ডার সফলভাবে সাবমিট হয়েছে!");
  };

  return (
    <section className=" py-6 px-2 bg-orange-100">
      <h2 className="text-center text-white bg-orange-500 py-3 rounded text-sm md:text-base font-semibold">
        নিচের ফর্মে আপনার নাম, মোবাইল নম্বর ও সম্পূর্ণ ঠিকানা লিখে “কনফার্ম
        অর্ডারে” ক্লিক করুন
      </h2>

      <form
        onSubmit={handleSubmit}
        className="mt-6 max-w-6xl mx-auto bg-white p-4 md:p-8 rounded-lg shadow space-y-8"
      >
        {/* Product Section */}
        <h3 className="text-base font-semibold text-gray-800">Your Products</h3>
        <div className="lg:flex-row flex flex-col items-center gap-3 justify-between ">
          {products?.map((p, index) => (
            <div
              key={p.id}
              className="border w-full  rounded-lg p-3 flex justify-between  sm:items-center gap-3 sm:gap-4 bg-white"
            >
              <div className="flex items-center gap-2 sm:flex-1">
                <input
                  type="checkbox"
                  checked={p.selected}
                  onChange={() => toggleProduct(index)}
                  className="accent-red-600 w-5 h-5"
                />
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-16 h-16 object-cover rounded"
                />
              </div>

              <div className="flex-1 text-center sm:text-left ">
                <p className="font-medium text-gray-900">{p.name}</p>
                <p className="text-sm text-gray-600">{p.color}</p>
                <div className="mt-2 flex justify-center sm:justify-start items-center gap-2">
                  <button
                    type="button"
                    onClick={() => changeQuantity(index, -1)}
                    className="px-2 py-1 border rounded"
                  >
                    −
                  </button>
                  <span>{p.quantity}</span>
                  <button
                    type="button"
                    onClick={() => changeQuantity(index, 1)}
                    className="px-2 py-1 border rounded"
                  >
                    +
                  </button>
                </div>
                <p className="text-sm text-gray-700 mt-1">
                  × {p.quantity} —{" "}
                  <span className="font-semibold">
                    {p.price * p.quantity} ৳
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Billing + Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Billing Details */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-900">
              Billing details
            </h3>

            <Input
              name="name"
              placeholder="নাম লিখুন"
              value={form.name}
              onChange={handleInput}
              required
            />
            <Input
              name="phone"
              placeholder="মোবাইল নম্বর লিখুন"
              value={form.phone}
              onChange={handleInput}
              required
            />

            {/* Address as textarea */}
            <textarea
              name="address"
              placeholder="সম্পূর্ণ ঠিকানা লিখুন"
              value={form.address}
              onChange={handleInput}
              required
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-orange-400 resize-none"
              rows={3}
            />

            {/* Size Selection */}
            <div className="space-y-2 pt-2 border border-red-400 rounded-md p-4">
              <p className="font-medium text-gray-800">
                জুতা সাইজ সিলেক্ট করুন *
              </p>
              <RadioGroup
                value={form.size}
                onValueChange={(val) => setForm({ ...form, size: val })}
                className="flex flex-wrap gap-4"
              >
                {["40", "41", "42", "43", "44"].map((size) => (
                  <div key={size} className="flex items-center gap-2">
                    <RadioGroupItem value={size} id={`size-${size}`} />
                    <label htmlFor={`size-${size}`} className="text-gray-700">
                      {size}
                    </label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Shipping */}
            <div className="space-y-2 pt-4 border border-red-500 rounded-md p-4">
              <p className="font-medium text-gray-800">Shipping</p>
              <RadioGroup
                value={form.shipping}
                onValueChange={(val) => setForm({ ...form, shipping: val })}
                className="space-y-2"
              >
                {Object.entries(deliveryCharges).map(([type, charge]) => (
                  <div
                    key={type}
                    className="flex justify-between items-center border-b"
                  >
                    <RadioGroupItem value={type} id={`ship-${type}`} />
                    <label
                      htmlFor={`ship-${type}`}
                      className="flex-1 ml-2 text-gray-700"
                    >
                      {type === "Dhaka Inside"
                        ? "ঢাকার মধ্যে হোম ডেলিভারি"
                        : "ঢাকার বাইরে কুরিয়ার সার্ভিস"}
                    </label>
                    <span className="font-medium">{charge} ৳</span>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-green-50 p-6 rounded-lg space-y-4 shadow-sm">
            <h3 className="text-base font-semibold text-gray-900">
              Your order
            </h3>
            <div className="space-y-2 divide-y divide-gray-300">
              {products
                .filter((p) => p.selected)
                .map((p) => (
                  <div
                    key={p.id}
                    className="flex justify-between py-2 text-gray-800"
                  >
                    <span>
                      {p.name} ({p.color}) × {p.quantity}
                    </span>
                    <span>{p.price * p.quantity} ৳</span>
                  </div>
                ))}
            </div>

            <div className="flex justify-between pt-2 font-medium text-gray-900">
              <span>Subtotal</span>
              <span>{subtotal} ৳</span>
            </div>
            <div className="flex justify-between pt-1 text-gray-700">
              <span>Shipping</span>
              <span>{deliveryCharges[form.shipping]} ৳</span>
            </div>
            <div className="flex justify-between pt-2 font-bold text-lg text-gray-900">
              <span>Total</span>
              <span>{total} ৳</span>
            </div>

            <div className="bg-red-100 text-red-700 p-2 rounded text-center font-medium">
              Cash on delivery
            </div>

            <Button
              type="submit"
              className="w-full bg-red-600 py-7 hover:bg-red-700 text-white mt-2 font-bold"
            >
              কনফার্ম অর্ডার – {total} ৳
            </Button>
          </div>
        </div>
      </form>
    </section>
  );
}

