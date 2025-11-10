"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { LogOut, User, Save, Edit3 } from "lucide-react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(session?.user?.name || "");
  const [password, setPassword] = useState("");

  const handleUpdate = async () => {
    if (!name) return toast.error("Name is required");
    setEditing(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/dashboard/profile-update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Profile updated successfully");
        await update(); // Refresh session
        setEditing(false);
        setPassword("");
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  };

  if (status === "loading") return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white shadow-md p-6 rounded-lg">
      <div className="flex items-center gap-3 mb-6">
        <User className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-semibold">
          {editing ? "Edit Profile" : "Profile"}
        </h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Name</label>
          <input
            type="text"
            className="mt-1 w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!editing}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Email / Phone</label>
          <input
            type="email"
            value={session?.user?.emailOrPhone || ""}
            className="mt-1 w-full border border-gray-200 px-3 py-2 rounded-md bg-red-100 cursor-not-allowed"
            disabled
          />
        </div>

        {editing && (
          <div>
            <label className="text-sm font-medium">New Password</label>
            <input
              type="password"
              className="mt-1 w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        )}

        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-md"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>

          <button
            onClick={() => (editing ? handleUpdate() : setEditing(true))}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md"
          >
            {editing ? (
              <>
                <Save className="w-4 h-4" /> Save
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4" /> Edit
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
