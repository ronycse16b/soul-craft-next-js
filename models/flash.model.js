import mongoose from "mongoose";

const flashSaleSchema = new mongoose.Schema(
  {
    title: { type: String, default: "Flash Sale" },
    endTime: { type: Date, required: true }, // Countdown er jonno
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        discount: { type: Number, required: true }, // product discount %
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.FlashSale ||
  mongoose.model("FlashSale", flashSaleSchema);