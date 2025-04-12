import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

export default function BucketCard({ 
  name, 
  description, 
  id, 
  className 
}: { 
  name: string; 
  description: string; 
  id: string;
  className?: string;
}) {
  return (
    <Link href={`/dashboard/buckets/${id}`} className="block h-full w-full">
      <Card className={cn(
        "h-full w-full bg-neutral-950 border-neutral-900/50 hover:bg-neutral-950/80 transition-all duration-200 overflow-hidden",
        "shadow-lg hover:shadow-lg ",
        className
      )}>
        <div className="flex flex-col h-full p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-shrink-0 rounded-md p-2">
              <Image 
                src="/bucket.svg" 
                alt="Bucket" 
                width={48} 
                height={48} 
                className="text-white filter invert" 
              />
            </div>
            <CardTitle className="text-lg font-medium text-white truncate">
              {name}
            </CardTitle>
          </div>
          
          <CardDescription className="text-neutral-400 text-sm mb-3 line-clamp-2">
            {description}
          </CardDescription>
          
          <div className="mt-auto pt-2 border-t border-neutral-700">
            <p className="text-xs text-neutral-500 flex items-center">
              <span className="mr-1">ID:</span>
              <span className="font-mono text-neutral-400 truncate">{id}</span>
            </p>
          </div>
        </div>
      </Card>
    </Link>
  )
}
