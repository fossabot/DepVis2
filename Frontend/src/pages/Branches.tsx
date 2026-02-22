import { DataTable } from "@/components/table/DataTable";
import { useGetBranchColumns } from "@/utils/columns/useGetBranchColumns";
import { useGetProjectId } from "@/utils/hooks/useGetProjectId";

import {
  useReactTable,
  getSortedRowModel,
  getCoreRowModel,
  type SortingState,
} from "@tanstack/react-table";
import { useCallback, useState } from "react";
import { XYChart } from "@/components/chart/XYChart";
import { toODataOrderBy } from "@/utils/odataHelper";
import { downloadBlob } from "@/utils/downloadBlob";
import { getPrettyDate } from "@/utils/dateHelper";
import {
  useGetProjectBranchesDetailedQuery,
  useLazyGetProjectBranchesDetailedExportQuery,
  useReprocessBranchMutation,
} from "@/store/api/branchesApi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/PageHeader";

const Branches = () => {
  const projectId = useGetProjectId();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [reprocess] = useReprocessBranchMutation();
  const { data = [], isLoading } = useGetProjectBranchesDetailedQuery({
    id: projectId,
    odata: toODataOrderBy(sorting),
  });

  const [triggerExport] = useLazyGetProjectBranchesDetailedExportQuery();

  const openReprocessDialog = useCallback(async (id: string) => {
    setProcessingId(id);
    setIsDialogOpen(true);
  }, []);

  const columns = useGetBranchColumns(openReprocessDialog, processingId);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
  });

  const onExportClick = async () => {
    const blob = await triggerExport({
      id: projectId,
      odata: toODataOrderBy(sorting),
    }).unwrap();

    downloadBlob(blob, `branches-${projectId}-${getPrettyDate()}.csv`);
  };

  const handleReprocess = async () => {
    if (!processingId) return;

    try {
      setIsDialogOpen(false);
      await reprocess({ id: processingId, projectId }).unwrap();
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelReprocess = () => {
    setProcessingId(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="flex flex-col gap-3 w-full h-full">
      <PageHeader
        hideSelector
        title="Branches"
        description="View and analyze branches in the selected project"
      />
      <div className="flex flex-row gap-10 w-full h-full justify-evenly">
        <div className="h-max-full w-2/3">
          <DataTable
            isLoading={isLoading}
            className="min-h-[calc(87vh)] max-h-[calc(87vh)]"
            table={table}
            onExportClick={onExportClick}
          />
        </div>
        <div className="flex flex-col gap-6 w-1/2 h-full">
          <XYChart
            isLoading={isLoading}
            className="min-h-[calc(42vh)] max-h-[calc(42vh)] w-full"
            data={data}
            xKey="name"
            yKey="packageCount"
            yLabel="Packages"
          />

          <XYChart
            data={data}
            isLoading={isLoading}
            className="min-h-[calc(42vh)] max-h-[calc(42vh)]"
            xKey="name"
            yKey="vulnerabilityCount"
            yLabel="Vulnerabilities"
            color="#d12c2c"
          />
        </div>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>Confirm Reprocessing</DialogHeader>
          <DialogDescription>
            Are you sure you want to reprocess this branch? This action cannot
            be undone and will remove all current branch data including branch
            history.
          </DialogDescription>

          <DialogFooter>
            <Button variant="outline" onClick={() => handleCancelReprocess()}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={() => handleReprocess()}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Branches;
