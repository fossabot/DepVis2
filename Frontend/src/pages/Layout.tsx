import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { BranchProvider } from "@/utils/hooks/BranchProvider";
import { Outlet, useLocation } from "react-router-dom";

const Layout = () => {
  const location = useLocation();

  let pageName = location.pathname;

  if (pageName.includes("vulnerabilities")) {
    pageName = "Vulnerabilities";
  } else if (pageName.includes("branches")) {
    pageName = "Branches";
  } else if (pageName.includes("graph")) {
    pageName = "Graph";
  } else if (pageName.includes("packages")) {
    pageName = "Packages";
  } else if (pageName.includes("branch-history")) {
    pageName = "Branch History";
  } else if (pageName.includes("edit")) {
    pageName = "Project Configuration";
  } else if (pageName.includes("compare")) {
    pageName = "Compare";
  } else {
    pageName = "Home";
  }

  return (
    <SidebarProvider>
      <BranchProvider>
        <AppSidebar />
        <SidebarInset className="z-1">
          <div className="px-16 py-4 h-full w-full">
            <Outlet />
          </div>
        </SidebarInset>
      </BranchProvider>
    </SidebarProvider>
  );
};

export default Layout;
