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
