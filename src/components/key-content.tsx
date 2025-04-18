"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { AlertCircle, Key, Lock, Shield, Copy, Clock, Database } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import KeyDeleteButton from "@/components/ui/KeyDeleteButton"
import AddKeyToBucketDialog from "@/components/AddKeyToBucketDialog"

type KeyData = {
  name: string
  accessKeyId: string
  createdAt?: string
  lastUsedAt?: string
  permissions: {
    createBucket: boolean
    owner?: boolean
  }
  buckets: {
    id: string
    globalAliases: string[]
    localAliases: string[]
    permissions: {
      read: boolean
      write: boolean
      owner: boolean
    }
  }[]
}

export function KeyViewerContent({ id }: { id: string }) {
  const [openDialogs, setOpenDialogs] = useState<Record<string, boolean>>({})
  const [addKeyDialogOpen, setAddKeyDialogOpen] = useState(false)
  const [, setAddKeyBucketId] = useState("")

  const { data, isLoading, error } = useQuery({
    queryKey: ["key", id],
    queryFn: async () => {
      const response = await fetch(`/api/keys?query=id&id=${encodeURIComponent(id)}`)
      if (!response.ok) {
        throw new Error("Failed to fetch key data")
      }
      return response.json() as Promise<KeyData>
    },
  })

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="space-y-6">
          <Skeleton className="h-12 w-1/3" />
          <Skeleton className="h-6 w-2/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <Alert variant="destructive">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load key data: {(error as Error).message}</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Defensive checks for data fields
  const keyName = data?.name || "Key Details"
  const accessKeyId = data?.accessKeyId || ""
  const createdAt = data?.createdAt ? new Date(data.createdAt).toLocaleString() : ""
  const lastUsedAt = data?.lastUsedAt ? new Date(data.lastUsedAt).toLocaleString() : ""

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex justify-end mb-4">
        <Button variant="outline" onClick={() => setAddKeyDialogOpen(true)} className="gap-2">
          <Database className="h-4 w-4" />
          Add Access Key to Bucket
        </Button>
        <AddKeyToBucketDialog
          accessKeyId={accessKeyId}
          open={addKeyDialogOpen}
          onOpenChange={(open) => {
            setAddKeyDialogOpen(open)
            if (!open) setAddKeyBucketId("")
          }}
          afterAllow={() => window.location.reload()}
        />
      </div>

      {/* Key Header */}
      <Card className="mb-8 shadow-lg border-muted">
        <CardContent className="p-0">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Key className="w-6 h-6 text-primary" />
                  </div>
                  <h1 className="text-2xl font-bold truncate">{keyName}</h1>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-sm text-muted-foreground font-medium">Access Key ID:</span>
                    {accessKeyId ? (
                      <div className="flex items-center">
                        <code className="font-mono text-xs bg-muted px-3 py-1.5 rounded-md border select-all tracking-wide">
                          {accessKeyId}
                        </code>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="ml-1 h-8 w-8"
                          onClick={() => {
                            navigator.clipboard.writeText(accessKeyId)
                            toast.success("Access Key ID copied to clipboard")
                          }}
                          title="Copy Access Key ID"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </div>

                  {(createdAt || lastUsedAt) && (
                    <div className="flex flex-wrap gap-4 text-sm">
                      {createdAt && (
                        <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-md">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Created:</span>
                          <span className="font-mono">{createdAt}</span>
                        </div>
                      )}
                      {lastUsedAt && (
                        <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-md">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Last Used:</span>
                          <span className="font-mono">{lastUsedAt}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {data?.permissions?.owner && (
                    <Alert variant="destructive" className="mt-4">
                      <Shield className="h-4 w-4" />
                      <AlertTitle>Owner Permissions</AlertTitle>
                      <AlertDescription>
                        This key has OWNER permissions. It has full control over all resources.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>

              {accessKeyId && (
                <div className="flex-shrink-0">
                  <KeyDeleteButton keyId={accessKeyId} />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permissions */}
      <Card className="mb-8 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-medium">Global Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2" title="Can create new buckets">
              <span className="font-mono text-sm">createBucket</span>
              <Badge variant={data?.permissions?.createBucket ? "secondary" : "destructive"}>
                {data?.permissions?.createBucket ? "Allowed" : "Denied"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Buckets */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">Bucket Access</h2>
          {(data?.buckets?.length ?? 0) > 0 && (
            <Badge variant="outline" className="rounded-full">
              {data?.buckets?.length}
            </Badge>
          )}
        </div>

        {Array.isArray(data?.buckets) && data.buckets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.buckets.map((bucket, index) => {
              const hasAllPermissions = bucket.permissions.read && bucket.permissions.write && bucket.permissions.owner
              const dialogOpen = openDialogs[bucket.id] || false
              const setDialogOpen = (open: boolean) => {
                setOpenDialogs((prev) => ({ ...prev, [bucket.id]: open }))
              }

              return (
                <Card key={index} className="overflow-hidden border-muted shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-1.5 rounded-full">
                          <Database className="w-6 h-6 text-primary" />
                        </div>
                        <CardTitle className="text-base font-medium">
                          {bucket.globalAliases[0] || bucket.id.substring(0, 8)}
                        </CardTitle>
                      </div>
                      <div className="flex gap-1.5">
                        {bucket.permissions.read && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                            Read
                          </Badge>
                        )}
                        {bucket.permissions.write && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
                            Write
                          </Badge>
                        )}
                        {bucket.permissions.owner && (
                          <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                            Owner
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">ID:</span>
                        <div className="flex items-center">
                          <code className="font-mono text-xs bg-muted px-2 py-1 rounded-md border select-all">
                            {bucket.id}
                          </code>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="ml-1 h-7 w-7"
                            onClick={() => {
                              navigator.clipboard.writeText(bucket.id)
                              toast.success("Bucket ID copied to clipboard")
                            }}
                            title="Copy Bucket ID"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {bucket.localAliases.length > 0 && (
                        <div className="flex flex-col gap-1">
                          <span className="text-sm text-muted-foreground">Local Aliases:</span>
                          <div className="flex flex-wrap gap-2">
                            {bucket.localAliases.map((alias, i) => (
                              <Badge key={i} variant="outline" className="font-mono text-xs">
                                {alias}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {!hasAllPermissions && (
                        <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)} className="mt-2">
                          Allow Key on Bucket
                        </Button>
                      )}

                      <AddKeyToBucketDialog
                        accessKeyId={accessKeyId}
                        open={dialogOpen}
                        onOpenChange={setDialogOpen}
                        afterAllow={() => window.location.reload()}
                      />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="border-dashed border-2 bg-muted/5">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="bg-muted/20 p-3 rounded-full mb-4">
                <Lock className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No Bucket Access</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                This key does not have access to any buckets. Add access to a bucket to start using this key.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
