// models/advertisement.model.js
import mongoose from "mongoose";

const advertisementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String },
    description: { type: String },
    image: { type: String, required: true },
    buttonText: { type: String, default: "Buy Now!" },
    buttonLink: { type: String, default: "#" },
    endTime: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Advertisement ||
  mongoose.model("Advertisement", advertisementSchema);
