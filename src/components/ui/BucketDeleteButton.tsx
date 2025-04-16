"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function BucketDeleteButton({ bucketId, afterDelete }: { bucketId: string, afterDelete?: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/buckets/delete?id=${encodeURIComponent(bucketId)}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete bucket");
      }
      setOpen(false);
      if (afterDelete) afterDelete();
      else router.push("/dashboard/buckets");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)} className="ml-2">Delete Bucket</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Bucket</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this bucket? This action cannot be undone.</p>
          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
