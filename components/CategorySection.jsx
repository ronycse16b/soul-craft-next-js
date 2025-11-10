"use client";

import React, { useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Container from "./Container";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Image from "next/image";

export default function CategorySection() {
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
  });

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev();
  const scrollNext = () => emblaApi && emblaApi.scrollNext();

  // Fetch categories dynamically
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/categories/client`); // Your API
      return res.data.result || [];

    },
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
  });

 

  return (
    <section className="sm:py-10 py-4 bg-white">
      <Container>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-md sm:text-2xl font-bold uppercase text-black">
            Browse By Category
          </h2>
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
            {categories?.map((cat) => {
              const isSelected = selected === cat.name;
              
            

              return (
                <div
                  key={cat._id || cat.name}
                  onClick={() => setSelected(cat.name)}
                  onMouseEnter={() => setHovered(cat?._id || cat?.name)}
                  onMouseLeave={() => setHovered(null)}
                  className={`flex flex-col items-center justify-center min-w-[120px] sm:min-w-[150px] h-[150px] rounded-md border cursor-pointer transition-all duration-300 relative bg-gray-50 ${
                    isSelected
                      ? "border-destructive shadow-lg"
                      : "border-gray-200 hover:shadow-sm"
                  }`}
                >
                  {/* Image Container with fade */}
                  <div className="relative w-20 h-20 mt-4 mb-2">
                    <Image
                      src={cat?.image}
                      alt={cat?.name}
                      fill
                      className="absolute object-contain transition-opacity duration-500"
                    />
                  </div>

                  {/* Category Name */}
                  <p
                    className={`text-sm font-semibold text-center mb-4 ${
                      isSelected ? "text-destructive" : "text-gray-800"
                    }`}
                  >
                    {cat.name}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <hr className="mt-10 border-t border-gray-200" />
      </Container>
    </section>
  );
}
