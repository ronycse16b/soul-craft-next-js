"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { PlusIcon, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "../ui/button";
import {
  clearLocalCache,
  getFromLocalCache,
  removeFromCDN,
  uploadMultiple,
} from "@/lib/uploadHelper";

const fetchBanners = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/banner`, {
    cache: "no-store",
  });
  const data = await res.json();
  return data?.data[0]?.imageUrls || [];
};

export default function BannerAddForm() {
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isDeletingBanner, setIsDeletingBanner] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef();
  const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
  const CACHE_KEY = "cdn_banner_temp";
  const queryClient = useQueryClient();

  const { data: imageUrls = [], isLoading: bannerLoading } = useQuery({
    queryKey: ["banners"],
    queryFn: fetchBanners,
  });

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: { images: [] },
  });

  const images = watch("images");

  // Load cached CDN images
  useEffect(() => {
    const cached = getFromLocalCache(CACHE_KEY);
    if (cached?.length) {
      setValue("images", cached);
      setThumbnailUrl(cached[0]);
    }
  }, [setValue]);

  // Upload to CDN
  const uploadMutation = useMutation({
    mutationFn: async (files) => await uploadMultiple(files, CACHE_KEY),
    onSuccess: (urls) => {
      setValue("images", [...images, ...urls]);
      if (!thumbnailUrl) setThumbnailUrl(urls[0]);
      toast.success("Images uploaded!");
    },
    onError: (err) => {
      console.error(err);
      toast.error("Upload failed");
    },
  });

  // Save banner list to backend
  const saveMutation = useMutation({
    mutationFn: async (imageUrls) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/banner`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(imageUrls),
        }
      );
      return res.json();
    },
    onSuccess: (data) => {
      if (data?.success || data?.data) {
        toast.success(data?.message || "Saved successfully");
        clearLocalCache(CACHE_KEY);
        setValue("images", []);
        setThumbnailUrl(null);
        queryClient.invalidateQueries({ queryKey: ["banners"] });
      } else {
        toast.error(data?.message || "Failed to save");
      }
    },
    onError: () => toast.error("Save failed"),
  });

  // Remove from CDN + cache
  const handleRemove = async (url) => {
    setIsDeletingBanner(url);
    try {
      await removeFromCDN(url, CACHE_KEY);
      setValue(
        "images",
        images.filter((img) => img !== url)
      );
      toast.success("Removed");
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    } finally {
      setIsDeletingBanner(null);
    }
  };

  // Upload handler
  const onFileChange = async (e) => {
    const files = Array.from(e.target.files).filter(
      (f) => f.size <= MAX_FILE_SIZE
    );
    setError(null);
    if (!files.length) return setError("Invalid file size (1MB max) use");

    setUploading(true);
    try {
      await uploadMutation.mutateAsync(files);
    } finally {
      setUploading(false);
    }
  };

  // Remove with DB + CDN
  const handleRemoveWithDB = async (url) => {
    setIsDeletingBanner(url);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/banner`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        }
      );
      const data = await res.json();

      if (data?.success) {
        await removeFromCDN(url, CACHE_KEY);
        toast.success(data?.message || "Deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["banners"] });
      } else {
        toast.error(data?.error || "Failed to delete banner");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while deleting");
    } finally {
      setIsDeletingBanner(null);
    }
  };

  return (
    <div className="p-14 bg-white ">
      {error && (
        <p className="text-red-600 font-bold animate-pulse bg-yellow-100 px-4 py-2 mb-4 rounded-md">
          {error}
        </p>
      )}

      <form
        onSubmit={handleSubmit((data) => saveMutation.mutate(data.images))}
        className="space-y-4"
      >
        {/* Upload Section */}
        <div className="w-full bg-gray-50 border border-dashed border-green-500 rounded-lg flex items-center justify-center overflow-hidden relative">
          {uploading && (
            <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-10">
              <Loader2 className="w-8 h-8 text-green-600 animate-spin mb-2" />
              <p className="text-green-600 font-semibold">Uploading...</p>
            </div>
          )}

          {images.length > 0 ? (
            <img
              src={thumbnailUrl || images[0]}
              alt="Main Preview"
              className="w-full h-[350px] object-contain"
            />
          ) : (
            <div
              onClick={() => fileInputRef.current.click()}
              className="w-full h-52 flex flex-col items-center justify-center text-green-600 cursor-pointer hover:bg-green-50 transition-all"
            >
              <PlusIcon size={28} />
              <span className="mt-2 text-sm font-semibold text-green-800">
                Click or Tap to Upload (866x350px recommended)
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                ref={fileInputRef}
                onChange={onFileChange}
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 0 && (
          <div className="flex items-center gap-3 mt-4 flex-wrap">
            {images.map((url, idx) => (
              <div
                key={idx}
                className={`relative w-24 h-24 p-1 border rounded-md transition-all ${
                  thumbnailUrl === url ? "ring-2 ring-green-500" : ""
                }`}
                onClick={() => setThumbnailUrl(url)}
              >
                <img
                  src={url}
                  alt={`img-${idx}`}
                  className="w-full h-full object-cover rounded"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(url);
                  }}
                  disabled={isDeletingBanner === url}
                  className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white w-5 h-5 flex items-center justify-center text-xs rounded"
                >
                  {isDeletingBanner === url ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    "✕"
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end mt-4">
          <Button
            type="submit"
            disabled={!images.length || saveMutation.isLoading}
            className="bg-green-700 text-white hover:bg-green-800 transition-all duration-200 flex items-center gap-2"
          >
            {saveMutation.isLoading && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            {saveMutation.isLoading ? "Submitting..." : "Save Image"}
          </Button>
        </div>
      </form>

      {/* Existing Banners */}
      <div className="bg-gray-50 mt-6 p-3 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Existing Banners</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[300px] overflow-y-auto">
          {bannerLoading ? (
            <p className="text-gray-500 italic">Loading...</p>
          ) : (
            imageUrls.map((img, idx) => (
              <div
                key={idx}
                className="relative border rounded overflow-hidden group"
              >
                <Image
                  src={img}
                  width={400}
                  height={300}
                  alt={`Banner ${idx}`}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                />
                <button
                  onClick={() => handleRemoveWithDB(img)}
                  disabled={isDeletingBanner === img}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-700 text-white px-2 py-1 text-xs rounded flex items-center gap-1"
                >
                  {isDeletingBanner === img ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Removing...
                    </>
                  ) : (
                    "Remove"
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
