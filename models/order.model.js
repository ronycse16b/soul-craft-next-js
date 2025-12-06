import mongoose from "mongoose";

// Define the counter schema
const counterSchema = new mongoose.Schema({
  _id: { type: String },
  seq: { type: Number, default: 0 },
});

// Fix: Don't recompile the model if it already exists
const Counter =
  mongoose.models.OrderCounter || mongoose.model("OrderCounter", counterSchema);

  const statusHistorySchema = new mongoose.Schema({
    status: {
      type: String,
      enum: [
        "Pending",
        "Processing",
        "Confirmed",
        "Shipped",
        "Delivered",
        "Cancelled",
        "Hold",
        "Failed",
        "Return",
      ],
      required: true,
    },
    note: { type: String, default: "" },
    changedAt: { type: Date, default: Date.now },
  });

// Define the order schema
const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },

    address: { type: String },
    identifier:{
      type:String
    },
    deliveryCharge: { type: Number },
    image: { type: String },
    mobile: { type: String },
    name: { type: String },
    paymentMethod: { type: String, default: "Cash on delivery" },
    price: { type: Number },
    productName: { type: String },
    note: { type: String },
    sku: { type: String },
    qty: { type: Number },
    size: { type: String },
    total: { type: Number },
    statusHistory: [statusHistorySchema], // ✅ stores full status log
    status: { type: String, default: "Processing" },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate order number
orderSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: "orderCounter" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      const serialNumber = counter.seq.toString().padStart(2, "0");
      this.orderNumber = `NF-${serialNumber}-${this.mobile}`;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Fix: this line had a typo (you used `productSchema` instead of `orderSchema`)
export default mongoose.models.Order || mongoose.model("Order", orderSchema);
