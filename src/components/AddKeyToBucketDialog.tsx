"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import type { Bucket } from "@/lib/types";

interface AddKeyToBucketDialogProps {
  accessKeyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  afterAllow?: () => void;
}

export default function AddKeyToBucketDialog({ accessKeyId, open, onOpenChange, afterAllow }: AddKeyToBucketDialogProps) {
  const [selectedBucketId, setSelectedBucketId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [read, setRead] = useState(false);
  const [write, setWrite] = useState(false);
  const [owner, setOwner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: buckets, isLoading: bucketsLoading, error: bucketsError } = useQuery<Bucket[]>({
    queryKey: ["buckets"],
    queryFn: async () => {
      const response = await fetch("/api/buckets/list");
      if (!response.ok) throw new Error("Failed to fetch buckets");
      return response.json();
    }
  });

  const filteredBuckets = buckets?.filter(b => {
    const lower = search.toLowerCase();
    return (
      b.id.toLowerCase().includes(lower) ||
      b.globalAliases?.some(alias => alias.toLowerCase().includes(lower)) ||
      b.localAliases?.some(alias => alias.toLowerCase().includes(lower)) ||
      b.description?.toLowerCase().includes(lower)
    );
  }) ?? [];

  const handleAllow = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!selectedBucketId) {
        setError("Please select a bucket");
        setLoading(false);
        return;
      }
      const response = await fetch("/api/buckets/allow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bucketId: selectedBucketId,
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
    } catch (err: unknown) {
      setError(typeof err === 'object' && err && 'message' in err && typeof (err as { message?: unknown }).message === 'string' ? (err as { message: string }).message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Allow Key on Bucket</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Label htmlFor="bucket-combobox">Select Bucket</Label>
            <input
              id="bucket-combobox"
              className="w-full px-3 py-2 border border-input rounded-md bg-transparent text-sm focus-visible:border-ring focus-visible:ring-ring/50 outline-none"
              placeholder={bucketsLoading ? "Loading..." : "Search or select a bucket"}
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              disabled={bucketsLoading}
              autoComplete="off"
            />
            {showDropdown && filteredBuckets.length > 0 && (
              <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border border-neutral-700 bg-neutral-900 shadow-lg">
                {filteredBuckets.map(bucket => (
                  <li
                    key={bucket.id}
                    className={`px-3 py-2 cursor-pointer hover:bg-neutral-800 ${selectedBucketId === bucket.id ? "bg-neutral-800" : ""}`}
                    onMouseDown={() => {
                      setSelectedBucketId(bucket.id);
                      setSearch(bucket.id);
                      setShowDropdown(false);
                    }}
                  >
                    <div className="flex flex-col">
                      <span className="font-mono text-xs">{bucket.id}</span>
                      <span className="text-xs text-neutral-400">{bucket.description || bucket.globalAliases?.join(", ") || bucket.localAliases?.join(", ")}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {showDropdown && filteredBuckets.length === 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-md border border-neutral-700 bg-neutral-900 shadow-lg px-3 py-2 text-sm text-neutral-400">No buckets found</div>
            )}
          </div>
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
          {bucketsError && <div className="text-red-500 text-sm">Failed to load buckets</div>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { setShowDropdown(false); onOpenChange(false); }} disabled={loading}>Cancel</Button>
          <Button onClick={handleAllow} disabled={loading || !selectedBucketId || (!read && !write && !owner)}>
            {loading ? "Saving..." : "Allow"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
