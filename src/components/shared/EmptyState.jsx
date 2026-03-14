import { FileQuestion } from "lucide-react";

export function EmptyState({
  icon: Icon = FileQuestion,
  title = "Aucun résultat",
  description = "",
  children,
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="rounded-full bg-muted p-4">
        <Icon className="size-8 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground max-w-sm">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}
