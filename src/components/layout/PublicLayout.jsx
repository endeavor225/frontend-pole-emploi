import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ScrollToTop } from "@/components/shared/ScrollToTop";
import { ScrollToTopButton } from "@/components/shared/ScrollToTopButton";

export function PublicLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
}
