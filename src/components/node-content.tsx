"use client"

import { useQuery } from "@tanstack/react-query"
import type { NodeList } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Plus, Server, Wifi, WifiOff, HardDrive } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { formatBytes } from "@/lib/utils"

export default function NodesContent() {
  const { data: nodes, isLoading, error } = useQuery({
    queryKey: ['nodes'],
    queryFn: async () => {
      const response = await fetch('/api/nodes/list')
      if (!response.ok) {
        throw new Error('Failed to fetch nodes')
      }
      return response.json()
    }
  })

  if (isLoading) {
    return (
      <div className="container py-6 space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{(error as Error).message}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="container py-6 m-6 pl-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Access Nodes</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Node
        </Button>
      </div>

      {nodes && nodes.length > 0 ? (
        <div className="grid grid-cols-5 gap-4">
          {nodes.map((node: any) => (
            <Card key={node.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg truncate" title={node.id}>
                    {node.hostname || node.id.substring(0, 10) + '...'}
                  </CardTitle>
                  {node.isUp ? 
                    <Wifi className="h-4 w-4 text-green-500" /> : 
                    <WifiOff className="h-4 w-4 text-red-500" />
                  }
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center text-sm">
                  <Server className="h-4 w-4 mr-2" />
                  <span className="text-muted-foreground">{node.addr}</span>
                </div>
                <div className="flex items-center text-sm">
                  <HardDrive className="h-4 w-4 mr-2" />
                  <span className="text-muted-foreground">
                    {formatBytes(node.dataPartition.available)} / {formatBytes(node.dataPartition.total)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Zone: {node.role.zone}</span>
                  <span className="text-muted-foreground">
                    {node.lastSeenSecsAgo !== null 
                      ? `Last seen ${node.lastSeenSecsAgo}s ago` 
                      : "Status unknown"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-6">
          <CardContent>No nodes found</CardContent>
        </Card>
      )}
    </div>
  )
}
