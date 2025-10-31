"use client";

import React, { useState, useEffect } from "react";
import Container from "./Container";
import { Textarea } from "./ui/textarea";
import { Truck } from "lucide-react";

const CheckoutPage = () => {
  const [user] = useState({
    loginMethod: "phone",
    email: "rony@example.com",
    phone: "+880176543210",
  });

  const [billing, setBilling] = useState({
    firstName: "",
    address: "",
    phone: user.loginMethod === "phone" ? user.phone : "",
    email: user.loginMethod === "email" ? user.email : "",
    saveInfo: false,
    coupon: "",
    location: "dhaka",
    paymentMethod: "cod",
    latitude: null,
    longitude: null,
  });

  const [editingPhone, setEditingPhone] = useState(false);

  // Detect location automatically
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setBilling((prev) => ({
            ...prev,
            latitude,
            longitude,
            location:
              latitude >= 23.7 &&
              latitude <= 23.85 &&
              longitude >= 90.35 &&
              longitude <= 90.5
                ? "dhaka"
                : "allBangladesh",
          }));
        },
        () => {
          console.log("Location permission denied, defaulting to Dhaka.");
        }
      );
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBilling((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleLocationChange = (location) => {
    setBilling((prev) => ({ ...prev, location }));
  };

  const orderItems = [
    { name: "LCD Monitor", price: 650 },
    { name: "Hi Gamepad", price: 1100 },
  ];
  const subtotal = orderItems.reduce((acc, item) => acc + item.price, 0);

  const deliveryCharges = {
    dhaka: 80,
    nearDhaka: 100,
    allBangladesh: 130,
  };
  const deliveryCharge = deliveryCharges[billing.location] || 0;
  const total = subtotal + deliveryCharge;

  return (
    <Container className="my-8 px-4 md:px-8 lg:px-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT SIDE */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Truck className="text-[#f69224]" size={24} /> Billing Details
          </h2>

          <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-sm rounded">
            You are logged in using:{" "}
            <span className="font-semibold text-[#f69224]">
              {user.loginMethod === "email" ? "Email" : "Phone"}
            </span>
            .{" "}
            {user.loginMethod === "email"
              ? "Please provide your phone number for order confirmation."
              : "Your phone number is already saved, but you can change it if needed."}
          </div>

          <form className="space-y-4">
            <input
              name="firstName"
              value={billing.firstName}
              onChange={handleChange}
              required
              placeholder="Full Name*"
              className="w-full border px-4 py-2 rounded focus:outline-none focus:border-[#f69224]"
            />

            <Textarea
              name="address"
              value={billing.address}
              onChange={handleChange}
              required
              placeholder="Street Address*"
              className="w-full border px-4 py-2 rounded focus:outline-none focus:border-[#f69224]"
            />

            {user.loginMethod === "phone" && !editingPhone ? (
              <div>
                <div className="flex items-center gap-2">
                  <input
                    type="tel"
                    name="phone"
                    value={billing.phone}
                    readOnly
                    className="w-full border px-4 py-2 rounded bg-gray-100 text-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => setEditingPhone(true)}
                    className="text-sm text-[#f69224] hover:underline"
                  >
                    Change Number
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  This phone number is linked to your account.
                </p>
              </div>
            ) : (
              <div>
                <input
                  type="tel"
                  name="phone"
                  value={billing.phone}
                  onChange={handleChange}
                  required
                  placeholder="Phone Number*"
                  className="w-full border px-4 py-2 rounded focus:outline-none focus:border-[#f69224]"
                />
              </div>
            )}

            {user.loginMethod === "email" && (
              <input
                type="email"
                name="email"
                value={billing.email}
                readOnly
                className="w-full border px-4 py-2 rounded bg-gray-100 text-gray-600"
              />
            )}

            {/* Delivery Location */}
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Delivery Charge</h3>
              <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                {[
                  { loc: "dhaka", label: "Inside Dhaka City (80 Tk)" },
                  { loc: "nearDhaka", label: "Near Dhaka City (100 Tk)" },
                  { loc: "allBangladesh", label: "All Bangladesh (130 Tk)" },
                ].map((item) => (
                  <label
                    key={item.loc}
                    className="flex items-center border px-3 py-2 bg-yellow-50 gap-2 rounded w-full sm:w-auto"
                  >
                    <input
                      type="radio"
                      name="location"
                      checked={billing.location === item.loc}
                      onChange={() => handleLocationChange(item.loc)}
                    />
                    {item.label}
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Location detected automatically when possible.
              </p>

              {billing.latitude && billing.longitude && (
                <iframe
                  title="Delivery Location"
                  width="100%"
                  height="200"
                  className="mt-4 rounded"
                  src={`https://maps.google.com/maps?q=${billing.latitude},${billing.longitude}&z=15&output=embed`}
                />
              )}
            </div>

            <label className="flex items-center gap-2 text-sm mt-4">
              <input
                type="checkbox"
                name="saveInfo"
                checked={billing.saveInfo}
                onChange={handleChange}
              />
              Save this information for faster checkout next time
            </label>
          </form>
        </div>

        {/* RIGHT SIDE */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="text-sm text-gray-600">
            Review your order and proceed to payment.
          </div>

          <div className="border p-4 rounded space-y-4 flex-1">
            {orderItems.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between text-sm sm:text-base"
              >
                <span>{item.name}</span>
                <span>${item.price}</span>
              </div>
            ))}

            <div className="flex justify-between border-t pt-2">
              <span>Subtotal</span>
              <span>${subtotal}</span>
            </div>

            <div className="flex justify-between">
              <span>Delivery Charge</span>
              <span>${deliveryCharge}</span>
            </div>

            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total</span>
              <span>${total}</span>
            </div>

            {/* Payment Option */}
            <div className="mt-4 p-4 border rounded bg-yellow-100 flex items-center gap-2">
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={billing.paymentMethod === "cod"}
                onChange={handleChange}
                disabled
              />
              <span className="font-semibold text-[#f69224]">
                Cash on Delivery
              </span>
            </div>

            {/* Coupon */}
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                name="coupon"
                value={billing.coupon}
                onChange={handleChange}
                placeholder="Coupon Code"
                className="flex-1 border px-4 py-2 rounded focus:outline-none focus:border-[#f69224]"
              />
              <button className="px-4 py-2 bg-[#0c7bc5] text-white rounded hover:bg-[#0c7bc5b7] cursor-pointer shadow-lg">
                Apply
              </button>
            </div>

            <button className="w-full mt-6 py-3 bg-destructive cursor-pointer  text-white shadow-lg font-semibold rounded hover:bg-destructive/90 flex items-center justify-center gap-2">
              <Truck size={20} /> Place Order (COD)
            </button>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default CheckoutPage;
