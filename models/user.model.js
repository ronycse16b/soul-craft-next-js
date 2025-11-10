import mongoose from "mongoose";
import bcrypt from "bcrypt";


const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    emailOrPhone: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: function () {
        return !this.isGoogle;
      },
    },

    // role: { type: String, enum: ["user", "admin"], default: "user" },

    isGoogle: {
      type: Boolean, // true if logged in via Google
      default: false,
    },

    hasPassword: {
      type: Boolean,
      default: false, // track if Google user has set a password
    },

    image: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    },

    role: {
      type: String,
      enum: ["admin", "moderator", "user"],
      default: "user",
    },
    permissions: {
      create: { type: Boolean, default: false },
      read: { type: Boolean, default: true },
      update: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
    },

    googleId: {
      type: String, // store Google ID
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

// Hash password before saving (only for credentials login or new password)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model("User", userSchema);
