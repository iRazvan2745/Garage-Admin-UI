"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Plus, FolderPlus, Loader2 } from "lucide-react"

import BucketCard from "@/components/bucket-card"
import type { Bucket } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"

export default function BucketsContent() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newBucketName, setNewBucketName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    data: buckets,
    isLoading,
    error: fetchError,
    refetch,
  } = useQuery({
    queryKey: ["buckets"],
    queryFn: async () => {
      const response = await fetch("/api/buckets/list")
      if (!response.ok) {
        throw new Error("Failed to fetch buckets")
      }
      return response.json()
    },
  })

  const handleCreateBucket = async () => {
    if (!newBucketName.trim()) {
      setError("Bucket name is required")
      return
    }

    setIsCreating(true)
    setError(null)

    try {
      const response = await fetch(`/api/buckets/create?name=${encodeURIComponent(newBucketName)}`, {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create bucket")
      }

      await refetch()
      setNewBucketName("")
      setIsCreateDialogOpen(false)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">My Buckets</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-white text-black hover:bg-white/80">
          <Plus className="mr-2 h-4 w-4" /> New Bucket
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-[180px] w-full bg-neutral-800" />
          ))}
        </div>
      ) : fetchError ? (
        <div className="p-4 rounded-md bg-red-900/20 border border-red-800 text-red-200">
          Error loading buckets: {(fetchError as Error).message}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(buckets) && buckets.length > 0 ? (
            buckets.map((bucket: Bucket) => (
              <div key={bucket.id} className="h-[180px] w-full">
                <BucketCard
                  name={bucket.globalAliases[0] || bucket.id}
                  description={bucket.description || "No description"}
                  id={bucket.id}
                />
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-10 text-center space-y-4 border border-dashed border-neutral-700 rounded-lg bg-neutral-800/50">
              <FolderPlus size={36} className="text-neutral-500" />
              <div>
                <p className="text-gray-400">No buckets found. Create a new bucket to get started.</p>
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  variant="outline"
                  className="mt-4 border-neutral-700 hover:bg-neutral-800"
                >
                  <Plus className="mr-2 h-4 w-4" /> Create Bucket
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="text-white border-neutral-700 bg-neutral-900">
          <DialogHeader>
            <DialogTitle>Create New Bucket</DialogTitle>
          </DialogHeader>
          {error && <div className="text-red-500 text-sm mt-2 p-2 rounded bg-red-950/50">{error}</div>}
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newBucketName}
                onChange={(e) => setNewBucketName(e.target.value)}
                className="col-span-3 bg-neutral-800 border-neutral-700"
                placeholder="my-bucket"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleCreateBucket}
              disabled={isCreating}
              className="bg-white text-black hover:bg-white/80"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
