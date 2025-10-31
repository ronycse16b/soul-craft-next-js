"use client";
import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

export default function SalesChart() {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/dashboard/sales-breakdown`)
      .then((res) => res.json())
      .then((data) => {
        const labels = Object.keys(data);
        const values = labels.map((key) => data[key].totalSales);
        const counts = labels.map((key) => data[key].count);

        setChartData({
          labels,
          values,
          counts,
        });
      });
  }, []);

  if (!chartData) return <p>Loading...</p>;

  const { labels, values, counts } = chartData;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-bold mb-4">Sales Breakdown</h2>

      <div className="relative w-full max-w-md mx-auto h-[300px] sm:h-[350px] md:h-[400px]">
        <Pie
          data={{
            labels,
            datasets: [
              {
                label: "Sales",
                data: values,
                backgroundColor: [
                  "#f69224", // Delivered
                  "#6fd300", // Shipped
                  "#36A2EB", // Processing
                  "#FF6384", // Returned
                  "#FFCE56", // Failed
                ],
                borderWidth: 1,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false, // make height dynamic
            plugins: {
              legend: {
                position: "top",
                labels: {
                  font: {
                    size: 12,
                    weight: "bold",
                  },
                },
              },
              datalabels: {
                formatter: (value, context) => {
                  const label = context.chart.data.labels[context.dataIndex];
                  return `${label}\n৳${value}`;
                },
                color: "#fff",
                font: {
                  weight: "bold",
                  size: 12,
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
}
