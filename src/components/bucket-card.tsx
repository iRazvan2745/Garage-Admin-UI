import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Link from "next/link"

export default function BucketCard({ name, description, id }: { name: string, description: string, id: string }) {
  return (
    <Link href={`/dashboard/buckets/${id}`}>
    <Card className="w-[64vh] gap-4 my-3 ml-3 bg-neutral-950">
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>ID: {id.slice(0, 12)}</p>
      </CardContent>
      <CardFooter>
        <p>{description}</p>
      </CardFooter>
    </Card>
  </Link>
  )
}