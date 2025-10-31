"use client";
import React from "react";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import StatCard from "./StatCard";
import OrdersTable from "./OrdersTable";
import ActivityList from "./ActivityList";
import ChartCard from "./ChartCard";

export default function DashboardPage() {
  // demo data (replace with real fetches)
  const stats = [
    { title: "Orders", value: "1,254", delta: "+6.2%", icon: ShoppingCart },
    { title: "Revenue", value: "$42,380", delta: "+12.4%", icon: DollarSign },
    { title: "Products", value: "540", delta: "+1.2%", icon: Package },
    { title: "Users", value: "3,120", delta: "-0.3%", icon: Users },
  ];

  const orders = [
    {
      id: "#1024",
      customer: "Ayesha",
      total: 299,
      status: "Paid",
      createdAt: new Date().toISOString(),
    },
    {
      id: "#1023",
      customer: "Jamal",
      total: 79,
      status: "Pending",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    },
    {
      id: "#1022",
      customer: "Kamrul",
      total: 129,
      status: "Paid",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
  ];

  const activities = [
    {
      id: 1,
      user: "A",
      text: "Ayesha left a 5-star review for Product XYZ",
      time: new Date().toISOString(),
    },
    {
      id: 2,
      user: "J",
      text: "Jamal placed new order #1023",
      time: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
  ];

  return (
    <div className=" bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100  sm:p-5">
      <main className="flex-1">
        <div className="p-2 sm:p-2 lg:p-3 space-y-6">
          {/* ===== Top Stats ===== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s) => (
              <StatCard key={s.title} {...s} />
            ))}
          </div>

          {/* ===== Charts + Recent Orders & Activity ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Chart */}
            <div className="lg:col-span-2 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sm:px-5 px-1 py-2 sm:py-5 ">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-sm font-semibold">Sales Overview</h3>
                <div className="text-xs text-slate-500">Last 30 days</div>
              </div>

              {/* Chart Card (Recharts) */}
                <ChartCard />
              {/* <div className="mt-4 h-[260px] sm:h-[320px] border rounded-md border-dashed border-slate-100 dark:border-slate-800 flex items-center justify-center">
              </div> */}
            </div>

            {/* Orders + Activity */}
            <div className="space-y-4">
              <OrdersTable orders={orders} />
              <ActivityList items={activities} />
            </div>
          </div>

          {/* ===== Bottom Area: Top Products ===== */}
          <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <h3 className="text-sm font-semibold mb-3">Top Products</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { name: "Running Shoes", sold: 520 },
                { name: "Wireless Headset", sold: 340 },
                { name: "Office Chair", sold: 210 },
              ].map((p) => (
                <div
                  key={p.name}
                  className="p-3 rounded-md border border-slate-100 dark:border-slate-800 hover:shadow-sm transition-shadow"
                >
                  <div className="text-sm font-semibold">{p.name}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    Sold: {p.sold}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
