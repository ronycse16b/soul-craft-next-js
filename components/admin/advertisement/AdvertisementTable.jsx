"use client";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Edit, Trash2 } from "lucide-react";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import DeleteDialog from "./DeleteDialog";
import { useState } from "react";

export default function AdvertisementTable({
  data,
  isLoading,
  onEdit,
  onRefresh,
}) {
  const [selected, setSelected] = useState(null);

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }) => {
      await axios.put(`/api/advertisement/${id}`, { isActive });
    },
    onSuccess: () => {
      toast.success("Status updated!");
      onRefresh();
    },
  });

  if (isLoading) return <div>Loading advertisements...</div>;
  if (!data?.length) return <div>No advertisements found.</div>;

  return (
    <div className="overflow-x-auto border rounded-md">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="py-3 px-4 text-left">Title</th>
            <th className="py-3 px-4">End Time</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((ad) => (
            <tr
              key={ad._id}
              className="border-b hover:bg-gray-50 transition-colors"
            >
              <td className="py-3 px-4 font-medium">{ad.title}</td>
              <td className="py-3 px-4">
                {new Date(ad.endTime).toLocaleString()}
              </td>
              <td className="py-3 px-4 text-center">
                <Switch
                  checked={ad.isActive}
                  onCheckedChange={(checked) =>
                    toggleMutation.mutate({ id: ad._id, isActive: checked })
                  }
                />
              </td>
              <td className="py-3 px-4 text-right flex justify-end gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => onEdit(ad)}
                >
                  <Edit size={16} />
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => setSelected(ad)}
                >
                  <Trash2 size={16} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <DeleteDialog
        selected={selected}
        onClose={() => setSelected(null)}
        onConfirm={async () => {
          await axios.delete(`/api/advertisement/${selected._id}`);
          toast.success("Advertisement deleted!");
          setSelected(null);
          onRefresh();
        }}
      />
    </div>
  );
}
