"use client";
import { useEffect, useState } from "react";
import { ShoppingCart, Users, DollarSign } from "lucide-react";
import axios from "axios";

export default function SummaryCards() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/dashboard/summary`);
        setStats(res.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
  }, []);

  if (!stats) {
    return (
      <div className="flex justify-center items-center flex-col space-y-4 py-10 bg-white rounded-lg shadow">
        <div className="flex justify-center items-center space-x-1">
          <div className="w-2 h-5 animate-[ping_1.4s_linear_infinite] bg-primary rounded"></div>
          <div className="w-2 h-5 animate-[ping_1.8s_linear_infinite] bg-primary mx-1 rounded"></div>
          <div className="w-2 h-5 animate-[ping_2s_linear_infinite] bg-primary rounded"></div>
        </div>
        <p className="text-sm text-gray-600">Loading...</p>
      </div>
    );
  }

  const cards = [
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: <ShoppingCart size={28} />,
      bg: "#f69224",
    },
    {
      title: "Total Sales",
      value: `৳${stats.totalSales}`,
      icon: <DollarSign size={28} />,
      bg: "#6fd300",
    },
    {
      title: "New Customers",
      value: stats.newCustomers ?? 0,
      icon: <Users size={28} />,
      bg: "#36A2EB",
    },
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      icon: <ShoppingCart size={28} />,
      bg: "#FF6384",
    },
  ];

  return (
    <>
      {stats?.totalOrders && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-[1600px] mx-auto">
          {cards.map((card, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between space-x-4 p-4 rounded-xl shadow-md text-white min-h-[100px] transition-transform hover:scale-[1.02]"
              style={{ backgroundColor: card.bg }}
            >
              <div className="p-2 rounded-full bg-white text-black">
                {card.icon}
              </div>
              <div className="text-end">
                <p className="text-sm md:text-base opacity-90">{card.title}</p>
                <h4 className="text-xl md:text-2xl font-bold">{card.value}</h4>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
