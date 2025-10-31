"use client";

import { useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const AccountPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isLoading = status === "loading";
  const isAuthentic = status === "authenticated";

  const [activeTab, setActiveTab] = useState("profile");
  const user = session?.user || {};

useEffect(() => {
  if (!isLoading && !isAuthentic) {
    router.push("/");
  }
}, [isLoading, isAuthentic, router]);

// ✅ Initialize empty, update when session is ready
const [profile, setProfile] = useState({
  name: "",
  emailOrPhone: "",
  image: "",
  address: "",
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

// ✅ Update when session changes
useEffect(() => {
  if (user && isAuthentic) {
    setProfile((prev) => ({
      ...prev,
      name: user?.name || "",
      emailOrPhone: user?.emailOrPhone || "",
      image: user?.image || "",
      address: user?.address || "",
    }));
  }
}, [user, isAuthentic]);

  // Dummy dynamic-style data
  const userAddresses = [
    {
      id: 1,
      type: "Home",
      addressLine: "123 Main Street, Dhaka, Bangladesh",
      phone: "+8801712345678",
      isDefault: true,
    },
    {
      id: 2,
      type: "Office",
      addressLine: "5th Floor, TechHub Tower, Gulshan, Dhaka",
      phone: "+8801812345678",
      isDefault: false,
    },
  ];

  const orders = [
    {
      id: "ORD-1289",
      date: "2025-10-03",
      status: "Delivered",
      total: 2450,
    },
    {
      id: "ORD-1277",
      date: "2025-09-20",
      status: "Cancelled",
      total: 1299,
    },
  ];

  const wishlist = [
    {
      id: "P-001",
      name: "Leather Travel Bag",
      price: 3499,
      image: "/bag.png",
    },
    {
      id: "P-002",
      name: "Noise Cancelling Headphones",
      price: 8999,
      image: "/headphones.png",
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.success("Profile updated successfully!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-lg font-medium">
        Loading profile...
      </div>
    );
  }

  // Sidebar groups
  const sidebarGroups = [
    {
      title: "Manage My Account",
      items: [
        { id: "profile", label: "My Profile" },
        { id: "address", label: "Address Book" },
        { id: "payment", label: "My Payment Options" },
      ],
    },
    {
      title: "My Orders",
      items: [
        { id: "returns", label: "My Returns" },
        { id: "cancellations", label: "My Cancellations" },
      ],
    },
    {
      title: "My Stuff",
      items: [{ id: "wishlist", label: "My Wishlist" }],
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 grid md:grid-cols-4 gap-6">
      {/* Sidebar */}
      <aside className="md:col-span-1 border-r pr-4">
        {sidebarGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">
              {group.title}
            </h3>
            <ul className="space-y-2 text-sm">
              {group.items.map((item) => (
                <li
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`cursor-pointer rounded px-2 py-1 transition ${
                    activeTab === item.id
                      ? "text-red-600 font-medium bg-red-50"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </aside>

      {/* Main Content */}
      <section className="md:col-span-3 w-full bg-white rounded-md shadow p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="text-sm text-gray-500 mb-2 sm:mb-0">
            Home / My Account
          </div>
          <div className="text-sm font-medium text-destructive">
            Welcome! {user?.name || "User"}
          </div>
        </div>

        {/* TAB CONTENT */}
        {activeTab === "profile" && (
          <>
            <h2 className="text-xl font-bold mb-6">Edit Your Profile</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {user?.isGoogle ? (
                <>
                  <p className="text-gray-600 mb-4">
                    You signed up using Google. You can set a password below to
                    enable email login too.
                  </p>

                  <input
                    name="newPassword"
                    type="password"
                    value={profile.newPassword}
                    onChange={handleChange}
                    placeholder="New Password"
                    className="border px-4 py-2 rounded w-full"
                  />
                  <input
                    name="confirmPassword"
                    type="password"
                    value={profile.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm Password"
                    className="border px-4 py-2 rounded w-full"
                  />
                  <button
                    type="submit"
                    className="mt-4 w-full sm:w-auto px-6 py-2 bg-red-600 text-white rounded hover:bg-red-500"
                  >
                    Set Password
                  </button>
                </>
              ) : (
                <>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input
                      name="name"
                      value={profile.name}
                      onChange={handleChange}
                      placeholder="Full Name"
                      className="border px-4 py-2 rounded w-full"
                    />
                    <input
                      name="emailOrPhone"
                      value={profile.emailOrPhone}
                      onChange={handleChange}
                      placeholder="Email or Phone"
                      className="border px-4 py-2 rounded w-full"
                      disabled
                    />
                  </div>

                  <input
                    name="address"
                    value={profile.address}
                    onChange={handleChange}
                    placeholder="Address"
                    className="border px-4 py-2 rounded w-full"
                  />

                  <h3 className="text-lg font-semibold mt-6">
                    Change Password
                  </h3>
                  <input
                    name="currentPassword"
                    type="password"
                    value={profile.currentPassword}
                    onChange={handleChange}
                    placeholder="Current Password"
                    className="border px-4 py-2 rounded w-full"
                  />
                  <input
                    name="newPassword"
                    type="password"
                    value={profile.newPassword}
                    onChange={handleChange}
                    placeholder="New Password"
                    className="border px-4 py-2 rounded w-full"
                  />
                  <input
                    name="confirmPassword"
                    type="password"
                    value={profile.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm New Password"
                    className="border px-4 py-2 rounded w-full"
                  />

                  <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-end" >
                    <button
                      type="button"
                      className="px-6 py-2 border rounded hover:bg-gray-100 w-full sm:w-auto"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-500 w-full sm:w-auto"
                    >
                      Save Changes
                    </button>
                  </div>
                </>
              )}
            </form>
          </>
        )}

        {activeTab === "address" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">My Address Book</h2>
            <div className="space-y-4">
              {userAddresses.map((addr) => (
                <div
                  key={addr.id}
                  className="border rounded p-4 hover:shadow transition"
                >
                  <h3 className="font-semibold text-gray-800 flex justify-between">
                    {addr.type}
                    {addr.isDefault && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                        Default
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {addr.addressLine}
                  </p>
                  <p className="text-sm text-gray-600">📞 {addr.phone}</p>
                  <div className="flex gap-3 mt-2">
                    <button className="text-sm text-red-500 hover:underline">
                      Edit
                    </button>
                    <button className="text-sm text-gray-600 hover:underline">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "returns" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">My Returns</h2>
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="border rounded p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">{order.id}</p>
                    <p className="text-sm text-gray-500">Date: {order.date}</p>
                  </div>
                  <p
                    className={`text-sm font-medium ${
                      order.status === "Delivered"
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {order.status}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "wishlist" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">My Wishlist</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {wishlist.map((item) => (
                <div
                  key={item.id}
                  className="border rounded p-3 flex gap-4 hover:shadow transition"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <h4 className="font-medium text-gray-800">{item.name}</h4>
                    <p className="text-sm text-gray-500">৳{item.price}</p>
                    <button className="text-sm text-red-600 hover:underline mt-1">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default AccountPage;
