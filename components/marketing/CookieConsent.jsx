"use client";
import { useEffect, useState } from "react";

export default function CookieConsent() {
  const [accepted, setAccepted] = useState(false);
  useEffect(() => {
    const v = localStorage.getItem("cookie_consent");
    if (v === "1") setAccepted(true);
  }, []);
  function accept() {
    localStorage.setItem("cookie_consent", "1");
    setAccepted(true);
  }
  if (accepted) return null;
  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white shadow p-4 rounded flex justify-between items-center z-50">
      <div>
        <strong>We use cookies</strong>
        <div className="text-sm">
          To improve experience and analytics. You can change settings in admin.
        </div>
      </div>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={accept}
      >
        Accept
      </button>
    </div>
  );
}
