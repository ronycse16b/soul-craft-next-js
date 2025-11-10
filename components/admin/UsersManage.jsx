"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import UserTable from "./UserTable";

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["users", { page, search }],
    queryFn: async () => {
      const res = await fetch(`/api/user?page=${page}&search=${search}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to fetch");
      return data;
    },
    keepPreviousData: true,
  });

  const users = data?.users || [];
  const totalPages = data?.pagination?.totalPages || 1;

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <h1 className="text-2xl font-semibold text-gray-800">
          User Management
        </h1>
        <div className="flex gap-2">
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="w-[250px]"
          />
          <Button onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? (
              <Loader2 className="animate-spin mr-1" size={16} />
            ) : (
              "Search"
            )}
          </Button>
          <Button variant="default" onClick={() => setShowModal(true)}>
            + Add User
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-gray-500" size={40} />
        </div>
      ) : (
        <UserTable users={users} refetch={refetch} />
      )}

      {/* Pagination */}
      <div className="flex justify-center items-center gap-3 mt-6">
        <Button
          variant="outline"
          disabled={page <= 1}
          onClick={() => setPage((prev) => prev - 1)}
        >
          Prev
        </Button>
        <span className="text-gray-600">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          disabled={page >= totalPages}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Next
        </Button>
      </div>

      {/* Create User Modal */}
      {showModal && (
        <CreateUserModal
          onClose={() => setShowModal(false)}
          refetch={refetch}
        />
      )}
    </div>
  );
}

function CreateUserModal({ onClose, refetch }) {
  const { register, handleSubmit, watch, control, reset } = useForm({
    defaultValues: {
      name: "",
      emailOrPhone: "",
      password: "",
      role: "user",
      permissions: { create: false, read: false, update: false, delete: false },
    },
  });

  const role = watch("role");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    if (
      !data.name ||
      !data.emailOrPhone ||
      !data.role ||
      (data.role !== "admin" && !data.password)
    ) {
      return alert("All fields are required (password required for non-admin)");
    }
    setLoading(true);
    try {
      const res = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.message);
      refetch();
      reset();
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-[400px]">
        <h2 className="text-xl font-semibold mb-4">Create New User</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <Input placeholder="Name" {...register("name", { required: true })} />
          <Input
            placeholder="Email or Phone"
            {...register("emailOrPhone", { required: true })}
          />
          <Input
            type="password"
            placeholder="Password"
            {...register("password")}
          />
          <select {...register("role")} className="border rounded p-2">
            <option value="user">User</option>
            <option value="moderator">Moderator</option>
            <option value="admin">Admin</option>
          </select>

          {/* Permissions only for moderator */}
          {role === "moderator" && (
            <div className="flex flex-col gap-1 border p-2 rounded">
              <span className="font-semibold">Permissions:</span>
              {["create", "read", "update", "delete"].map((perm) => (
                <label key={perm} className="flex items-center gap-2">
                  <Controller
                    control={control}
                    name={`permissions.${perm}`}
                    render={({ field }) => (
                      <input type="checkbox" {...field} checked={field.value} />
                    )}
                  />
                  {perm.charAt(0).toUpperCase() + perm.slice(1)}
                </label>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="animate-spin mr-1" size={16} />
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
