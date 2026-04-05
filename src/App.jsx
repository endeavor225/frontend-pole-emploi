import { RouterProvider } from "react-router-dom";
import { SWRConfig } from "swr";
import { Toaster } from "@/components/ui/sonner";
import { router } from "@/router";
import { fetcher } from "@/api/fetcher";
import { TooltipProvider } from "@/components/ui/tooltip";

function App() {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: true, // Recommandé pour la fraîcheur des données
        revalidateOnReconnect: true, // Très utile pour les connexions mobiles instables
        refreshInterval: 0, // Pas de polling automatique (on évite de surcharger le serveur)
        errorRetryCount: 3, // Un peu plus de souplesse pour les erreurs réseau
        dedupingInterval: 2000, // 2 secondes suffisent généralement pour éviter les requêtes en double
        shouldRetryOnError: true,
      }}
    >
      <TooltipProvider>
        <RouterProvider router={router} />
        <Toaster richColors position="top-right" />
      </TooltipProvider>
    </SWRConfig>
  );
}

export default App;
