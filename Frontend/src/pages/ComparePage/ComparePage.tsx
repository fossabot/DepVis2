import BranchSelector from "@/components/BranchSelector";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useLazyGetBranchComparisonQuery } from "@/store/api/branchesApi";
import {
  type Branch,
  type BranchCommitsDto,
  type BranchComparison,
} from "@/types/branches";
import { useBranch } from "@/utils/hooks/BranchProvider";
import { Minus, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ListPanel from "./Components/ListPanel";
import StatCard, { DeltaBadge } from "./Components/StatCard";
import PageHeader from "@/components/PageHeader";

const ComparePage = () => {
  const [triggerCompare, { data, isLoading, isFetching }] =
    useLazyGetBranchComparisonQuery();

  const { branch, commit } = useBranch();
  const [compareBranch, setCompareBranch] = useState<Branch | null>(null);
  const [compareCommit, setCompareCommit] = useState<BranchCommitsDto | null>(
    null,
  );

  useEffect(() => {
    if (branch && compareBranch) {
      triggerCompare({
        branchId: commit?.commitId ?? branch.id,
        compareToBranchId: compareCommit?.commitId ?? compareBranch?.id ?? "",
      });
    }
  }, [branch, commit, compareBranch, compareCommit, triggerCompare]);

  const comparison = data as BranchComparison | undefined;

  const comparedBranchName = `${compareBranch?.name ?? ""} ${compareCommit?.commitName ? "- " + compareCommit.commitName : ""}`;

  const derived = useMemo(() => {
    if (!comparison) return null;

    const packageDelta =
      comparison.comparedBranchPackageCount - comparison.mainBranchPackageCount;
    const vulnDelta =
      comparison.comparedBranchVulnerabilityCount -
      comparison.mainBranchVulnerabilityCount;

    return {
      packageDelta,
      vulnDelta,
      addedPackagesCount: comparison.addedPackages.length,
      removedPackagesCount: comparison.removedPackages.length,
      addedVulnsCount: comparison.addedVulnerabilityIds.length,
      removedVulnsCount: comparison.removedVulnerabilityIds.length,
      netPackages:
        comparison.addedPackages.length - comparison.removedPackages.length,
      netVulns:
        comparison.addedVulnerabilityIds.length -
        comparison.removedVulnerabilityIds.length,
    };
  }, [comparison]);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Branch Comparison"
        description="Compare packages and vulnerabilities between branches"
        secondaryDescription="Select two branches (and optional commits) to see what changed."
      >
        <div className="min-w-0 flex-1">
          <div className="mb-2 text-xs font-medium text-muted-foreground">
            Compare to
          </div>
          <BranchSelector
            branch={compareBranch}
            setBranch={setCompareBranch}
            commit={compareCommit}
            setCommit={setCompareCommit}
          />
        </div>
      </PageHeader>

      {(isLoading || isFetching) && (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && !isFetching && !comparison && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">No comparison yet</CardTitle>
            <CardDescription>
              Pick a main branch and a compare branch to load results.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              Nothing to display.
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isFetching && comparison && derived && (
        <>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Packages"
              description="Total package count per side"
              leftLabel={`${branch?.name} ${commit?.commitName ? "- " + commit.commitName : ""}`}
              leftValue={comparison.mainBranchPackageCount}
              rightLabel={comparedBranchName}
              rightValue={comparison.comparedBranchPackageCount}
              delta={derived.packageDelta}
            />
            <StatCard
              title="Vulnerabilities"
              description="Total vulnerability count per side"
              leftLabel={`${branch?.name} ${commit?.commitName ? "- " + commit.commitName : ""}`}
              leftValue={comparison.mainBranchVulnerabilityCount}
              rightLabel={comparedBranchName}
              rightValue={comparison.comparedBranchVulnerabilityCount}
              delta={derived.vulnDelta}
            />

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Package changes</CardTitle>
                <CardDescription className="text-xs">
                  Added vs removed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Plus className="h-4 w-4" /> Added
                  </div>
                  <Badge className="tabular-nums">
                    {derived.addedPackagesCount}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Minus className="h-4 w-4" /> Removed
                  </div>
                  <Badge variant="secondary" className="tabular-nums">
                    {derived.removedPackagesCount}
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">Net</div>
                  <DeltaBadge delta={derived.netPackages} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  Vulnerability changes
                </CardTitle>
                <CardDescription className="text-xs">
                  Added vs removed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Plus className="h-4 w-4" /> Added
                  </div>
                  <Badge className="tabular-nums">
                    {derived.addedVulnsCount}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Minus className="h-4 w-4" /> Removed
                  </div>
                  <Badge variant="secondary" className="tabular-nums">
                    {derived.removedVulnsCount}
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">Net</div>
                  <DeltaBadge delta={derived.netVulns} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <ListPanel
              title={`Added packages (in ${comparedBranchName})`}
              icon={<Plus className="h-4 w-4" />}
              items={comparison.addedPackages}
              emptyLabel="No packages were added."
            />
            <ListPanel
              title={`Removed packages (in ${comparedBranchName})`}
              icon={<Minus className="h-4 w-4" />}
              items={comparison.removedPackages}
              emptyLabel="No packages were removed."
            />
            <ListPanel
              title={`Added vulnerabilities (in ${comparedBranchName})`}
              icon={<Plus className="h-4 w-4" />}
              items={comparison.addedVulnerabilityIds}
              emptyLabel="No vulnerabilities were added."
            />
            <ListPanel
              title={`Removed vulnerabilities (in ${comparedBranchName})`}
              icon={<Minus className="h-4 w-4" />}
              items={comparison.removedVulnerabilityIds}
              emptyLabel="No vulnerabilities were removed."
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ComparePage;
