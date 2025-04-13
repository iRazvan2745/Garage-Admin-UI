"use client"

import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import type { NodeList } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Plus, Server, Wifi, WifiOff, HardDrive } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatBytes } from "@/lib/utils"
import { toast } from "sonner"
import Link from "next/link"

export default function NodesContent() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newNodeConnectID, setNewNodeConnectID] = useState("")
  
  const { data: nodes, isLoading, error } = useQuery({
    queryKey: ['nodes'],
    queryFn: async () => {
      const response = await fetch("/api/nodes/list")
      if (!response.ok) {
        throw new Error("Failed to fetch nodes")
      }
      return response.json()
    }
  })

  const handleAddNode = async () => {
    if (newNodeConnectID === "") {
      toast("Connect ID is required")
      return;
    }
    try {
      const response = await fetch('/api/nodes/add', { 
        method: 'POST', 
        body: JSON.stringify({ connectID: newNodeConnectID }) 
      })
      if (!response.ok) {
        throw new Error('Failed to add node')
      }
      setIsDialogOpen(false)
      setNewNodeConnectID("")
      toast.success("Node added successfully")
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

/*  if (isLoading) { broken
    return (
      <div className="container py-6 m-6 pl-4 space-y-4">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }
*/

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
        <h1 className="text-2xl font-bold">Nodes</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Node
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Node</DialogTitle>
            <DialogDescription>
              Run "garage node id" to get the connect ID
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="connectID" className="text-right">Connect ID</Label>
              <Input 
                id="connectID" 
                value={newNodeConnectID} 
                onChange={(e) => setNewNodeConnectID(e.target.value)} 
                className="col-span-3" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleAddNode}>Add Node</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {nodes && nodes.length > 0 ? (
        <div className="grid grid-cols-5 gap-4">
          {nodes.map((node: any) => (
            <Link key={node.id} href={`/dashboard/nodes/${node.id}`}>
              <Card className="overflow-hidden hover:bg-neutral-950/60 cursor-pointer duration-300">
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
            </Link>
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
