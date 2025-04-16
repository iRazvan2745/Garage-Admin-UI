'use client'
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Server, Database, HardDrive, Shield, AlertCircle, Activity, Key } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import HealthCard from "@/components/health-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const queryClient = new QueryClient()

function DashboardContent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["status"],
    queryFn: async () => {
      const response = await fetch("/api/nodes/status");
      if (!response.ok) {
        throw new Error("Failed to fetch system status");
      }
      return response.json();
    },
  });
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">System Dashboard</h1>
      
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
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
          <HealthCard status={data?.nodes?.every((node: { isUp: any; }) => node.isUp) ? "healthy" : "unhealthy"} />
          
          <Card>
            <CardHeader>
              <CardTitle>System Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex items-center space-x-4">
                  <Server className="h-10 w-10 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Nodes</p>
                    <p className="text-2xl font-bold">{data?.nodes?.length ?? "-"}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Shield className="h-10 w-10 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Online Nodes</p>
                    <p className="text-2xl font-bold">{data?.nodes?.filter((node: { isUp: any; }) => node.isUp).length ?? "-"}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Database className="h-10 w-10 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">DB Engine</p>
                    <p className="text-2xl font-bold">{data?.dbEngine?.split(" ")[0] ?? "-"}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <HardDrive className="h-10 w-10 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Layout Version</p>
                    <p className="text-2xl font-bold">{data?.layoutVersion ?? "-"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
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
            
            <Card>
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
            
            <Card>
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
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p><span className="font-medium">Version:</span> {data?.garageVersion}</p>
                <p><span className="font-medium">Rust Version:</span> {data?.rustVersion}</p>
                <p><span className="font-medium">Features:</span> {data?.garageFeatures?.join(", ")}</p>
                <p><span className="font-medium">Last Checked:</span> {new Date().toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardContent />
    </QueryClientProvider>
  );
}