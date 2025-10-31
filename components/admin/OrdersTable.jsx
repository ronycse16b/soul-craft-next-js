"use client";
import React from "react";
import { formatDistanceToNow } from "date-fns";

export default function OrdersTable({ orders = [] }) {
  return (
    <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
      <h3 className="text-sm font-semibold mb-3">Recent Orders</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-slate-500 text-xs">
            <tr>
              <th className="text-left py-2">Order</th>
              <th className="text-left py-2">Customer</th>
              <th className="text-left py-2">Total</th>
              <th className="text-left py-2">Status</th>
              <th className="text-left py-2">When</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-slate-400">
                  No orders yet
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr
                  key={o.id}
                  className="border-t border-slate-100 dark:border-slate-800"
                >
                  <td className="py-3">{o.id}</td>
                  <td className="py-3">{o.customer}</td>
                  <td className="py-3">${o.total}</td>
                  <td
                    className={`py-3 text-sm ${
                      o.status === "Paid" ? "text-green-600" : "text-amber-500"
                    }`}
                  >
                    {o.status}
                  </td>
                  <td className="py-3 text-slate-500">
                    {formatDistanceToNow(new Date(o.createdAt), {
                      addSuffix: true,
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
