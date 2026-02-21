import {
  Home,
  GitBranch,
  Package,
  AlertTriangle,
  CircleDashed,
  History,
  Settings,
  ArrowLeftRight,
} from "lucide-react";
import { useParams, useLocation } from "react-router-dom";

const useSidebar = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  if (!id) {
    return { data: { navMain: [], navBottom: [] } };
  }

  const navItems = [
    {
      title: "Home",
      url: `/${id}`,
      icon: Home,
    },
    {
      title: "Branches",
      url: `/${id}/branches`,
      icon: GitBranch,
    },
    {
      title: "Packages",
      url: `/${id}/packages`,
      icon: Package,
    },
    {
      title: "Vulnerabilities",
      url: `/${id}/vulnerabilities`,
      icon: AlertTriangle,
    },
    {
      title: "Graph",
      url: `/${id}/graph`,
      icon: CircleDashed,
    },
    {
      title: "Compare",
      url: `/${id}/compare`,
      icon: ArrowLeftRight,
    },
    {
      title: "Branch History",
      url: `/${id}/branch-history`,
      icon: History,
    },
  ];

  const navBottom = [
    {
      title: "Project Configuration",
      url: `/${id}/edit`,
      icon: Settings,
    },
  ];

  const data = {
    navMain: navItems.map((item) => ({
      ...item,
      isActive: location.pathname === item.url,
    })),
    navBottom: navBottom.map((item) => ({
      ...item,
      isActive: location.pathname === item.url,
    })),
  };

  return { data };
};

export default useSidebar;
