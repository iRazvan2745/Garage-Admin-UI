import { Card, CardContent } from "@/components/ui/card"

function Gauge({ value, legend, icon }: { value: number | string, legend: string, icon?: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center gap-2">
          {icon && <div className="flex items-center justify-center text-muted-foreground">{icon}</div>}
          <p className="text-sm text-muted-foreground">{legend}</p>
          <p className="text-4xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default Gauge