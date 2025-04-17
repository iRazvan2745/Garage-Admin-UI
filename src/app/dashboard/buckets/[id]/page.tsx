"use client"

import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query"
import { use, useState } from "react"
import { formatBytes } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Database, HardDrive, Upload, Key } from "lucide-react"
import BucketDeleteButton from "../../../../components/ui/BucketDeleteButton"
import AddKeyToBucketDialog from "@/components/AddKeyToBucketDialog";

type Params = {
  id: string
}

type KeyPermission = {
  read: boolean
  write: boolean
  owner: boolean
}

type BucketKey = {
  accessKeyId: string
  name: string
  permissions: KeyPermission
  bucketLocalAliases: string[]
}

type BucketData = {
  id: string
  globalAliases?: string[]
  description?: string
  websiteAccess: boolean
  websiteConfig: any
  keys: BucketKey[]
  objects: number
  bytes: number
  unfinishedUploads: number
  unfinishedMultipartUploads: number
  unfinishedMultipartUploadParts: number
  unfinishedMultipartUploadBytes: number
  quotas?: {
    maxSize?: number | null
    maxObjects?: number | null
  }
}

const queryClient = new QueryClient()

export default function BucketViewer({ params }: { params: Promise<Params> | Params }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BucketViewerContent params={params} />
    </QueryClientProvider>
  )
}

function BucketViewerContent({ params }: { params: Promise<Params> | Params }) {
  const [addKeyDialogOpen, setAddKeyDialogOpen] = useState(false);
  const [addKeyAccessKeyId, setAddKeyAccessKeyId] = useState("");
  const resolvedParams = params instanceof Promise ? use(params) : params
  const { id } = resolvedParams

  const {
    data: bucket,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["bucket", id],
    queryFn: async () => {
      const response = await fetch(`/api/buckets?id=${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch bucket data")
      }
      return response.json() as Promise<BucketData>
    },
  })

  if (isLoading) {
    return (
      <div className="h-screen w-full p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/3 bg-neutral-800" />
          <Skeleton className="h-4 w-2/3 bg-neutral-800" />
          <div className="grid grid-cols-2 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full bg-neutral-800" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen w-full p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load bucket data: {(error as Error).message}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="h-full w-full bg-neutral-900 text-gray-200 p-6 overflow-auto">
      <div className="space-y-6 max-w-5xl mx-auto">

        <div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <h1 className="text-2xl font-medium">{bucket?.globalAliases?.[0] || bucket?.id}</h1>
              <p className="text-sm text-gray-400">ID: {id}</p>
              <p className="text-sm text-gray-400 mt-1">{bucket?.description || "No description available"}</p>
            </div>
            <BucketDeleteButton bucketId={id} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-neutral-800 text-gray-200 overflow-hidden">
            <CardContent className="p-4">
              <div className="p-4 border-b border-neutral-800 flex items-center gap-2">
                <Database className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium">Storage</span>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Objects</span>
                  <span className="text-lg font-medium">{bucket?.objects}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Size</span>
                  <span className="text-lg font-medium">{formatBytes(bucket?.bytes || 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-neutral-800 text-gray-200 overflow-hidden">
            <CardContent className="p-4">
              <div className="p-4 border-b border-neutral-800 flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium">Quotas</span>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Max Size</span>
                  <span className="text-lg font-medium">
                    {bucket?.quotas?.maxSize ? formatBytes(bucket?.quotas.maxSize) : "Unlimited"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Max Objects</span>
                  <span className="text-lg font-medium">
                    {bucket?.quotas?.maxObjects ? bucket.quotas.maxObjects.toLocaleString() : "Unlimited"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-neutral-800 text-gray-200 md:col-span-2 overflow-hidden">
            <CardContent className="p-4">
              <div className="p-4 border-b border-neutral-800 flex items-center gap-2">
                <Upload className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium">Unfinished Uploads</span>
              </div>
              <div className="grid grid-cols-2 divide-x divide-neutral-800">
                <div className="p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Standard Uploads</span>
                    <span className="text-lg font-medium">{bucket?.unfinishedUploads}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Multipart Uploads</span>
                    <span className="text-lg font-medium">{bucket?.unfinishedMultipartUploads}</span>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Multipart Parts</span>
                    <span className="text-lg font-medium">
                      {bucket?.unfinishedMultipartUploadParts.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Multipart Size</span>
                    <span className="text-lg font-medium">
                      {formatBytes(bucket?.unfinishedMultipartUploadBytes || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-neutral-800 text-gray-200 overflow-hidden">
            <CardContent className="p-4">
              <div className="p-4 border-b border-neutral-800 flex items-center gap-2">
                <Key className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium">Access Keys</span>
              </div>
              <div className="p-4">
                {/* Add Key to Bucket Button */}
                <div className="flex justify-end mb-4">
                  <Button variant="outline" size="sm" onClick={() => setAddKeyDialogOpen(true)}>
                    Add Key to Bucket
                  </Button>
                  <AddKeyToBucketDialog
                    bucketId={bucket.id}
                    accessKeyId={addKeyAccessKeyId}
                    open={addKeyDialogOpen}
                    onOpenChange={open => {
                      setAddKeyDialogOpen(open);
                      if (!open) setAddKeyAccessKeyId("");
                    }}
                    afterAllow={() => window.location.reload()}
                  />
                </div>
                {bucket?.keys && bucket.keys.length > 0 ? (
                  <div className="space-y-4">
                    {bucket.keys.map(key => (
                      <div key={key.accessKeyId} className="border border-neutral-800 rounded-md p-8">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{key.name}</div>
                            <div className="text-sm text-gray-400">{key.accessKeyId}</div>
                          </div>
                          <div className="flex gap-2">
                            {key.permissions.read && (
                              <span className="px-2 py-1 bg-blue-900/30 text-blue-400 text-xs rounded">Read</span>
                            )}
                            {key.permissions.write && (
                              <span className="px-2 py-1 bg-green-900/30 text-green-400 text-xs rounded">Write</span>
                            )}
                            {key.permissions.owner && (
                              <span className="px-2 py-1 bg-purple-900/30 text-purple-400 text-xs rounded">Owner</span>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <div className="text-sm text-gray-400">Local Aliases</div>
                          <div className="text-sm font-medium">
                            {key.bucketLocalAliases.join(", ") || "No aliases"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-400">No access keys available for this bucket</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 
