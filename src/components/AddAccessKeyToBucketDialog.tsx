"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AddAccessKeyToBucketDialogProps {
  bucketId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  afterAllow?: () => void;
}

export default function AddAccessKeyToBucketDialog({ bucketId, open, onOpenChange, afterAllow }: AddAccessKeyToBucketDialogProps) {
  const [accessKeyId, setAccessKeyId] = useState("");
  const [read, setRead] = useState(false);
  const [write, setWrite] = useState(false);
  const [owner, setOwner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAllow = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/buckets/allow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bucketId,
          accessKeyId,
          permissions: { read, write, owner },
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to allow key");
      }
      toast.success("Key permissions updated!");
      onOpenChange(false);
      if (afterAllow) afterAllow();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Access Key to Bucket</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <input
            type="text"
            value={accessKeyId}
            onChange={e => setAccessKeyId(e.target.value)}
            className="w-full border border-neutral-700 rounded px-2 py-1 text-sm bg-neutral-900 text-white"
            placeholder="Access Key ID"
            disabled={loading}
          />
          <div className="flex gap-2 items-center">
            <label className="flex items-center gap-1">
              <input type="checkbox" checked={read} onChange={e => setRead(e.target.checked)} />
              <span className="text-sm">Read</span>
            </label>
            <label className="flex items-center gap-1">
              <input type="checkbox" checked={write} onChange={e => setWrite(e.target.checked)} />
              <span className="text-sm">Write</span>
            </label>
            <label className="flex items-center gap-1">
              <input type="checkbox" checked={owner} onChange={e => setOwner(e.target.checked)} />
              <span className="text-sm">Owner</span>
            </label>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleAllow} disabled={loading || !accessKeyId || (!read && !write && !owner)}>
            {loading ? "Saving..." : "Add Key"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
