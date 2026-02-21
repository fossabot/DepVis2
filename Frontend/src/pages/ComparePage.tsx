import BranchSelector from "@/components/BranchSelector";
import { Card, CardTitle } from "@/components/ui/card";

const ComparePage = () => {
  return (
    <div className="gap-2 flex flex-col">
      <div className="flex flex-row">
        <BranchSelector />
        <div>hehe</div>
      </div>
      <div className="flex flex-col w-full gap-2">
        <Card>
          <CardTitle>Comparison Statistics</CardTitle>
        </Card>
        <div className="flex flex-row w-full h-full gap-2">
          <div className="w-1/2 h-full">
            <Card className="h-full">
              <CardTitle>Added in branch1 compared with branch2</CardTitle>
              <Card>
                <CardTitle>Packages</CardTitle>
              </Card>
              <Card>
                <CardTitle>Vulnerabilities</CardTitle>
              </Card>
            </Card>
          </div>
          <div className="w-1/2 h-full">
            <Card>
              <CardTitle>Removed in branch1 compared with branch2</CardTitle>
              <Card>
                <CardTitle>Packages</CardTitle>
              </Card>
              <Card>
                <CardTitle>Vulnerabilities</CardTitle>
              </Card>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparePage;
