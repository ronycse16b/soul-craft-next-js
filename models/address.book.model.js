import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    deliveryAddress: { type: String, default: "" },
    phone: { type: String, default: "" },
    isDefault: { type: Boolean, default: false },
    label: { type: String, enum: ["Home", "Office", "Other"], default: "Home" },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const addressBookSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    addresses: [addressSchema],
  },
  { timestamps: true }
);

// ✅ Export with clean model name and variable name
const AddressBookModel =
  mongoose.models.AddressBook ||
  mongoose.model("AddressBook", addressBookSchema);

export default AddressBookModel;
