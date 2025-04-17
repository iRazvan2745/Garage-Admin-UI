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
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Access Keys</h1>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Key
        </Button>
      </div>

      {keys && keys.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 ml-2 mr-2">
          {keys.map((key) => (
            <Link href={`/dashboard/keys/${key.id}`} key={key.id} className="block">
              <Card className="h-full hover:bg-neutral-950/60 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    {key.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground truncate">ID: {key.id}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="text-center py-8">
          <CardContent>
            <p className="text-muted-foreground">No access keys found. Create your first key to get started.</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Access Key</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Key Name</Label>
              <Input
                id="name"
                placeholder="Enter key name"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={createKey} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Key"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Credentials Dialog */}
      <Dialog open={credentialsDialogOpen} onOpenChange={(open) => {
        setCredentialsDialogOpen(open);
        if (!open) setCredentials(null);
      }}>
        <DialogContent className="max-w-[420px] w-full rounded-xl border border-neutral-800 shadow-md p-0">
          <div className="flex items-center gap-2 px-6 pt-6 pb-2">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            <span className="text-base font-semibold text-white">Access Key Created</span>
          </div>
          <div className="px-6 pb-1">
            <p className="text-xs text-muted-foreground mb-3">
              Please <span className="font-semibold">copy your credentials now</span>. The secret key will <span className="underline">not</span> be shown again!
            </p>
            {credentials && (
              <div className="bg-neutral-950 border border-neutral-800 rounded-lg px-5 py-3 mt-2 mb-2">
                <div className="grid gap-2">
                  {/* Access Key ID Row */}
                  <div className="flex items-center gap-1">
                    <span className="min-w-[140px] text-right font-medium text-xs text-white">Access Key ID:</span>
                    <span className="font-sans bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-xs select-all break-all flex-1">
                      {credentials.accessKeyId}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="px-2 ml-1 font-medium text-xs h-7 cursor-pointer"
                      onClick={() => navigator.clipboard.writeText(credentials.accessKeyId).then(() => toast.success("Access Key ID copied to clipboard"))}
                      title="Copy Access Key ID"
                    >
                      Copy
                    </Button>
                  </div>
                  {/* Secret Access Key Row */}
                  <div className="flex items-start gap-1">
                    <span className="min-w-[140px] text-right font-medium text-xs text-white pt-1">Secret Access Key:</span>
                    <span className="font-mono bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-xs select-all break-all flex-1">
                      {credentials.secretAccessKey}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="px-2 ml-1 font-medium text-xs h-7 mt-1"
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
            }} className="w-24">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
