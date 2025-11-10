"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash } from "lucide-react";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import UserEditModal from "./UserEditModal";

export default function UserTable({
  users,
  refetch,
  currentUserRole = "admin",
}) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [open, setOpen] = useState(false);

  const deleteUser = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/user/${id}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to delete");
      return data;
    },
    onSuccess: () => {
      toast.success("User deleted successfully");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const canEdit = currentUserRole === "admin";

  return (
    <>
      <div className="overflow-x-auto border rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Name
              </th>
             
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Permissions
              </th>
              {canEdit && (
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {users?.length ? (
              users.map((user) => (
                <tr
                  key={user._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.image || "/default-avatar.png"}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover border"
                      />
                      <div>
                        <div className="font-medium text-gray-800">
                          {user.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.emailOrPhone}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <Badge
                      className={`${
                        user.role === "admin"
                          ? "bg-green-100 text-green-700"
                          : user.role === "moderator"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {user.role}
                    </Badge>
                  </td>

                  <td className="px-6 py-4 text-center text-sm text-gray-600">
                    {Object.entries(user.permissions || {}).map(
                      ([key, value]) => (
                        <span
                          key={key}
                          className={`inline-block px-2 py-0.5 text-xs rounded ${
                            value
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-600"
                          } mr-1`}
                        >
                          {key}
                        </span>
                      )
                    )}
                  </td>

                  {canEdit &&
                     (
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setOpen(true);
                            }}
                            disabled={user.role === "admin"} // prevent editing admins
                          >
                            <Pencil size={16} className="text-blue-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteUser.mutate(user._id)}
                            disabled={
                              deleteUser.isPending || user.role === "admin"
                            }
                          >
                            <Trash size={16} className="text-red-500" />
                          </Button>
                        </div>
                      </td>
                    )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="text-center text-gray-500 py-8 font-medium"
                >
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <UserEditModal
          user={selectedUser}
          open={open}
          onClose={() => setOpen(false)}
          refetch={refetch}
          currentUserRole={currentUserRole}
        />
      )}
    </>
  );
}
