"use client";

import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function FeatureControlDialog({ product }) {
  const [open, setOpen] = useState(false);
  const [isFeatured, setIsFeatured] = useState(product.featured || false);
  const [position, setPosition] = useState(product.featuredPosition || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);

      const res = await axios.post("/api/featured-section", {
        productId: product._id,
        featured: isFeatured,
        featuredPosition: Number(position) || null,
      });

      if (res.data.success) {
        toast.success("Featured status updated!");
        setOpen(false); // ✅ close dialog after success
      } else {
        toast.error(res.data.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          onClick={() => setOpen(true)}
          className={`${
            isFeatured
              ? "border-green-600 text-green-600 hover:bg-green-50"
              : "border-gray-400 text-gray-600 hover:bg-gray-50"
          }`}
        >
          {isFeatured ? "Featured" : "Set Featured"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[420px] rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Feature Product Control
          </DialogTitle>
          <DialogDescription>
            Mark this product as <b>Featured</b> and select a display position.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-3">
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Product Name
            </Label>
            <Input
              value={product.productName}
              disabled
              className="bg-gray-100 text-gray-700 mt-1"
            />
          </div>

          <div className="flex items-center justify-between mt-2">
            <Label className="text-sm font-medium text-gray-700">
              Featured Status
            </Label>
            <Button
              type="button"
              size="sm"
              onClick={() => setIsFeatured((prev) => !prev)}
              className={`${
                isFeatured ? "bg-green-600 hover:bg-green-700" : "bg-gray-300"
              } text-white`}
            >
              {isFeatured ? "Active" : "Inactive"}
            </Button>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">
              Position (1–4)
            </Label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              disabled={!isFeatured}
              className="w-full border rounded-md px-2 py-1 mt-1 text-sm"
            >
              <option value="">Select position</option>
              <option value="1">1 - Main Left</option>
              <option value="2">2 - Top Right</option>
              <option value="3">3 - Bottom Left</option>
              <option value="4">4 - Bottom Right</option>
            </select>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-[#f69224] text-white hover:bg-[#e98220]"
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
