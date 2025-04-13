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
  name: string
  accessKeyId: string
  permissions: {
    createBucket: boolean
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

const queryClient = new QueryClient()

export default function KeyViewer({ params }: { params: Promise<Params> | Params }) {
  return (
    <QueryClientProvider client={queryClient}>
      <KeyViewerContent params={params} />
    </QueryClientProvider>
  )
}

function KeyViewerContent({ params }: { params: Promise<Params> | Params }) {
  const resolvedParams = params instanceof Promise ? use(params) : params
  const { id } = resolvedParams

  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["key", id],
    queryFn: async () => {
      const response = await fetch(`/api/keys?query=id&id=${encodeURIComponent(id)}`)
      console.log(response)
      if (!response.ok) {
        throw new Error("Failed to fetch key data")
      }
      return response.json() as Promise<KeyData>
    },
  })

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-neutral-950 p-6">
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
      <div className="h-screen w-full bg-neutral-950 p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load key data: {(error as Error).message}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-neutral-900 text-gray-200 p-6 overflow-auto">
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Key Header */}
        <div>
          <h1 className="text-2xl font-medium">{data?.name || "Key Details"}</h1>
          <p className="text-sm text-gray-400">Access Key ID: {data?.accessKeyId || "N/A"}</p>
        </div>

        {/* Key Information */}
        <Card className="border-neutral-700">
          <CardContent>
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Name</span>
                <span className="text-lg font-medium">{data?.name || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Access Key ID</span>
                <span className="text-lg font-medium">{data?.accessKeyId || "N/A"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Permissions */}
        <Card className=" border-neutral-700">
          <CardContent>
            <div className="p-4 space-y-4">
              <h3 className="font-medium">Global Permissions</h3>
              <div className="flex justify-between items-center">
                <span>Create Buckets</span>
                <span className={data?.permissions?.createBucket ? "text-green-400" : "text-red-400"}>
                  {data?.permissions?.createBucket ? "Allowed" : "Denied"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buckets */}
        {data?.buckets && data.buckets.length > 0 && (
          <Card className="border-neutral-700">
            <CardContent>
              <div className="p-4 space-y-4">
                <h3 className="font-medium">Bucket Access ({data.buckets.length})</h3>
                {data.buckets.map((bucket) => (
                  <div key={bucket.id} className="border border-neutral-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">
                        {bucket.globalAliases[0] || bucket.id.substring(0, 8)}
                      </h4>
                      <div className="flex gap-2">
                        {bucket.permissions.read && <span className="text-xs bg-blue-900 text-blue-200 px-2 py-1 rounded">Read</span>}
                        {bucket.permissions.write && <span className="text-xs bg-green-900 text-green-200 px-2 py-1 rounded">Write</span>}
                        {bucket.permissions.owner && <span className="text-xs bg-purple-900 text-purple-200 px-2 py-1 rounded">Owner</span>}
                      </div>
                    </div>
                    <p className="text-sm text-gray-400">ID: {bucket.id}</p>
                    {bucket.localAliases.length > 0 && (
                      <p className="text-sm text-gray-400">Local Aliases: {bucket.localAliases.join(', ')}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
