"use client"

import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query"
import { use } from "react"
import { formatBytes } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Database, HardDrive, Upload } from "lucide-react"

type Params = {
  id: string
}

type BucketData = {
  id: string
  globalAliases?: string[]
  description?: string
  objects: number
  bytes: number
  unfinishedUploads: number
  unfinishedMultipartUploads: number
  unfinishedMultipartUploadParts: number
  unfinishedMultipartUploadBytes: number
  quotas?: {
    maxSize?: number
    maxObjects?: number
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
      <div className="h-screen w-full bg-neutral-900 p-6">
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
      <div className="h-screen w-full bg-neutral-900 p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load bucket data: {(error as Error).message}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="h-screen w-full bg-neutral-900 text-gray-200 p-6 overflow-auto">
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Bucket Header */}
        <div>
          <h1 className="text-2xl font-medium">{bucket?.globalAliases?.[0] || bucket?.id}</h1>
          <p className="text-sm text-gray-400">ID: {id}</p>
          <p className="text-sm text-gray-400 mt-1">{bucket?.description || "No description available"}</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Storage Card */}
          <Card className="bg-neutral-950 border-neutral-800 text-gray-200 overflow-hidden">
            <CardContent className="p-0">
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

          {/* Quotas Card */}
          <Card className="bg-neutral-950 border-neutral-800 text-gray-200 overflow-hidden">
            <CardContent className="p-0">
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

          {/* Unfinished Uploads Card - Full Width */}
          <Card className="bg-neutral-950 border-neutral-800 text-gray-200 md:col-span-2 overflow-hidden">
            <CardContent className="p-0">
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
        </div>
      </div>
    </div>
  )
}
