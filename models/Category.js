import mongoose from "mongoose";
import slugify from "slugify";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, unique: true },
    isActive: { type: Boolean, default: true },
    image: { type: String },
  },
  { timestamps: true }
);

// Auto-generate slug
categorySchema.pre("save", function (next) {
  if (!this.isModified("name")) return next();
  this.slug = slugify(this.name, { lower: true, strict: true });
  next();
});

export default mongoose.models.Category ||
  mongoose.model("Category", categorySchema);
