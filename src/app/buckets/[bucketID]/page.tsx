"use client"

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import type { BucketInfo } from "@/lib/types"

export default function BucketManagePage({ params }: { params: { bucketID: string } }) {
  const { bucketID } = params
  const searchParams = useSearchParams()
  const id = searchParams.get('id') || bucketID
  const [bucketInfo, setBucketInfo] = useState<BucketInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBucketInfo = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/bucket/info?id=${id}`)
        const data = await response.json()
        setBucketInfo(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchBucketInfo()
  }, [id])

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading bucket information...</div>
  }

  if (error) {
    return <div className="flex justify-center items-center h-full text-red-500">Error: {error}</div>
  }

  if (!bucketInfo) {
    return <div className="flex justify-center items-center h-full">Bucket not found</div>
  }


  return (
    <div className="container p-6">
      <h1 className="text-2xl font-bold mb-6">{bucketInfo.id}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-lg p-4 border">
          <h2 className="text-lg font-medium mb-4">Bucket Details</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Created:</span> {new Date(bucketInfo.createdAt).toLocaleString()}</p>
            <p><span className="font-medium">Last Updated:</span> {new Date(bucketInfo.updatedAt).toLocaleString()}</p>
            <p><span className="font-medium">Objects:</span> {bucketInfo.objects}</p>
            <p><span className="font-medium">Size:</span> {(bucketInfo.bytes / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        </div>
        
        <div className="bg-card rounded-lg p-4 border">
          <h2 className="text-lg font-medium mb-4">Configuration</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Website Access:</span> {bucketInfo.websiteAccess ? 'Enabled' : 'Disabled'}</p>
            <p><span className="font-medium">Global Aliases:</span> {bucketInfo.globalAliases?.length ? bucketInfo.globalAliases.join(', ') : 'None'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}