"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import BucketViewerContent from "@/components/bucket-content"
import { use } from "react"

const queryClient = new QueryClient()

export default function BucketViewer({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = params instanceof Promise ? use(params) : params
  const { id } = resolvedParams
  return (
    <QueryClientProvider client={queryClient}>
      <BucketViewerContent id={id} />
    </QueryClientProvider>  
  );
}