'use client'
import { Gauge } from "@/components/charts/gauge"
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Server, Database, HardDrive, Shield } from "lucide-react";
import HealthCard from "@/components/health-card";

const queryClient = new QueryClient()

function DashboardContent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const response = await fetch("/api/nodes/health");
      return response.json();
    },
  });
  
  return (
    <div className="grid gap-4 ml-2 mt-4">
      {isLoading ? (
        <p>Loading health status...</p>
      ) : error ? (
        <p>Error loading health status</p>
      ) : (
        <HealthCard status={data?.status || "unhealthy"} />
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