import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const StatCard = ({
  title,
  description,
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
  delta,
}: {
  title: string;
  description?: string;
  leftLabel: string;
  leftValue: number;
  rightLabel: string;
  rightValue: number;
  delta: number;
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? (
          <CardDescription className="text-xs">{description}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">{leftLabel}</div>
          <div className="font-semibold tabular-nums">{leftValue}</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">{rightLabel}</div>
          <div className="font-semibold tabular-nums">{rightValue}</div>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">Difference</div>
          <div className="flex items-center gap-2">
            <DeltaBadge delta={delta} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const formatDelta = (delta: number) => {
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta}`;
};

export const DeltaBadge = ({ delta }: { delta: number }) => {
  if (delta === 0) return <Badge variant="secondary">0</Badge>;
  return (
    <Badge variant={delta > 0 ? "default" : "destructive"}>
      {formatDelta(delta)}
    </Badge>
  );
};

export default StatCard;
