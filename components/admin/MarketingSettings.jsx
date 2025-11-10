"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function MarketingSettings() {
  const [form, setForm] = useState({
    gtmId: "",
    ga4Id: "",
    metaPixelId: "",
    metaAccessToken: "",
  });
  const [loading, setLoading] = useState(false);

  // Fetch existing marketing config
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/marketing-config`);
        const json = await res.json();
        const d = json.data || {};
        setForm({
          gtmId: d.gtmId || "",
          ga4Id: d.ga4Id || "",
          metaPixelId: d.metaPixelId || "",
          metaAccessToken: d.metaAccessToken || "",
        });
      } catch (err) {
        console.warn("Failed to load marketing config:", err);
        toast.error("Failed to load marketing config");
      }
    })();
  }, []);

  // Save marketing config
  async function save() {
    if (!form.gtmId && !form.ga4Id && !form.metaPixelId) {
      return toast.error("At least one ID must be provided");
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/marketing-config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to save");
      toast.success("Marketing config saved successfully");
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  const renderInput = (label, valueKey, placeholder) => (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <label className="font-medium">{label}</label>
        {form[valueKey] ? (
          <span className="text-sm text-green-600 font-semibold">Active</span>
        ) : (
          <span className="text-sm text-gray-400">Inactive</span>
        )}
      </div>
      <input
        value={form[valueKey]}
        onChange={(e) => setForm({ ...form, [valueKey]: e.target.value })}
        placeholder={placeholder}
        className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400"
      />
    </div>
  );

  return (
    <section className="flex justify-center items-center min-h-[60vh] bg-gray-50">
      <div className="p-6 bg-white shadow rounded max-w-xl w-full">
        <h3 className="mb-5 text-xl font-semibold text-center">
          Marketing Config (Admin)
        </h3>

        {renderInput("GTM ID", "gtmId", "GTM-XXXX")}
        {renderInput("GA4 Measurement ID", "ga4Id", "G-XXXX")}
        {renderInput("Meta Pixel ID", "metaPixelId", "XXXX")}
        {renderInput("Meta Access Token (server)", "metaAccessToken", "XXXX")}

        <div className="flex justify-end mt-4">
          <button
            onClick={save}
            disabled={loading}
            className={`px-5 py-2 rounded text-white font-medium transition-colors ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </section>
  );
}
