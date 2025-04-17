"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface HealthCardProps {
  title: string
  status: "ok" | "error" | "warning"
  description?: string
}

const HealthCard: React.FC<HealthCardProps> = ({ title, status, description }) => {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {status === "error" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{description || "An error occurred."}</AlertDescription>
          </Alert>
        )}
        {status === "warning" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>{description || "A warning occurred."}</AlertDescription>
          </Alert>
        )}
        {status === "ok" && (
          <p className="text-sm text-muted-foreground">{description || "All systems operational."}</p>
        )}
      </CardContent>
    </Card>
  )
}

export default HealthCard
