"use client"

import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query"
import { use } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Key, Lock, Shield } from "lucide-react"

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

type KeyData = {
  id: string
  name: string
  accessKeyId: string
  secretAccessKey?: string
  buckets: {
    id: string
    name: string
    permissions: KeyPermission
  }[]
  created: string
  lastUsed?: string
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
    data: key,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["key", id],
    queryFn: async () => {
      const response = await fetch(`/api/keys?id=${id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch key data")
      }
      return response.json() as Promise<KeyData>
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
          <AlertDescription>Failed to load key data: {(error as Error).message}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="h-screen w-full bg-neutral-900 text-gray-200 p-6 overflow-auto">
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Key Header */}
        <div>
          <h1 className="text-2xl font-medium">{key?.name}</h1>
          <p className="text-sm text-gray-400">Access Key ID: {key?.accessKeyId}</p>
          <p className="text-sm text-gray-400 mt-1">Created: {key?.created ? new Date(key.created).toLocaleString() : 'N/A'}</p>
          {key?.lastUsed && (
            <p className="text-sm text-gray-400">Last Used: {new Date(key.lastUsed).toLocaleString()}</p>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Key Details Card */}
          <Card className="bg-neutral-950 border-neutral-800 text-gray-200 overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 border-b border-neutral-800 flex items-center gap-2">
                <Key className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium">Key Details</span>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">ID</span>
                  <span className="text-lg font-medium">{key?.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Access Key ID</span>
                  <span className="text-lg font-medium">{key?.accessKeyId}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Secret Key Card */}
          <Card className="bg-neutral-950 border-neutral-800 text-gray-200 overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 border-b border-neutral-800 flex items-center gap-2">
                <Lock className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium">Secret Key</span>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Secret Access Key</span>
                  <span className="text-lg font-medium">
                    {key?.secretAccessKey ? key.secretAccessKey : "••••••••••••••••"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Associated Buckets Card - Full Width */}
          <Card className="bg-neutral-950 border-neutral-800 text-gray-200 md:col-span-2 overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 border-b border-neutral-800 flex items-center gap-2">
                <Shield className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium">Associated Buckets</span>
              </div>
              <div className="p-4">
                {key?.buckets && key.buckets.length > 0 ? (
                  <div className="space-y-4">
                    {key.buckets.map((bucket) => (
                      <div key={bucket.id} className="border border-neutral-800 rounded-md p-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{bucket.name}</span>
                          <div className="flex gap-2">
                            {bucket.permissions.read && (
                              <span className="text-xs bg-blue-900 text-blue-200 px-2 py-1 rounded">Read</span>
                            )}
                            {bucket.permissions.write && (
                              <span className="text-xs bg-green-900 text-green-200 px-2 py-1 rounded">Write</span>
                            )}
                            {bucket.permissions.owner && (
                              <span className="text-xs bg-purple-900 text-purple-200 px-2 py-1 rounded">Owner</span>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">ID: {bucket.id}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No buckets associated with this key</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
