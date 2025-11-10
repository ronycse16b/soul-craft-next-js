import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
  attributes: Object, // { Color: "Red", Size: "L", Material: "Leather" }
  price: Number,
  stock: Number,
  sku: String,
});

const attributeSchema = new mongoose.Schema({
  name: String,
  values: [String],
});

const landingPageSchema = new mongoose.Schema(
  {
    heroTitle: String,
    heroParagraph: String,
    heroButtonText: String,

    productTitle: { type: String, required: true },
    productShortDesc: String,
    productDescription: String,
    productImages: [String],

    attributes: [attributeSchema],
    variants: [variantSchema],

    videoDescription: String,
    videoUrl: String,
  },
  { timestamps: true }
);

export default mongoose.models.LandingPage ||
  mongoose.model("LandingPage", landingPageSchema);
