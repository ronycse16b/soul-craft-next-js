"use client";

// -------------------- DEBUG --------------------
const DEBUG_MODE = true; // সব ইভেন্ট console-এ দেখতে true রাখুন

// -------------------- HELPERS --------------------
const sendGA4Event = (event, params) => {
  if (DEBUG_MODE) console.log("[GA4 Event]", event, params);
  if (typeof window !== "undefined" && window.gtag)
    window.gtag("event", event, params);
};

const sendGTMEvent = (event, data) => {
  if (DEBUG_MODE) console.log("[GTM Event]", event, data);
  if (typeof window !== "undefined" && window.dataLayer)
    window.dataLayer.push({ event, ...data });
};

const sendMetaAPIEvent = async (eventName, eventData) => {
  if (DEBUG_MODE) console.log("[MetaAPI Event]", eventName, eventData);
  try {
    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          action_source: "website",
          user_data: eventData.user_data || {},
          custom_data: eventData.custom_data || {},
          app_data: eventData.app_data || {},
          url:
            eventData.url ||
            (typeof window !== "undefined" ? window.location.href : ""),
        },
      ],
    };

    await fetch(`/api/capi-event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error("[MetaAPI] Error:", err);
  }
};

// -------------------- UTIL --------------------
const getPrice = (product) => {
  if (!product) return 0;
  if (product.productType === "simple")
    return product.discountPrice || product.price || 0;
  if (product.productType === "variant" && product.sizes?.length)
    return product.sizes[0].discount || product.sizes[0].price || 0;
  return 0;
};

// -------------------- EVENT TRACKERS --------------------
export const trackViewContent = (product) => {
  if (!product) return;
  const price = getPrice(product);

  const data = {
    currency: "BDT",
    value: price,
    items: [
      {
        item_id: product.slug || "",
        item_name: product.productName || "",
        item_category: product.categoryId || "",
        price,
        quantity: 1,
      },
    ],
  };

  sendGA4Event("view_item", data);
  sendGTMEvent("view_content", data);
  sendMetaAPIEvent("ViewContent", { custom_data: data });
};

export const trackAddToCart = (item) => {
  if (!item) return;
  const data = {
    currency: "BDT",
    value: item.totalPrice || 0,
    items: [
      {
        item_id: item.productId || "",
        item_name: item.productName || "",
        item_category: item.category || "",
        price: item.price || 0,
        quantity: item.qty || 1,
      },
    ],
  };

  sendGA4Event("add_to_cart", data);
  sendGTMEvent("add_to_cart", data);
  sendMetaAPIEvent("AddToCart", { custom_data: data });
};

export const trackInitiateCheckout = (cart) => {
  if (!cart?.length) return;

  const totalPrice = cart.reduce(
    (sum, i) => sum + (i.price || 0) * (i.qty || 1),
    0
  );
  const data = {
    currency: "BDT",
    value: totalPrice,
    items: cart.map((i) => ({
      item_id: i.sku || "",
      item_name: i.productName || "",
      item_category: i.category || "",
      price: i.price || 0,
      quantity: i.qty || 1,
    })),
  };

  sendGA4Event("begin_checkout", data);
  sendGTMEvent("initiate_checkout", data);
  sendMetaAPIEvent("InitiateCheckout", { custom_data: data });
};

export const trackPurchase = (order) => {
  if (!order) return;
  const data = {
    transaction_id: order.orderNumber || "",
    currency: "BDT",
    value: order.total || 0,
    user_data: {
      em: order.user?.email ? [order.user.email] : [""],
      ph: order.user?.mobile ? [order.user.mobile] : [""],
      address: {
        first_name: order.user?.name || "",
        last_name: "",
        city: order.user?.address || "",
        country: "Bangladesh",
      },
    },
    items:
      order.products?.map((i) => ({
        item_id: i.productId || "",
        item_name: i.productName || "",
        item_category: i.sku || "",
        price: i.price || 0,
        quantity: i.qty || 1,
      })) || [],
    url: typeof window !== "undefined" ? window.location.href : "",
  };

  sendGA4Event("purchase", data);
  sendGTMEvent("purchase", data);
  sendMetaAPIEvent("Purchase", {
    custom_data: data,
    user_data: data.user_data,
    url: data.url,
  });
};
