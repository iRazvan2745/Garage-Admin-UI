"use client"

import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { RefreshCcw, AlertCircle, Tag, MapPin, Database, ArrowRight } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatBits as formatCapacity } from "@/lib/utils"

interface Role {
  id: string
  zone: string
  capacity: number
  tags: string[]
}

interface LayoutData {
  version: number
  roles: Role[]
  stagedRoleChanges: Role[]
}

const truncateId = (id: string) => {
  if (id.length <= 16) return id
  return `${id.substring(0,20)}...`
}

function RoleCard({ role, isModified = false }: { role: Role; isModified?: boolean }) {
  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <div className="flex items-center gap-1.5 mb-3">
          <Database className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono text-sm">{truncateId(role.id)}</span>
          {isModified && <Badge className="ml-auto bg-amber-900/30 text-amber-400 border-amber-800">Modified</Badge>}
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center text-sm">
            <MapPin className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <span className="text-muted-foreground mr-2">Zone</span>
            {role.zone === "ro" ? (
              <span>{role.zone}</span>
            ) : role.zone === "ro2" ? (
              <>
                <span className="text-muted-foreground mr-1">ro</span>
                <ArrowRight className="h-3 w-3 text-muted-foreground mx-1" />
                <span>ro2</span>
              </>
            ) : (
              <span>{role.zone}</span>
            )}
          </div>

          <div className="flex items-center text-sm">
            <span className="text-muted-foreground mr-2">Capacity</span>
            <span>{formatCapacity(role.capacity)}</span>
          </div>

          <div className="mt-2">
            <div className="text-muted-foreground text-sm flex items-center mb-1.5">
              <Tag className="h-3.5 w-3.5 mr-1.5" /> Tags
            </div>
            <div className="flex flex-wrap gap-1.5">
              {role.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-muted text-foreground">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 mb-3">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center">
                <Skeleton className="h-3.5 w-3.5 mr-1.5" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-6 ml-auto" />
              </div>
              <div className="flex items-center">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-10 ml-auto" />
              </div>
              <div>
                <Skeleton className="h-4 w-14 mb-1.5" />
                <div className="flex gap-1.5">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function LayoutContent() {
  const { data, isLoading, error, refetch, isRefetching } = useQuery<LayoutData>({
    queryKey: ["layout"],
    queryFn: async () => {
      const res = await fetch("/api/layout")
      if (!res.ok) throw new Error("Failed to fetch layout data")
      return res.json()
    },
  })

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <Alert variant="destructive" className="max-w-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {(error as Error).message}
            <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const modifiedRoles = data
    ? data.roles.filter((role) => data.stagedRoleChanges.some((staged) => staged.id === role.id))
    : []
  const modifiedRoleIds = modifiedRoles.map((role) => role.id)

  return (
    <div className="ml-8 mb-8 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between py-3 mb-4">
        <div>
          <h1 className="text-xl font-semibold">Layout Manager</h1>
          <p className="text-sm text-muted-foreground">
            {data
              ? `Version ${data.version} • ${data.roles.length} Roles • ${data.stagedRoleChanges.length} Staged Changes`
              : "Loading..."}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading || isRefetching}
          className="gap-1.5"
        >
          <RefreshCcw className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Main content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100%-4rem)]">
        {/* Current Roles Column */}
        <Card className="h-full flex flex-col overflow-hidden">
          <CardHeader className="p-3 border-b">
            <CardTitle className="text-base font-medium">Current Roles ({data?.roles.length || 0})</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-full">
              {isLoading ? (
                <div className="p-4">
                  <LoadingSkeleton />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                  {data?.roles.map((role) => (
                    <RoleCard key={role.id} role={role} isModified={modifiedRoleIds.includes(role.id)} />
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Staged Changes Column */}
        <Card className="h-full flex flex-col overflow-hidden">
          <CardHeader className="p-3 border-b">
            <CardTitle className="text-base font-medium">
              Staged Changes ({data?.stagedRoleChanges.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-full">
              {isLoading ? (
                <div className="p-4">
                  <LoadingSkeleton />
                </div>
              ) : (
                <div className="p-4">
                  {data?.stagedRoleChanges.length ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {data?.stagedRoleChanges.map((role) => (
                        <RoleCard key={role.id} role={role} isModified={true} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full py-12 text-muted-foreground">
                      No staged changes
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

const queryClient = new QueryClient()

export default function Layout() {
  return (
    <QueryClientProvider client={queryClient}>
      <LayoutContent />
    </QueryClientProvider>
  )
}
