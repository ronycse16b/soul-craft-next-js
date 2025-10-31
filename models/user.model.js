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
      // only required if user is NOT using Google login
      required: function () {
        return !this.isGoogle;
      },
    },

    role: { type: String, enum: ["user", "admin"], default: "user" },

    isGoogle: {
      type: Boolean, // true if logged in via Google
      default: false,
    },

    image: {
      type: String,
      default: () => "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    },

    address:{
      type: String,
      default: "N/A",
    },

    googleId: {
      type: String, // store Google ID
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true }
);

// Hash password before saving (only for credentials login)
userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model("User", userSchema);
