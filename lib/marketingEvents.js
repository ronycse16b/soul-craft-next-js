"use client";

import { v4 as uuidv4 } from "uuid";

// 🔹 Helper: send event to Meta CAPI (server-side)
async function sendToCapi(eventName, data = {}) {
  console.log("[CAPI Debug] Sending event:", eventName, data); // 🔹 DEBUG
  try {
    await fetch("/api/meta-capi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventName, data }),
    });
  } catch (err) {
    console.warn("CAPI send error:", err.message);
  }
}

// 🔹 Helper: common dedupe event_id generator
function generateEventId() {
  return uuidv4();
}

// 🔹 Common pixel trigger
function fbqTrack(event, params = {}, eventId) {
  console.log("[FB Pixel Debug] Event:", event, params, eventId); // 🔹 DEBUG
  if (typeof window === "undefined") return;
  if (window.fbq) {
    window.fbq("trackSingle", event, params, { eventID: eventId });
  }
}

// 🔹 Common GA4 trigger
function gtagEvent(event, params = {}) {
  console.log("[GA4 Debug] Event:", event, params); // 🔹 DEBUG
  if (typeof window === "undefined") return;
  if (window.gtag) {
    window.gtag("event", event, params);
  }
}

// ========== MAIN EXPORTS ==========

// 🟩 VIEW CONTENT
export function trackViewContent(product) {
  const id = product?._id || product?.productId || "unknown-id";
  const eventId = generateEventId();
  const data = {
    event_id: eventId,
    url: typeof window !== "undefined" ? window.location.href : "",
    custom_data: {
      content_name: product?.productName,
      content_ids: [id],
      content_type: "product",
      value: product?.price || 0,
      currency: "BDT",
    },
  };

  fbqTrack("ViewContent", data.custom_data, eventId);
  gtagEvent("view_item", {
    items: [
      {
        item_id: id,
        item_name: product?.productName,
        price: product?.price,
      },
    ],
  });
  sendToCapi("ViewContent", data);
}

// 🟨 ADD TO CART
export function trackAddToCart(product) {
  const id = product?._id || product?.productId || "unknown-id";
  const eventId = generateEventId();
  const data = {
    event_id: eventId,
    url: typeof window !== "undefined" ? window.location.href : "",
    custom_data: {
      content_name: product?.productName,
      content_ids: [id],
      content_type: "product",
      value: product?.price || 0,
      currency: "BDT",
    },
  };

  fbqTrack("AddToCart", data.custom_data, eventId);
  gtagEvent("add_to_cart", {
    items: [
      {
        item_id: id,
        item_name: product?.productName,
        price: product?.price,
      },
    ],
  });
  sendToCapi("AddToCart", data);
}

// 🟧 INITIATE CHECKOUT
export function trackInitiateCheckout(cart) {
  const eventId = generateEventId();
  const totalValue = cart.reduce((acc, i) => acc + i.price * (i.qty || 1), 0);
  const ids = cart.map((i) => i._id || i.productId || "unknown-id");

  const data = {
    event_id: eventId,
    url: typeof window !== "undefined" ? window.location.href : "",
    custom_data: {
      content_ids: ids,
      content_type: "product_group",
      value: totalValue,
      currency: "BDT",
    },
  };

  fbqTrack("InitiateCheckout", data.custom_data, eventId);
  gtagEvent("begin_checkout", { value: totalValue, currency: "BDT" });
  sendToCapi("InitiateCheckout", data);
}

// 🟥 PURCHASE
export function trackPurchase(order) {
  const eventId = generateEventId();
  const totalValue = order?.total || 0;
  const items = order?.items || [];

  const data = {
    event_id: eventId,
    url: typeof window !== "undefined" ? window.location.href : "",
    email: order?.user?.email,
    phone: order?.user?.phone,
    custom_data: {
      value: totalValue,
      currency: "BDT",
      contents: items.map((i) => ({
        id: i._id || i.productId || "unknown-id",
        quantity: i.qty || 1,
        item_price: i.price,
      })),
    },
  };

  fbqTrack("Purchase", data.custom_data, eventId);
  gtagEvent("purchase", {
    transaction_id: order?._id,
    value: totalValue,
    currency: "BDT",
  });
  sendToCapi("Purchase", data);
}
