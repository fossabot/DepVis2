import type { PropsWithChildren } from "react";
import { GlobalBranchSelector } from "./BranchSelector";
import { CardTitle, CardDescription } from "./ui/card";
import { Separator } from "./ui/separator";

type PageHeaderProps = {
  title: string;
  description?: string;
  secondaryDescription?: string;
  hideSelector?: boolean;
} & PropsWithChildren;

const PageHeader = ({
  title,
  description,
  secondaryDescription,
  children,
  hideSelector = false,
}: PageHeaderProps) => {
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4">
      <CardTitle className="text-xl">{title}</CardTitle>
      {description && <CardDescription>{description}</CardDescription>}
      {secondaryDescription && (
        <CardDescription>{secondaryDescription}</CardDescription>
      )}
      {!hideSelector && (
        <>
          <Separator />
          <div className="flex flex-row items-center">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="min-w-0 flex-1">
                <GlobalBranchSelector />
              </div>

              {children}
            </div>
          </div>
        </>
      )}
      {hideSelector && children}
    </div>
  );
};

export default PageHeader;
