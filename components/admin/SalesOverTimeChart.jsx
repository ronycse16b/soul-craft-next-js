"use client";

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const FILTERS = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
];

export default function SalesOverTimeChart() {
  const [filter, setFilter] = useState("week");
  const [data, setData] = useState({ labels: [], sales: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/dashboard/sales-over-time?filter=${filter}`
    )
      .then((res) => res.json())
      .then((res) => {
        setData({
          labels: res.labels || [],
          sales: res.sales || [],
        });
        setLoading(false);
      });
  }, [filter]);

  const skyBlue = "#4da6ff"; // nice sky blue

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          boxWidth: 14,
          color: "#333",
          font: { size: 12, weight: "500" },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => `৳${context.parsed.y}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#666", font: { size: 12 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: "#eee" },
        ticks: {
          color: "#666",
          callback: (val) => `৳${val}`,
        },
      },
    },
  };

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: "Sales",
        data: data.sales,
        borderColor: skyBlue,
        backgroundColor: "rgba(77, 166, 255, 0.2)", // translucent fill
        fill: true, // fill area under line
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 7,
        borderWidth: 3,
        pointBackgroundColor: skyBlue,
        pointHoverBackgroundColor: "#1a75ff",
      },
    ],
  };

  return (
    <div className="bg-white text-black p-4 rounded-lg shadow w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Sales Over Time</h2>
        <select
          className="border px-2 py-1 rounded text-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          {FILTERS.map(({ label, value }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading...</p>
      ) : data.labels.length === 0 ? (
        <p className="text-gray-500 text-sm">No sales data available.</p>
      ) : (
        <Line data={chartData} options={chartOptions} />
      )}
    </div>
  );
}
