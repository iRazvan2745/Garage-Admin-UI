"use client"

import { useQuery } from "@tanstack/react-query"
import { AlertCircle, Database, HardDrive, Upload, Key } from "lucide-react"

import { formatBytes } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import BucketDeleteButton from "@/components/ui/BucketDeleteButton"

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
  websiteConfig: boolean
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

export default function BucketViewerContent({ id }: { id: string }) {
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
      <div className="container mx-auto p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load bucket data: {(error as Error).message}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Bucket Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-medium">{bucket?.globalAliases?.[0] || bucket?.id}</h1>
            <p className="text-sm text-muted-foreground">ID: {id}</p>
            {bucket?.description && <p className="text-sm text-muted-foreground mt-1">{bucket.description}</p>}
          </div>
          <BucketDeleteButton bucketId={id} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Storage Card */}
          <Card>
            <CardContent className="p-0">
              <div className="p-4 border-b flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Storage</span>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Objects</span>
                  <span className="font-medium">{bucket?.objects.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Size</span>
                  <span className="font-medium">{formatBytes(bucket?.bytes || 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quotas Card */}
          <Card>
            <CardContent className="p-0">
              <div className="p-4 border-b flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Quotas</span>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Max Size</span>
                  <span className="font-medium">
                    {bucket?.quotas?.maxSize ? formatBytes(bucket?.quotas.maxSize) : "Unlimited"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Max Objects</span>
                  <span className="font-medium">
                    {bucket?.quotas?.maxObjects ? bucket.quotas.maxObjects.toLocaleString() : "Unlimited"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Unfinished Uploads Card */}
          <Card className="md:col-span-2">
            <CardContent className="p-0">
              <div className="p-4 border-b flex items-center gap-2">
                <Upload className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Unfinished Uploads</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
                <div className="p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Standard Uploads</span>
                    <span className="font-medium">{bucket?.unfinishedUploads.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Multipart Uploads</span>
                    <span className="font-medium">{bucket?.unfinishedMultipartUploads.toLocaleString()}</span>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Multipart Parts</span>
                    <span className="font-medium">{bucket?.unfinishedMultipartUploadParts.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Multipart Size</span>
                    <span className="font-medium">{formatBytes(bucket?.unfinishedMultipartUploadBytes || 0)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Access Keys Card */}
          <Card className="md:col-span-2">
            <CardContent className="p-0">
              <div className="p-4 border-b flex items-center gap-2">
                <Key className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Access Keys</span>
              </div>
              <div className="p-4">
                {bucket?.keys && bucket.keys.length > 0 ? (
                  <div className="space-y-4">
                    {bucket.keys.map((key) => (
                      <div key={key.accessKeyId} className="border rounded p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <div className="font-medium">{key.name}</div>
                            <div className="text-sm text-muted-foreground font-mono">{key.accessKeyId}</div>
                          </div>
                          <div className="flex gap-2">
                            {key.permissions.read && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs rounded">
                                Read
                              </span>
                            )}
                            {key.permissions.write && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs rounded">
                                Write
                              </span>
                            )}
                            {key.permissions.owner && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 text-xs rounded">
                                Owner
                              </span>
                            )}
                          </div>
                        </div>
                        {key.bucketLocalAliases.length > 0 && (
                          <div className="mt-2 pt-2 border-t">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                              <span className="text-sm text-muted-foreground">Local Aliases:</span>
                              <span className="text-sm">{key.bucketLocalAliases.join(", ")}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">No access keys available for this bucket</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
