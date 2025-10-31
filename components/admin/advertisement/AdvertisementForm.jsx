"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { Upload, X } from "lucide-react";

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

export default function AdvertisementForm({
  open,
  onClose,
  onSuccess,
  editData,
}) {
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    buttonText: "Buy Now!",
    buttonLink: "#",
    image: "",
    endTime: "",
  });

  const [uploadedUrls, setUploadedUrls] = useState([]); // UI display
  const [localUploadedUrls, setLocalUploadedUrls] = useState([]); // localStorage sync
  const [uploading, setUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);

  // === Modal Open Logic ===
  useEffect(() => {
    if (!open) return;

    if (editData) {
      // === Edit ===
      setForm(editData);
      setUploadedUrls(editData.image ? [editData.image] : []);
      setLocalUploadedUrls([]); // edit modal ignore localStorage unless user upload/delete
    } else {
      // === New ===
      const savedImages = localStorage.getItem("advertisementImages");
      const localImages = savedImages ? JSON.parse(savedImages) : [];
      setUploadedUrls(localImages);
      setLocalUploadedUrls(localImages);
      resetFormWithoutImages();
    }
  }, [open, editData]);

  const resetFormWithoutImages = () => {
    setForm({
      title: "",
      subtitle: "",
      description: "",
      buttonText: "Buy Now!",
      buttonLink: "#",
      image: "",
      endTime: "",
    });
  };

  // === Sync localUploadedUrls to localStorage (only for new ad or edit changes) ===
  useEffect(() => {
    if (!editData) {
      if (localUploadedUrls.length) {
        localStorage.setItem(
          "advertisementImages",
          JSON.stringify(localUploadedUrls)
        );
      } else {
        localStorage.removeItem("advertisementImages");
      }
    }
  }, [localUploadedUrls, editData]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // === Upload Image ===
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    const validFiles = files.filter((f) => f.size <= MAX_FILE_SIZE);
    if (!validFiles.length) {
      toast.error("All files exceed 1MB.");
      setUploading(false);
      return;
    }

    try {
      const formData = new FormData();
      validFiles.forEach((f) => formData.append("images", f));

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
        if (!editData)
          setLocalUploadedUrls((prev) => [...prev, ...data.imageUrls]);
        else setLocalUploadedUrls((prev) => [...prev, ...data.imageUrls]); // edit change
        toast.success("Image uploaded successfully!");
      } else {
        toast.error("Upload failed.");
      }
    } catch {
      toast.error("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  // === Remove Image ===
  const handleRemoveImage = async (url) => {
    try {
      setIsDeleting(url);
      const filename = url.split("/uploads/")[1];
      await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/delete-upload-image`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename }),
        }
      );

      setUploadedUrls((prev) => prev.filter((u) => u !== url));
      setLocalUploadedUrls((prev) => prev.filter((u) => u !== url)); // sync for localStorage
      toast.success("Image removed");
    } catch {
      toast.error("Failed to remove image");
    } finally {
      setIsDeleting(null);
    }
  };

  // === Submit ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, image: uploadedUrls[0] || "" };

    try {
      if (editData) {
        await axios.put(`/api/advertisement/${editData._id}`, payload);
        toast.success("Advertisement updated!");
      } else {
        await axios.post("/api/advertisement", payload);
        toast.success("Advertisement created!");
      }

      localStorage.removeItem("advertisementImages"); // always clear on submit
      setLocalUploadedUrls([]);
      onSuccess();
      onClose();
    } catch {
      toast.error("Failed to save advertisement");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="min-w-[800px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800">
            {editData ? "Edit Advertisement" : "Create Advertisement"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter advertisement title"
              required
            />
          </div>

          <div>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter short description"
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={4}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <Label>Button Text</Label>
              <Input
                name="buttonText"
                value={form.buttonText}
                onChange={handleChange}
              />
            </div>
            <div className="flex-1">
              <Label>Button Link</Label>
              <Input
                name="buttonLink"
                value={form.buttonLink}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            {uploadedUrls.length === 0 && (
              <label
                htmlFor="file-upload"
                className="mt-2 border-2 border-dashed rounded-md flex flex-col items-center justify-center p-6 bg-gray-50 cursor-pointer hover:border-green-500 hover:bg-green-50"
              >
                <Upload className="w-10 h-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  {uploading ? "Uploading..." : "Click or drag to upload image"}
                </p>
                <Input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                  disabled={uploading}
                />
              </label>
            )}

            {uploadedUrls.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {uploadedUrls.map((url) => (
                  <div
                    key={url}
                    className="relative rounded-md overflow-hidden border group w-48 h-48"
                  >
                    <Image
                      src={url}
                      alt="Uploaded"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(url)}
                      className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition"
                    >
                      {isDeleting === url ? (
                        <span className="text-[10px]">...</span>
                      ) : (
                        <X className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label>End Time</Label>
            <Input
              type="datetime-local"
              name="endTime"
              value={form.endTime}
              onChange={handleChange}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold transition"
            disabled={uploading || isDeleting}
          >
            {uploading
              ? "Uploading..."
              : editData
              ? "Update Advertisement"
              : "Create Advertisement"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
