"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Container from "./Container";

export default function CategorySection() {
  const categories = [
    { name: "Phones", icon: "📱" },
    { name: "Computers", icon: "💻" },
    { name: "SmartWatch", icon: "⌚" },
    { name: "Camera", icon: "📸" },
    { name: "HeadPhones", icon: "🎧" },
    { name: "Gaming", icon: "🎮" },
    { name: "Watch", icon: "⌚" },
   
  ];

  const [selected, setSelected] = useState("Camera");

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
  });

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  return (
    <section className="sm:py-10 py-4 bg-white">
      <Container>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            {/* <p className="text-[#f69224] font-semibold">Categories</p> */}
            <h2 className="text-md sm:text-2xl font-bold uppercase text-black">
              Browse By Category
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={scrollPrev}
              className="p-2 rounded-full border hover:bg-gray-100 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={scrollNext}
              className="p-2 rounded-full border hover:bg-gray-100 transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Categories Carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4">
            {categories.map((cat) => (
              <div
                key={cat.name}
                onClick={() => setSelected(cat.name)}
                className={`flex flex-col items-center justify-center min-w-[120px] sm:min-w-[150px] h-[120px] rounded-md border text-center cursor-pointer transition-all duration-300 ${
                  selected === cat.name
                    ? "bg-destructive text-white border-destructive shadow-md"
                    : "border-gray-200 hover:border-destructive hover:shadow-sm"
                }`}
              >
                <div className="text-4xl mb-2">{cat.icon}</div>
                <p
                  className={`text-sm font-medium ${
                    selected === cat.name ? "text-white" : "text-gray-800"
                  }`}
                >
                  {cat.name}
                </p>
              </div>
            ))}
          </div>
        </div>
        <hr className="mt-18 border-t border-gray-200"/>
      </Container>
    </section>
  );
}
