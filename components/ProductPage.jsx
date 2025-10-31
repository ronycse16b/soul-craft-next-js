'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Minus,
  Plus,
  Truck,
  RotateCcw,
  MessageCircle,
} from "lucide-react";
import { useState } from "react";

export default function ProductPage() {
  const [quantity, setQuantity] = useState(1);
  const increment = () => setQuantity((q) => Math.min(q + 1, 99));
  const decrement = () => setQuantity((q) => Math.max(q - 1, 1));

  const thumpsImages = ["/thump.png", "/thump2.png", "/thump3.png", "/thump4.png"];

  return (
    <div className=" p-4 md:p-6 space-y-10">
      {/* Product Section */}
      <div className="flex flex-col md:flex-row ">
        {/* Images */}
        <div className="flex md:flex-row flex-col gap-4 w-full">
          {/* Thumbnails */}
          <div className="flex md:flex-col gap-2 min-w-[100px] flex-shrink-0">
            {thumpsImages?.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Thumb ${i + 1}`}
                className="w-[110px] h-[100px] object-cover rounded-md border hover:scale-105 transition "
              />
            ))}
          </div>

          {/* Main Image */}
          <img
            src="/main.png"
            alt="Main Gamepad"
            className="w-[450px] h-[420px] object-cover rounded-lg border"
          />
        </div>

        {/* Details */}
        <div className="space-y-5 ">
          <h2 className="text-3xl font-bold">Havic HV G-92 Gamepad</h2>
          <p className="text-2xl text-blue-600 font-semibold">$192.00</p>
          <p className="text-sm text-muted-foreground">
            PlayStation 5 Controller Skin High quality vinyl with air channel
            adhesive for easy bubble free install & mess free removal. Pressure
            sensitive.
          </p>

          <div className="flex gap-3">
            {/* Color Selector */}
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="white">White</SelectItem>
                  <SelectItem value="black">Black</SelectItem>
                  <SelectItem value="blue">Blue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Size Selector */}
            <div className="space-y-2">
              <Label htmlFor="size">Size</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="s">S</SelectItem>
                  <SelectItem value="m">M</SelectItem>
                  <SelectItem value="l">L</SelectItem>
                  <SelectItem value="xl">XL</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={decrement}>
                <Minus className="w-4 h-4" />
              </Button>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-16 text-center"
              />
              <Button variant="outline" size="icon" onClick={increment}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button className="">Buy Now</Button>
            <Button variant="outline" className="">
              Add to Cart
            </Button>
            {/* WhatsApp Button */}
            <a
              href="https://wa.me/8801234567890"
              target="_blank"
              rel="noopener noreferrer"
              className=" inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition text-sm w-fit"
            >
              <MessageCircle className="w-4 h-4" />
              Chat on WhatsApp
            </a>
          </div>

          {/* Delivery & Return Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="border rounded-md p-4 flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-green-600" />
                <span className="font-semibold">Free Delivery</span>
              </div>
              <p className="text-muted-foreground">
                See your postal code for delivery availability.
              </p>
            </div>
            <div className="border rounded-md p-4 flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-yellow-600" />
                <span className="font-semibold">Return Delivery</span>
              </div>
              <p className="text-muted-foreground">
                Max 30 Days Delivery Returns. Details.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="description" className="w-full">
        <TabsList>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="review">Review</TabsTrigger>
        </TabsList>

        <hr className="border-b border-gray-300" />
        <TabsContent value="description">
          <p className="mt-4 text-sm text-muted-foreground">
            This controller skin uses premium vinyl with air channel adhesive
            for bubble-free installation. Pressure-sensitive and easy to remove
            without residue.
            {/* Product Attributes */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Compatibility:</strong> PS5, PC
              </div>
              <div>
                <strong>Connection:</strong> Wired USB
              </div>
              <div>
                <strong>Material:</strong> Vinyl Skin
              </div>
              <div>
                <strong>Warranty:</strong> 1 Year
              </div>
            </div>
          </p>
        </TabsContent>
        <TabsContent value="review">
          <div className="mt-4 space-y-3 text-sm text-muted-foreground">
            <div>
              ⭐️⭐️⭐️⭐️☆ — “Feels premium and works flawlessly with my PS5.
              Highly recommend!”
            </div>
            <div>⭐️⭐️⭐️☆☆ — “Good build but delivery was slow.”</div>
            <div>
              ⭐️⭐️⭐️⭐️⭐️ — “Excellent grip and responsive buttons. Worth
              the price!”
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Related Items */}
      <h2>Related Products</h2>
      <hr className="border-b border-gray-300" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {[
          {
            name: "HAVIT HV-G92 Gamepad",
            price: "$160",
            old: "$192",
            img: "/related1.png",
          },
          {
            name: "AK-900 Wired Keyboard",
            price: "$40",
            old: "$60",
            img: "/related2.png",
          },
          {
            name: "IPS LCD Gaming Monitor",
            price: "$170",
            old: "$200",
            img: "/related3.png",
          },
          {
            name: "RGB Liquid CPU Cooler",
            price: "$160",
            old: "$170",
            img: "/related4.png",
          },
        ].map((item, i) => (
          <Card key={i} className="hover:shadow-md transition">
            <CardHeader>
              <img
                src={item.img}
                alt={item.name}
                className="rounded-md w-full h-32 object-cover"
              />
            </CardHeader>
            <CardContent>
              <CardTitle className="text-sm font-semibold">
                {item.name}
              </CardTitle>
              <p className="text-blue-600 font-semibold">{item.price}</p>
              <p className="line-through text-xs text-muted-foreground">
                {item.old}
              </p>
              <Button variant="outline" className="mt-2 w-full">
                View
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
