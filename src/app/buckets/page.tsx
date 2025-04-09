"use client"
import { useState, useEffect } from "react"
import type { Bucket, BucketInfo } from "@/lib/types"
import { BucketCard } from "@/components/bucketCard"
import { formatBytes } from "@/lib/utils"

export default function Buckets() {
  const [buckets, setBuckets] = useState<Bucket[]>([])
  const [loading, setLoading] = useState(true)
  const [bucketInfoMap, setBucketInfoMap] = useState<Record<string, BucketInfo>>({})

  useEffect(() => {
    const fetchBuckets = async () => {
      try {
        const response = await fetch("/api/bucket/list")
        const data = await response.json()
        setBuckets(data)
        
        // Fetch info for each bucket
        const infoPromises = data.map((bucket: Bucket) => fetchBucketInfo(bucket.id))
        const bucketInfoResults = await Promise.all(infoPromises)
        
        // Create a map of bucket id to bucket info
        const infoMap: Record<string, BucketInfo> = {}
        bucketInfoResults.forEach((info, index) => {
          if (info) {
            infoMap[data[index].id] = info
          }
        })
        
        setBucketInfoMap(infoMap)
        setLoading(false)
      } catch (error) {
        console.error("Failed to fetch buckets:", error)
        setLoading(false)
      }
    }

    const fetchBucketInfo = async (bucketId: string) => {
      try {
        const response = await fetch(`/api/bucket/info?id=${bucketId}`);
        const data = await response.json();
        return data;
      } catch (error) {
        console.error(`Failed to fetch bucket info for ${bucketId}:`, error);
        return null;
      }
    };

    fetchBuckets()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Buckets</h1>

      {loading ? (
        <div className="flex justify-center">
          <p>Loading buckets...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {buckets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No buckets found</p>
            </div>
          ) : (
            buckets.map((bucket) => (
              <BucketCard
                key={bucket.id}
                name={
                  bucket.globalAliases && bucket.globalAliases.length > 0
                    ? bucket.globalAliases[0]
                    : bucket.id.substring(0, 8)
                }
                id={bucket.id.substring(0, 12)}
                size={formatBytes(bucketInfoMap[bucket.id]?.bytes || 0)}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}
