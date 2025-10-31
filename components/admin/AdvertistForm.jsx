"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button"; // ধরে নিলাম আপনি shadcn/ui ব্যবহার করছেন
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// একটি সিমুলেটেড API কল ফাংশন
async function savePromotionData(data) {
  // বাস্তব প্রজেক্টে, এখানে Next.js API রুটকে কল করা হবে (যেমন: /api/promotion)
  // এবং ডেটাবেসে (MongoDB/PostgreSQL/Supabase) সেভ করা হবে।
  console.log("Saving data to database:", data);
  // সিমুলেশন: 1 সেকেন্ড পরে সফল মেসেজ
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: "Promotion data saved successfully!" });
    }, 1000);
  });
}

export default function AdvertistForm() {
  const [formData, setFormData] = useState({
    title: "Enhance Your Music Experience",
    imageUrl: "/music.png", // ছবির URL
    days: 5,
    hours: 23,
    minutes: 59,
    seconds: 35,
  });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value) || 0 : value, // সংখ্যা ইনপুটকে ইন্টিজারে রূপান্তর
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Saving...");
    setError("");

    try {
      const response = await savePromotionData(formData);
      if (response.success) {
        setStatus(response.message);
        // আপনি এখানে চাইলেই ডাটা সেভ করার পর ফ্রন্ট-এন্ডে থাকা MusicExperience কম্পোনেন্টকে রিফ্রেশ করতে পারেন
      } else {
        setError("Failed to save data.");
        setStatus("");
      }
    } catch (err) {
      setError("An error occurred during save.");
      setStatus("");
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto bg-white shadow-xl rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
        প্রোমোশন সেটিংস অ্যাডমিন প্যানেল ⚙️
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Title Input */}
        <div>
          <Label htmlFor="title" className="text-gray-700">
            শিরোনাম (Title)
          </Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enhance Your Music Experience"
            className="mt-1"
          />
        </div>

        {/* 2. Image URL Input */}
        <div>
          <Label htmlFor="imageUrl" className="text-gray-700">
            পণ্যের ছবির URL
          </Label>
          <Input
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="/music.png"
            className="mt-1"
          />
        </div>

        {/* 3. Countdown Timer Inputs */}
        <div className="grid grid-cols-4 gap-4">
          {["days", "hours", "minutes", "seconds"].map((timeUnit) => (
            <div key={timeUnit}>
              <Label htmlFor={timeUnit} className="text-gray-700 capitalize">
                {timeUnit}
              </Label>
              <Input
                id={timeUnit}
                name={timeUnit}
                type="number"
                min="0"
                value={formData[timeUnit]}
                onChange={handleChange}
                className="mt-1 text-center"
              />
            </div>
          ))}
        </div>

        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 transition duration-200"
          disabled={status === "Saving..."}
        >
          {status === "Saving..." ? "আপডেট হচ্ছে..." : "পরিবর্তন সেভ করুন"}
        </Button>
      </form>

      {/* Status Messages */}
      {status && status !== "Saving..." && (
        <p className="mt-4 text-sm text-green-600 font-medium">{status}</p>
      )}
      {error && (
        <p className="mt-4 text-sm text-red-600 font-medium">Error: {error}</p>
      )}
    </div>
  );
}
