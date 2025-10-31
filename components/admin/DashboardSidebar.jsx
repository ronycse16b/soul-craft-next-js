"use client";

import axios from "axios";
import {
  ChartBarStacked,
  Home,
  Image,
  LayoutDashboard,
  LogOut,
  Package,
  Plus,
  Settings,
  ShoppingCart,
  User,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardSidebar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // if (status === "loading") {
  //   return <div>Loading...</div>;
  // }

  const [summary, setSummary] = useState({
    total: 0,
    processing: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  });

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

  const isActive = (path) => pathname === path;

  useEffect(() => {
    getSummary();
  }, [pathname]);

  return (
    <aside className="w-full ">
      {/* Sidebar Header */}
      <div className="px-4 py-6 border-b border-base-300 flex items-center space-x-3">
        <LayoutDashboard className="w-6 h-6 text-primary" />
        <h2 className="text-lg font-bold text-primary">Admin Dashboard</h2>
      </div>

      {/* Sidebar Menu */}
      <ul className="menu p-4 text-base-content space-y-2 w-full">
        <li>
          <Link
            href="/dashboard"
            className={`flex items-center w-full gap-3 rounded-md p-2 transition ${
              isActive("/dashboard")
                ? "bg-primary/10 text-primary font-semibold"
                : "hover:bg-primary/10 hover:text-primary"
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </Link>
        </li>

        <li>
          <Link
            href="/dashboard/order-management"
            className={`flex items-center w-full gap-3 rounded-md p-2 transition ${
              isActive("/dashboard/order-management")
                ? "bg-primary/10 text-primary font-semibold"
                : "hover:bg-primary/10 hover:text-primary"
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            <span>
              Order{" "}
              <div className="badge badge-sm badge-secondary">
                +{summary?.processing || 0}
              </div>
            </span>
          </Link>
        </li>

        <li>
          <Link
            href="/dashboard/banner"
            className={`flex items-center w-full gap-3 rounded-md p-2 transition ${
              isActive("/dashboard/banner")
                ? "bg-primary/10 text-primary font-semibold"
                : "hover:bg-primary/10 hover:text-primary"
            }`}
          >
            <Image className="w-5 h-5" />
            <span>Banner</span>
          </Link>
        </li>

        <li>
          <Link
            href="/dashboard/add-product"
            className={`flex items-center w-full gap-3 rounded-md p-2 transition ${
              isActive("/dashboard/add-product")
                ? "bg-primary/10 text-primary font-semibold"
                : "hover:bg-primary/10 hover:text-primary"
            }`}
          >
            <Plus className="w-5 h-5" />
            <span>Add Product</span>
          </Link>
        </li>

        <li>
          <Link
            href="/dashboard/products-list"
            className={`flex items-center w-full gap-3 rounded-md p-2 transition ${
              isActive("/dashboard/products-list")
                ? "bg-primary/10 text-primary font-semibold"
                : "hover:bg-primary/10 hover:text-primary"
            }`}
          >
            <Package className="w-5 h-5" />
            <span>Products</span>
          </Link>
        </li>

        <li>
          <Link
            href="/dashboard/categories"
            className={`flex items-center w-full gap-3 rounded-md p-2 transition ${
              isActive("/dashboard/categories")
                ? "bg-primary/10 text-primary font-semibold"
                : "hover:bg-primary/10 hover:text-primary"
            }`}
          >
            <ChartBarStacked className="w-5 h-5" />
            <span>Categories</span>
          </Link>
        </li>

        <li>
          <Link
            href="/dashboard/marketing"
            className={`flex items-center w-full gap-3 rounded-md p-2 transition ${
              isActive("/dashboard/marketing")
                ? "bg-primary/10 text-primary font-semibold"
                : "hover:bg-primary/10 hover:text-primary"
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Marketing Setup</span>
          </Link>
        </li>
        <li>
          <Link
            href="/dashboard/profile"
            className={`flex items-center w-full gap-3 rounded-md p-2 transition ${
              isActive("/dashboard/profile")
                ? "bg-primary/10 text-primary font-semibold"
                : "hover:bg-primary/10 hover:text-primary"
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
        </li>
      </ul>

      {/* User Profile + Logout */}
      {session?.user && (
        <div className="mt-auto p-4 border-t border-base-300 absolute bottom-0 w-full">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-6 h-6 text-primary" />
            <span className="font-medium text-base-content">
              {session.user.name}
            </span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-red-600 hover:bg-red-500 text-white cursor-pointer transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </aside>
  );
}
