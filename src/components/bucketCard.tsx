import { BsBucket } from "react-icons/bs";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link";

interface BucketCardProps {
  name: string
  id: string
  size: string
  info?: {
    files?: number
    lastUpdated?: string
  }
}

export function BucketCard({ name, id, size, info }: BucketCardProps) {
  return (
    <Link href={`/buckets/manage/${id}`}>
      <Card className="w-[132vh] md:w-[120vh] lg:w-[132vh] bg-background border-border rounded-2xl hover:border-primary/15 transition-colors">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="flex items-center justify-center p-2 rounded-md">
            <BsBucket className="h-12 w-12 text-primary" />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <CardTitle className="text-base font-medium text-foreground truncate">{name}</CardTitle>
            <CardDescription className="text-xs text-muted-foreground truncate">{id}</CardDescription>
            {info && (
              <div className="text-xs text-muted-foreground mt-1">
                {info.files !== undefined && `${info.files} files`}
                {info.files !== undefined && info.lastUpdated && ' · '}
                {info.lastUpdated && `Updated ${info.lastUpdated}`}
              </div>
            )}
          </div>
          <div className="text-xs text-muted-foreground whitespace-nowrap">
            Size: {size}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
