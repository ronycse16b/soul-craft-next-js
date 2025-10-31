"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

import Sidebar from "@/components/admin/Sidebar";
import DashHeader from "@/components/admin/DashHeader";

export default function AdminLayout({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="h-screen w-screen flex bg-muted/30 overflow-hidden">
      {/* ===== Desktop Sidebar ===== */}
      <aside className="hidden lg:flex flex-col w-[250px] min-w-[250px] border-r bg-background fixed left-0 top-0 bottom-0 z-40">
        <Sidebar />
      </aside>

      {/* ===== Mobile Sidebar ===== */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="lg:hidden fixed top-4 left-4 z-50 bg-background/90 shadow-sm hover:bg-background"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="p-0 w-[250px]">
          <Sidebar onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* ===== Main Content ===== */}
      <div className="flex-1 flex flex-col lg:ml-[250px] transition-all duration-300">
        {/* Header */}
        <DashHeader />

        {/* Scrollable Content */}
        <main
          className="
            flex-1
            overflow-y-auto
            p-4
            md:p-6
            w-full
            mx-auto
            xl:max-w-none
            max-w-[1360px]
          "
          style={{
            height: "calc(100vh - 124px)", // Header = 64px
            minHeight: "704px", // Perfect for 1366×768
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
