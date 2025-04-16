"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import BucketsContent from "@/components/buckets-content"

const queryClient = new QueryClient()

export default function Buckets() {
  return (
    <div className="h-full w-full bg-neutral-900">
      <QueryClientProvider client={queryClient}>
        <BucketsContent />
      </QueryClientProvider>
    </div>
  )
}
