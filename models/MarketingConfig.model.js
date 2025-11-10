import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    gtmId: { type: String, default: "" },
    ga4Id: { type: String, default: "" },
    metaPixelId: { type: String, default: "" },
    metaAccessToken: { type: String, default: "" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.MarketingConfig ||
  mongoose.model("MarketingConfig", schema);
