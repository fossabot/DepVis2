import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import CopyButton from "./CopyButton";

const ListPanel = ({
  title,
  icon,
  items,
  emptyLabel,
  maxHeightClass = "max-h-[320px]",
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  emptyLabel: string;
  maxHeightClass?: string;
}) => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2 text-base">
              {icon}
              <span className="truncate">{title}</span>
            </CardTitle>
            <CardDescription className="text-xs">
              {items.length} total
            </CardDescription>
          </div>

          <CopyButton text={items.join("\n")} />
        </div>
      </CardHeader>

      <CardContent>
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            {emptyLabel}
          </div>
        ) : (
          <div className={`overflow-auto pr-1 ${maxHeightClass}`}>
            <ul className="space-y-2">
              {items.map((x) => (
                <li
                  key={x}
                  className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
                >
                  <span className="min-w-0 truncate font-mono text-xs">
                    {x}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ListPanel;
