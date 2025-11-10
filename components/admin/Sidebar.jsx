"use client";

import {
  Home,
  UserCog,
  Users,
  Settings,
  MessageSquare,
  ShoppingCart,
  Zap,
  PlusCircle,
  List,
  Tags,
  FolderPlus,
  Layers,
  Flag,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Sidebar({ onNavigate }) {
  const pathname = usePathname();

  const menuGroups = [
    {
      label: "Overview",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: Home },
        {
          name: "Orders Manage",
          href: "/dashboard/orders",
          icon: ShoppingCart,
        },
        {
          name: "Contact Messages",
          href: "/dashboard/messages",
          icon: MessageSquare,
        },
      ],
    },
    {
      label: "Products",
      items: [
        { name: "All Products", href: "/dashboard/products-list", icon: List },
        {
          name: "Add Product",
          href: "/dashboard/add-product",
          icon: PlusCircle,
        },
        { name: "Flash Sale", href: "/dashboard/flash-sale", icon: Zap },
      ],
    },
    {
      label: "Categories",
      items: [
        { name: "All Categories", href: "/dashboard/categories", icon: Tags },
      ],
    },
    {
      label: "Banners & Advertise",
      items: [
        { name: "Banner Mange", href: "/dashboard/banner", icon: Flag },
        { name: "Advertisement", href: "/dashboard/advertisement", icon: Layers },
        { name: "Landing Page", href: "/dashboard/landing-page-list", icon: Tags },
      ],
    },
    {
      label: "Users",
      items: [
        {
          name: " User Roles & Permissions Manage",
          href: "/dashboard/users",
          icon: UserCog,
        },
      ],
    },
    {
      label: "Settings",
      items: [
        {
          name: "My Profile Settings",
          href: "/dashboard/profile",
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <aside
      className="
        h-full flex flex-col bg-background border-r
        lg:w-[250px] md:w-[230px] sm:w-[210px] w-full
        overflow-hidden
        transition-all duration-300
      "
    >
      {/* ===== Logo Header ===== */}
      <div
        className="
          flex items-center gap-3 px-4 py-3  bg-background/95 backdrop-blur-sm
          shrink-0 sticky top-0 z-30
        "
      >
        <img
          src="/logo3.png"
          alt="Logo"
          className="w-9 md:w-8 sm:w-7 h-auto object-contain"
        />
        <h2
          className="
            text-lg md:text-[15px] sm:text-[13px]
            font-semibold tracking-tight truncate
          "
        >
          Admin Panel
        </h2>
      </div>

      {/* ===== Navigation ===== */}
      <nav
        className="
          flex-1 p-3 md:p-2 sm:p-1.5
          space-y-5 md:space-y-4 sm:space-y-3
          overflow-y-auto scrollbar-hide
        "
      >
        {menuGroups?.map((group) => (
          <div key={group.label}>
            <p
              className="
                text-[11px] md:text-[10px] sm:text-[9px]
                uppercase text-muted-foreground font-semibold mb-2 px-2
                tracking-wider
              "
            >
              {group.label}
            </p>

            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      `
                      flex items-center gap-3 rounded-md
                      px-3 py-2
                      text-sm md:text-[13px] sm:text-[12px]
                      font-medium transition-all duration-200
                      hover:bg-muted hover:text-foreground
                    `,
                      active
                        ? " text-destructive bg-destructive/10 shadow-sm"
                        : "text-muted-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 md:h-3.5 md:w-3.5 sm:h-3 sm:w-3 shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* ===== Footer ===== */}
      <div
        className="
          px-4 py-3 border-t bg-background/90 text-muted-foreground
          text-[12px] md:text-[11px] sm:text-[10px]
          text-center shrink-0
        "
      >
        © 2025 Soul Craft
      </div>
    </aside>
  );
}
