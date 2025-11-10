"use client";
import { PlusIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "../ui/button";
import AdvertistForm from "./AdvertistForm";

export default function BannerAddForm() {

  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrls, setUploadedUrls] = useState([]); // For preview,
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [bannerLoading,setBannerLoading] = useState(true);

  const [isDeleting, setIsDeleting] = useState(null);

  const [error, setError] = useState("");
    const [imageUrls, setImageUrls] = useState([]);
    const [isDeletingBanner, setIsDeletingBanner] = useState(null);
  
    // Fetch banner data
    const fetchBannerData = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/banner`,
          { cache: "no-store" }
        );
        const data = await res.json();
        setImageUrls(data?.data[0]?.imageUrls || []);
      } catch (error) {
        console.error("Failed to fetch banner data", error);
        setImageUrls([]);
      }finally{
        setBannerLoading(false);
      }
    };
  
    useEffect(() => {
      fetchBannerData();
    }, []);
  
    // Delete an image
    const handleRemoveImageBanner = async (urlToRemove) => {
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
  
        // রিফ্রেশ করে নতুন ব্যানার দেখাতে পারেন
        await fetchBannerData();
      } catch (error) {
        console.log("image deleted fail:", error);
      } finally {
        setIsDeletingBanner(null);
      }
    };

  const fileInputRef = useRef();
  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("uploadedImagesForBanner");
    if (stored) setUploadedUrls(JSON.parse(stored));
  }, []);

  // Update localStorage when uploadedUrls changes
  useEffect(() => {
    localStorage.setItem("uploadedImagesForBanner", JSON.stringify(uploadedUrls));
  }, [uploadedUrls]);

  const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

  const handleImageChange = async (e) => {
    try {
      setUploading(true);
      const files = Array.from(e.target.files);
      const validFiles = [];
      const errors = [];

      files.forEach((file) => {
        if (file.size > MAX_FILE_SIZE) {
          errors.push(`${file.name} is larger than 1MB and was not uploaded.`);
        } else {
          validFiles.push(file);
        }
      });

      if (errors.length > 0) {
        setError(errors.join("\n"));
      }

      if (validFiles.length === 0) {
        setUploading(false);
        return;
      }

      const formData = new FormData();
      validFiles.forEach((file) => formData.append("images", file));

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (data.success) {
        setUploadedUrls((prev) => [...prev, ...data.imageUrls]);
      } else {
        alert("Upload failed. Please try again.");
      }
    } catch (error) {
      console.error("Upload Error:", error);
      alert("An error occurred while uploading images.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async (urlToRemove) => {
    try {
      setIsDeleting(urlToRemove);
      const filename = urlToRemove.split("/uploads/")[1]; // Extract filename only

      // Call API to delete from server
      await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/delete-upload-image`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename }),
        }
      );

      // Remove from UI + localStorage
      const filtered = uploadedUrls.filter((url) => url !== urlToRemove);
      setUploadedUrls(filtered);
    } catch (error) {
      console.log(error?.message);
    } finally {
      setIsDeleting(null);
    }
  };

  const saveImageHandler = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/banner`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(uploadedUrls),
        }
      );

      const data = await res.json(); // ✅ Await the parsed JSON

    

      if (data?.data) {
        await fetchBannerData();
        toast.success(data?.message || "Data saved successfully");
        setUploadedUrls([]);
        localStorage.removeItem("uploadedImagesForBanner");
      } else {
        toast.error(data?.message || "Failed to save data");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while saving the banner.");
    } finally {
      setIsSaving(false);
    }
  };
  

  return (
    <div className="">
      <div className="   p-4 rounded-xl relative">
        <div className="w-full">
          {/* <h2 className="text-lg font-semibold mb-4">Images Upload</h2> */}

          {/* Main Image Preview */}
          <div className="w-full   bg-gray-50 flex items-center justify-center overflow-hidden">
            {uploadedUrls.length > 0 ? (
              <img
                src={`${thumbnailUrl || uploadedUrls[0]}`}
                alt="Main Preview"
                className="w-full h-[350px] object-contain"
              />
            ) : (
              <>
                <div className="w-full">
                  <div
                    onClick={() => fileInputRef.current.click()}
                    className="w-full h-52 border-2 border-dashed border-green-500 rounded-lg flex flex-col items-center justify-center text-green-600 cursor-pointer transition-colors hover:bg-green-50"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        fileInputRef.current.click();
                    }}
                  >
                    <PlusIcon size={24} />
                    <span className="mt-2 text-sm  text-red-600 animate-pulse font-bold">
                      Click or Tap to Upload Images (width = 866px * height = 350px )
                    </span>
                    <span className="text-xs text-gray-500">
                      (Only image files are allowed)
                    </span>
                  </div>

                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              </>
            )}
          </div>

          {/* Thumbnails */}
          <div className="flex items-center gap-3 mt-6">
            {uploadedUrls?.map((url, idx) => (
              <div
                key={idx}
                className={`relative w-24 h-24 p-2  overflow-hidden border border-gray-300 cursor-pointer ${
                  thumbnailUrl === url ? "ring-2 ring-red-600" : ""
                }`}
                onClick={() => setThumbnailUrl(url)}
              >
                <img
                  src={`${url}`}
                  alt={`img-${idx}`}
                  className="w-full h-full object-cover"
                />

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage(url);
                  }}
                  disabled={isDeleting === url}
                  className={`absolute top-1 right-1 bg-red-600  text-white  w-5 h-5 flex items-center justify-center text-xs z-10 ${
                    isDeleting === url ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isDeleting === url ? (
                    <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                  ) : (
                    "✕"
                  )}
                </button>
              </div>
            ))}

            {uploadedUrls.length > 0 && (
              <>
                <div
                  onClick={() => fileInputRef.current.click()}
                  className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center text-green-600 cursor-pointer hover:bg-green-50"
                >
                  <PlusIcon size={20} />
                </div>

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                />
              </>
            )}
          </div>

          {/* Uploading Status */}
          {uploading && (
            <p className="text-sm text-gray-500 mt-2">Image Uploading...</p>
          )}
        </div>
        <div className="my-4">
          <Button
            disabled={!uploadedUrls?.length || isSaving}
            onClick={saveImageHandler}
            className="btn bg-green-700 text-white absolute bottom-3 right-3"
          >
            {isSaving ? "Saving..." : "Save Image"}
          </Button>
        </div>
      </div>

      {/* data save in database button  */}

      <div className="bg-base-100 sm:mt-5 mt-2">
        <h2 className="text-lg font-semibold mb-1">Existing Banners</h2>
        <p className="mb-6">Manage your existing banners below.</p>
        {/* Future implementation for displaying existing banners */}
      
        <div className=" overflow-y-auto h-[300px]">
          {bannerLoading ? (
            "..."
          ) : (
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
                      handleRemoveImageBanner(
                        `${process.env.NEXT_PUBLIC_BASE_URL}${img}`
                      )
                    }
                    disabled={
                      isDeletingBanner ===
                      `${process.env.NEXT_PUBLIC_BASE_URL}${img}`
                    }
                    className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-sm rounded hover:bg-red-700"
                  >
                    {isDeletingBanner ===
                    `${process.env.NEXT_PUBLIC_BASE_URL}${img}`
                      ? "Removing..."
                      : "Remove"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
