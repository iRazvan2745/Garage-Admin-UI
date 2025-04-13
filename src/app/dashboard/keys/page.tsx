"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import KeysContent from "@/components/keys-content"
import { Link } from "lucide-react"

const queryClient = new QueryClient()

export default function Keys() {
  return (
    <QueryClientProvider client={queryClient}>
      <Link href={`/dashboard/keys/{id}`} >Add New Key</Link>
      <KeysContent />
    </QueryClientProvider>
  )
}