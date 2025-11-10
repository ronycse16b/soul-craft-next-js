import { NextResponse } from "next/server";
import { sendMetaCapiEvent } from "@/lib/metaCapi";

export async function POST(req) {
  try {
    const body = await req.json();
    if (!body?.eventName) {
      return NextResponse.json(
        { success: false, message: "eventName required" },
        { status: 400 }
      );
    }
    const result = await sendMetaCapiEvent(body.eventName, body.data || {});
    if (!result.ok)
      return NextResponse.json(
        { success: false, meta: result },
        { status: 500 }
      );
    return NextResponse.json({ success: true, meta: result });
  } catch (err) {
    console.error("meta-capi route error:", err);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
