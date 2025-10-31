"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AdvertisementTable from "@/components/admin/advertisement/AdvertisementTable";
import AdvertisementForm from "@/components/admin/advertisement/AdvertisementForm";

export default function AdvertisementPage() {
  const [openForm, setOpenForm] = useState(false);
  const [editAd, setEditAd] = useState(null);

  // Fetch all advertisements
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["advertisement-admin"],
    queryFn: async () => {
      const res = await axios.get("/api/advertisement");
      return res.data;
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Manage Advertisements</h1>
        {!data?.length > 0 && <Button
          onClick={() => {
            setEditAd(null);
            setOpenForm(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus size={18} /> New Advertisement
        </Button>}
      </div>

      <AdvertisementTable
        data={data}
        isLoading={isLoading}
        onEdit={(ad) => {
          setEditAd(ad);
          setOpenForm(true);
        }}
        onRefresh={refetch}
      />

      <AdvertisementForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSuccess={() => {
          refetch();
          setOpenForm(false);
        }}
        editData={editAd}
      />
    </div>
  );
}
