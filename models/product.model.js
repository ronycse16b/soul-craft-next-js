import mongoose from "mongoose";
import slugify from "slugify";
import Counter from "./Counter.js"; // adjust path based on your project structure

const variantSchema = new mongoose.Schema(
  {
    variant: String,
    price: Number,
    quantity: Number,
    sku: String,
    discount: { type: Number, default: 0 },
    discountedPrice: { type: Number, default: 0 },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  slug: { type: String, unique: true },
  productIndex: { type: Number, unique: true },
  description: String,
  type: { type: String, enum: ["simple", "variant"], required: true },
  price: { type: Number, default: 0 },

  quantity: Number,
  sku: String,
  discount: { type: Number, default: 0 },
  variant: [variantSchema],
  brand: { type: String, default: "Soul Craft" },
  colors: [String],
  material: String,
  weight: String,
  ingredients: [String],
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubCategory",
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId, // optional but useful
    ref: "Category",
  },
  images: [String],
  thumbnail: String,
  video: String,
  features: [String],
  isActive: { type: Boolean, default: true },
  visibility: { type: String, enum: ["public", "private"], default: "public" },
  flashSale: { type: Boolean, default: false },
  newArrival: { type: Boolean, default: false },
  averageRating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  totalSold: Number,
  reviews: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      rating: Number,
      comment: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Generate slug + auto-increment product index
productSchema.pre("save", async function (next) {
  this.updatedAt = new Date();

  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { name: "product" },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );

    this.productIndex = counter.value;

    const baseSlug = slugify(this.productName, { lower: true, strict: true });
    this.slug = `${baseSlug}-${this.productIndex}`;
  }

  next();
});

export default mongoose.models.Product ||
  mongoose.model("Product", productSchema);

