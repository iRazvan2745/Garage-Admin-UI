"use client"

import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { Reorder } from "framer-motion"
import { useState, useEffect } from "react"
import Cookies from "js-cookie"
import { ProtectedPage } from "@/components/protected-page"

const queryClient = new QueryClient()

const NODE_ORDER_COOKIE_KEY = "nodeOrder"

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
  const [nodes, setNodes] = useState<NodeStatus[]>([])
  const { data, isLoading, error, refetch } = useQuery<DashboardData>({
    queryKey: ["status"],
    queryFn: async () => {
      const response = await fetch("/api/nodes/status")
      if (!response.ok) {
        const errorData = await response.text()
        console.error("API Error:", errorData)
        throw new Error(
          `Failed to fetch system status: ${response.status} ${response.statusText}`,
        )
      }
      return response.json()
    },
    refetchOnWindowFocus: false, // Optional: prevent refetching just on focus
  })

  useEffect(() => {
    if (data?.nodes) {
      const savedOrderCookie = Cookies.get(NODE_ORDER_COOKIE_KEY)
      let initialNodes = [...data.nodes] // Create a mutable copy

      if (savedOrderCookie) {
        try {
          const savedOrderIds = JSON.parse(savedOrderCookie) as string[]
          const nodeMap = new Map(
            initialNodes.map((node) => [node.id, node]),
          )
          const orderedNodes: NodeStatus[] = []
          const remainingNodes = new Set(nodeMap.keys())

          // Add nodes in the saved order
          savedOrderIds.forEach((id) => {
            if (nodeMap.has(id)) {
              orderedNodes.push(nodeMap.get(id)!)
              remainingNodes.delete(id)
            }
          })

          // Add any new nodes (not in the saved order) to the end
          remainingNodes.forEach((id) => {
            orderedNodes.push(nodeMap.get(id)!)
          })

          initialNodes = orderedNodes
        } catch (e) {
          console.error("Failed to parse node order cookie:", e)
          // Fallback to API order if cookie is invalid
          Cookies.remove(NODE_ORDER_COOKIE_KEY) // Remove invalid cookie
        }
      }
      setNodes(initialNodes)
    }
  }, [data])

  const handleReorder = (newOrder: NodeStatus[]) => {
    setNodes(newOrder)
    const orderedIds = newOrder.map((node) => node.id)
    Cookies.set(NODE_ORDER_COOKIE_KEY, JSON.stringify(orderedIds), {
      expires: 7, // Cookie expires in 7 days
      path: "/", // Make cookie available across the site
      sameSite: "Lax", // Recommended for security
    })
  }

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
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <Clock className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
          <Button size="sm" className="gap-1">
            <BarChart3 className="h-4 w-4" />
            <span>View Reports</span>
          </Button>
        </div>
      </div>

      {isLoading && !data ? ( // Show skeleton only on initial load
        <div className="space-y-4">
          <Skeleton className="h-20 w-full bg-neutral-800" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full bg-neutral-800" />
            ))}
          </div>
          <Skeleton className="h-64 w-full bg-neutral-800" />
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Fetching Status</AlertTitle>
          <AlertDescription>
            {(error as Error).message || "An unknown error occurred."}
            <Button
              variant="link"
              className="p-0 h-auto ml-2 text-red-400 hover:text-red-300"
              onClick={() => refetch()}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : data ? (
        <div className="space-y-6">
          <Card className="border-neutral-800  shadow-md text-neutral-100">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "h-14 w-14 rounded-full flex items-center justify-center",
                    data.nodes?.every((node) => node.isUp)
                      ? "bg-green-900/50"
                      : "bg-red-900/50",
                  )}
                >
                  {data.nodes?.every((node) => node.isUp) ? (
                    <CheckCircle className="h-7 w-7 text-green-400" />
                  ) : (
                    <XCircle className="h-7 w-7 text-red-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">System Status</h3>
                  <p
                    className={cn(
                      "font-medium",
                      data.nodes?.every((node) => node.isUp)
                        ? "text-green-400"
                        : "text-red-400",
                    )}
                  >
                    {data.nodes?.every((node) => node.isUp)
                      ? "All systems operational"
                      : "System issues detected"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="shadow-sm hover:shadow-lg transition-shadow  border-neutral-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-neutral-100">
                  <Server className="h-5 w-5" />
                  Total Nodes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="bg-blue-900/50 p-3 rounded-full">
                    <Server className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="text-3xl font-bold text-neutral-100">
                    {data.nodes?.length ?? "-"}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm hover:shadow-lg transition-shadow  border-neutral-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-neutral-100">
                  <Shield className="h-5 w-5" />
                  Online Nodes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="bg-green-900/50 p-3 rounded-full">
                    <Shield className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="text-3xl font-bold text-neutral-100">
                    {data.nodes?.filter((node) => node.isUp).length ?? "-"}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm hover:shadow-lg transition-shadow  border-neutral-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-neutral-100">
                  <Database className="h-5 w-5" />
                  DB Engine
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="bg-purple-900/50 p-3 rounded-full">
                    <Database className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="text-xl font-bold truncate text-neutral-100">
                    {data.dbEngine?.split(" ")[0] ?? "-"}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm hover:shadow-lg transition-shadow  border-neutral-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-neutral-100">
                  <HardDrive className="h-5 w-5" />
                  Layout Version
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="bg-amber-900/50 p-3 rounded-full">
                    <HardDrive className="h-6 w-6 text-amber-400" />
                  </div>
                  <div className="text-3xl font-bold text-neutral-100">
                    {data.layoutVersion ?? "-"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm border-neutral-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-neutral-100">
                <Server className="h-5 w-5" />
                Storage Overview (Drag to reorder)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {nodes.length > 0 ? (
                <Reorder.Group
                  axis="y"
                  values={nodes}
                  onReorder={handleReorder}
                  className="space-y-4"
                >
                  {nodes.map((node) => (
                    <Reorder.Item
                      key={node.id}
                      value={node}
                      className="bg-neutral-950 border border-neutral-700 rounded-lg shadow-md"
                    >
                      <div className="p-4 cursor-grab active:cursor-grabbing">
                        {/* Node Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-3">
                          <div className="flex-shrink-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-neutral-100 truncate">
                                {node.hostname}
                              </h3>
                              <div
                                className={cn(
                                  "px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap",
                                  node.isUp
                                    ? "bg-green-900 text-green-300"
                                    : "bg-red-900 text-red-300",
                                )}
                              >
                                {node.isUp ? "Online" : "Offline"}
                              </div>
                            </div>
                            <p className="text-xs text-neutral-500 mt-1 font-mono break-all">
                              ID: {node.id}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap flex-shrink min-w-0">
                            <div className="px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-700 text-neutral-200 whitespace-nowrap">
                              Zone: {node.role.zone}
                            </div>
                            {node.role.tags.map((tag) => (
                              <div
                                key={tag}
                                className="px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-700 text-neutral-200 whitespace-nowrap"
                              >
                                {tag}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Storage Bars */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Data Storage */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-sm text-neutral-300">
                              <span>Data Storage</span>
                              <span className="text-neutral-400">
                                {calculatePercentage(
                                  node.dataPartition.available,
                                  node.dataPartition.total,
                                )}
                                % free
                              </span>
                            </div>
                            <div className="w-full bg-neutral-700 rounded-full h-2.5 overflow-hidden">
                              <div
                                className="bg-amber-500 h-2.5 rounded-full transition-all duration-300 ease-out"
                                style={{
                                  width: `${
                                    100 -
                                    calculatePercentage(
                                      node.dataPartition.available,
                                      node.dataPartition.total,
                                    )
                                  }%`,
                                }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs text-neutral-500">
                              <span>
                                Used:{" "}
                                {formatBytes(
                                  node.dataPartition.total -
                                    node.dataPartition.available,
                                )}
                              </span>
                              <span>
                                Total: {formatBytes(node.dataPartition.total)}
                              </span>
                            </div>
                          </div>
                          {/* Metadata Storage */}
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-sm text-neutral-300">
                              <span>Metadata Storage</span>
                              <span className="text-neutral-400">
                                {calculatePercentage(
                                  node.metadataPartition.available,
                                  node.metadataPartition.total,
                                )}
                                % free
                              </span>
                            </div>
                            <div className="w-full bg-neutral-700 rounded-full h-2.5 overflow-hidden">
                              <div
                                className="bg-purple-500 h-2.5 rounded-full transition-all duration-300 ease-out"
                                style={{
                                  width: `${
                                    100 -
                                    calculatePercentage(
                                      node.metadataPartition.available,
                                      node.metadataPartition.total,
                                    )
                                  }%`,
                                }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs text-neutral-500">
                              <span>
                                Used:{" "}
                                {formatBytes(
                                  node.metadataPartition.total -
                                    node.metadataPartition.available,
                                )}
                              </span>
                              <span>
                                Total:{" "}
                                {formatBytes(node.metadataPartition.total)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Address and Last Seen */}
                        <div className="mt-3 text-sm text-neutral-400 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
                          <span className="truncate">
                            Address: {node.addr}
                          </span>
                          {node.lastSeenSecsAgo !== null && (
                            <span className="whitespace-nowrap flex-shrink-0">
                              Last seen: {node.lastSeenSecsAgo}s ago
                            </span>
                          )}
                        </div>
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              ) : isLoading ? (
                <Skeleton className="h-48 w-full bg-neutral-800" /> // Skeleton while loading nodes list
              ) : (
                <p className="text-neutral-500 text-center py-4">
                  No nodes found.
                </p>
              )}
            </CardContent>
          </Card>

          {/* --- Link Cards --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="shadow-sm hover:shadow-lg transition-shadow  border-neutral-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-neutral-100">
                  <Server className="h-5 w-5" />
                  Nodes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-neutral-400">
                  Manage your storage nodes
                </p>
                <Link href="/dashboard/nodes">
                  <Button variant="outline" className="w-full mt-2">
                    View Nodes
                  </Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="shadow-sm hover:shadow-lg transition-shadow  border-neutral-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-neutral-100">
                  <Database className="h-5 w-5" />
                  Buckets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-neutral-400">
                  Manage your storage buckets
                </p>
                <Link href="/dashboard/buckets">
                  <Button variant="outline" className="w-full mt-2">
                    View Buckets
                  </Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="shadow-sm hover:shadow-lg transition-shadow  border-neutral-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-neutral-100">
                  <Key className="h-5 w-5" />
                  Access Keys
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-neutral-400">
                  Manage your API keys
                </p>
                <Link href="/dashboard/keys">
                  <Button variant="outline" className="w-full mt-2">
                    View Keys
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* --- System Information Card --- */}
          <Card className="shadow-sm  border-neutral-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-neutral-100">
                <Activity className="h-5 w-5" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-neutral-300">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-400 mb-1">
                      Version Information
                    </h3>
                    <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                      <div className="font-medium text-neutral-400">
                        Garage:
                      </div>
                      <div className="font-mono">
                        {data.garageVersion?.substring(0, 8) ?? "N/A"}
                      </div>
                      <div className="font-medium text-neutral-400">Rust:</div>
                      <div>{data.rustVersion ?? "N/A"}</div>
                      <div className="font-medium text-neutral-400">
                        Layout:
                      </div>
                      <div>{data.layoutVersion ?? "N/A"}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-400 mb-1">
                      Enabled Features
                    </h3>
                    {data.garageFeatures?.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {data.garageFeatures.map((feature) => (
                          <div
                            key={feature}
                            className="px-2 py-0.5 rounded-md text-xs font-medium bg-neutral-700 text-neutral-200"
                          >
                            {feature}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-500 italic mt-1">
                        No specific features listed.
                      </p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-neutral-400 mb-1">
                      Status Check
                    </h3>
                    <div className="text-sm">
                      <div className="flex items-center gap-2 text-neutral-400">
                        <Clock className="h-4 w-4" />
                        <span>
                          Last Checked: {new Date().toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center text-neutral-500">
          No dashboard data available.
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  return (
    <ProtectedPage>
      <QueryClientProvider client={queryClient}>
        <DashboardContent />
      </QueryClientProvider>
    </ProtectedPage>
  )
}
