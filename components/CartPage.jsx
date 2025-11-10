"use client";

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  incrementQuantity,
  decrementQuantity,
  removeFromCart,
} from "@/redux/features/cartSlice";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import Image from "next/image";

const CartPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const cartItems = useSelector((state) => state.cart.items);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const shipping = cartItems.length ? 80 : 0;
  const tax = 0;
  const total = subtotal + shipping + tax;

  // handle increment
  const handleIncrement = (item) => {
    const maxStock =
      item.availableStock ?? item.variant?.quantity ?? item.stock ?? 0;

    if (item.quantity >= maxStock) {
      toast.error(`Only ${maxStock} items available`);
      return;
    }

    dispatch(
      incrementQuantity({
        productId: item.productId,
        attributes: item.attributes,
      })
    );
  };

  // handle decrement
  const handleDecrement = (item) => {
    if (item.quantity > 1) {
      dispatch(
        decrementQuantity({
          productId: item.productId,
          attributes: item.attributes,
        })
      );
    }
  };

  // handle checkout
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }
    router.push("/checkout");
     trackInitiateCheckout(payload);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-lg md:text-xl font-semibold mb-6 text-gray-700">
        Home / Cart
      </h1>

      {cartItems?.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-12  min-h-[300px] lg:min-h-[400px]">
         
          <h2 className="text-lg font-semibold text-gray-700">
            Your cart is empty
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Looks like you haven’t added anything yet.
          </p>
          <Link
            href="/shop"
            className="px-5 py-2 bg-destructive text-white rounded-full font-medium hover:bg-destructive/80 transition-all duration-300"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems?.map((item) => (
              <div
                key={`${item.productId}-${JSON.stringify(item.attributes)}`}
                className="bg-white  border-b md:p-4 transition-all hover:shadow-md"
              >
                {/* ===== MOBILE HEADER ===== */}
                <div className="flex items-center border-b justify-between  lg:hidden">
                  <h2 className="font-semibold text-gray-800 text-sm leading-tight w-[80%]">
                    {item.productName}
                  </h2>
                  <button
                    onClick={() => dispatch(removeFromCart(item.productId))}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Remove item"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* ===== MAIN CONTENT ===== */}
                <div className="flex justify-end md:justify-between items-center ">
                  {/* LEFT SIDE (Image + Info) */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <Image
                      src={item.images}
                      alt={item.productName}
                      height={40}
                      width={40}
                      className="w-20 h-20 object-cover "
                    />
                    <div className="hidden lg:block">
                      {/* Product name for large screen */}
                      <h2 className="font-semibold text-gray-800 text-sm sm:text-base ">
                        {item.productName}
                      </h2>

                      {Object.keys(item.attributes || {}).length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {Object.entries(item.attributes)
                            .map(([key, val]) => `${key}: ${val}`)
                            .join(", ")}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        SKU: {item.sku}
                      </p>
                    </div>
                  </div>

                  {/* RIGHT SIDE (Controls + Price + Remove for lg) */}
                  <div className="flex flex-col justify-end items-end  lg:gap-6 lg:flex-row lg:items-center lg:justify-between w-full lg:w-auto lg:mt-0">
                    {/* Quantity Controls */}
                    <div className="flex items-center justify-end  w-full sm:w-auto">
                      <button
                        onClick={() => handleDecrement(item)}
                        className="px-2 py-1 border  text-gray-700 hover:bg-gray-100"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        readOnly
                        value={item.quantity}
                        className="w-14 text-center border h-[34px] text-gray-700 font-medium"
                      />
                      <button
                        onClick={() => handleIncrement(item)}
                        disabled={
                          item.quantity >=
                          (item.stock ?? item.availableStock ?? 0)
                        }
                        className="px-2 py-1 border  text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>
                    <div className="lg:hidden">
                      {/* Product name for large screen */}
                      {/* <h2 className="font-semibold text-gray-800 text-sm sm:text-base  ">
                        {item.productName}
                      </h2> */}

                      {Object.keys(item.attributes || {}).length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {Object.entries(item.attributes)
                            .map(([key, val]) => `${key}: ${val}`)
                            .join(", ")}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        SKU: {item.sku}
                      </p>
                    </div>

                    {/* Price + Stock */}
                    <div className="flex flex-col items-end">
                      <span className="text-[#f69224] font-semibold">
                        BDT {(item.price * item.quantity).toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500">
                        Stock: {item.stock ?? item.availableStock ?? 0}
                      </span>
                    </div>

                    {/* Remove (for large screen only) */}
                    <button
                      onClick={() => dispatch(removeFromCart(item.productId))}
                      className="hidden lg:flex text-red-600 hover:text-red-800 items-center justify-center"
                      title="Remove item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-[#fff8f1] rounded-md shadow-sm p-5 h-fit sticky top-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Items ({cartItems.length})</span>
                <span>BDT {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping Standard</span>
                <span>BDT {shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>BDT {tax.toFixed(2)}</span>
              </div>

              <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-lg text-gray-800">
                <span>Total</span>
                <span>BDT {total.toFixed(2)}</span>
              </div>
            </div>

            <Button
              onClick={handleCheckout}
              className="mt-6 w-full  bg-gradient-to-b from-[#f62424] to-[#f62424] text-white py-6 rounded-none font-semibold  transition-all duration-300"
            >
              Proceed to Checkout ({cartItems.length})
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
