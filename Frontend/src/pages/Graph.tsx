import SimpleGraph, { type GraphNames } from "@/components/graph/SimpleGraph";
import ParentsSelector from "@/components/graph/GraphMisc/ParentsSelector";
import Separator from "@/components/Separator";
import SeveritySelector from "@/components/graph/GraphMisc/SeveritySelector";
import type { Severity } from "@/types/packages";
import { useBranch } from "@/utils/hooks/BranchProvider";
import { useState } from "react";
import NamesSelector from "@/components/graph/GraphMisc/NamesSelector";
import Legend from "@/components/graph/GraphMisc/Legend/Legend";
import NodeInformation from "@/components/graph/GraphMisc/NodeInformation/NodeInformation";
import { Button } from "@/components/ui/button";
import { useLazyGetProjectGraphExportQuery } from "@/store/api/projectsApi";
import { downloadBlob } from "@/utils/downloadBlob";
import { getPrettyDate } from "@/utils/dateHelper";
import PageHeader from "@/components/PageHeader";

const Graph = () => {
  const { branch, commit } = useBranch();
  const [selectedSeverity, setSelectedSeverity] = useState<
    Severity | undefined
  >();
  const [showNames, setShowNames] = useState<GraphNames>("severity");
  const [showParents, setShowParents] = useState(true);
  const [selectedNode, setSelectedNode] = useState<string | undefined>();

  const [triggerExport] = useLazyGetProjectGraphExportQuery();
  const onInformationClose = () => {
    setSelectedNode(undefined);
  };

  const onExportClick = async () => {
    if (!branch) return;

    const blob = await triggerExport({
      showParents: showParents,
      commitId: commit?.commitId,
      severityFilter: selectedSeverity,
      id: branch.id,
    }).unwrap();

    downloadBlob(
      blob,
      `graph-${branch.name}-${getPrettyDate()}-${selectedSeverity || "all"}.dot`,
    );
  };
  return (
    <div className="h-[calc(100vh-5rem)] max-h-[calc(100vh-5rem)] w-[calc(100vw-25rem)] max-w-[calc(100vw-25rem)] overflow-hidden">
      <PageHeader
        title="Dependency Graph"
        description="Visualize and analyze the dependency graph for the selected source"
      >
        <div className="flex flex-row gap-2">
          <Button variant={"outline"} onClick={onExportClick} className="mt-5">
            Export Graph
          </Button>
          <Separator />
          <SeveritySelector
            selected={selectedSeverity}
            onSelect={setSelectedSeverity}
          />
          <Separator />
          <NamesSelector selected={showNames} onSelect={setShowNames} />
          {selectedSeverity && (
            <>
              <Separator />
              <ParentsSelector
                selected={showParents}
                onSelect={setShowParents}
              />
            </>
          )}
        </div>
      </PageHeader>

      <Legend />
      <NodeInformation packageId={selectedNode} onClose={onInformationClose} />
      {branch && (
        <SimpleGraph
          onNodeClick={(node) => {
            setSelectedNode(node.id);
          }}
          commitId={commit?.commitId}
          branch={branch}
          severityFilter={selectedSeverity}
          showNames={showNames}
          showParents={showParents}
        />
      )}
    </div>
  );
};

export default Graph;
