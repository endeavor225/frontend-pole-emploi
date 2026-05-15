import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingSpinner({ className = "", size = 32, text = "", fullScreen = false }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 w-full animate-in fade-in duration-500",
        fullScreen ? "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" : "min-h-[60vh]"
      )}
    >
      <div className="relative flex items-center justify-center">
        {/* Douce lueur d'arrière-plan */}
        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
        
        {/* Conteneur Glassmorphism */}
        <div className="relative bg-background/60 p-4 rounded-2xl shadow-sm border border-primary/10 backdrop-blur-md">
          <Loader2
            className={cn("animate-spin text-primary", className)}
            size={size}
            strokeWidth={2.5}
          />
        </div>
      </div>
      
      {text && (
        <p className="text-sm font-medium text-muted-foreground animate-pulse mt-2">
          {text}
        </p>
      )}
    </div>
  );
}
