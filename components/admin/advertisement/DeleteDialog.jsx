"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function DeleteDialog({ selected, onClose, onConfirm }) {
  if (!selected) return null;

  return (
    <Dialog open={!!selected} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Advertisement</DialogTitle>
        </DialogHeader>
        <p>
          Are you sure you want to delete{" "}
          <span className="font-semibold">{selected.title}</span>?
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
