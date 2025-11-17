"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Menu,
  X,
  Search,
  Heart,
  ShoppingCart,
  ChevronDown,
  User,
  LogOut,
  Settings,
  Users2,
  Mail,
  KeyRound,
  Shield,
  LockKeyhole,
  Home,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Container from "./Container";
import Image from "next/image";
import Logo from "../public/logo.png";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu";
import { useSelector } from "react-redux";
import CartIconButton from "./CartIconButton";
import ProductSearchBar from "./ProductSearchBar";
import { useQuery } from "@tanstack/react-query";

export default function Header() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("categories");

  const user = session?.user;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

    // ✅ Fetch dynamic categories
    const {
      data: categories = [],
      isLoading: isCategoryLoading,
      isError: isCategoryError,
    } = useQuery({
      queryKey: ["categories"],
      queryFn: async () => {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/categories/client`
        );
  
        return data?.result || [];
      },
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 30,
      keepPreviousData: true,
    });

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "Contact", href: "/contact" },
    { name: "About", href: "/about" },
    { name: "Sign Up", href: "/auth/sign-up" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
      {/* Top Offer Bar */}
      <section className="bg-black text-white text-xs sm:text-sm py-2">
        <Container className="flex justify-between items-center text-center">
          <p className="text-center w-full sm:w-auto">
            Summer Sale For All Swim Suits And Free Express Delivery - OFF 50%!{" "}
            <Link
              href="/shop"
              className="font-semibold underline underline-offset-2 hover:text-[#f69224] ml-1"
            >
              Shop Now
            </Link>
          </p>
          <div className="hidden sm:flex items-center gap-1 cursor-pointer text-white">
            <span>English</span>
            <ChevronDown className="w-4 h-4" />
          </div>
        </Container>
      </section>

      <Container>
        {/* Main Navbar */}
        <div className="flex items-center justify-between py-3 sm:py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src={Logo}
              alt="Soul Craft Logo"
              width={130}
              height={60}
              priority
              className="object-contain"
            />
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-8 text-gray-700 font-medium">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative group text-sm tracking-wide transition-colors duration-300 ${
                    isActive ? "text-black" : "hover:text-black text-gray-700"
                  }`}
                >
                  {link.name}
                  <span
                    className={`absolute left-0 -bottom-1 h-[2px] bg-destructive transition-all duration-300 ease-out origin-left ${
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop Search */}
            <div className="hidden md:block">
              <ProductSearchBar />
            </div>

            {/* Icons */}
            <div className="flex items-center gap-2">
              <CartIconButton />

              {/* User Avatar / Dropdown */}
              <div className="md:block hidden">
                {session?.user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center relative gap-2 focus:outline-none hover:bg-destructive/10 transition-all delay-200 cursor-pointer px-2">
                        <Avatar className="h-9 w-9 border-2 border-destructive">
                          <AvatarImage src={user?.image} alt={user?.name} />
                          <AvatarFallback>
                            {user?.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="hidden sm:flex flex-col items-start text-left">
                          <span className="text-sm font-medium leading-tight capitalize">
                            {user?.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {user?.emailOrphone}
                          </span>
                        </div>

                        {/* Dropdown Arrow with Red Marker */}
                        <div className="relative">
                          <ChevronDown className="w-4 h-4 text-gray-600" />
                        </div>
                      </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      align="end"
                      className="w-68 p-0 border shadow-xl rounded-none overflow-hidden mt-2"
                    >
                      {/* Green Header with Arrow Bump */}
                      <div className=" bg-green-500 text-white p-4 flex items-center gap-3">
                        <div className="absolute right-4 top-1 w-4 h-4  rotate-45 bg-green-500"></div>
                        <Avatar className="border-2 border-white">
                          <AvatarImage src={user.image} alt={user.name} />
                          <AvatarFallback>
                            {user.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm">{user.name}</p>
                          <p className="text-xs">{user.emailOrPhone}</p>
                        </div>
                      </div>
                      {/* Menu Items */}
                      <div className="py-1 text-sm">
                        {user?.role === "admin" ? (
                          <DropdownMenuItem asChild>
                            <Link
                              href="/dashboard"
                              className="flex items-center cursor-pointer gap-2"
                            >
                              <Home className="w-4 h-4 text-gray-500" />
                              <span>Dashboard</span>
                            </Link>
                          </DropdownMenuItem>
                        ) : (
                          <>
                            <DropdownMenuItem asChild>
                              <Link
                                href="/account"
                                className="flex items-center cursor-pointer gap-2"
                              >
                                <Home className="w-4 h-4 text-gray-500" />
                                <span>My Dashboard</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href="/my-orders"
                                className="flex items-center cursor-pointer gap-2"
                              >
                                <User className="w-4 h-4 text-gray-500" />
                                <span>My Orders</span>
                              </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem asChild>
                              <Link
                                href="/cart"
                                className="flex items-center cursor-pointer gap-2"
                              >
                                <ShoppingCart className="w-4 h-4 text-gray-500" />
                                <span>Cart</span>
                              </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem asChild>
                              <Link
                                href="/account"
                                className="flex items-center cursor-pointer gap-2"
                              >
                                <User className="w-4 h-4 text-gray-500" />
                                <span>Account</span>
                              </Link>
                            </DropdownMenuItem>
                          </>
                        )}

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() => signOut({ callbackUrl: "/" })}
                          className="flex items-center gap-2 text-red-600 font-medium cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </DropdownMenuItem>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link href="/auth/sign-in">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full bg-gray-50"
                    >
                      <User className="h-6 w-6 text-gray-800" />
                    </Button>
                  </Link>
                )}
              </div>

              {/* Mobile Menu */}
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full md:hidden bg-gray-100 hover:bg-gray-200"
                  >
                    <Menu className="h-5 w-5 text-gray-800" />
                  </Button>
                </SheetTrigger>

                <SheetContent
                  side="left"
                  className="w-[85%] sm:w-[330px] p-0 bg-white shadow-xl border-r border-gray-200"
                >
                  {/* WRAPPER CARD */}
                  <div className="h-full flex flex-col bg-gradient-to-b from-white to-gray-50">
                    {/* HEADER SECTION */}
                    <div className="p-5 border-b bg-white flex flex-col gap-1 shadow-sm">
                      <Link href="/" className="flex items-center gap-2">
                        <Image
                          src={Logo}
                          alt="Soul Craft Logo"
                          width={130}
                          height={60}
                          priority
                          className="object-contain"
                        />
                      </Link>
                      <p className="text-xs text-gray-500 italic">
                        Premium Online Shopping Experience
                      </p>
                    </div>

                    {/* TABS */}
                    <div className="flex w-full bg-gray-100 border-b">
                      <button
                        onClick={() => setActiveTab("categories")}
                        className={`w-1/2 py-3 text-center text-sm font-semibold tracking-wide transition-all
          ${
            activeTab === "categories"
              ? "bg-white text-gray-900 border-b-2 border-[#f69224]"
              : "text-gray-500"
          }`}
                      >
                        Categories
                      </button>

                      <button
                        onClick={() => setActiveTab("nav")}
                        className={`w-1/2 py-3 text-center text-sm font-semibold tracking-wide transition-all
          ${
            activeTab === "nav"
              ? "bg-white text-gray-900 border-b-2 border-[#f69224]"
              : "text-gray-500"
          }`}
                      >
                        Menu
                      </button>
                    </div>

                    {/* CONTENT AREA */}
                    <div className="flex-1 p-5 overflow-y-auto animate-[fadeIn_0.35s_ease]">
                      {/* CATEGORY LIST */}
                      {activeTab === "categories" && (
                        <div className="space-y-1">
                          {categories?.map((cat, idx) => (
                            <Link
                              key={idx}
                              href={`/shop/${cat?.slug}`}
                              onClick={() => setOpen(false)}
                              className="flex items-center justify-between py-3 px-3   border-b
                hover:border-[#f69224] hover:bg-[#fff5ec] transition-all "
                            >
                              <span className="text-gray-700 font-medium text-sm">
                                {cat?.name}
                              </span>
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* NAVIGATION LIST */}
                      {activeTab === "nav" && (
                        <div>
                          <div className="space-y-1">
                            {navLinks?.map((link) => (
                              <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => setOpen(false)}
                                className={`flex items-center justify-between py-3 px-3   border-b
                   transition-all
                  ${
                    pathname === link.href
                      ? "border-[#f69224] bg-[#fff5ec] text-gray-900 font-semibold"
                      : "text-gray-700 hover:border-[#f69224] hover:bg-[#fff5ec]"
                  }`}
                              >
                                <span className="text-sm">{link.name}</span>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* keyframes */}
                  <style jsx>{`
                    @keyframes fadeIn {
                      from {
                        opacity: 0;
                        transform: translateY(6px);
                      }
                      to {
                        opacity: 1;
                        transform: translateY(0);
                      }
                    }
                  `}</style>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="sm:hidden mb-2 w-full ">
          <ProductSearchBar />
        </div>
      </Container>
    </header>
  );
}
