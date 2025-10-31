"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import clsx from "clsx";

export default function StatCard({ icon: Icon, title, value, delta }) {
  // Gradient colors for each category
  const colorMap = {
    Orders: "from-blue-500 to-indigo-500",
    Revenue: "from-green-500 to-emerald-500",
    Products: "from-orange-500 to-amber-500",
    Users: "from-pink-500 to-rose-500",
  };

  const gradient = colorMap[title] || "from-slate-500 to-slate-700";

  return (
    <Card
      className={clsx(
        "relative overflow-hidden text-white border-none transition-all duration-300",
        "hover:scale-[1.03] hover:shadow-xl hover:shadow-black/10 gap-1",
        "bg-gradient-to-br px-4 py-2 rounded-sm cursor-pointer",
        ` ${gradient}`,
        "max-h-[120px]"
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between p-0 ">
        <CardTitle className="text-sm font-semibold tracking-wide drop-shadow-sm">
          {title}
        </CardTitle>
        <div className="p-2 bg-white/25 rounded-lg backdrop-blur-sm shadow-sm">
          <Icon className="w-8 h-8" /> {/* Larger, more visible */}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="text-3xl font-bold leading-tight">{value}</div>
        <p className="text-xs text-white/90 ">{delta}</p>
      </CardContent>

      {/* Subtle overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
    </Card>
  );
}
