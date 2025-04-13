import { Card, CardContent } from "./ui/card";
import { Activity, Skull } from "lucide-react";

export default function HealthCard({ status }: { status: string }) {
  return (
    <Card>
      <CardContent>
        {status === "healthy" ? (
          <div className="flex items-center gap-2 text-green-500">
            <Activity className="h-8 w-8" />
            <span>Healthy</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-red-500">
            <Skull className="h-8 w-8" />
            <span>Unhealthy</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}