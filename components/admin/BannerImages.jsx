"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function BannerImages() {
  const [imageUrls, setImageUrls] = useState([]);
  const [isDeletingBanner, setIsDeletingBanner] = useState(null);

  // Fetch banner data
  const fetchData = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/banner`,
        { cache: "no-store" }
      );
      const data = await res.json();
      setImageUrls(data.imageUrls || []);
    } catch (error) {
      console.error("Failed to fetch banner data", error);
      setImageUrls([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Delete an image
  const handleRemoveImage = async (urlToRemove) => {
    try {
      setIsDeletingBanner(urlToRemove);

      const filename = urlToRemove.split("/uploads/")[1];

      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/banner`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filename }),
      });

   
      await fetchData();
    } catch (error) {
      console.log("image deleted fail:", error);
    } finally {
      setIsDeletingBanner(null);
    }
  };
  

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {imageUrls.map((img, index) => (
        <div
          key={index}
          className="relative group border rounded overflow-hidden"
        >
          <Image
            src={`${img}`}
            width={400}
            height={300}
            alt={`Banner ${index}`}
            className="object-cover w-full h-full"
          />
          <button
            onClick={() =>
              handleRemoveImage(`${process.env.NEXT_PUBLIC_BASE_URL}${img}`)
            }
            disabled={
              isDeletingBanner === `${process.env.NEXT_PUBLIC_BASE_URL}${img}`
            }
            className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-sm rounded hover:bg-red-700"
          >
            {isDeletingBanner === `${process.env.NEXT_PUBLIC_BASE_URL}${img}`
              ? "Removing..."
              : "Remove"}
          </button>
        </div>
      ))}
    </div>
  );
}
