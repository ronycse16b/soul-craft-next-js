"use client";

import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  LogOut,
  User,
  Mail,
  Shield,
  KeyRound,
  Users2,
  LockKeyhole,
  ChevronDown,
  SettingsIcon,
} from "lucide-react";

export default function DashHeader() {
  const { data: session } = useSession();
  const user = session?.user || {
    name: "abdus salam fotik",
    email: "info.fotik@gmail.com",
    image: "https://www.gravatar.com/avatar?d=mp",
  };

  return (
    <header className="h-16 border-b flex items-center justify-between px-4 md:px-6 bg-background shadow-sm z-40">
      {/* Search Box */}
      <h1></h1>

      {/* User Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center relative gap-2 focus:outline-none hover:bg-destructive/10 transition-all delay-200 cursor-pointer py-3 px-2">
            <Avatar className="h-9 w-9 border-2 border-destructive">
              <AvatarImage src={user?.image} alt={user?.name} />
              <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="hidden sm:flex flex-col items-start text-left">
              <span className="text-sm font-medium leading-tight capitalize">
                {user?.name}
              </span>
              <span className="text-xs text-gray-500">{user?.email}</span>
            </div>

            {/* Dropdown Arrow with Red Marker */}
            <div className="relative">
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </div>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-68 p-0 border shadow-xl overflow-hidden"
        >
          {/* Green Header with Arrow Bump */}
          <div className=" bg-green-500 text-white p-4 flex items-center gap-3">
            <div className="absolute right-4 -top-[6px] w-4 h-4  rotate-45 bg-green-500"></div>
            <Avatar className="border-2 border-white">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{user.name}</p>
              <p className="text-xs">{user.email}</p>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1 text-sm">
            <DropdownMenuItem className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" /> My Details
            </DropdownMenuItem>

            <DropdownMenuItem className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-gray-500" /> Change Password
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2">
              <SettingsIcon className="w-4 h-4 text-gray-500" /> Settings
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-2 text-red-600 font-medium cursor-pointer"
            >
              <LogOut
                
                className="w-4 h-4"
              />{" "}
              Logout
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
