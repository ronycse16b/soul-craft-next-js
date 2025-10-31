"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const data = [
  { name: "Jan", sales: 4000 },
  { name: "Feb", sales: 3200 },
  { name: "Mar", sales: 5000 },
  { name: "Apr", sales: 4200 },
  { name: "May", sales: 6000 },
  { name: "Jun", sales: 7000 },
];

export default function ChartCard() {
  return (
    <Card className='border-none shadow-none px-0'>
      <CardHeader>
        {/* <CardTitle>Monthly Sales</CardTitle> */}
      </CardHeader>
      <CardContent className="h-[300px] px-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#2563eb"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
