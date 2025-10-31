"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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

export default function Header() {
  const { data: session } = useSession();
  const user = session?.user;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
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
            <div className="hidden sm:flex items-center relative">
              <Input
                placeholder="What are you looking for?"
                className="w-64 pl-10 text-sm border-gray-300 focus-visible:ring-0 focus:border-gray-400 rounded-md"
              />
              <Search className="absolute left-3 h-5 w-5 text-gray-400" />
            </div>

            {/* Icons */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-gray-100 hover:bg-gray-200 hidden sm:inline-flex"
              >
                <Heart className="h-6 w-6 text-gray-800" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-gray-100 hover:bg-gray-200 relative hidden sm:inline-flex"
              >
                <ShoppingCart className="h-6 w-6 text-gray-800" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#f69224] text-[10px] text-white font-semibold">
                  2
                </span>
              </Button>

              {/* User Avatar / Dropdown */}
              {session?.user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center relative gap-2 focus:outline-none hover:bg-destructive/10 transition-all delay-200 cursor-pointer px-2">
                      <Avatar className="h-9 w-9 border-2 border-destructive">
                        <AvatarImage src={user?.image} alt={user?.name} />
                        <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
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
                    className="w-68 p-0 border shadow-xl overflow-hidden mt-2"
                  >
                    {/* Green Header with Arrow Bump */}
                    <div className=" bg-green-500 text-white p-4 flex items-center gap-3">
                      <div className="absolute right-4 top-1 w-4 h-4  rotate-45 bg-green-500"></div>
                      <Avatar className="border-2 border-white">
                        <AvatarImage src={user.image} alt={user.name} />
                        <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">{user.name}</p>
                        <p className="text-xs">{user.emailOrPhone}</p>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1 text-sm">
                      <DropdownMenuItem className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" /> My Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2">
                        <Users2 className="w-4 h-4 text-gray-500" />{" "}
                        Contacts/Sub-Accounts
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" /> My Emails
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-gray-500" /> Change
                        Password
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-gray-500" /> Security
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2">
                        <LockKeyhole className="w-4 h-4 text-gray-500" />{" "}
                        Support PIN
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="flex items-center gap-2 text-red-600 font-medium cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" /> Logout
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/auth/sign-in">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-6 w-6 text-gray-800" />
                  </Button>
                </Link>
              )}

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
                  className="w-[80%] sm:w-[300px] p-6 bg-white"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold">Menu</h2>
                  </div>

                  <nav className="flex flex-col gap-4">
                    {navLinks.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className={`text-base font-medium transition-colors duration-300 ${
                          pathname === link.href
                            ? "text-black"
                            : "text-gray-700 hover:text-[#f69224]"
                        }`}
                      >
                        {link.name}
                      </Link>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="flex sm:hidden items-center relative mb-3">
          <Input
            placeholder="Search products..."
            className="w-full pl-10 text-sm border-gray-300 focus-visible:ring-0 focus:border-gray-400 rounded-md"
          />
          <Search className="absolute left-3 h-5 w-5 text-gray-400" />
        </div>
      </Container>
    </header>
  );
}
