// app/dashboard/components/TodayOrders.jsx
"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";

export default function TodayOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/dashboard/today-orders`).then((res) => setOrders(res.data));
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-4 overflow-auto">
      <h2 className="text-lg font-bold mb-4">Today’s Orders</h2>
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Order#</th>
            <th className="p-2 text-left">Customer</th>
            <th className="p-2 text-left">Total</th>
            <th className="p-2 text-left">Time</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id} className="border-t border-gray-300">
              <td className="p-2">{order.orderNumber}</td>
              <td className="p-2">{order.name}</td>
              <td className="p-2">৳{order.total}</td>
              <td className="p-2">{format(new Date(order.createdAt), "p")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
