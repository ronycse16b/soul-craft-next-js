"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function AnalyticsSettings() {
  const [config, setConfig] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/config")
      .then((res) => res.json())
      .then(setConfig);
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
     const res = await axios.post(
       `${process.env.NEXT_PUBLIC_BASE_URL}/api/config`,
       config
     );
     if(res.status === 200) {
       toast.success("Config saved successfully");
     }
     setConfig(res.data);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6 bg-white shadow rounded">
      <h1 className="text-xl font-bold">Analytics Settings</h1>

      {/* GTM */}
      <div>
        <label>GTM ID</label>
        <input
          className="border w-full p-2"
          value={config?.gtm?.id || ""}
          onChange={(e) =>
            setConfig({
              ...config,
              gtm: { ...config?.gtm, id: e.target.value },
            })
          }
        />
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={config?.gtm?.enabled || false}
            onChange={(e) =>
              setConfig({
                ...config,
                gtm: { ...config?.gtm, enabled: e.target.checked },
              })
            }
          />
          <span>Enable GTM</span>
        </label>
      </div>

      {/* GA4 */}
      <div>
        <label>GA4 Measurement ID</label>
        <input
          className="border w-full p-2"
          value={config?.ga4?.id || ""}
          onChange={(e) =>
            setConfig({
              ...config,
              ga4: { ...config?.ga4, id: e.target.value },
            })
          }
        />
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={config?.ga4?.enabled || false}
            onChange={(e) =>
              setConfig({
                ...config,
                ga4: { ...config?.ga4, enabled: e.target.checked },
              })
            }
          />
          <span>Enable GA4</span>
        </label>
      </div>

      {/* Meta Pixel */}
      <div>
        <label>Meta Pixel ID</label>
        <input
          className="border w-full p-2"
          value={config?.metaPixel?.id || ""}
          onChange={(e) =>
            setConfig({
              ...config,
              metaPixel: { ...config?.metaPixel, id: e.target.value },
            })
          }
        />
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={config?.metaPixel?.enabled || false}
            onChange={(e) =>
              setConfig({
                ...config,
                metaPixel: { ...config?.metaPixel, enabled: e.target.checked },
              })
            }
          />
          <span>Enable Meta Pixel</span>
        </label>
      </div>

      {/* CAPI */}
      <div>
        <label>Meta CAPI Access Token</label>
        <input
          className="border w-full p-2"
          value={config?.capi?.accessToken || ""}
          onChange={(e) =>
            setConfig({
              ...config,
              capi: { ...config?.capi, accessToken: e.target.value },
            })
          }
        />
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={config?.capi?.enabled || false}
            onChange={(e) =>
              setConfig({
                ...config,
                capi: { ...config?.capi, enabled: e.target.checked },
              })
            }
          />
          <span>Enable Meta CAPI</span>
        </label>
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}
