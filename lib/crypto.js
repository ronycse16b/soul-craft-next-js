import crypto from "crypto";

const ALGO = "aes-256-cbc";
const KEY = process.env.CONFIG_SECRET_KEY;

export function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGO, Buffer.from(KEY), iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return { iv: iv.toString("hex"), data: encrypted };
}

export function decrypt(encrypted) {
  const decipher = crypto.createDecipheriv(ALGO, Buffer.from(KEY), Buffer.from(encrypted.iv, "hex"));
  let decrypted = decipher.update(encrypted.data, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
