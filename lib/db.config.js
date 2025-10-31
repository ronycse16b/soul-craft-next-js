import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: "soulcraft" });
    isConnected = true;
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error(error);
  }
};

