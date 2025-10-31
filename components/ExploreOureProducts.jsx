"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Heart, ShoppingCart } from "lucide-react";
import Container from "./Container";

const TABS = ["All", "Popular", "New"];

const ALL_PRODUCTS = [
  {
    id: 1,
    name: "Summer Dress",
    price: "$49.99",
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400",
  },
  {
    id: 2,
    name: "Casual Shirt",
    price: "$29.99",
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400",
  },
  {
    id: 3,
    name: "Elegant Shoes",
    price: "$79.99",
    image: "https://images.unsplash.com/photo-1521334884684-d80222895322?w=400",
  },
  {
    id: 4,
    name: "Leather Bag",
    price: "$99.99",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
  },
  {
    id: 5,
    name: "Stylish Sunglasses",
    price: "$39.99",
    image: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=400",
  },
  {
    id: 6,
    name: "Elegant Watch",
    price: "$129.99",
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400",
  },
  {
    id: 7,
    name: "Classic Hat",
    price: "$19.99",
    image: "https://images.unsplash.com/photo-1520975918318-3f5c39f96f86?w=400",
  },
  {
    id: 8,
    name: "Denim Jacket",
    price: "$89.99",
    image: "https://images.unsplash.com/photo-1528701800489-20be9c2a9b19?w=400",
  },
];

export default function ExploreProducts() {
  const [activeTab, setActiveTab] = useState("All");
  const [visibleProducts, setVisibleProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(5);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      let filtered =
        activeTab === "All"
          ? ALL_PRODUCTS
          : ALL_PRODUCTS.filter((_, i) =>
              activeTab === "Popular" ? i % 2 === 0 : i % 2 !== 0
            );
      setVisibleProducts(filtered.slice(0, limit));
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [activeTab, limit]);

  const handleLoadMore = () => {
    setLimit((prev) => prev + 3);
  };

  return (
    <section className="py-10">
      <Container>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold uppercase tracking-wide">
            Explore Our Products
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-8 ">
          {TABS.map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "outline"}
              onClick={() => {
                setActiveTab(tab);
                setLimit(5);
              }}
              className={`rounded-full text-sm px-5 ${
                activeTab === tab
                  ? "bg-[#f69224] hover:bg-[#e48016] text-white"
                  : "text-gray-600"
              }`}
            >
              {tab}
            </Button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {loading
            ? Array.from({ length: 5 }).map((_, idx) => (
                <Card
                  key={idx}
                  className="animate-pulse border rounded-lg overflow-hidden"
                >
                  <div className="bg-gray-200 h-40 w-full" />
                  <CardContent className="p-3 space-y-2">
                    <div className="bg-gray-200 h-4 w-3/4 rounded"></div>
                    <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
                  </CardContent>
                </Card>
              ))
            : visibleProducts.map((product) => (
                <Card
                  key={product.id}
                  className="rounded-lg shadow-sm hover:shadow-lg transition-transform duration-300 hover:-translate-y-1 overflow-hidden"
                >
                  <div className="relative w-full h-40">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                    <button className="absolute top-2 right-2 bg-white/80 p-1 rounded-full shadow hover:bg-white">
                      <Heart className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="text-sm font-medium truncate">
                      {product.name}
                    </h3>
                    <p className="text-[#f69224] font-semibold">
                      {product.price}
                    </p>
                  </CardContent>
                  <CardFooter className="p-3 pt-0">
                    <Button
                      size="sm"
                      className="w-full bg-[#6fd300] hover:bg-[#5ec000] text-white text-xs"
                    >
                      <ShoppingCart className="w-3 h-3 mr-1" /> Add to Cart
                    </Button>
                  </CardFooter>
                </Card>
              ))}
        </div>

        {/* Load More */}
        {!loading && visibleProducts.length < ALL_PRODUCTS.length && (
          <div className="flex justify-center mt-10">
            <Button
              onClick={handleLoadMore}
              className="bg-destructive hover:bg-destructive/90  text-white px-6 py-3 rounded-none"
            >
              Load More
            </Button>
          </div>
        )}
      </Container>
    </section>
  );
}
