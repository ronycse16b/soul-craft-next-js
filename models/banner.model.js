import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    imageUrls: [String],
  },
  { timestamps: true }
);

export default mongoose.models.Banner || mongoose.model("Banner", bannerSchema);
