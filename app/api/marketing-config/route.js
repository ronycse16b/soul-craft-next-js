import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db.config";
import MarketingConfig from "@/models/MarketingConfig.model";
import { verifyAccess } from "@/lib/roleMiddleware"; // or your adminOnlyMiddleware

export async function GET(req) {
  await connectDB();
  const cfg = await MarketingConfig.findOne({ active: true });
  return NextResponse.json({ success: true, data: cfg || null });
}

export async function POST(req) {
  // require admin
  const auth = await verifyAccess(req, { roles: ["admin"] });
  if (auth instanceof NextResponse) return auth;

  await connectDB();
  const body = await req.json();
  const { gtmId, ga4Id, metaPixelId, metaAccessToken } = body;
  if (!metaPixelId && !gtmId && !ga4Id) {
    return NextResponse.json(
      { success: false, message: "At least one ID required" },
      { status: 400 }
    );
  }

  // deactivate old
  await MarketingConfig.updateMany({}, { active: false });
  const newCfg = await MarketingConfig.create({
    gtmId,
    ga4Id,
    metaPixelId,
    metaAccessToken,
    active: true,
  });
  return NextResponse.json({ success: true, data: newCfg });
}

export async function DELETE(req) {
  // require admin
  const auth = await verifyAccess(req, { roles: ["admin"] });
  if (auth instanceof NextResponse) return auth;
  await connectDB();
  await MarketingConfig.updateMany({}, { active: false });
  return NextResponse.json({ success: true });
}