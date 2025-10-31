"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import Container from "./Container";

export default function NewArrival() {
  return (
    <Container className="w-full py-12 px-2 sm:px-8 bg-white">
      {/* Title Section */}
      <div className="flex items-center gap-2 mb-2 texc">
        <span className="w-2 h-2 rounded-full bg-[#f44]" />
        <span className="text-sm font-semibold text-[#f44] uppercase">
          Featured
        </span>
      </div>
      <h2 className="text-xl sm:text-2xl  font-bold mb-8">New Arrival</h2>

      {/* Fixed Height Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[500px]">
        {/* Left Side - PlayStation */}
        <div className="relative md:col-span-2 overflow-hidden  group h-full">
          <Image
            src="/n1.png"
            alt="PlayStation 5"
            fill
            className="object-contain transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute bottom-6 left-6 text-white z-10">
            <h3 className="text-2xl font-semibold mb-1">PlayStation 5</h3>
            <p className="text-sm mb-3 max-w-xs opacity-90">
              Black and White version of the PS5 coming out on sale.
            </p>
            <Button className="bg-outline underline  text-destructive hover:bg-[#f69224] hover:text-white">
              Shop Now
            </Button>
          </div>
        </div>

        {/* Right Side (Split into 3 sections) */}
        <div className="flex flex-col gap-6 h-full">
          {/* Top - Women’s Collection */}
          <div className="relative overflow-hidden  group h-[50%]">
            <Image
              src="/n2.png"
              alt="Women's Collections"
              fill
              className="object-contain transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="absolute bottom-6 left-6 text-white">
              <h3 className="text-lg font-semibold mb-1">
                Women’s Collections
              </h3>
              <p className="text-sm mb-3 opacity-90 max-w-xs">
                Featured woman collections that give you another vibe.
              </p>
              <Button className="bg-outline underline  text-destructive hover:bg-[#f69224] hover:text-white">
                Shop Now
              </Button>
            </div>
          </div>

          {/* Bottom Row (Speakers + Perfume) */}
          <div className="grid grid-cols-2 gap-2 h-[50%]">
            {/* Speakers */}
            <div className="relative overflow-hidden  group">
              <Image
                src="/n3.png"
                alt="Speakers"
                fill
                className="object-contain transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-base font-semibold mb-1">Speakers</h3>
                <p className="text-xs mb-3 opacity-90">
                  Amazon wireless speakers.
                </p>
                <Button className="bg-outline underline  text-destructive hover:bg-[#f69224] hover:text-white">
                  Shop Now
                </Button>
              </div>
            </div>

            {/* Perfume */}
            <div className="relative overflow-hidden  group">
              <Image
                src="/n4.png"
                alt="Perfume"
                fill
                className="object-contain transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-base font-semibold mb-1">Perfume</h3>
                <p className="text-xs mb-3 opacity-90">GUCCI INTENSEOUD EDP</p>
                <Button className="bg-outline underline  text-destructive hover:bg-[#f69224] hover:text-white">
                  Shop Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
