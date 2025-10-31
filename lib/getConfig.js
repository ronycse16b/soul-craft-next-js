'use server';
export async function getConfig() {

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  try {
   const res = await fetch(`${baseUrl}/api/config-marketing`, {
     next: { revalidate: 60 }, // ISR (revalidates every 60s)
   });
    if (!res.ok) return {}; // fallback empty config
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("Config fetch failed", err);
    return {}; // fallback empty config
  }
}
