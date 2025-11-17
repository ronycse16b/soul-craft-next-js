"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Pencil, Trash } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import Container from "./Container";
import { Button } from "./ui/button";
import Image from "next/image";

// ================= FETCH HELPERS =================
const fetchOrders = async ({ queryKey }) => {
  const [_key, { status, page, limit, phone }] = queryKey;
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/order/user?phone=${phone}&status=${status}&page=${page}&limit=${limit}`
  );
  return res.data?.data || [];
};

const fetchAddresses = async () => {
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/user/address`
  );
  return res.data;
};

// ================= MAIN COMPONENT =================
const AccountPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  const user = session?.user || {};
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";
  const [showAddressForm, setShowAddressForm] = useState(false);


  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      name: "",
      emailOrPhone: "",
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

  // Prefill profile inputs
  useEffect(() => {
    if (isAuthenticated && user) {
      setValue("name", user.name);
      setValue("emailOrPhone", user.emailOrPhone);
    }
  }, [user, isAuthenticated, setValue]);

  // ============ PROFILE UPDATE =============
  const onSubmit = async (data) => {
    try {
      if (data.newPassword && data.newPassword !== data.confirmPassword)
        return toast.error("New passwords do not match");

      const payload = {
        name: data.name,
        newPassword: data.newPassword,
      };

      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/profile/${user.id}`,
        payload
      );

      if (res.data.success) {
        toast.success("Profile updated! Please login again.");
        signOut({ callbackUrl: "/auth/sign-in" });
      } else toast.error(res.data.message);
    } catch (err) {
      toast.error("Profile update failed");
    }
  };

  // ============ ADDRESSES QUERY =============
  const { data: addressData, isFetching: addressLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: fetchAddresses,
    enabled: activeTab === "address" || activeTab === "orders",
  });

  // Extract default phone
  const defaultPhone = useMemo(() => {
    return (
      addressData?.addresses?.find((a) => a.isDefault)?.phone ||
      user?.emailOrPhone ||
      ""
    );
  }, [addressData, user]);

  // ============ ORDERS QUERY =============
  const { data: ordersData, isFetching: ordersLoading } = useQuery({
    queryKey: [
      "orders",
      {
        status: activeTab === "cancellations" ? "Cancelled" : "Processing",
        page,
        limit,
        phone: defaultPhone,
      },
    ],
    queryFn: fetchOrders,
    keepPreviousData: true,
    enabled: activeTab === "orders" || activeTab === "cancellations",
  });

  // ============ ADDRESS MUTATIONS ============
  const addAddress = useMutation({
    mutationFn: (data) =>
      axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/user/address`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["addresses"]);
      toast.success("Address added!");
    },
    onError: () => toast.error("Failed to add address"),
  });

  const updateAddress = useMutation({
    mutationFn: ({ id, data }) =>
      axios.put(`${process.env.NEXT_PUBLIC_BASE_URL}/api/user/address`, {
        id,
        ...data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["addresses"]);
      toast.success("Updated!");
    },
  });

  const deleteAddress = useMutation({
    mutationFn: (id) =>
      axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/user/address?id=${id}`
      ),
    onSuccess: () => {
      queryClient.invalidateQueries(["addresses"]);
      toast.success("Deleted!");
    },
  });

  const setDefaultAddress = useMutation({
    mutationFn: (id) =>
      axios.put(`${process.env.NEXT_PUBLIC_BASE_URL}/api/user/address`, {
        id,
        setDefault: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["addresses"]);
      toast.success("Default updated!");
    },
  });

  // Address form
  const {
    register: addr,
    handleSubmit: submitAddr,
    reset: resetAddr,
  } = useForm({
    defaultValues: {
      name: "",
      phone: "",
      deliveryAddress: "",
      label: "Home",
    },
  });

  const [editingAddress, setEditingAddress] = useState(null);

  const onAddressSubmit = (data) => {
    if (editingAddress) {
      updateAddress.mutate({
        id: editingAddress._id,
        data,
      });
    } else {
      addAddress.mutate(data);
    }
    setEditingAddress(null);
    resetAddr();
  };

  // ================== SIDEBAR MENU ==================
  const menu = [
    { id: "profile", label: "Profile" },
    { id: "address", label: "Address Book" },
    { id: "orders", label: "My Orders" },
    { id: "cancellations", label: "Cancellations" },
  ];

  if (isLoading)
    return (
      <div className="min-h-[60vh] flex justify-center items-center text-sm">
        Loading...
      </div>
    );

  return (
    <Container className=" mx-auto grid md:grid-cols-4 gap-6 px-2">
      {/* ===== MOBILE TAB ButtonS ===== */}
      <h2 className="text-xl font-bold mb-5 sm:hidden text-center">
        My Account
      </h2>
      <div className="md:hidden grid grid-cols-3 gap-1 mb-4">
        {menu?.map((m) => (
          <Button
            key={m.id}
            className={`px-4 py-2 rounded-full whitespace-nowrap font-medium text-xs border transition
              ${
                activeTab === m.id
                  ? "bg-red-600 text-white border-red-600 shadow"
                  : "bg-gray-100 text-gray-700 border-gray-300"
              }`}
            onClick={() => setValue("activeTab", m.id)}
          >
            {m.label}
          </Button>
        ))}

        <Button
          onClick={() => signOut({ callbackUrl: "/auth/sign-in" })}
          className="px-4 py-2 text-xs rounded-full whitespace-nowrap font-medium border border-gray-300 bg-gray-200 text-red-600 hover:bg-gray-300 transition"
        >
          Logout
        </Button>
      </div>

      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="hidden md:block   p-5 border-r ">
        <h2 className="text-xl font-bold mb-5">My Account</h2>

        <ul className="space-y-2">
          {menu.map((m) => (
            <li
              key={m.id}
              onClick={() => setValue("activeTab", m.id)}
              className={`px-4 py-1 rounded-full cursor-pointer transition-all
                ${
                  activeTab === m.id
                    ? "bg-red-600 text-white shadow font-semibold"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
            >
              {m.label}
            </li>
          ))}

          <li
            onClick={() => signOut({ callbackUrl: "/auth/sign-in" })}
            className="mt-4 px-4 py-2 rounded-lg cursor-pointer   text-red-600 hover:bg-gray-100 font-medium transition delay-100"
          >
            Logout
          </li>
        </ul>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <section className="md:col-span-3 bg-white  md:p-6 ">
        {/* ================= PROFILE ================= */}
        {activeTab === "profile" && (
          <form
            className="space-y-6 bg-white p-6 rounded-2xl md:shadow-lg border border-gray-200"
            onSubmit={handleSubmit(onSubmit)}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Edit Profile
            </h2>

            {/* Profile Image */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-red-600">
                <img
                  src={user.image || "/default-avatar.png"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-medium text-gray-700">{user.name}</p>
                <p className="text-sm text-gray-500">{user.emailOrPhone}</p>
              </div>
            </div>

            {/* Inputs */}
            <div className="grid gap-4 md:grid-cols-2">
              <input
                {...register("name")}
                placeholder="Full Name"
                className="border px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-red-200 transition "
              />

              <input
                {...register("emailOrPhone")}
                disabled
                className="border px-4 py-2 rounded-lg w-full bg-gray-100 text-gray-500"
              />

              <input
                {...register("newPassword")}
                type="password"
                placeholder="New Password"
                className="border px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-red-200 transition "
              />

              <input
                {...register("confirmPassword")}
                type="password"
                placeholder="Confirm Password"
                className="border px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-red-200 transition "
              />
            </div>

            {/* Save Button */}
            <Button
              type="submit"
              className="w-full md:w-1/3 px-6 py-2 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition shadow-lg"
            >
              Save Changes
            </Button>
          </form>
        )}

        {/* ================= ADDRESS ================= */}
        {activeTab === "address" && (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-2xl font-bold text-gray-800 tracking-wide">
                Address Book
              </h2>
              <Button
                onClick={() => setShowAddressForm((prev) => !prev)}
                className="px-5 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full shadow-lg hover:scale-105 transform transition-all duration-200"
              >
                {showAddressForm ? "Hide Form" : "Add New Address"}
              </Button>
            </div>

            {addressLoading ? (
              <p className="text-gray-500">Loading...</p>
            ) : (
              <div className="space-y-5">
                {addressData?.addresses?.map((a) => (
                  <div
                    key={a._id}
                    className={`p-5  bg-white transition  border ${
                      a.isDefault ? "border-green-400" : "border-gray-200"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                      <div>
                        <h4 className="font-semibold text-gray-700 text-lg">
                          {a.name}
                        </h4>
                        <p className="text-sm text-gray-500">{a.phone}</p>
                        <p className="text-sm text-gray-500">
                          {a.deliveryAddress}
                        </p>
                        {a.isDefault && (
                          <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            Default
                          </span>
                        )}
                      </div>

                      <div className="flex gap-3 flex-wrap mt-3 sm:mt-0">
                        <Button
                          onClick={() => {
                            setEditingAddress(a);
                            resetAddr(a);
                            setShowAddressForm(true);
                          }}
                          className="px-4 py-2 transition bg-blue-600  hover:bg-blue-700 delay-100"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>

                        <Button
                          onClick={() => deleteAddress.mutate(a._id)}
                          className="px-4 py-2  text-sm   transition bg-red-600  hover:bg-red-700 delay-100"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>

                        {!a.isDefault && (
                          <Button
                            onClick={() => setDefaultAddress.mutate(a._id)}
                            className="px-4 py-2 border border-green-400 text-green-700 rounded-full text-sm hover:bg-green-50 transition "
                          >
                            Set Default
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add/Edit Form */}
            {showAddressForm && (
              <form
                onSubmit={submitAddr(onAddressSubmit)}
                className="mt-6 p-6 bg-white space-y-4 border-t border-gray-100 transition-all duration-300"
              >
                <h3 className="font-bold text-xl text-gray-800">
                  {editingAddress ? "Edit Address" : "Add Address"}
                </h3>

                <input
                  {...addr("name")}
                  placeholder="Full Name"
                  className="w-full border border-gray-200  px-4 py-2  focus:ring-2 focus:ring-red-200 transition"
                />

                <input
                  {...addr("phone")}
                  placeholder="Phone"
                  className="w-full border border-gray-200  px-4 py-2  focus:ring-2 focus:ring-red-200 transition"
                />

                <textarea
                  {...addr("deliveryAddress")}
                  placeholder="Delivery Address"
                  className="w-full border border-gray-200  px-4 py-2  focus:ring-2 focus:ring-red-200 transition resize-none"
                  rows={3}
                />

                <select
                  {...addr("label")}
                  className="w-full border border-gray-200  px-4 py-2  focus:ring-2 focus:ring-red-200 transition"
                >
                  <option value="Home">Home</option>
                  <option value="Office">Office</option>
                  <option value="Other">Other</option>
                </select>

                <div className="flex  justify-end">
                  <Button
                    type="submit"
                    className="w-1/4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full shadow-lg hover:scale-105 transform transition duration-200 font-semibold"
                  >
                    {editingAddress ? "Update" : "Save"}
                  </Button>
                </div>
              </form>
            )}
          </>
        )}

        {/* ================= ORDERS ================= */}
        {activeTab === "orders" && (
          <>
            <h2 className="text-xl font-bold mb-5">My Orders</h2>

            {ordersLoading ? (
              <p>Loading...</p>
            ) : ordersData?.length ? (
              <div className="space-y-4">
                {ordersData?.map((o) => (
                  <div key={o._id} className="flex flex-col">
                    <p className="font-semibold text-sm truncate">
                      #{o.orderNumber}
                    </p>
                    <div className="flex flex-wrap items-center gap-2  border-t border-b  transition bg-white sm:max-h-[70px] overflow-hidden">
                      {/* IMAGE LEFT */}
                      <div className="w-16 h-16 flex-shrink-0  overflow-hidden ">
                        <Image
                          src={o.image}
                          alt={o.productName}
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                        />
                      </div>

                      {/* DETAILS CENTER */}
                      <div className="flex-1 flex flex-col sm:flex-row sm:justify-between items-center gap-1 overflow-hidden">
                        <div className="flex flex-col sm:flex-row sm:gap-2  overflow-hidden">
                          <p className="text-gray-700 text-sm font-medium truncate">
                            {o.productName}
                          </p>
                          <p className="text-[10px] text-gray-500 truncate">
                            SKU: <span className="font-medium">{o.sku}</span>
                          </p>
                        </div>

                        <div className="flex gap-2 text-[12px] text-gray-600 sm:text-sm sm:gap-4 flex-wrap">
                          <p>Qty: {o.qty}</p>

                          {/* <p>Delivery: {o.deliveryCharge} Tk</p> */}
                          <p>Total: {o.total} Tk</p>
                        </div>

                        <p className="text-gray-400 text-xs mt-1 sm:mt-0 truncate">
                          {new Date(o.createdAt).toLocaleString()}
                        </p>
                      </div>

                      {/* STATUS RIGHT */}
                      <div className="w-24 flex-shrink-0 text-right">
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            o.status === "Processing"
                              ? "bg-yellow-100 text-yellow-700"
                              : o.status === "Delivered"
                              ? "bg-green-100 text-green-700"
                              : o.status === "Cancelled"
                              ? "bg-red-100 text-red-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {o.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No orders found.</p>
            )}
          </>
        )}

        {/* ================= CANCELLATIONS ================= */}
        {activeTab === "cancellations" && (
          <>
            <h2 className="text-xl font-bold">Cancelled Orders</h2>

            {ordersLoading ? (
              <p>Loading...</p>
            ) : ordersData?.filter((o) => o.status === "Cancelled")?.length ? (
              <div className="space-y-3">
                {ordersData
                  ?.filter((o) => o.status === "Cancelled")
                  .map((o) => (
                    <div
                      key={o._id}
                      className="border p-3 rounded-xl shadow-sm bg-red-50"
                    >
                      <p className="font-medium">Order #{o.orderNumber}</p>
                      <p className="text-red-600">Status: {o.status}</p>
                    </div>
                  ))}
              </div>
            ) : (
              <p>No cancelled orders.</p>
            )}
          </>
        )}
      </section>
    </Container>
  );
};

export default AccountPage;
