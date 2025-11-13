const CDN_URL =
  process.env.NEXT_PUBLIC_CDN_URL || "https://cdn.soulcraftbd.com";

/**
 * 🧩 Save temporary uploaded file URLs in localStorage
 */
function saveToLocalCache(key, urls) {
  try {
    localStorage.setItem(key, JSON.stringify(urls));
  } catch (err) {
    console.warn("LocalStorage save error:", err);
  }
}

/**
 * 🧩 Load cached URLs from localStorage
 */
export function getFromLocalCache(key) {
  try {
    const cached = localStorage.getItem(key);
    return cached ? JSON.parse(cached) : [];
  } catch (err) {
    console.warn("LocalStorage read error:", err);
    return [];
  }
}

/**
 * 🧩 Clear local cache after delete or form submit
 */
export function clearLocalCache(key) {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn("LocalStorage clear error:", err);
  }
}

/**
 * 📤 Upload single file to CDN
 * @param {File} file
 * @param {string} cacheKey - LocalStorage key for caching
 * @returns {Promise<string>} - Uploaded file URL
 */
export async function uploadSingle(file, cacheKey = "cdn_temp") {
  if (!file) return null;

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(`${CDN_URL}/upload/single`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    if (data.success && data.url) {
      const cached = getFromLocalCache(cacheKey);
      const updated = [...cached, data.url];
      saveToLocalCache(cacheKey, updated);
      return data.url;
    }

    throw new Error(data.message || "Upload failed");
  } catch (err) {
    console.error("CDN Single Upload Error:", err);
    throw err;
  }
}

/**
 * 📤 Upload multiple files to CDN
 * @param {File[]} files
 * @param {string} cacheKey - LocalStorage key for caching
 * @returns {Promise<string[]>} - Array of uploaded URLs
 */
export async function uploadMultiple(files, cacheKey = "cdn_temp") {
  if (!files || !files.length) return [];

  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  try {
    const res = await fetch(`${CDN_URL}/upload/multiple`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    if (data.success && Array.isArray(data.urls)) {
      const cached = getFromLocalCache(cacheKey);
      const updated = [...cached, ...data.urls];
      saveToLocalCache(cacheKey, updated);
      return data.urls;
    }

    throw new Error(data.message || "Upload failed");
  } catch (err) {
    console.error("CDN Multiple Upload Error:", err);
    throw err;
  }
}

/**
 * ❌ Remove image from CDN
 * @param {string} url - Full CDN URL (e.g., https://cdn.soulcraftbd.com/uploads/file.jpg)
 * @param {string} cacheKey - LocalStorage key
 */
export async function removeFromCDN(url, cacheKey = "cdn_temp") {
  if (!url) return;

  const filename = url.split("/uploads/")[1];
  if (!filename) throw new Error("Invalid file URL");

  try {
    const res = await fetch(`${CDN_URL}/images/${filename}`, {
      method: "DELETE",
    });
    const data = await res.json();

    if (data.success) {
      const cached = getFromLocalCache(cacheKey).filter((u) => u !== url);
      saveToLocalCache(cacheKey, cached);
    } else {
      throw new Error(data.message || "Delete failed");
    }
  } catch (err) {
    console.error("CDN Delete Error:", err);
    throw err;
  }
}
