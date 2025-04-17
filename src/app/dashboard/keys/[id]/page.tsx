"use client"

import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query"
import { use } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Key, Lock, Shield } from "lucide-react"
import KeyDeleteButton from "@/components/ui/KeyDeleteButton"

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
    <div className="min-h-screen w-full flex justify-center items-stretch bg-gradient-to-br from-neutral-900 via-neutral-950 to-black text-gray-200 p-0 overflow-auto animate-fade-in">
      <div className="flex-1 flex flex-col space-y-8 max-w-4xl mx-auto py-10 px-4 sm:px-8 md:px-12 lg:px-0">
        {/* Key Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-neutral-950/90 border border-neutral-800 rounded-2xl shadow-lg p-8 mb-2 ring-1 ring-neutral-800/40">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <Key className="w-7 h-7 text-yellow-500" />
              <h1 className="text-2xl font-bold truncate">{data?.name || "Key Details"}</h1>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-400">Access Key ID:</span>
              {data?.accessKeyId ? (
                <>
                  <span className="font-mono text-xs bg-neutral-900 px-2 py-1 rounded border border-neutral-800 select-all tracking-wide">{data.accessKeyId}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="ml-1 px-2 h-7 w-7"
                    onClick={() => {navigator.clipboard.writeText(data.accessKeyId); toast.success("Access Key ID copied to clipboard")}}
                    title="Copy Access Key ID"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16h8m-4-4h4m-6 8a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H8zm0 0H6a2 2 0 01-2-2V8a2 2 0 012-2h2" /></svg>
                  </Button>
                </>
              ) : (
                <span className="text-gray-500">N/A</span>
              )}
            </div>
            {(data?.createdAt || data?.lastUsedAt) && (
              <div className="mt-2 bg-neutral-900 border border-neutral-800 rounded p-2 text-xs text-gray-400 flex flex-col gap-1 w-fit">
                {data?.createdAt && (
                  <span>Created: <span className="font-mono">{new Date(data.createdAt).toLocaleString()}</span></span>
                )}
                {data?.lastUsedAt && (
                  <span>Last Used: <span className="font-mono">{new Date(data.lastUsedAt).toLocaleString()}</span></span>
                )}
              </div>
            )}
            {data?.permissions?.owner && (
              <div className="mt-2 px-3 py-2 rounded bg-red-900/80 text-red-200 text-xs font-semibold flex items-center gap-2 border border-red-700 shadow">
                <Shield className="w-4 h-4 inline-block mr-1" />
                Warning: This key has OWNER permissions!
              </div>
            )}
          </div>
          {data?.accessKeyId && (
            <div className="flex-shrink-0 flex justify-end">
              <KeyDeleteButton keyId={data.accessKeyId} />
            </div>
          )}
        </div>
        {/* Permissions */}
        <Card className="border-neutral-800 bg-neutral-950/80 rounded-2xl shadow-lg ring-1 ring-neutral-800/30">
          <CardContent>
            <div className="p-6 space-y-4">
              <h3 className="font-semibold mb-2 text-lg">Global Permissions</h3>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2" title="Can create new buckets">
                  <span className="font-mono text-xs">createBucket</span>
                  <span className={data?.permissions?.createBucket ? "bg-green-900/80 text-green-400 px-2 py-1 rounded text-xs font-semibold" : "bg-red-900/80 text-red-400 px-2 py-1 rounded text-xs font-semibold"}>
                    {data?.permissions?.createBucket ? "Allowed" : "Denied"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Buckets */}
        <div className="space-y-6">
          <h3 className="font-semibold text-lg mt-2">Bucket Access ({data?.buckets?.length || 0})</h3>
          {data?.buckets && data.buckets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.buckets.map((bucket) => (
                <Card key={bucket.id} className="border border-neutral-800 bg-neutral-950/90 rounded-2xl shadow-lg ring-1 ring-neutral-800/20 hover:ring-yellow-600/30 transition-all">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Key className="w-5 h-5 text-blue-400" />
                          <h4 className="font-semibold text-base truncate">
                            {bucket.globalAliases[0] || bucket.id.substring(0, 8)}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400">ID:</span>
                          <span className="font-mono text-xs bg-neutral-900 px-2 py-1 rounded border border-neutral-800 select-all">{bucket.id}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="ml-1 px-2 h-7 w-7"
                            onClick={() => {navigator.clipboard.writeText(bucket.id); toast.success("Bucket ID copied to clipboard")}}
                            title="Copy Bucket ID"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16h8m-4-4h4m-6 8a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H8zm0 0H6a2 2 0 01-2-2V8a2 2 0 012-2h2" /></svg>
                          </Button>
                        </div>
                        {bucket.localAliases.length > 0 && (
                          <p className="text-xs text-gray-400 mt-1">Local Aliases: {bucket.localAliases.join(', ')}</p>
                        )}
                      </div>
                      <div className="flex gap-2 flex-wrap mt-2 md:mt-0">
                        {bucket.permissions.read && <span className="text-xs bg-blue-900/80 text-blue-200 px-2 py-1 rounded font-semibold" title="Read access">Read</span>}
                        {bucket.permissions.write && <span className="text-xs bg-green-900/80 text-green-200 px-2 py-1 rounded font-semibold" title="Write access">Write</span>}
                        {bucket.permissions.owner && <span className="text-xs bg-purple-900/80 text-purple-200 px-2 py-1 rounded font-semibold" title="Owner access">Owner</span>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-gradient-to-br from-neutral-950/90 via-neutral-900/80 to-neutral-950/80 border border-neutral-800 rounded-2xl flex items-center justify-center py-14 shadow-xl ring-1 ring-yellow-800/20">
              <CardContent className="flex flex-col items-center">
                <Lock className="h-10 w-10 text-yellow-400 mb-4 drop-shadow-lg animate-bounce-slow" />
                <p className="text-xl font-bold text-yellow-200 mb-1">No Bucket Access</p>
                <p className="text-base text-gray-400">This key does not have access to any buckets.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
