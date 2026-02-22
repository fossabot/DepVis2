import { XYChart } from "@/components/chart/XYChart";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  useGetBranchHistoryQuery,
  useProcessBranchHistoryMutation,
} from "@/store/api/branchesApi";
import { ProcessStep } from "@/types/branches";
import { useBranch } from "@/utils/hooks/BranchProvider";
import { RefreshCcw } from "lucide-react";
import ViewSelector, { ViewType } from "./Components/ViewSelector";
import { useState } from "react";
import PageHeader from "@/components/PageHeader";

const BranchHistory = () => {
  const [selectedView, setSelectedView] = useState(ViewType.Both);

  return (
    <div className="flex flex-col gap-3 w-full h-full  max-h-full">
      <PageHeader
        title="Branch History"
        description="View and analyze branch history for the selected branch"
      >
        <ViewSelector selected={selectedView} onSelect={setSelectedView} />
      </PageHeader>
      <History selectedView={selectedView} />
    </div>
  );
};

const History = ({ selectedView }: { selectedView: ViewType }) => {
  const { branch } = useBranch();
  const {
    isFetching: isLoading,
    data,
    refetch,
  } = useGetBranchHistoryQuery(branch ? branch.id : "", { skip: !branch });
  const [mutate] = useProcessBranchHistoryMutation();

  const onProcessHistoryClick = async () => {
    if (branch) {
      await mutate(branch.id);
    }
  };

  if (!branch || isLoading || !data)
    return <div>Loading branch history...</div>;

  if (branch.isTag) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full">
        <Card className="flex flex-col justify-center items-center w-1/3 self-center ">
          <div className="p-4">
            Branch history is only available for branches.
          </div>
        </Card>
      </div>
    );
  }
  if (data?.processingStep === ProcessStep.NotStarted)
    return (
      <div className="flex flex-col items-center justify-center w-full h-full">
        <Card className="flex flex-col justify-center items-center w-1/3 self-center ">
          <div className="p-4">Branch History has not been processed yet</div>
          <Button onClick={onProcessHistoryClick} variant={"outline"}>
            Process Branch History
          </Button>
        </Card>
      </div>
    );

  if (data?.processingStep !== ProcessStep.Processed)
    return (
      <div className="flex flex-col items-center justify-center w-full h-full">
        <Card className="flex flex-col justify-center items-center w-1/3 self-center ">
          <div className="p-4">Branch History is being processed</div>
          <Button variant={"ghost"} onClick={refetch}>
            <RefreshCcw />
          </Button>
        </Card>
      </div>
    );

  return (
    <div className="h-full w-full flex flex-col justify-start">
      <div className="h-full max-h-10/12 flex flex-row items-start justify-center gap-2 pt-8">
        {selectedView !== ViewType.Vulnerabilities && (
          <XYChart
            className={`${selectedView === ViewType.Packages ? "h-11/12 " : "h-full w-1/2"}`}
            data={data.histories}
            isLoading={isLoading}
            xKey="commitMessage"
            yKey="packageCount"
            yLabel="Packages"
          />
        )}
        {selectedView !== ViewType.Packages && (
          <XYChart
            className={`${selectedView === ViewType.Vulnerabilities ? "h-11/12 " : "h-full w-1/2"}`}
            data={data.histories}
            isLoading={isLoading}
            xKey="commitMessage"
            yKey="vulnerabilityCount"
            yLabel="Vulnerabilities"
            color="#d12c2c"
          />
        )}
      </div>
    </div>
  );
};

export default BranchHistory;
