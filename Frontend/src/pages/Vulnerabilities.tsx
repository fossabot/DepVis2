import { PieCustomChart } from "@/components/chart/PieCustomChart";
import PageHeader from "@/components/PageHeader";
import { DataTable } from "@/components/table/DataTable";
import VulnerabilityCard from "@/components/VulnerabilityCard";
import {
  useLazyGetVulnerabilitiesExportQuery,
  useLazyGetVulnerabilitiesQuery,
} from "@/store/api/projectsApi";
import type { Severity } from "@/types/packages";
import type { VulnerabilitySmallDto } from "@/types/vulnerabilities";
import { buildOdata } from "@/utils/buildVulnerabilitiesOdata";
import { useGetVulnerabilitiesColumns } from "@/utils/columns/useGetVulnerabilitiesColumns";
import { getPrettyDate } from "@/utils/dateHelper";
import { downloadBlob } from "@/utils/downloadBlob";
import { useBranch } from "@/utils/hooks/BranchProvider";
import {
  joinODataFilters,
  toODataFilter,
  toODataOrderBy,
} from "@/utils/odataHelper";
import { riskToColor } from "@/utils/riskToColor";
import {
  useReactTable,
  getSortedRowModel,
  getCoreRowModel,
  getPaginationRowModel,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";

const Vulnerabilities = () => {
  const { branch, commit, isLoading: isLoadingBranch } = useBranch();
  const columns = useGetVulnerabilitiesColumns();
  const [riskFilter, setRiskFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

  const [fetchVulnerabilities, { data, isFetching: isLoading, isSuccess }] =
    useLazyGetVulnerabilitiesQuery();
  const [triggerExport] = useLazyGetVulnerabilitiesExportQuery();

  const [selectedVulnerability, setSelectedVulnerability] =
    useState<VulnerabilitySmallDto | null>(null);

  const table = useReactTable({
    data: data?.vulnerabilities || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    getPaginationRowModel: getPaginationRowModel(),
    manualSorting: true,
    manualFiltering: true,
    getCoreRowModel: getCoreRowModel(),
  });

  useEffect(() => {
    if (!branch) return;

    const chartOdata = buildOdata({ severity: riskFilter || "" });
    const filterOdata = toODataFilter(columnFilters);
    const filter = joinODataFilters([chartOdata, filterOdata]);
    const sortOdata = toODataOrderBy(sorting);
    const fullOdata = [filter, sortOdata].filter(Boolean).join("&");

    fetchVulnerabilities(
      {
        id: branch.id,
        commitId: commit?.commitId,
        odata: fullOdata,
      },
      true,
    );
  }, [
    branch,
    riskFilter,
    sorting,
    columnFilters,
    fetchVulnerabilities,
    commit,
  ]);

  const onRiskClick = (name: string) => {
    setRiskFilter((prev) => (prev === name ? "" : name));
  };

  const onExportClick = async () => {
    if (!branch) return;

    const chartOdata = buildOdata({ severity: riskFilter || "" });
    const filterOdata = toODataFilter(columnFilters);
    const filter = joinODataFilters([chartOdata, filterOdata]);
    const sortOdata = toODataOrderBy(sorting);
    const fullOdata = [filter, sortOdata].filter(Boolean).join("&");

    const blob = await triggerExport({
      id: branch.id,
      commitId: commit?.commitId,
      odata: fullOdata,
    }).unwrap();

    downloadBlob(
      blob,
      `vulnerabilities-${branch.name}${commit ? `-${commit.commitName}` : ""}-${getPrettyDate()}.csv`,
    );
  };

  return (
    <div className="flex flex-col gap-3 w-full h-full">
      <div className="flex flex-col w-full h-full justify-evenly gap-2">
        <PageHeader
          title="Vulnerabilities"
          description="View and analyze vulnerabilities in the selected source"
        />

        {!isLoadingBranch && branch && (
          <div className="flex flex-row gap-10 w-full h-full justify-evenly">
            <div className="h-max-full w-1/2">
              <DataTable
                onExportClick={onExportClick}
                isLoading={isLoading || !isSuccess}
                onClick={(row) => setSelectedVulnerability(row)}
                className="min-h-[calc(100vh-9rem)] max-h-[calc(100vh-9rem)]"
                table={table}
              />
            </div>
            <div className="flex flex-col gap-6 w-1/2 h-full ">
              <PieCustomChart
                title="Risk Severities"
                className="min-h-[calc(42vh)] max-h-[calc(42vh)]"
                pies={
                  data?.risks.map((risk) => ({
                    ...risk,
                    color: riskToColor(risk.name as Severity),
                  })) ?? []
                }
                filteredBy={riskFilter}
                isLoading={isLoading || !isSuccess}
                onSliceClick={onRiskClick}
              />
              <div
                className={`flex items-center justify-center self-center h-1/2 w-full`}
              >
                <VulnerabilityCard
                  selectedVulnerability={selectedVulnerability}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Vulnerabilities;
