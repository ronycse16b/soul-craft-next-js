import crypto from "crypto";
import { connectDB } from "@/lib/db.config";
import MarketingConfig from "@/models/MarketingConfig.model";

function sha256(value = "") {
  return crypto
    .createHash("sha256")
    .update(String(value).trim().toLowerCase())
    .digest("hex");
}

export async function sendMetaCapiEvent(eventName, payload = {}) {
  await connectDB();
  const cfg = await MarketingConfig.findOne({ active: true });
  if (!cfg || !cfg.metaPixelId || !cfg.metaAccessToken) {
    console.warn("Meta CAPI not configured");
    return { ok: false, message: "Meta CAPI not configured" };
  }

  const pixelId = cfg.metaPixelId;
  const accessToken = cfg.metaAccessToken;
  const apiUrl = process.env.META_API_URL || "https://graph.facebook.com/v18.0";

  const eventId = payload.event_id || crypto.randomUUID();

  const body = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: payload.action_source || "website",
        event_source_url: payload.url || "",
        user_data: {
          // supply hashed values when available
          em: payload.email ? [sha256(payload.email)] : undefined,
          ph: payload.phone ? [sha256(payload.phone)] : undefined,
          client_ip_address: payload.ip || undefined,
          client_user_agent: payload.userAgent || undefined,
        },
        custom_data: payload.custom_data || {},
      },
    ],
  };

  try {
    const res = await fetch(
      `${apiUrl}/${pixelId}/events?access_token=${accessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    const json = await res.json();
    return { ok: res.ok, status: res.status, body: json, event_id: eventId };
  } catch (err) {
    console.error("Meta CAPI send error:", err);
    return { ok: false, message: err.message };
  }
}
