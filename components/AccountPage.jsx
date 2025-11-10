"use client";

import { signOut, useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useForm } from "react-hook-form";

// ------------------------ FETCH HELPERS ------------------------
const fetchOrders = async ({ queryKey }) => {
  const [_key, { status, page, limit }] = queryKey;
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/order/user?status=${status}&page=${page}&limit=${limit}`
  );
  return res.data;
};

const fetchAddresses = async () => {
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/user/address`
  );
  return res.data;
};

const AccountPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  const user = session?.user || {};
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  const { register, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      name: "",
      emailOrPhone: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      activeTab: "profile",
    },
  });

  const activeTab = watch("activeTab");
  const [page, setPage] = useState(1);
  const limit = 5;

  // Redirect unauthenticated users
  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/auth/sign-in");
  }, [isLoading, isAuthenticated, router]);

  // Prefill user data
  useEffect(() => {
    if (isAuthenticated && user) {
      setValue("name", user.name || "");
      setValue("emailOrPhone", user.emailOrPhone || "");
    }
  }, [user, isAuthenticated, setValue]);

  // ------------------------ PROFILE UPDATE ------------------------
  const onSubmit = async (data) => {
    try {
      if (data.newPassword && data.newPassword !== data.confirmPassword)
        return toast.error("New passwords do not match!");

      const payload = {
        name: data.name,
        currentPassword:
          user?.isGoogle && !user?.hasPassword
            ? undefined
            : data.currentPassword,
        newPassword: data.newPassword,
        setPassword: user?.isGoogle && !user?.hasPassword,
      };

      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/profile/${user.id}`,
        payload
      );
      if (res.data.success) {
        toast.success("Profile updated successfully!");
        signOut({ callbackUrl: "/auth/sign-in" });
      } else toast.error(res.data.message || "Failed to update profile.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong.");
    }
  };

  // ------------------------ ORDERS ------------------------
  const { data: ordersData } = useQuery({
    queryKey: [
      "orders",
      {
        status: activeTab === "cancellations" ? "Cancelled" : "Processing",
        page,
        limit,
      },
    ],
    queryFn: fetchOrders,
    keepPreviousData: true,
  });

  // ------------------------ ADDRESSES ------------------------
  const { data: addressData, isFetching: addressLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: fetchAddresses,
    enabled: activeTab === "address",
    keepPreviousData: true,
  });

  const addAddressMutation = useMutation({
    mutationFn: async (data) => {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/user/address`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["addresses"]);
      toast.success("Address added!");
    },
    onError: () => toast.error("Failed to add address"),
  });

  const updateAddressMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/user/address`,
        { id, ...data }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["addresses"]);
      toast.success("Address updated!");
    },
    onError: () => toast.error("Update failed"),
  });

  const deleteAddressMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/user/address?id=${id}`
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["addresses"]);
      toast.success("Address deleted!");
    },
    onError: () => toast.error("Delete failed"),
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/user/address`,
        {
          id,
          setDefault: true,
        }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["addresses"]);
      toast.success("Default address set!");
    },
    onError: () => toast.error("Failed to set default"),
  });

  // ------------------------ ADDRESS FORM ------------------------
  const {
    register: addressRegister,
    handleSubmit: handleAddressSubmit,
    reset: resetAddress,
    formState: { errors },
  } = useForm({
    defaultValues: { name: "", deliveryAddress: "", phone: "", label: "Home" },
  });

  const [editingAddress, setEditingAddress] = useState(null);

  const onAddressSubmit = (data) => {
    if (editingAddress) {
      updateAddressMutation.mutate({ id: editingAddress._id, data });
      setEditingAddress(null);
    } else {
      addAddressMutation.mutate(data);
    }
    resetAddress({ name: "", deliveryAddress: "", phone: "", label: "Home" });
  };

  // ------------------------ SIDEBAR ------------------------
  const sidebarGroups = [
    {
      title: "Manage My Account",
      items: [
        { id: "profile", label: "Profile Settings" },
        { id: "address", label: "Address Book" },
        { id: "orders", label: "My Orders" },
        { id: "cancellations", label: "Cancellations" },
      ],
    },
  ];

  // ------------------------ MOBILE TAB BUTTONS ------------------------
  const tabButtons = [
    { id: "profile", label: "Profile" },
    { id: "address", label: "Address" },
    { id: "orders", label: "Orders" },
  ];

  // ------------------------ RENDER ------------------------
  if (isLoading)
    return (
      <div className="min-h-[70vh] flex justify-center items-center text-lg font-medium">
       ...
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-1 sm:p-6 lg:p-8">
      {/* Mobile Tabs */}
      <div className="flex md:hidden mb-4 border-b overflow-x-auto no-scrollbar">
        {tabButtons.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setValue("activeTab", tab.id)}
            className={`px-4 py-2 flex-shrink-0 text-sm font-medium border-b-2 transition ${
              activeTab === tab.id
                ? "border-red-600 text-red-600"
                : "border-transparent text-gray-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Sidebar (hidden on mobile) */}
        <aside className="hidden md:block md:col-span-1 border-r pr-4">
          {sidebarGroups.map((group, i) => (
            <div key={i} className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">
                {group.title}
              </h3>
              <ul className="space-y-2 text-sm">
                {group.items.map((item) => (
                  <li
                    key={item.id}
                    onClick={() => setValue("activeTab", item.id)}
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

        {/* Main Section */}
        <section className="md:col-span-3 bg-white rounded-md shadow p-4 sm:p-6">
          <div className="flex justify-between mb-6">
            <div className="text-sm text-gray-500">Home / My Account</div>
            <div className="text-sm font-medium text-red-600">
              Welcome! {user?.name || "User"}
            </div>
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <h2 className="text-xl font-bold mb-4">Edit Your Profile</h2>
              <input
                {...register("name")}
                placeholder="Full Name"
                className="border px-4 py-2 rounded w-full"
              />
              <input
                {...register("emailOrPhone")}
                disabled
                className="border px-4 py-2 rounded w-full bg-gray-100"
              />
              <input
                {...register("newPassword")}
                type="password"
                placeholder="New Password"
                className="border px-4 py-2 rounded w-full"
              />
              <input
                {...register("confirmPassword")}
                type="password"
                placeholder="Confirm Password"
                className="border px-4 py-2 rounded w-full"
              />
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => reset()}
                  className="px-6 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-500"
                >
                  Save
                </button>
              </div>
            </form>
          )}

          {/* Address Book */}
          {activeTab === "address" && (
            <div>
              <h2 className="text-xl font-bold mb-4">My Address Book</h2>
              {addressLoading ? (
                <p>...</p>
              ) : (
                <div className="space-y-4">
                  {addressData?.addresses
                    ?.sort(
                      (a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0)
                    )
                    .map((addr) => (
                      <div
                        key={addr._id}
                        className={`border p-3 rounded ${
                          addr.isDefault ? "border-green-500" : ""
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <p className="font-medium">{addr.name}</p>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {addr.label || "Home"}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm">{addr.deliveryAddress}</p>
                        <p className="text-gray-400 text-sm">{addr.phone}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {addr.isDefault && (
                            <span className="text-sm text-green-600 font-semibold">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="flex gap-3 mt-3">
                          <button
                            onClick={() => {
                              setEditingAddress(addr);
                              resetAddress({
                                name: addr.name,
                                deliveryAddress: addr.deliveryAddress,
                                phone: addr.phone,
                                label: addr.label || "Home",
                              });
                            }}
                            className="px-3 py-1 border rounded text-sm hover:bg-gray-100"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              deleteAddressMutation.mutate(addr._id)
                            }
                            className="px-3 py-1 border rounded text-sm hover:bg-gray-100"
                          >
                            Delete
                          </button>
                          {!addr.isDefault && (
                            <button
                              onClick={() =>
                                setDefaultMutation.mutate(addr._id)
                              }
                              className="px-3 py-1 border rounded text-sm text-green-600 hover:bg-green-50"
                            >
                              Set Default
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* Add / Edit Form */}
              <form
                onSubmit={handleAddressSubmit(onAddressSubmit)}
                className="mt-6 border-t pt-4 space-y-3"
              >
                <h3 className="font-semibold">
                  {editingAddress ? "Edit Address" : "Add New Address"}
                </h3>
                <input
                  {...addressRegister("name", { required: "Name required" })}
                  placeholder="Full Name"
                  className="border px-3 py-2 rounded w-full"
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
                <input
                  {...addressRegister("phone", {
                    required: "Phone number required",
                  })}
                  placeholder="Phone"
                  className="border px-3 py-2 rounded w-full"
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
                <textarea
                  {...addressRegister("deliveryAddress", {
                    required: "Address required",
                  })}
                  placeholder="Delivery Address"
                  className="border px-3 py-2 rounded w-full"
                />
                {errors.deliveryAddress && (
                  <p className="text-sm text-red-500">
                    {errors.deliveryAddress.message}
                  </p>
                )}

                <select
                  {...addressRegister("label")}
                  className="border px-3 py-2 rounded w-full"
                >
                  <option value="Home">🏠 Home</option>
                  <option value="Office">🏢 Office</option>
                  <option value="Other">📦 Other</option>
                </select>

                <div className="flex justify-end gap-3 mt-3">
                  {editingAddress && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAddress(null);
                        resetAddress({
                          name: "",
                          deliveryAddress: "",
                          phone: "",
                          label: "Home",
                        });
                      }}
                      className="px-4 py-2 border rounded"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-500"
                  >
                    {editingAddress ? "Update" : "Add"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AccountPage;
