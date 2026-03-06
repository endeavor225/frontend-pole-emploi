import { RouterProvider } from "react-router-dom";
import { SWRConfig } from "swr";
import { Toaster } from "@/components/ui/sonner";
import { router } from "@/router";
import { fetcher } from "@/api/fetcher";

function App() {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        errorRetryCount: 2,
        dedupingInterval: 5000,
      }}
    >
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </SWRConfig>
  );
}

export default App;
