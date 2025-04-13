"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import KeysContent from "@/components/keys-content"

const queryClient = new QueryClient()

export default function Keys() {
  return (
    <QueryClientProvider client={queryClient}>
      <KeysContent />
    </QueryClientProvider>
  )
}