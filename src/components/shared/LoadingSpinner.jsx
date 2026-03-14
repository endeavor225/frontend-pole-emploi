import { Loader2 } from "lucide-react";

export function LoadingSpinner({ className = "", size = 24, text = "" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <Loader2
        className={`animate-spin text-primary ${className}`}
        size={size}
      />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}
