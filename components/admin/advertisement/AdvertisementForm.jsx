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
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import {
  clearLocalCache,
  getFromLocalCache,
  removeFromCDN,
  uploadSingle,
} from "@/lib/uploadHelper";

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

export default function AdvertisementForm({
  open,
  onClose,
  onSuccess,
  editData,
}) {
  const queryClient = useQueryClient();

  const [uploadedUrl, setUploadedUrl] = useState (null);
  const [uploading, setUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      title: "",
      subtitle: "",
      description: "",
      buttonText: "Buy Now!",
      buttonLink: "#",
      image: "",
      endTime: "",
    },
  });

  // === Load data on open ===
  useEffect(() => {
    if (!open) return;

    if (editData) {
      const formattedTime = editData.endTime
        ? new Date(editData.endTime).toISOString().slice(0, 16)
        : "";

      reset({
        ...editData,
        endTime: formattedTime,
      });
      setUploadedUrl(editData.image || null);
    } else {
      const cached = getFromLocalCache("advertisementImages");
      if (cached.length > 0) {
        setUploadedUrl(cached[0]);
        setValue("image", cached[0]);
      }
      reset({
        title: "",
        subtitle: "",
        description: "",
        buttonText: "Buy Now!",
        buttonLink: "#",
        image: "",
        endTime: "",
      });
    }
  }, [open, editData, reset, setValue]);

  // === Upload ===
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File exceeds 1MB.");
      return;
    }

    setUploading(true);
    try {
      const url = await uploadSingle(file, "advertisementImages");
      if (url) {
        setUploadedUrl(url);
        setValue("image", url);
        toast.success("Image uploaded!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Upload failed!");
    } finally {
      setUploading(false);
    }
  };

  // === Remove Image ===
  const handleRemoveImage = async () => {
    if (!uploadedUrl) return;
    try {
      setIsDeleting(true);
      await removeFromCDN(uploadedUrl, "advertisementImages");
      setUploadedUrl(null);
      setValue("image", "");
      toast.success("Image removed!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove image");
    } finally {
      setIsDeleting(false);
    }
  };

  // === Submit (mutation with caching) ===
  const mutation = useMutation({
    mutationFn: async (data) => {
      if (editData) {
        return axios.put(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/advertisement/${editData._id}`,
          data
        );
      }
      return axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/advertisement`,
        data
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advertisements"] });
      clearLocalCache("advertisementImages");
      setUploadedUrl(null);
      toast.success(
        editData ? "Advertisement updated!" : "Advertisement created!"
      );
      onSuccess();
      onClose();
    },
    onError: () => {
      toast.error("Failed to save advertisement");
    },
  });

  const onSubmit = (data) => {
    if (!uploadedUrl) {
      toast.error("Please upload an image first.");
      return;
    }
    mutation.mutate({ ...data, image: uploadedUrl });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full md:max-w-3xl p-10">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800">
            {editData ? "Edit Advertisement" : "Create Advertisement"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="">
            <Input
              {...register("title", { required: true })}
              placeholder="Enter advertisement title"
            />
          
          </div>

          <textarea
            {...register("description")}
            placeholder="Enter short description"
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            rows={2}
          />

          <div className="flex gap-4">
            <div className="flex-1">
              <Label>Button Text</Label>
              <Input {...register("buttonText")} />
            </div>
            <div className="flex-1">
              <Label>Button Link</Label>
              <Input {...register("buttonLink")} />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            {!uploadedUrl ? (
              <label
                htmlFor="upload"
                className="mt-2 border-2 border-dashed rounded-md flex flex-col items-center justify-center p-6 bg-gray-50 cursor-pointer hover:border-green-500 hover:bg-green-50 transition"
              >
                <Upload className="w-10 h-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  {uploading ? "Uploading..." : "Click or drag to upload image"}
                </p>
                <Input
                  id="upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                  disabled={uploading}
                />
              </label>
            ) : (
              <div className="mt-4 relative w-full h-48 group border rounded-md overflow-hidden">
                <Image
                  src={uploadedUrl}
                  alt="Uploaded"
                  fill
                  className="object-contain"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                >
                  {isDeleting ? "..." : <X className="w-3 h-3" />}
                </button>
              </div>
            )}
          </div>

          <div>
            <Label>End Time</Label>
            <Input
              type="datetime-local"
              {...register("endTime", { required: true })}
              className="w-full"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <Button
              type="button"
              disabled={register?.image?.length === 0}
              variant="outline"
              onClick={onClose}
              className="border-gray-300 text-white cursor-pointer transition hover:text-white hover:bg-red-700 bg-red-600 delay-100"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold"
              disabled={uploading || isDeleting || mutation.isPending}
            >
              {mutation.isPending
                ? "Saving..."
                : editData
                ? "Save Changes"
                : "Create "}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
