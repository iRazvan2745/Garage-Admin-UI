'use client'
import { Gauge } from "@/components/charts/gauge"
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Server, Database, HardDrive, Shield } from "lucide-react";

const queryClient = new QueryClient()

function DashboardContent() {
  const { data } = useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const response = await fetch("/api/nodes/health");
      return response.json();
    },
  });
  
  return (
    <div className="grid grid-cols-4 gap-4 p-4">
      <Gauge value={data?.knownNodes || 0} legend="All Nodes" icon={<Server className="h-12 w-12" />} />
      <Gauge value={data?.connectedNodes || 0} legend="Active Nodes" icon={<Server className="h-12 w-12" />} />
      <Gauge value={data?.storageNodes || 0} legend="Storage Nodes" icon={<HardDrive className="h-12 w-12" />} />
      <Gauge value={data?.storageNodesOk || 0} legend="Healthy Storage" icon={<HardDrive className="h-12 w-12" />} />
      <Gauge value={data?.partitions || 0} legend="Total Partitions" icon={<Database className="h-12 w-12" />} />
      <Gauge value={data?.partitionsQuorum || 0} legend="Quorum Partitions" icon={<Database className="h-12 w-12" />} />
      <Gauge value={data?.partitionsAllOk || 0} legend="Healthy Partitions" icon={<Database className="h-12 w-12" />} />
      <Gauge value={data?.status === "healthy" ? "OK" : "ERROR"} legend="System Status" icon={<Shield className="h-12 w-12" />} />
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