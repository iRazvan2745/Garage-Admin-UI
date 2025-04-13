"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import NodesContent from "@/components/node-content"

const queryClient = new QueryClient()

export default function Nodes() {
  return (
    <QueryClientProvider client={queryClient}>
      <NodesContent />
    </QueryClientProvider>
  )
}