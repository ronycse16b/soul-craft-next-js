import mongoose from "mongoose";
import slugify from "slugify";
import Counter from "./Counter.js";

// Each variant combination (like S + Red)
const variantItemSchema = new mongoose.Schema(
  {
    attributes: {
      type: Map, 
      of: String,
    },
    price: { type: Number, },
    discount: { type: Number, default: 0 },
    quantity: { type: Number, default: 0 },
    sku: { type: String },
  },
  { _id: false }
);

// Attribute setup for variant generation
const attributeSchema = new mongoose.Schema(
  {
    name: { type: String },
    values: [{ type: String }],
  },
  { _id: false }
);

const productSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  slug: { type: String, unique: true },
  productIndex: { type: Number, unique: true },

  description: String,
  type: { type: String, enum: ["simple", "variant"], required: true },

  // for simple products
  price: { type: Number, default: 0 },
  quantity: Number,
  sku: String,
  discount: { type: Number, default: 0 },

  // Variant-based
  attributes: {
    type: [attributeSchema],
    required: function () {
      return this.type === "variant"; // only required for variant products
    },
    default: [],
  },
  variants: {
    type: [variantItemSchema],
    required: function () {
      return this.type === "variant"; // only required for variant products
    },
    default: [],
  },

  brand: { type: String, default: "Soul Craft" },
  colors: [String],
  material: String,
  weight: String,
  ingredients: [String],

  featured: {
    type: Boolean,
    default: false, // determines if the product is featured
  },
  featuredPosition: {
    type: Number,
    enum: [1, 2, 3, 4], // which slot (1–4) it appears in the layout
    default: null,
  },

  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubCategory",
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
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

// Auto slug + index
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

