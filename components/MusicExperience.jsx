"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Container from "./Container";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";

export default function MusicExperience() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // ✅ Fetch active advertisement via TanStack Query
  const {
    data: ads,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["advertisement"],
    queryFn: async () => {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/advertisement/client`);
      return res.data;
    },
    staleTime: 1000 * 60 * 5, // cache for 5 
    keepPreviousData: true,
  });

  const ad = ads?.[0]; // Only one active ad to show

  // ⏱ Countdown Timer Logic
  useEffect(() => {
    if (!ad?.endTime) return;
    const end = new Date(ad.endTime).getTime();

    const timer = setInterval(() => {
      const now = Date.now();
      const diff = end - now;

      if (diff <= 0) {
        clearInterval(timer);
        return setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [ad]);

  // 💬 Loading / Error states
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16 text-gray-400">
        ...
      </div>
    );
  }

  if (isError || !ad) {
    return null; // hide section if no active ad
  }

  // 🎨 UI
  return (
    <Container className="px-0 mb-8">
      <section className="relative w-full py-16 bg-gradient-to-r from-black via-red-900 to-red-800 text-white overflow-hidden">
        <div className="container mx-auto px-8 lg:px-16 flex flex-col lg:flex-row items-center justify-between gap-10">
          {/* Left Side */}
          <div
            data-aos="fade-right"
            data-aos-offset="300"
            data-aos-easing="ease-in-sine"
            className="lg:w-1/2 space-y-6"
          >
            <h3 className="text-lg font-semibold text-green-500 uppercase">
              {ad?.title || "Categories"}
            </h3>
            {ad?.description && (
              <p className="text-gray-300 max-w-lg">{ad?.description}</p>
            )}

            {/* Countdown Timer */}
            <div className="flex gap-6 mb-8 mt-4">
              {Object.entries(timeLeft).map(([label, value]) => (
                <div
                  key={label}
                  className="text-center bg-white rounded-full w-14 h-14 flex flex-col items-center justify-center text-gray-800 shadow-lg"
                >
                  <div className="text-sm font-semibold">
                    {String(value).padStart(2, "0")}
                  </div>
                  <div className="text-[10px] capitalize">{label}</div>
                </div>
              ))}
            </div>

            {/* Button */}
            <Button
              asChild
              className="bg-destructive hover:bg-destructive/80 shadow-lg text-white px-8 py-6 rounded-full text-lg font-semibold transition-all duration-300"
            >
              <Link href={ad.buttonLink}>{ad.buttonText}</Link>
            </Button>
          </div>

          {/* Right Side */}
          <div
            data-aos="fade-left"
            data-aos-anchor="#example-anchor"
            data-aos-offset="500"
            data-aos-duration="500"
            className="lg:w-1/2 flex justify-center"
          >
            <Image
              src={ad.image}
              alt={ad.title}
              width={400}
              height={400}
              priority
              className="object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </section>
    </Container>
  );
}
