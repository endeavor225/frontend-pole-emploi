import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { ScrollToTop } from "@/components/shared/ScrollToTop";
import { ScrollToTopButton } from "@/components/shared/ScrollToTopButton";

export function DashboardLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-[#F9FAFB]">
      <ScrollToTop />
      <Navbar />
      <div className="flex flex-col md:flex-row flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 gap-6 md:gap-8 mt-4 md:mt-8">
        <Sidebar />
        <main className="flex-1 pb-20 min-w-0">
          <Outlet />
        </main>
      </div>
      <ScrollToTopButton />
    </div>
  );
}
