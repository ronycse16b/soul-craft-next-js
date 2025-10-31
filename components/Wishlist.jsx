"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import RelatedProducts from "./RelatedProducts";
import Container from "./Container";

const wishlistItems = [
  {
    id: 1,
    name: "Gucci duffle bag",
    price: 960,
    oldPrice: 1160,
    discount: 38,
    image:
      "https://cdn.pixabay.com/photo/2017/09/01/18/16/sander-2703986_960_720.jpg",
  },
  {
    id: 2,
    name: "RGB liquid CPU Cooler",
    price: 1960,
    oldPrice: null,
    discount: null,
    image:
      "https://cdn.pixabay.com/photo/2018/05/29/10/40/cpu-3439475_960_720.jpg",
  },
  {
    id: 3,
    name: "GP11 Shooter USB Gamepad",
    price: 550,
    oldPrice: null,
    discount: null,
    image:
      "https://cdn.pixabay.com/photo/2017/06/13/22/01/gamepad-2405935_960_720.jpg",
  },
  {
    id: 4,
    name: "Quilted Satin Jacket",
    price: 750,
    oldPrice: null,
    discount: null,
    image:
      "https://cdn.pixabay.com/photo/2016/03/31/19/59/jacket-1295589_960_720.jpg",
  },
];

const Wishlist = () => {
  return (
    <Container className="p-6">
      {/* Wishlist Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          Wishlist ({wishlistItems.length})
        </h2>
        <button className="px-4 py-2 border rounded hover:bg-gray-100">
          Move All To Bag
        </button>
      </div>

      {/* Wishlist Items */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {wishlistItems.map((item) => (
          <div
            key={item.id}
            className="border rounded p-4 flex flex-col relative"
          >
            {item.discount && (
              <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                -{item.discount}%
              </span>
            )}

            {/* Trash Icon */}
            <button className="absolute top-2 right-2 text-gray-500 hover:text-red-500">
              <Trash2 size={18} />
            </button>

            <img
              src={item.image}
              alt={item.name}
              className="w-full h-32 object-contain mb-2"
            />

            <div className="flex flex-col mt-auto">
              <h3 className="text-sm font-medium">{item.name}</h3>

              <div className="flex items-center gap-2 mt-1">
                <span className="text-red-500 font-semibold">
                  ${item.price}
                </span>
                {item.oldPrice && (
                  <span className="line-through text-gray-500 text-xs">
                    ${item.oldPrice}
                  </span>
                )}
              </div>

              <button className="mt-3 flex items-center justify-center gap-1 bg-black text-white py-1 rounded text-sm hover:bg-gray-800">
                Add To Cart
              </button>
            </div>
          </div>
        ))}
      </div>
      <RelatedProducts />
    </Container>
  );
};

export default Wishlist;
