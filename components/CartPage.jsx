"use client";

import React, { useState } from "react";
import Container from "./Container";
import { Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Premium Belt",
      price: 990,
      quantity: 1,
      image: "/p1.png",
      size: "Default Size",
    },
    {
      id: 2,
      name: "Leather Wallet",
      price: 1290,
      quantity: 2,
      image: "/p2.png",
      size: "Medium",
    },
  ]);

  const handleQuantityChange = (id, newQty) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: newQty > 0 ? newQty : 1 } : item
      )
    );
  };

  const handleRemoveItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const shipping = cartItems.length ? 80 : 0;
  const tax = 0;
  const total = subtotal + shipping + tax;

  return (
    <Container className="py-8">
      <h1 className="text-lg font-semibold mb-6 text-gray-700">Home / Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.length === 0 ? (
            <p className="text-center text-gray-500">Your cart is empty.</p>
          ) : (
            cartItems?.map((item) => (
              <Card
                key={item.id}
                className="p-4 flex flex-col gap-4 rounded-none shadow-none border bg-gray-50 "
              >
                {/* Row 1: Name & Details */}
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <h2 className="font-semibold text-lg">{item.name}</h2>
                    <span className="text-sm text-gray-500">{item.size}</span>
                  </div>
                </div>

                {/* Row 2: Image & Input */}
                <div className="flex justify-between items-center gap-4">
                  {/* Left: Product Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 object-cover rounded"
                    />
                  </div>

                  {/* Right: Input & Rate */}
                  <div className="flex flex-col w-full sm:w-auto gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex ">
                        <Input
                          id={`qty-${item.id}`}
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(
                              item.id,
                              parseInt(e.target.value)
                            )
                          }
                          className="w-16 text-center"
                        />
                      </div>

                      <span className="text-lg font-medium">×</span>

                      <div className="flex flex-col">
                        <Label className="text-sm">Total</Label>
                        <span className="text-sm font-medium text-orange-500">
                          BDT {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        className="text-red-600 hover:text-red-800 p-2 self-start"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <Trash className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Order Summary */}
        <Card className="bg-yellow-50 rounded-sm  py-5 max-h-[300px]">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Items ({cartItems.length})</span>
              <span>BDT {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>BDT {shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>BDT {tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold border-t pt-3 mt-3 text-lg">
              <span>Total</span>
              <span>BDT {total.toFixed(2)}</span>
            </div>
          </CardContent>
          <CardContent>
            <Button className="w-full bg-destructive cursor-pointer hover:bg-destructive/90 text-white font-semibold rounded-none">
              Proceed to Checkout ({cartItems.length})
            </Button>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
};

export default CartPage;
