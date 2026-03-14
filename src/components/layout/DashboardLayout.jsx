import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { useUiStore } from "@/store/uiStore";
import { cn } from "@/lib/utils";
import { ScrollToTop } from "@/components/shared/ScrollToTop";
import { ScrollToTopButton } from "@/components/shared/ScrollToTopButton";

export function DashboardLayout() {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);

  return (
    <div className="flex min-h-svh flex-col">
      <ScrollToTop />
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main
          className={cn(
            "flex-1 transition-all duration-300 ease-in-out",
            "p-4 md:p-6 lg:p-8 md:ml-0",
          )}
        >
          <Outlet />
        </main>
      </div>
      <ScrollToTopButton />
    </div>
  );
}
