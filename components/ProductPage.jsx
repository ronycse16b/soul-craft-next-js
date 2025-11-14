"use client";

import { useState, useEffect } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Minus, Plus, Truck, RotateCcw, MessageCircle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import toast, { Toaster } from "react-hot-toast";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  buyNow,
  decrementQuantity,
  incrementQuantity,
} from "@/redux/features/cartSlice";
import RelatedProducts from "./RelatedProducts";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { trackAddToCart, trackInitiateCheckout, trackViewContent } from "@/lib/marketingEvents";



function getFinalPrice(product, variant) {
  const isSimple = product.type === "simple";

  if (isSimple) {
    const hasDiscount = product.discount > 0;
    return hasDiscount ? product.discount : product.price;
  }

  if (!variant) return 0;

  const hasDiscount = variant.discount > 0;
  return hasDiscount ? variant.discount : variant.price;
}

function getComparePrice(product, variant) {
  const isSimple = product.type === "simple";
  return isSimple ? product.price : variant?.price;
}

function getDiscountPercent(product, variant) {
  const final = getFinalPrice(product, variant);
  const base = getComparePrice(product, variant);

  if (!base || base <= final) return 0;

  return Math.round(((base - final) / base) * 100);
}





export default function ProductPage({ product }) {
  const cartItems = useSelector((state) => state.cart.items);
  const router = useRouter();

  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(
    product.thumbnail || product.images?.[0]
  );
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [selectedVariant, setSelectedVariant] = useState(
    product.type === "simple"
      ? { ...product, quantity: product.quantity ?? 9999 } // fallback for simple product
      : null
  );
  const finalPrice = getFinalPrice(product, selectedVariant);
  const comparePrice = getComparePrice(product, selectedVariant);
  const percentageOff = getDiscountPercent(product, selectedVariant);

  const autoplay = Autoplay({ delay: 3500, stopOnInteraction: false });

  useEffect(() => {
    const isSimple = product.type === "simple";
    // ✅ Get accurate available stock
    const availableStock = isSimple
      ? product.quantity
      : selectedVariant?.quantity ?? 0;
    // ✅ Everything ok → prepare payload
    const payload = {
      productId: product._id,
      productName: product.productName,
      images: product.thumbnail || product.images?.[0],
      attributes: isSimple ? {} : selectedAttributes,
      price: finalPrice,
      sku: isSimple ? product.sku : selectedVariant?.sku ?? "",
      quantity,
      variant: isSimple ? null : selectedVariant,
      availableStock, // 🟢 send stock info to slice
    };

    // 🔹 Track product view on mount
    trackViewContent(payload);
  }, [product]);

  // Normalize attributes from API so each attribute.values is always array of strings
  const normalizeAttributes = (attrs = []) =>
    attrs.map((a) => {
      const raw = a.values;

      // if values already an array, try to flatten JSON-encoded items and split comma-inside items
      if (Array.isArray(raw)) {
        const flattened = raw.flatMap((item) => {
          if (typeof item !== "string") return [String(item)];
          // try JSON parse if it's a JSON string like '["Red","Black"]'
          try {
            const parsed = JSON.parse(item);
            if (Array.isArray(parsed)) return parsed.map((p) => String(p));
          } catch (e) {
            // not JSON, fall through
          }
          // split by comma if present
          if (item.includes(",")) return item.split(",").map((s) => s.trim());
          return [item.trim()];
        });
        return {
          ...a,
          values: Array.from(new Set(flattened.map((s) => s.trim()))).filter(
            Boolean
          ),
        };
      }

      // if values is a string: try JSON parse first, then comma-split
      if (typeof raw === "string") {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            return {
              ...a,
              values: parsed.map((s) => String(s).trim()).filter(Boolean),
            };
          }
        } catch (e) {}
        return {
          ...a,
          values: raw
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        };
      }

      // fallback: return empty array
      return { ...a, values: [] };
    });

  // safer attrsFromVariant: return object mapping attribute name -> value
  const attrsFromVariant = (variant) => {
    if (!variant) return {};
    if (!variant.attributes) return {};
    if (
      typeof variant.attributes === "object" &&
      !Array.isArray(variant.attributes)
    ) {
      return variant.attributes;
    }
    // if it's entries array like [['Size','39'], ['Colors','Black']]
    if (Array.isArray(variant.attributes)) {
      try {
        return Object.fromEntries(variant.attributes);
      } catch (e) {
        // fallback: if items are objects {name, value}
        const obj = {};
        variant.attributes.forEach((it) => {
          if (Array.isArray(it) && it.length >= 2) obj[it[0]] = it[1];
          else if (it && it.name) obj[it.name] = it.value ?? it.values ?? "";
        });
        return obj;
      }
    }
    // last resort: try to parse string
    try {
      return JSON.parse(variant.attributes);
    } catch (e) {
      return {};
    }
  };

  // Initialize product attributes once after fetch/receive
  useEffect(() => {
    if (!product) return;

    // normalize attributes before using them
    const normalizedAttrs = normalizeAttributes(product.attributes || []);
    // create a shallow-cloned product object for local use or set into state
    const normalizedProduct = { ...product, attributes: normalizedAttrs };
    // if you keep product in state: setProduct(normalizedProduct) else use local var below
    // assume you set a local normalized variable for render and logic
    // find first available variant (same as your existing logic)
    if (
      normalizedProduct.type === "variant" &&
      normalizedProduct.variants?.length > 0
    ) {
      const firstVariant =
        normalizedProduct.variants.find((v) => v.quantity > 0) ||
        normalizedProduct.variants[0];
      setSelectedVariant(firstVariant);
      setSelectedAttributes(attrsFromVariant(firstVariant));
    }
    // If you store normalized product into state, do it here:
    // setProduct(normalizedProduct);
  }, [product]);

  // NEW handleAttributeSelect - dynamic, no hardcoding
  const handleAttributeSelect = (name, value) => {
    // 1) set the clicked attribute locally
    const updated = { ...selectedAttributes, [name]: value };

    // 2) try to find any variant that matches all currently selected attribute keys
    const match = product.variants.find((variant) => {
      if (!variant) return false;
      if (variant.quantity <= 0) return false; // only consider in-stock variants
      const attrs = attrsFromVariant(variant);

      // every selected key must match the variant
      return Object.entries(updated).every(([k, v]) => attrs[k] === v);
    });

    if (match) {
      // If we found a variant that matches the partial selection,
      // auto-fill ALL attributes from that variant (so missing attributes like color get selected)
      const fullAttrs = attrsFromVariant(match);
      setSelectedAttributes(fullAttrs);
      setSelectedVariant(match);
    } else {
      const anyMatchForClicked = product.variants.find((variant) => {
        if (!variant) return false;
        if (variant.quantity <= 0) return false;
        const attrs = attrsFromVariant(variant);
        return attrs[name] === value;
      });

      if (anyMatchForClicked) {
        // Auto-fill from that variant (it chooses one color/other attrs that exist for the clicked value)
        setSelectedAttributes(attrsFromVariant(anyMatchForClicked));
        setSelectedVariant(anyMatchForClicked);
      } else {
        // Nothing matches: keep the partial selection (user chose a combination with no stock)
        setSelectedAttributes(updated);
        setSelectedVariant(null);
      }
    }

    // reset quantity on every attribute change
    setQuantity(1);
  };

  const increment = () => {
    // limit on stock
    setQuantity((prev) => {
      if (selectedVariant) {
        return prev < selectedVariant.quantity ? prev + 1 : prev;
      } else {
        return prev + 1;
      }
    });
  };

  // Decrement quantity in cart
  const decrement = () => {
    // limit on stock
    setQuantity((prev) => (prev > 1 ? prev - 1 : prev));
  };




  const dispatch = useDispatch();



  // Add to cart handler
  const handleAddToCart = () => {
    const isSimple = product.type === "simple";

    // ✅ Get accurate available stock
    const availableStock = isSimple
      ? product.quantity
      : selectedVariant?.quantity ?? 0;

    if (!isSimple && !selectedVariant) {
      return toast.error("Please select variant first");
    }

    // ✅ Find existing cart item
    const existingItem = cartItems.find(
      (item) =>
        item.productId === product._id &&
        JSON.stringify(item.attributes || {}) ===
          JSON.stringify(selectedAttributes || {})
    );

    const totalQuantity = existingItem
      ? existingItem.quantity + quantity
      : quantity;

    // ✅ Stock check before dispatch
    if (totalQuantity > availableStock) {
      return toast.error(`Only ${availableStock} items in stock`);
    }

    // ✅ Everything ok → prepare payload
    const payload = {
      productId: product._id,
      productName: product.productName,
      images: product.thumbnail || product.images?.[0],
      attributes: isSimple ? {} : selectedAttributes,
      price: finalPrice,
      sku: isSimple ? product.sku : selectedVariant?.sku ?? "",
      quantity,
      variant: isSimple ? null : selectedVariant,
      availableStock, // 🟢 send stock info to slice
    };

   
    trackAddToCart(payload);
    // ✅ Dispatch safely
    dispatch(addToCart(payload));
    toast.success("Added to cart");
  };

  // Direct buy handler
  const handleBuyNow = () => {
    const isSimple = product.type === "simple";

    if (!isSimple && !selectedVariant) {
      return toast.error("Please select variant first");
    }

    const cartItem = {
      productId: product._id,
      productName: product.productName,
      images: product.images?.[0] || product.thumbnail,
      quantity,
      attributes: isSimple ? {} : selectedAttributes,
      price: finalPrice,
      sku: isSimple ? product.sku : selectedVariant?.sku ?? "",
      variant: isSimple ? null : selectedVariant,
    };

    trackAddToCart(cartItem);
    dispatch(buyNow(cartItem));

    toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
      loading: "Processing...",
      success: "Proceeding to checkout",
      error: "Failed to proceed to checkout",
    });

    trackInitiateCheckout([cartItem]);

    router.push("/checkout");
  };

  // Attribute stock checks
  const isValueAvailable = (attrName, value) => {
    if (product.type === "simple") return true; // simple product has no attributes
    return product.variants.some((variant) => {
      const attrs =
        typeof variant.attributes === "object"
          ? variant.attributes
          : Object.fromEntries(variant.attributes);

      const otherAttrsMatch = Object.entries(selectedAttributes).every(
        ([key, val]) => key === attrName || attrs[key] === val
      );

      return (
        otherAttrsMatch && attrs[attrName] === value && variant.quantity > 0
      );
    });
  };

  const isAttributeValueInStock = (attrName, value) => {
    if (product.type === "simple") return true;
    return product.variants.some((variant) => {
      const attrs =
        typeof variant.attributes === "object"
          ? variant.attributes
          : Object.fromEntries(variant.attributes);
      return attrs[attrName] === value && variant.quantity > 0;
    });
  };

  const whatsAppMessage = `Hello, I am interested in the product: ${
    product.productName
  }. 
Here is the link: ${typeof window !== "undefined" ? window.location.href : ""}. 
Could you tell me more about it?`;

  // URL-encode for WhatsApp
  const encodedMessage = encodeURIComponent(whatsAppMessage);
  // Example WhatsApp link
  const whatsappLink = `https://wa.me/8801968536050?text=${encodedMessage}`;

  console.log("=== PRICE DEBUG ===");
  console.log("Type:", product.type);
  console.log("Variant:", selectedVariant);
  console.log("Final Price:", finalPrice);
  console.log("Compare Price:", comparePrice);
  console.log("Discount %:", percentageOff);
  console.log("=====================");


  return (
    <div className="p-1 md:p-6 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Images */}
        <div className="lg:flex-row flex flex-col-reverse gap-4 w-full md:w-1/2">
          {/* Thumbnails */}
          <div className="flex md:flex-col gap-2">
            {product?.images?.map((img, i) => (
              <div
                key={i}
                className={`relative w-16 h-16 md:w-20 md:h-20 rounded-md border cursor-pointer transition-all overflow-hidden ${
                  currentImage === img
                    ? "border-[#f69224] scale-105 shadow-lg"
                    : "hover:scale-105"
                }`}
                onClick={() => setCurrentImage(img)}
              >
                <Image
                  src={img}
                  alt={`Thumb ${i}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          {/* Main Carousel */}
          <div className="w-full md:w-4/5 rounded-lg  overflow-hidden">
            <Carousel plugins={[autoplay]}>
              <CarouselContent>
                {product?.images?.map((img, i) => (
                  <CarouselItem key={i}>
                    <div className="relative w-full h-[350px] md:h-[420px] rounded-lg cursor-pointer border">
                      <Image
                        src={img}
                        alt={`Product Image ${i}`}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </div>

        {/* Right Details */}
        <div className="w-full md:w-1/2 space-y-3  md:space-y-6 px-2 sm:px-0">
          <h1 className="sm:text-3xl font-bold text-xl">
            {product.productName}
          </h1>

          {/* Price Section */}
          <div className="flex items-center gap-4 mt-2">
            <p className="text-3xl font-extrabold text-green-600">
              BDT {finalPrice?.toLocaleString()}
            </p>

            {comparePrice > finalPrice && (
              <div className="flex items-center gap-2">
                <p className="text-gray-400 line-through text-lg">
                  BDT {comparePrice?.toLocaleString()}
                </p>
                <span className="bg-gradient-to-r from-red-600 to-red-400 text-white font-semibold text-xs px-3 py-1 rounded-full shadow-md">
                  {percentageOff}% OFF
                </span>
              </div>
            )}
          </div>

          {/* <pre>{JSON?.stringify(product.attributes)}</pre> */}

          {/* Attributes */}
          {product?.attributes?.map((attr) => (
            <div key={attr.name}>
              <Label className="font-medium">{attr.name}</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {attr?.values?.map((v, i) => {
                  const val = String(v).trim();
                  const selected = selectedAttributes[attr.name] === val;
                  const isFirstAttribute =
                    product.attributes[0].name === attr.name;
                  const available = isFirstAttribute
                    ? isAttributeValueInStock(attr.name, val)
                    : isValueAvailable(attr.name, val);

                  return (
                    <Button
                      key={`${attr.name}-${i}`}
                      size="sm"
                      variant={selected ? "default" : "outline"}
                      onClick={() => handleAttributeSelect(attr.name, val)}
                      disabled={!available}
                      className={`transition-all duration-200 ${
                        selected ? "scale-105 shadow-lg" : "hover:scale-105"
                      } ${!available ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {val}
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Quantity */}
          <div className="flex items-center ">
            <Button
              variant="outline"
              className="rounded-none shadow-none cursor-pointer"
              size="icon"
              onClick={decrement}
            >
              <Minus className="w-4 h-3" />
            </Button>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-16 h-10 text-center rounded-none shadow-none"
            />
            <Button
              variant="outline"
              className="rounded-none shadow-none cursor-pointer"
              size="icon"
              onClick={increment}
            >
              <Plus className="w-4 h-3" />
            </Button>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Buy Now Button */}
            <Button
              onClick={handleBuyNow}
              className="w-full sm:w-1/2 py-6 px-6 bg-gradient-to-r from-[#f69224] to-[#fbb034] hover:from-[#e07b1c] hover:to-[#f69224] text-white font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Buy Now
            </Button>

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              variant="outline"
              className="w-full sm:w-1/2 py-[22px] px-6 border-2 border-[#f69224] text-[#f69224] font-semibold rounded-lg hover:bg-[#f69224] hover:text-white shadow transition-all duration-300 transform hover:scale-105 cursor-pointer"
            >
              Add to Cart
            </Button>
          </div>

          {/* WhatsApp Chat */}
          <Link
            href={whatsappLink}
            target="_blank"
            className="inline-flex items-center justify-center gap-2 px-4 py-3 w-full bg-gradient-to-r from-green-400 to-green-600 text-white font-medium rounded-lg hover:from-green-500 hover:to-green-700 shadow-lg transition-all duration-300 transform hover:scale-105 text-sm"
          >
            <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
          </Link>

          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {/* Free Delivery */}
            <div className="border rounded-lg p-4 flex flex-col gap-2 text-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center gap-2 text-green-700 font-medium">
                <Truck className="w-5 h-5" /> Free Delivery
              </div>
              <p className="text-gray-500 text-xs">
                Check your postal code for availability
              </p>
            </div>

            {/* Return Policy */}
            <div className="border rounded-lg p-4 flex flex-col gap-2 text-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center gap-2 text-yellow-600 font-medium">
                <RotateCcw className="w-5 h-5" /> Return Policy
              </div>
              <p className="text-gray-500 text-xs">
                Max 30 Days Delivery Returns
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Reviews Tabs */}
      <div className="mt-8">
        <Tabs defaultValue="description" className="w-full">
          {/* Tab Headers */}
          <TabsList className="border-b border-gray-200 flex flex-wrap">
            <TabsTrigger
              value="description"
              className="text-gray-700 font-medium px-4 py-2 hover:text-[#f69224] transition-colors duration-300 flex-1 text-center md:text-left"
            >
              Description
            </TabsTrigger>
            <TabsTrigger
              value="review"
              className="text-gray-700 font-medium px-4 py-2 hover:text-[#f69224] transition-colors duration-300 flex-1 text-center md:text-left"
            >
              Reviews ({product.reviews?.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* Description Content */}
          <TabsContent
            value="description"
            className="mt-4 text-gray-700 text-sm leading-relaxed prose prose-sm max-w-full"
          >
            <div dangerouslySetInnerHTML={{ __html: product.description }} />
          </TabsContent>

          {/* Reviews Content */}
          <TabsContent value="review" className="mt-4 space-y-4">
            {!product.reviews || product.reviews.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No reviews yet</p>
            ) : (
              product.reviews.map((r, i) => (
                <div
                  key={i}
                  className="p-4 border rounded-xl shadow-sm hover:shadow-md transition-all duration-300 bg-white"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-yellow-500">
                      ⭐ {r.rating}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm">{r.comment}</p>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Divider */}
      <hr className="my-8 border-gray-200" />

      {/* Related Products Heading */}
      <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-800">
        Related Products
      </h2>

      {/* Related Products Component */}
      <RelatedProducts
        categoryId={product?.subCategory?._id} // category of current product
        excludeId={product?._id} // exclude current product
      />
    </div>
  );
}
