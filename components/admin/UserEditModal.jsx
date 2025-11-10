"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

export default function UserEditModal({
  user,
  open,
  onClose,
  refetch,
  currentUserRole,
}) {
  const [role, setRole] = useState("user");
  const [permissions, setPermissions] = useState({
    create: false,
    read: true,
    update: false,
    delete: false,
  });

  useEffect(() => {
    if (user) {
      setRole(user.role || "user");
      setPermissions(user.permissions || permissions);
    }
  }, [user]);

  const updateUser = useMutation({
    mutationFn: async (data) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/user/${user._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      const result = await res.json();
      if (!result.success)
        throw new Error(result.message || "Failed to update");
      return result;
    },
    onSuccess: () => {
      toast.success("User updated successfully");
      refetch();
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = () => {
    if (currentUserRole !== "admin") {
      toast.error("Only admin can assign roles");
      return;
    }

    updateUser.mutate({ role, permissions });
  };

  const canAssignRole = currentUserRole === "admin";
  const canEditPermissions = role === "moderator";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <div>
            <Label>Name</Label>
            <div className="mt-1 text-gray-700 font-medium">{user?.name}</div>
          </div>

          <div>
            <Label>Email</Label>
            <div className="mt-1 text-gray-600">{user?.email}</div>
          </div>

          {canAssignRole && (
            <div>
              <Label>Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label>Permissions</Label>
            <div className="flex flex-wrap gap-3 mt-2">
              {Object.keys(permissions).map((key) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={permissions[key]}
                    onCheckedChange={(val) =>
                      setPermissions((prev) => ({ ...prev, [key]: val }))
                    }
                    disabled={!canEditPermissions}
                  />
                  <Label
                    htmlFor={key}
                    className={`capitalize ${
                      !canEditPermissions ? "opacity-60" : ""
                    }`}
                  >
                    {key}
                  </Label>
                </div>
              ))}
            </div>
            {!canEditPermissions && (
              <p className="text-xs text-gray-500 mt-1">
                Permissions can only be assigned after user becomes a moderator.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {canAssignRole && (
            <Button onClick={handleSubmit} disabled={updateUser.isPending}>
              {updateUser.isPending ? "Saving..." : "Save Changes"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
