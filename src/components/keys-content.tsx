"use client"

import { useQuery } from "@tanstack/react-query"
import type { KeyList } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function KeysContent() {
  const { data: keys, isLoading, error } = useQuery<KeyList[]>({
    queryKey: ['keys'],
    queryFn: async () => {
      const response = await fetch('/api/keys/list')
      if (!response.ok) {
        throw new Error('Failed to fetch keys')
      }
      return response.json()
    }
  })

  if (isLoading) {
    return (
      <div className="container py-6 space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{(error as Error).message}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="container py-6 m-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Access Keys</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Key
        </Button>
      </div>

      {keys && keys.length > 0 ? (
        <div className="grid grid-cols-5 gap-1">
          {keys.map((key) => (
            <Card key={key.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{key.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{key.id}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-6">
          <CardContent>No access keys found</CardContent>
        </Card>
      )}
    </div>
  )
}
