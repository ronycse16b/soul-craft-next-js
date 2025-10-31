// /models/Message.js
import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  email: { type: String, required: true, trim: true, lowercase: true },
  name: { type: String, required: true, trim: true },
  phone: { type: String, trim: true },
  message: { type: String, required: true, trim: true },
  reply: { type: String, default: "" },
  repliedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});


// Avoid recompiling model in Next.js hot reload
export default mongoose.models.Message ||
  mongoose.model("Message", MessageSchema);
