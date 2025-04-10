"use client"

import { useState } from "react"

export function useBucketInfo(bucketID: string) {

  const [bucketInfo, setBucketInfo] = useState(null)
  fetch(`/api/bucket/info?id=${bucketID}`)
    .then(res => res.json())
    .then(data => setBucketInfo(data))
  return { bucketInfo }
}