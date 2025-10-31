"use client";

import React from "react";
import { ShoppingCart } from "lucide-react";

const relatedProducts = [
  {
    id: 1,
    name: "Wireless Bluetooth Headphones",
    price: 120,
    oldPrice: 150,
    discount: 20,
    image:
      "https://cdn.pixabay.com/photo/2016/11/29/06/15/headphones-1868616_960_720.jpg",
  },
  {
    id: 2,
    name: "Gaming Mouse",
    price: 45,
    oldPrice: 60,
    discount: 25,
    image:
      "https://cdn.pixabay.com/photo/2017/08/10/07/22/mouse-2619395_960_720.jpg",
  },
  {
    id: 3,
    name: "Portable Power Bank",
    price: 35,
    oldPrice: null,
    discount: null,
    image:
      "https://cdn.pixabay.com/photo/2015/01/21/14/14/powerbank-606402_960_720.jpg",
  },
  {
    id: 4,
    name: "Smart Watch",
    price: 250,
    oldPrice: 300,
    discount: 17,
    image:
      "https://cdn.pixabay.com/photo/2016/03/27/21/37/smartwatch-1282234_960_720.jpg",
  },
];

const RelatedProducts = () => {
  return (
    <div className="my-4">
      {/* Related Products Header */}
      <h2 className="text-xl font-semibold mb-4">Related Products</h2>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {relatedProducts.map((product) => (
          <div
            key={product.id}
            className="border rounded p-4 flex flex-col relative hover:shadow-lg transition-shadow"
          >
            {product.discount && (
              <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                -{product.discount}%
              </span>
            )}

            <img
              src={product.image}
              alt={product.name}
              className="w-full h-32 object-contain mb-2"
            />

            <div className="flex flex-col mt-auto">
              <h3 className="text-sm font-medium">{product.name}</h3>

              <div className="flex items-center gap-2 mt-1">
                <span className="text-red-500 font-semibold">
                  ${product.price}
                </span>
                {product.oldPrice && (
                  <span className="line-through text-gray-500 text-xs">
                    ${product.oldPrice}
                  </span>
                )}
              </div>

              <button className="mt-3 flex items-center justify-center gap-1 bg-black text-white py-1 rounded text-sm hover:bg-gray-800">
                <ShoppingCart size={16} /> Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
