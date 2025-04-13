"use client";

import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Server, Wifi, WifiOff, HardDrive } from "lucide-react";

const queryClient = new QueryClient();

function NodeInfo({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data, isLoading, error } = useQuery({
    queryKey: ["nodeInfo", resolvedParams.id],
    queryFn: async () => {
      const response = await fetch(`/api/nodes/info?id=${resolvedParams.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch node info");
      }
      return response.json();
    }
  });

  if (isLoading) return <div className="p-4"><Skeleton className="h-32 w-full" /></div>;
  if (error) return (
    <Alert variant="destructive" className="m-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{(error as Error).message}</AlertDescription>
    </Alert>
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Node Info: {data.hostname}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><span className="font-medium">ID:</span> {data.id}</p>
            <p><span className="font-medium">Address:</span> {data.addr}</p>
            <p><span className="font-medium">Hostname:</span> {data.hostname}</p>
            <p className="flex items-center gap-2">
              <span className="font-medium">Status:</span> 
              {data.isUp ? (
                <span className="flex items-center gap-1"><Wifi className="h-4 w-4 text-green-500" /> Up</span>
              ) : (
                <span className="flex items-center gap-1"><WifiOff className="h-4 w-4 text-red-500" /> Down</span>
              )}
            </p>
            <p><span className="font-medium">Draining:</span> {data.draining ? "Yes" : "No"}</p>
            <p><span className="font-medium">Last Seen:</span> {data.lastSeenSecsAgo ? `${data.lastSeenSecsAgo} seconds ago` : "N/A"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Role Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><span className="font-medium">Zone:</span> {data.role.zone}</p>
            <p><span className="font-medium">Capacity:</span> {(data.role.capacity / 1e9).toFixed(2)} GB</p>
            <p><span className="font-medium">Tags:</span> {data.role.tags.join(", ")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Data Partition
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><span className="font-medium">Used:</span> {(data.dataUsed / 1e9).toFixed(2)} GB</p>
            <p><span className="font-medium">Total:</span> {(data.dataPartition.total / 1e9).toFixed(2)} GB</p>
            <p><span className="font-medium">Usage:</span> {(100 - (data.dataPartition.available / data.dataPartition.total * 100)).toFixed(2)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Metadata Partition
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><span className="font-medium">Used:</span> {(data.metadataUsed / 1e9).toFixed(2)} GB</p>
            <p><span className="font-medium">Total:</span> {(data.metadataPartition.total / 1e9).toFixed(2)} GB</p>
            <p><span className="font-medium">Usage:</span> {(100 - (data.metadataPartition.available / data.metadataPartition.total * 100)).toFixed(2)}%</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function NodeInfoPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <QueryClientProvider client={queryClient}>
      <NodeInfo params={params} />
    </QueryClientProvider>
  );
}