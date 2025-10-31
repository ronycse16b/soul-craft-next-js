import { connectDB } from "@/lib/db.config";
import Message from "@/models/message.model";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    await connectDB();
    const { messageId, reply } = await req.json();

    if (!messageId || !reply) {
      return NextResponse.json(
        { error: "Missing messageId or reply" },
        { status: 400 }
      );
    }

    // 1️⃣ Update message in DB
    const message = await Message.findByIdAndUpdate(
      messageId,
      { reply, repliedAt: new Date() },
      { new: true }
    );

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // 2️⃣ Configure Nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // 3️⃣ Email template with brand colors
    const mailOptions = {
      from: `"SoulCraft Support" <${process.env.SMTP_USER}>`,
      to: message.email,
      subject: "Your message reply from SoulCraft",
      html: `
      <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: auto; border: 1px solid #eaeaea; border-radius: 10px; overflow: hidden;">
        <div style="background: linear-gradient(90deg, #f69224, #6fd300); color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">SoulCraft Support</h2>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
          <p style="font-size: 16px;">Hello <strong>${
            message.name
          }</strong>,</p>
          <p style="font-size: 16px;">Thank you for reaching out to us. Here’s a copy of your message:</p>
          <div style="background: #fff; padding: 15px; border-radius: 8px; border: 1px solid #ddd; margin-bottom: 15px;">
            <p style="margin: 0;"><strong>Your message:</strong></p>
            <p style="margin: 5px 0 0 0;">${message.message}</p>
          </div>
          <div style="background: #fff; padding: 15px; border-radius: 8px; border: 1px solid #ddd; margin-bottom: 15px;">
            <p style="margin: 0; color: #f69224;"><strong>Our reply:</strong></p>
            <p style="margin: 5px 0 0 0;">${reply}</p>
          </div>
          <p style="font-size: 14px; color: #666;">Replied at: ${new Date().toLocaleString()}</p>
          <p style="font-size: 16px; color: #333;">We hope this helps. If you have any more questions, reply to this email and we'll get back to you.</p>
        </div>
        <div style="background: #f1f1f1; text-align: center; padding: 15px; font-size: 14px; color: #555;">
          &copy; ${new Date().getFullYear()} SoulCraft. All rights reserved.
        </div>
      </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to reply and send email" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const messages = await Message.find().sort({ createdAt: 1 });
    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
