"use client";

import axios from "axios";
import clsx from "clsx";
import {
  Box,
  CheckCircle2,
  Edit,
  Loader2,
  Truck,
  XCircle
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "../ui/button";

const statusFlow = {
  Pending: ["Processing", "Cancelled"],
  Processing: ["Processing", "Confirmed", "Cancelled"],
  Confirmed: ["Confirmed", "Shipped", "Hold", "Cancelled"],
  Shipped: ["Shipped", "Delivered", "Failed", "Return"],
  Hold: ["Hold", "Confirmed", "Cancelled", "Shipped"],
  Cancelled: ["Cancelled", "Hold", "Confirmed"],
  Delivered: ["Delivered", "Return"],
  Failed: ["Failed"],
  Return: ["Return"],
};

const allTabs = [
  "All",
  "Processing",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
  "Hold",
  "Failed",
  "Return",
];

export default function OrderManagement() {
  const [summary, setSummary] = useState({
    total: 0,
    processing: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  });

 
  const [editLoading, setEditLoading] = useState(false); // New state
  const [statusLoading, setStatusLoading] = useState(false); // New state
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reason, setReason] = useState("");
  const [statusChangeTarget, setStatusChangeTarget] = useState(null);

  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editOrder, setEditOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/order`,
        {
          params: {
            page,
            limit: 10,
            search,
            status: status === "All" ? "" : status,
          },
        }
      );
      setOrders(res.data.data);
      setPages(res.data.pagination.pages);
    } catch (err) {
      console.error("Fetch Error", err);
    } finally {
      setLoading(false);
    }
  };

  const getSummary = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/order/summary`
      ); // backend should aggregate by status
      setSummary(res.data);
    } catch (err) {
      console.error("Summary Fetch Error", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, search, status]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_BASE_URL}/api/order/${id}`, {
        status: newStatus,
      });
      fetchOrders();
    } catch (err) {
      console.error("Status Update Error:", err);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/order/update/${editOrder._id}`,
        editOrder
      );
      toast.success("Order updated successfully");
      setEditOrder(null);
      fetchOrders();
    } catch (err) {
      toast.error("Failed to update order");
      console.error("Edit Submit Error:", err);
    } finally {
      setEditLoading(false);
    }
  };

  const handleSelectChange = (order, newStatus) => {
    const needsReason = ["Cancelled", "Hold", "Failed", "Return"].includes(
      newStatus
    );
    if (needsReason) {
      setStatusChangeTarget({ id: order._id, newStatus });
      setShowReasonModal(true);
    } else {
      handleStatusChange(order._id, newStatus);
    }
  };
  const submitStatusWithReason = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason");
      return;
    }
    setStatusLoading(true);
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/order/fail/${statusChangeTarget.id}`,
        {
          status: statusChangeTarget.newStatus,
          note: reason,
        }
      );
      toast.success("Status updated");
      setShowReasonModal(false);
      setReason("");
      setStatusChangeTarget(null);
      fetchOrders();
    } catch (err) {
      toast.error("Failed to update status");
      console.error("Status update with reason failed:", err);
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    getSummary();
  }, [page, search, status]);

  return (
    <div className="p-4 space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-[1600px] mx-auto ">
        {[
          {
            label: "Total Orders",
            value: summary.total,
            icon: <Box className="w-5 h-5 text-red-600" />,
            bg: "bg-gradient-to-br from-red-500 to-red-600",
            iconBg: "bg-white",
            text: "text-white",
          },
          {
            label: "Processing",
            value: summary.processing,
            icon: <Loader2 className="w-5 h-5 text-blue-600" />,
            bg: "bg-gradient-to-br from-blue-500 to-blue-600",
            iconBg: "bg-white",
            text: "text-white",
          },
          {
            label: "Confirmed",
            value: summary.confirmed,
            icon: <CheckCircle2 className="w-5 h-5 text-indigo-600" />,
            bg: "bg-gradient-to-br from-green-500 to-green-600",
            iconBg: "bg-white",
            text: "text-white",
          },
          // {
          //   label: "Delivered",
          //   value: summary.delivered,
          //   icon: <Truck className="w-5 h-5 text-green-600" />,
          //   bg: "bg-gradient-to-br from-yellow-400 to-yellow-500",
          //   iconBg: "bg-white",
          //   text: "text-white",
          // },
          {
            label: "Cancelled",
            value: summary.cancelled,
            icon: <XCircle className="w-5 h-5 text-red-600" />,
            bg: "bg-red-300",
            iconBg: "bg-white",
            text: "text-white",
          },
        ].map((item, i) => (
          <div
            key={i}
            className={`rounded-xl ${item.bg} shadow-lg 2xl:px-6 px-4 flex items-center gap-4 justify-between hover:shadow-md transition min-h-[90px]`}
          >
            {/* Left Side: Icon + Label */}
            <div className="flex items-center gap-3 ">
              <div className={`p-2 rounded-full ${item.iconBg}`}>
                {item.icon}
              </div>
              <p className={`text-sm sm:text-base font-medium ${item.text}`}>
                {item.label}
              </p>
            </div>

            {/* Right Side: Value */}
            <div className={`text-base sm:text-lg font-bold ${item.text}`}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-1 my-8">
        {allTabs?.map((tab) => {
          const isActive = tab === status;
          return (
            <Button
              key={tab}
              onClick={() => {
                setStatus(tab);
                setPage(1);
              }}
              variant="ghost"
              className={clsx(
                "relative rounded-full text-sm sm:text-base font-medium px-5 py-2 transition-all duration-300 border",
                isActive
                  ? "border-[#f69224] text-[#f69224] bg-white shadow-sm"
                  : "border-gray-200 text-gray-700 hover:border-[#f69224] hover:text-[#f69224] hover:bg-white/80"
              )}
            >
              {tab}
              {isActive && (
                <span className="absolute -bottom-[2px] left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-[#f69224] rounded-full"></span>
              )}
            </Button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="w-full sm:w-1/3">
          <input
            type="text"
            placeholder="Search orders..."
            className=" border border-gray-300 px-4 py-2 rounded-md outline-0  w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto  shadow bg-white">
        <table className="min-w-full table-auto text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3 text-left border-b border-gray-300 whitespace-nowrap">
                #Order
              </th>
              <th className="px-4 py-3 text-left border-b border-gray-300 whitespace-nowrap">
                Products
              </th>
              <th className="px-4 py-3 text-left border-b border-gray-300 whitespace-nowrap">
                Shipped To
              </th>
              <th className="px-4 py-3 text-center border-b border-gray-300 whitespace-nowrap">
                Qty
              </th>
              <th className="px-4 py-3 text-right border-b border-gray-300 whitespace-nowrap">
                Total
              </th>
              <th className="px-4 py-3 text-center border-b border-gray-300 whitespace-nowrap">
                Status
              </th>
              <th className="px-4 py-3 text-left border-b border-gray-300 whitespace-nowrap">
                Remarks
              </th>
              <th className="px-4 py-3 text-center border-b border-gray-300 whitespace-nowrap">
                Edit
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="py-10 text-center">
                  <Loader2 className="animate-spin mx-auto text-blue-500" />
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-10 text-center text-gray-400">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order._id}
                  className={clsx("transition-all hover:bg-blue-50", {
                    "bg-yellow-50 font-semibold": !order?.read,
                  })}
                >
                  <td className="whitespace-nowrap px-4 py-3 border-b border-gray-300 align-top">
                    {order?.orderNumber}
                  </td>
                  <td className="whitespace-nowrap px-4 py-1 border-b border-gray-300">
                    <div className="flex gap-3">
                      {order?.image && (
                        <Image
                          src={`${order.image}`}
                          width={64}
                          height={64}
                          alt="product"
                          className="rounded border w-16 h-16 object-cover"
                        />
                      )}
                      <div className="space-y-1 text-sm">
                        <div className="font-medium text-gray-800 truncate max-w-[150px] text-sm ">
                          {order?.productName}
                        </div>
                        <div className="text-xs text-gray-500">
                          SKU: {order?.sku}
                        </div>
                        <div className="text-xs text-gray-700 font-medium">
                          ৳{order?.price}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-1  border-b border-gray-300 ">
                    <div className="text-xs mt-2">
                      <span className="font-medium text-gray-700">
                        {order?.name}
                      </span>{" "}
                      <br />
                      <span className="text-gray-500">
                        {order?.mobile}
                      </span>{" "}
                      <br />
                      <span className="text-gray-500">{order?.address}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-center border-b border-gray-300 align-middle">
                    {order?.qty}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right border-b border-gray-300 font-semibold text-gray-800 align-middle">
                    ৳{order?.total}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-center border-b border-gray-300 align-middle">
                    <select
                      className={clsx(
                        "select select-sm w-[120px] min-w-[100px] rounded-md border text-sm font-medium ",
                        {
                          "bg-green-100 border-green-300 text-green-700":
                            order?.status === "Delivered",
                          "bg-yellow-100 border-yellow-300 text-yellow-800":
                            order?.status === "Pending",
                          "bg-red-100 border-red-300 text-red-700":
                            order?.status === "Cancelled",
                          "bg-blue-100 border-blue-300 text-blue-700":
                            order?.status === "Processing" ||
                            order?.status === "Confirmed",
                        }
                      )}
                      value={order?.status}
                      onChange={(e) =>
                        handleSelectChange(order, e.target.value)
                      }
                    >
                      {(statusFlow[order?.status] || [order?.status]).map(
                        (opt) => (
                          <option
                            key={opt}
                            value={opt}
                            className="text-sm text-gray-700"
                          >
                            {opt}
                          </option>
                        )
                      )}
                    </select>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 border-b border-gray-300 text-xs align-top">
                    {order?.statusHistory?.length > 0 && (
                      <div className="bg-gray-50 border-l-4 border-blue-300 p-2 mt-1 rounded text-gray-700">
                        <ul className="space-y-1 list-disc list-inside">
                          {order.statusHistory.map((entry, index) => (
                            <li key={index}>
                              <strong>{entry.status}</strong>{" "}
                              {entry.note && (
                                <span className="text-gray-500">
                                  ({entry.note})
                                </span>
                              )}
                              <div className="text-[10px] text-gray-400">
                                {new Date(entry.changedAt).toLocaleString()}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-center border-b border-gray-300 align-middle">
                    <button
                      className="inline-flex items-center justify-center p-1 rounded hover:bg-blue-100"
                      title="Edit Order"
                      onClick={() => setEditOrder(order)}
                    >
                      <Edit className="text-blue-500 w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-2">
        <p className="text-sm text-gray-500">
          Page {page} of {pages}
        </p>
        <div className="flex gap-1">
          <button
            className="btn btn-sm btn-outline"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          {Array.from({ length: pages }, (_, i) => (
            <button
              key={i}
              className={clsx("btn btn-sm", {
                "btn-primary": page === i + 1,
                "btn-outline": page !== i + 1,
              })}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="btn btn-sm btn-outline"
            disabled={page === pages}
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
          >
            Next
          </button>
        </div>
      </div>
      {/* {editOrder && (
        
      )} */}

      <div
        className={`fixed z-[100] w-screen ${
          editOrder ? "visible opacity-100" : "invisible opacity-0"
        } inset-0 grid place-items-center bg-primary/20 backdrop-blur-sm duration-100 dark:bg-transparent`}
      >
        <div
          className={`absolute w-[400px] rounded-lg bg-white p-6 drop-shadow-lg dark:bg-zinc-900 dark:text-white ${
            editOrder
              ? "opacity-100 duration-300"
              : "scale-110 opacity-0 duration-150"
          }`}
        >
          <h3 className="text-lg font-bold mb-4">Edit Order</h3>
          <form onSubmit={handleEditSubmit} className="space-y-3">
            <input
              className="input input-bordered w-full"
              placeholder="Customer Name"
              value={editOrder?.name}
              onChange={(e) =>
                setEditOrder({ ...editOrder, name: e.target.value })
              }
            />
            <input
              className="input input-bordered w-full"
              placeholder="Mobile"
              value={editOrder?.mobile}
              onChange={(e) =>
                setEditOrder({ ...editOrder, mobile: e.target.value })
              }
            />
            <input
              className="input input-bordered w-full"
              placeholder="Address"
              value={editOrder?.address}
              onChange={(e) =>
                setEditOrder({ ...editOrder, address: e.target.value })
              }
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                className="btn btn-sm btn-outline"
                onClick={() => setEditOrder(null)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-sm btn-primary"
                disabled={editLoading}
              >
                {editLoading ? (
                  <Loader2 className="animate-spin w-4 h-4" />
                ) : (
                  "Update"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* {showReasonModal && (
       
      )} */}
      <div
        className={`fixed z-[100] w-screen ${
          showReasonModal ? "visible opacity-100" : "invisible opacity-0"
        } inset-0 grid place-items-center bg-primary/20 backdrop-blur-sm duration-100 dark:bg-transparent`}
      >
        <div
          className={`absolute w-[400px] rounded-lg bg-white p-6 drop-shadow-lg dark:bg-zinc-900 dark:text-white ${
            showReasonModal
              ? "opacity-100 duration-300"
              : "scale-110 opacity-0 duration-150"
          }`}
        >
          <h3 className="text-lg font-bold">Provide Reason</h3>
          <textarea
            className="textarea textarea-bordered w-full"
            placeholder="Write reason here..."
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="flex justify-end gap-2 mt-4">
            <button
              className="btn btn-sm btn-outline"
              onClick={() => {
                setShowReasonModal(false);
                setReason("");
                setStatusChangeTarget(null);
              }}
            >
              Cancel
            </button>
            <button
              className="btn btn-sm btn-primary"
              onClick={submitStatusWithReason}
              disabled={statusLoading}
            >
              {statusLoading ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
