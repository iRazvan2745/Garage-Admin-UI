'use client'

import BucketCard from "@/components/bucket-card"
import type { Bucket } from "@/lib/types"
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query"

const queryClient = new QueryClient()

function BucketsContent() {
  const { data: buckets, isLoading, error } = useQuery({
    queryKey: ['buckets'],
    queryFn: async () => {
      const response = await fetch('/api/buckets/list')
      if (!response.ok) {
        throw new Error('Failed to fetch buckets')
      }
      return response.json()
    }
  })
  
  if (isLoading) return <div>Loading buckets...</div>
  if (error) return <div>Error loading buckets: {(error as Error).message}</div>
  
  return (
    <div>
      {Array.isArray(buckets) && 
        buckets.map((bucket: Bucket) => (
          <div key={bucket.id} className="flex flex-row gap-2">
            <BucketCard 
              name={bucket.globalAliases[0] || bucket.id} 
              description={bucket.description || ''}
              id={bucket.id}
            />
          </div>
        ))}
    </div>
  )
}

export default function Buckets() {
  return (
    <QueryClientProvider client={queryClient}>
      <BucketsContent />
    </QueryClientProvider>
  )
}