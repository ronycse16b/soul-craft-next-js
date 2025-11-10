"use client";

import React, { useEffect, useState } from "react";
import Container from "./Container";
import { Textarea } from "./ui/textarea";
import { Truck } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Button } from "./ui/button";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import axios from "axios";
import { clearCart } from "@/redux/features/cartSlice";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query"; // NEW: TanStack Query import
import Image from "next/image";
import { trackPurchase } from "@/lib/marketingEvents";


const CheckoutPage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const cartItems = useSelector((state) => state.cart.items);
  const dispatch = useDispatch();

  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      firstName: session?.user?.name,
      address: "",
      phone: "",
      email: "",
      saveInfo: false,
      coupon: "",
      location: "dhaka",
      paymentMethod: "",
      note: "",
    },
  });

  // NEW: Fetch saved addresses for logged-in users (TanStack v5)
 

  const { data: savedAddresses } = useQuery({
    queryKey: ["userAddresses", session?.user?.id],
    queryFn: async () => {
      const res = await axios.get(`/api/user/address`);
      return res.data?.addresses || [];
    },
    enabled: !!session?.user?.id, // only fetch if user is logged in
  });

  // Update form values when session loads
  useEffect(() => {
    if (session?.user) {
      setValue("firstName", session.user.name || "");
      setValue(
        "phone",
        session.user.emailOrPhone.includes("0") ? session.user.emailOrPhone : ""
      );
      setValue(
        "email",
        session.user.emailOrPhone.includes("@") ? session.user.emailOrPhone : ""
      );
      // setValue("address", session.user.address || "");
    }
    if (!cartItems?.length) {
      router.push("/");
      return;
    }
  }, [session, setValue, cartItems, router]);

  const billing = watch();
  const [editingPhone, setEditingPhone] = useState(false);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  // Auto-detect location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLatitude(latitude);
          setLongitude(longitude);

          if (
            latitude >= 23.7 &&
            latitude <= 23.85 &&
            longitude >= 90.35 &&
            longitude <= 90.5
          ) {
            setValue("location", "dhaka");
          } else {
            setValue("location", "allBangladesh");
          }
        },
        () => console.log("Location permission denied.")
      );
    }
  }, [setValue]);

  const deliveryCharges = {
    dhaka: 80,
    nearDhaka: 100,
    allBangladesh: 130,
  };

  const MySwal = withReactContent(Swal);

  const onSubmit = async (data) => {
    if (!cartItems.length) {
      toast.error("Your cart is empty!");
      return;
    }

    try {
      const orderPayloads = cartItems.map((item) => ({
        name: data.firstName,
        mobile: data.phone,
        address: data.address,
        deliveryCharge: deliveryCharges[data.location] || 0,
        paymentMethod: data.paymentMethod || "Cash on delivery",
        productName: item.productName,
        price: item.price,
        total:
          item.price * item.quantity + (deliveryCharges[data.location] || 0),
        sku: item.sku,
        qty: item.quantity,
        size: item.size || "",
        image: item.images || "",
        note: data.note || "",
        statusHistory: [{ status: "Processing", note: "Order placed" }],
        email: session?.user?.emailOrPhone,
      }));

      const responses = await toast.promise(
        Promise.all(orderPayloads.map((p) => axios.post("/api/order", p))),
        {
          loading: "Submitting your order...",
          success: "Order submitted successfully!",
          error: "Failed to submit order.",
        }
      );

      const orderData = responses.map((res) => res.data.data);

      trackPurchase(orderData);

      MySwal.fire({
        title: (
          <h2 className="text-xl sm:text-2xl font-bold">
            🎉 Order Placed Successfully!
          </h2>
        ),
        html: (
          <div className="space-y-3 text-left">
            {orderData.map((order, idx) => (
              <div key={idx} className="flex items-center gap-3 border-b pb-2">
                <img
                  src={order?.image}
                  alt={order?.productName}
                  className="w-16 h-16 object-cover rounded shadow-sm"
                />
                <div>
                  <p className="font-semibold text-sm">{order?.productName}</p>
                  <p className="text-sm text-gray-600">
                    Quantity: {order?.qty}
                  </p>
                  <p className="text-sm text-gray-600">SKU: {order?.sku}</p>
                  <p className="text-sm font-medium text-green-600">
                    Total: {order?.total} BDT
                  </p>
                  <p className="text-xs text-gray-400">
                    Order #: {order?.orderNumber}
                  </p>
                </div>
              </div>
            ))}
            <div className="mt-3 font-bold text-right text-lg">
              Grand Total: {orderData?.reduce((acc, o) => acc + o.total, 0)} BDT
            </div>
          </div>
        ),
        icon: "success",
        confirmButtonText: "Continue Shopping",
        width: "500px",
        customClass: {
          popup: "p-2",
          confirmButton:
            "bg-[#f69224] hover:bg-[#e07b1c] text-white px-4 py-2 rounded shadow",
        },
      }).then((result) => {
        dispatch(clearCart());
        if (result.isDismissed || result.isConfirmed) {
          router.push("/");
        }
      });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to submit order");
    }
  };

  return (
    <Container className="my-8 px-4 md:px-8 lg:px-16">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT SIDE */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Truck className="text-[#f69224]" size={24} /> Billing Details
            </h2>

            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-sm rounded shadow-sm">
              You are logged in using:{" "}
              <span className="font-semibold text-[#f69224]">
                {session?.user?.emailOrPhone.includes("@") ? "Email" : "Phone"}
              </span>
              . Please confirm your billing details.
            </div>

            <input
              {...register("firstName", { required: true })}
              placeholder="Full Name*"
              className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#f69224]"
            />

            {/* ------------------- Address Section ------------------- */}
            <div className="">
              <label className="font-medium text-sm mb-1 block">
                Delivery Address
              </label>

              {/* Editable Textarea for address */}
              <Textarea
                {...register("address", { required: true })}
                placeholder="Street Address*"
                className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#f69224]"
              />

              {/* Saved Addresses as suggestions */}
              {session?.user && savedAddresses?.length > 0 && (
                <div className="mt-2 text-sm text-gray-700">
                  <p className="font-medium mb-1">
                    Or pick from your saved addresses:
                  </p>
                  <div className="flex flex-col gap-2">
                    {savedAddresses.map((addr, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          setValue("address", addr.deliveryAddress)
                        }
                        className="text-left p-3 bg-yellow-100 border rounded-md cursor-pointer transition
                       hover:bg-yellow-100 hover:border-yellow-400
                       focus:bg-yellow-200 focus:border-yellow-500
                       min-h-[50px]"
                      >
                        <p className="font-medium">{addr.deliveryAddress}</p>
                        <span className="text-xs text-gray-500">
                          {addr.label || "Home"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {session?.user?.phone && !editingPhone ? (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <input
                    type="tel"
                    {...register("phone", { required: true })}
                    readOnly
                    className="w-full border px-4 py-2 rounded bg-gray-100 text-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => setEditingPhone(true)}
                    className="text-sm text-[#f69224] hover:underline"
                  >
                    Change
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  This phone number is linked to your account.
                </p>
              </div>
            ) : (
              <input
                type="tel"
                {...register("phone", { required: true })}
                placeholder="Phone Number*"
                className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#f69224]"
              />
            )}

            {session?.user?.email && (
              <input
                type="email"
                {...register("email")}
                readOnly
                className="w-full border px-4 py-2 rounded bg-gray-100 text-gray-600"
              />
            )}

            {/* ------------------- Delivery Location ------------------- */}
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-3">
                Delivery Charge & Location
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { loc: "dhaka", label: "Inside Dhaka City (80 Tk)" },
                  { loc: "nearDhaka", label: "Near Dhaka City (100 Tk)" },
                  { loc: "allBangladesh", label: "All Bangladesh (130 Tk)" },
                ].map((item) => (
                  <label
                    key={item.loc}
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition
                    hover:bg-yellow-100 hover:border-yellow-400
                    ${
                      watch("location") === item.loc
                        ? "bg-yellow-200 border-yellow-400"
                        : "bg-yellow-50 border-transparent"
                    }`}
                  >
                    <input
                      type="radio"
                      value={item.loc}
                      {...register("location")}
                      className="accent-[#f69224]"
                    />
                    <span className="text-sm font-medium">{item.label}</span>
                  </label>
                ))}
              </div>

              {latitude && longitude && (
                <div className="mt-4 rounded-lg overflow-hidden shadow-sm border">
                  <iframe
                    title="Delivery Location"
                    width="100%"
                    height="200"
                    className="rounded-lg"
                    src={`https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`}
                  />
                </div>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm mt-4">
              <input
                type="checkbox"
                {...register("saveInfo")}
                className="accent-[#f69224]"
              />
              Save this information for faster checkout next time
            </label>

            <Textarea
              {...register("note")}
              placeholder="Order Note (Optional)"
              className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#f69224] mt-4"
            />
          </div>

          {/* RIGHT SIDE */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="text-sm text-gray-600">
              Review your order and proceed to payment.
            </div>

            <div className="border p-5  space-y-5 flex-1 bg-white">
              {/* Cart Items */}
              {cartItems?.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-sm sm:text-base gap-3"
                >
                  <Image
                    src={item.images}
                    alt={item.productName}
                    className="w-14 h-14 object-cover  border"
                    height={44}
                    width={44}
                  />
                  <span className="flex-1 truncate font-medium">
                    {item.productName}
                  </span>
                  <span className="font-semibold text-gray-700">
                    {item.price * item.quantity} BDT
                  </span>
                </div>
              ))}

              {/* Subtotal */}
              <div className="flex justify-between border-t pt-3 font-medium text-gray-700">
                <span>SKU</span>
                <span>{cartItems?.map((item) => item?.sku).join(", ")}</span>
              </div>
              <div className="flex justify-between border-t pt-3 font-medium text-gray-700">
                <span>Subtotal</span>
                <span>
                  {cartItems.reduce(
                    (acc, item) => acc + item.price * item.quantity,
                    0
                  )}{" "}
                  BDT
                </span>
              </div>

              {/* Delivery Charge */}
              <div className="flex justify-between text-gray-700">
                <span>Delivery Charge</span>
                <span>{deliveryCharges[billing.location] || 0} BDT</span>
              </div>

              {/* Total */}
              <div className="flex justify-between font-bold text-lg border-t pt-3 text-gray-800">
                <span>Total</span>
                <span>
                  {cartItems.reduce(
                    (acc, item) => acc + item.price * item.quantity,
                    0
                  ) + (deliveryCharges[billing.location] || 0)}{" "}
                  BDT
                </span>
              </div>

              {/* Payment Option */}
              <div className="mt-4 p-4 border rounded-xl bg-yellow-50 flex items-center gap-3">
                <input
                  type="radio"
                  value="cod"
                  {...register("paymentMethod")}
                  checked
                  disabled
                  className="accent-[#f69224] w-5 h-5"
                />
                <span className="font-semibold text-[#f69224] text-sm">
                  Cash on Delivery
                </span>
              </div>

              {/* Coupon */}
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  {...register("coupon")}
                  placeholder="Coupon Code"
                  className="flex-1 border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f69224] transition"
                />
                <Button
                  type="button"
                  disabled
                  className="px-5 py-2 bg-[#0c7bc5] text-white rounded-lg hover:bg-[#0c7bc5b7] shadow-md transition"
                >
                  Apply
                </Button>
              </div>

              {/* Place Order Button */}
              <Button
                type="submit"
                className="w-full mt-6 py-6 bg-destructive hover:bg-destructive/80 text-white shadow-lg font-semibold rounded-lg flex items-center justify-center gap-2 transition-all duration-300"
              >
                <Truck size={20} /> Place Order (COD)
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Container>
  );
};

export default CheckoutPage;
