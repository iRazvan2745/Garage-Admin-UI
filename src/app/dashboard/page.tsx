"use client"

import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Server,
  Database,
  HardDrive,
  Shield,
  AlertCircle,
  Activity,
  Key,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Home,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatBytes, calculatePercentage } from "@/lib/utils"

const queryClient = new QueryClient()

type NodeStatus = {
  id: string
  hostname: string
  addr: string
  isUp: boolean
  dataPartition: { total: number; available: number }
  metadataPartition: { total: number; available: number }
  lastSeenSecsAgo: number | null
  role: { zone: string; tags: string[] }
}

type DashboardData = {
  nodes: NodeStatus[]
  dbEngine: string
  layoutVersion: string
  garageVersion: string
  rustVersion: string
  garageFeatures: string[]
}

function DashboardContent() {
  const { data, isLoading, error, refetch } = useQuery<DashboardData>({
    queryKey: ["status"],
    queryFn: async () => {
      const response = await fetch("/api/nodes/status")
      if (!response.ok) {
        throw new Error("Failed to fetch system status")
      }
      return response.json()
    },
  })

  const totalStorage = data?.nodes?.reduce((acc, node) => acc + node.dataPartition.total, 0) || 0
  const availableStorage = data?.nodes?.reduce((acc, node) => acc + node.dataPartition.available, 0) || 0
  const usedStorage = totalStorage - availableStorage
  const storagePercentage = totalStorage > 0 ? Math.round((usedStorage / totalStorage) * 100) : 0

  return (
    <div className="container mx-auto p-6 min-h-screen text-neutral-100">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Home className="h-4 w-4" />
            <span className="text-sm">Dashboard</span>
          </div>
          <h1 className="text-2xl font-bold">System Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1" onClick={() => refetch()}>
            <Clock className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
          <Button size="sm" className="gap-1">
            <BarChart3 className="h-4 w-4" />
            <span>View Reports</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
          <Skeleton className="h-48 w-full" />
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{(error as Error).message}</AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-6">
          <Card className="border-none shadow-md text-neutral-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "h-14 w-14 rounded-full flex items-center justify-center",
                    data?.nodes?.every((node) => node.isUp) ? "bg-green-100" : "bg-red-100",
                  )}
                >
                  {data?.nodes?.every((node) => node.isUp) ? (
                    <CheckCircle className="h-7 w-7 text-green-600" />
                  ) : (
                    <XCircle className="h-7 w-7 text-red-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">System Status</h3>
                  <p
                    className={cn(
                      "font-medium",
                      data?.nodes?.every((node) => node.isUp) ? "text-green-600" : "text-red-600",
                    )}
                  >
                    {data?.nodes?.every((node) => node.isUp) ? "All systems operational" : "System issues detected"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Nodes */}
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Nodes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Server className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold">{data?.nodes?.length ?? "-"}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Online Nodes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold">{data?.nodes?.filter((node) => node.isUp).length ?? "-"}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">DB Engine</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Database className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="text-xl font-bold truncate">{data?.dbEngine?.split(" ")[0] ?? "-"}</div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Layout Version</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="bg-amber-100 p-3 rounded-full">
                    <HardDrive className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="text-3xl font-bold">{data?.layoutVersion ?? "-"}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Storage Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  {data?.nodes?.map((node) => (
                    <div key={node.id} className="border rounded-lg p-4 bg-neutral-950 border-neutral-800">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-neutral-100">{node.hostname}</h3>
                            <div
                              className={cn(
                                "px-2 py-0.5 rounded-full text-xs font-medium",
                                node.isUp ? "bg-green-900 text-green-300" : "bg-red-900 text-red-300",
                              )}
                            >
                              {node.isUp ? "Online" : "Offline"}
                            </div>
                          </div>
                          <p className="text-sm text-neutral-400 mt-1">ID: {node.id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-800 text-neutral-200">
                            Zone: {node.role.zone}
                          </div>
                          {node.role.tags.map((tag) => (
                            <div key={tag} className="px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-800 text-neutral-200">
                              {tag}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Data Storage</span>
                            <span>
                              {calculatePercentage(node.dataPartition.available, node.dataPartition.total)}% free
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2.5">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{
                                width: `${100 - calculatePercentage(node.dataPartition.available, node.dataPartition.total)}%`,
                              }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Used: {formatBytes(node.dataPartition.total - node.dataPartition.available)}</span>
                            <span>Total: {formatBytes(node.dataPartition.total)}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Metadata Storage</span>
                            <span>
                              {calculatePercentage(node.metadataPartition.available, node.metadataPartition.total)}%
                              free
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2.5">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{
                                width: `${100 - calculatePercentage(node.metadataPartition.available, node.metadataPartition.total)}%`,
                              }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>
                              Used: {formatBytes(node.metadataPartition.total - node.metadataPartition.available)}
                            </span>
                            <span>Total: {formatBytes(node.metadataPartition.total)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 text-sm text-neutral-400">
                        <span>Address: {node.addr}</span>
                        {node.lastSeenSecsAgo !== null && (
                          <span className="ml-4">Last seen: {node.lastSeenSecsAgo} seconds ago</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Nodes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">Manage your storage nodes</p>
                <Link href="/dashboard/nodes">
                  <Button className="w-full mt-2">View Nodes</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Buckets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">Manage your storage buckets</p>
                <Link href="/dashboard/buckets">
                  <Button className="w-full mt-2">View Buckets</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Access Keys
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">Manage your API keys</p>
                <Link href="/dashboard/keys">
                  <Button className="w-full mt-2">View Keys</Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Version Information</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="font-medium">Garage Version:</div>
                      <div className="font-mono">{data?.garageVersion?.substring(0, 8)}</div>
                      <div className="font-medium">Rust Version:</div>
                      <div>{data?.rustVersion}</div>
                      <div className="font-medium">Layout Version:</div>
                      <div>{data?.layoutVersion}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Enabled Features</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {data?.garageFeatures?.map((feature) => (
                        <div key={feature} className="px-2 py-0.5 rounded-md text-xs font-medium bg-neutral-800 text-neutral-200">
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">System Status</h3>
                    <div className="text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Last Checked: {new Date().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>      )
    }

import { ProtectedPage } from "@/components/protected-page";

export default function Dashboard() {
  return (
    <ProtectedPage>
      <QueryClientProvider client={queryClient}>
        <DashboardContent />
      </QueryClientProvider>
    </ProtectedPage>
  );
}
