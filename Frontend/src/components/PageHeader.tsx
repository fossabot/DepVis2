import type { PropsWithChildren } from "react";
import { GlobalBranchSelector } from "./BranchSelector";
import { CardTitle, CardDescription } from "./ui/card";
import { Separator } from "./ui/separator";

type PageHeaderProps = {
  title: string;
  description?: string;
  secondaryDescription?: string;
} & PropsWithChildren;

const PageHeader = ({
  title,
  description,
  secondaryDescription,
  children,
}: PageHeaderProps) => {
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4">
      <CardTitle className="text-xl">{title}</CardTitle>
      {description && <CardDescription>{description}</CardDescription>}
      {secondaryDescription && (
        <CardDescription>{secondaryDescription}</CardDescription>
      )}

      <Separator />

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="min-w-0 flex-1">
          <GlobalBranchSelector />
        </div>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
};

export default PageHeader;
