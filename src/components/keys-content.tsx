"use client"

import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import type { KeyList } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Key, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { toast } from "sonner"

export default function KeysContent() {
  const [open, setOpen] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [credentials, setCredentials] = useState<{ accessKeyId: string; secretAccessKey: string } | null>(null)
  const [credentialsDialogOpen, setCredentialsDialogOpen] = useState(false)

  const { data: keys, isLoading, error, refetch } = useQuery<KeyList[]>({
    queryKey: ['keys'],
    queryFn: async () => {
      const response = await fetch('/api/keys/list')
      if (!response.ok) {
        throw new Error('Failed to fetch keys')
      }
      return response.json()
    }
  })

  const createKey = async () => {
    if (!newKeyName.trim()) {
      toast.error("Key name cannot be empty")
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch('/api/keys/create?name=' + encodeURIComponent(newKeyName), { method: 'POST' })

      if (!response.ok) {
        throw new Error('Failed to create key')
      }
      const data = await response.json();
      setCredentials({
        accessKeyId: data.accessKeyId,
        secretAccessKey: data.secretAccessKey,
      })
      setCredentialsDialogOpen(true)
      toast.success("Access key created successfully")
      setOpen(false)
      setNewKeyName("")
      refetch()
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setIsCreating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-6 space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{(error as Error).message}</AlertDescription>
      </Alert>
    )
  }

  return (
    <>
      <div className="container mx-auto py-6 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Access Keys</h1>
          <Button onClick={() => setOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-white font-semibold">
            <Plus className="mr-2 h-4 w-4" /> New Key
          </Button>
        </div>
        {keys && keys.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {keys.map((key) => (
              <Link href={`/dashboard/keys/${key.id}`} key={key.id} className="block">
                <Card className="h-full bg-neutral-950/60 border-neutral-800/70 hover:bg-neutral-900/70 transition-colors shadow-md group">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2 text-white group-hover:text-amber-400 transition-colors">
                      <Key className="h-5 w-5" />
                      {key.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground truncate">ID: {key.id}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-2 border border-dashed border-neutral-800 rounded-lg bg-neutral-900/70 mt-12">
            <Key className="h-10 w-10 mb-4 text-neutral-700" />
            <p className="text-gray-400 mb-3">No access keys found. Create your first key to get started.</p>
            <Button onClick={() => setOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-white font-semibold">
              <Plus className="mr-2 h-4 w-4" /> Create Key
            </Button>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-neutral-800 max-w-sm w-full rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Access Key</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">Key Name</Label>
              <Input
                id="name"
                placeholder="Enter key name"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="bg-neutral-900 border-neutral-800 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="border-neutral-700 text-white">Cancel</Button>
            <Button onClick={createKey} disabled={isCreating} className="bg-amber-500 hover:bg-amber-600 text-white font-semibold">
              {isCreating ? (
                <span>Creating...</span>
              ) : (
                "Create Key"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Credentials Dialog */}
      <Dialog open={credentialsDialogOpen} onOpenChange={(open) => {
        setCredentialsDialogOpen(open);
        if (!open) setCredentials(null);
      }}>
        <DialogContent className="max-w-[420px] w-full rounded-xl border border-neutral-800 shadow-md bg-neutral-950 p-0">
          <div className="flex items-center gap-2 px-6 pt-6 pb-2">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            <span className="text-base font-semibold text-white">Access Key Created</span>
          </div>
          <div className="px-6 pb-1">
            <p className="text-xs text-muted-foreground mb-3">
              Please <span className="font-semibold">copy your credentials now</span>. The secret key will <span className="underline">not</span> be shown again!
            </p>
            {credentials && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg px-5 py-3 mt-2 mb-2">
                <div className="grid gap-2">
                  {/* Access Key ID Row */}
                  <div className="flex items-center gap-1">
                    <span className="min-w-[140px] text-right font-medium text-xs text-white">Access Key ID:</span>
                    <span className="font-sans bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-xs select-all break-all flex-1">
                      {credentials.accessKeyId}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="px-2 ml-1 font-medium text-xs h-7 cursor-pointer border-neutral-700 text-white"
                      onClick={() => navigator.clipboard.writeText(credentials.accessKeyId).then(() => toast.success("Access Key ID copied to clipboard"))}
                      title="Copy Access Key ID"
                    >
                      Copy
                    </Button>
                  </div>
                  {/* Secret Access Key Row */}
                  <div className="flex items-start gap-1">
                    <span className="min-w-[140px] text-right font-medium text-xs text-white pt-1">Secret Access Key:</span>
                    <span className="font-mono bg-neutral-950 border border-neutral-800 rounded px-2 py-1 text-xs select-all break-all flex-1">
                      {credentials.secretAccessKey}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="px-2 ml-1 font-medium text-xs h-7 mt-1 border-neutral-700 text-white"
                      onClick={() => navigator.clipboard.writeText(credentials.secretAccessKey).then(() => toast.success("Secret Access Key copied to clipboard"))}
                      title="Copy Secret Access Key"
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end px-6 pb-5 pt-1 mt-2">
            <Button onClick={() => {
              setCredentialsDialogOpen(false);
              setCredentials(null);
            }} className="w-24 bg-amber-500 hover:bg-amber-600 text-white font-semibold">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
