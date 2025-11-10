"use client";
import React from "react";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import StatCard from "./StatCard";
import OrdersTable from "./OrdersTable";
import ActivityList from "./ActivityList";
import ChartCard from "./ChartCard";
import SummaryCards from "./SummaryCards";
import SalesOverTimeChart from "./SalesOverTimeChart";
import TopProductsCard from "./TopProductsCard";
import TodayOrders from "./TodayOrders";
import SalesChart from "./SalesChart";

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
    <section className="p-4 space-y-6">
      {/* <h1 className="text-2xl font-bold">Dashboard</h1> */}
      <SummaryCards />

      <div className="grid lg:grid-cols-2 gap-4">
        <SalesOverTimeChart />
        <TopProductsCard />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <TodayOrders />
        <SalesChart />
      </div>
    </section>
  );
}
