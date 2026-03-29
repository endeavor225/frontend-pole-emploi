import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CircleAlertIcon, UserIcon, XIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "Ko", "Mo", "Go", "To"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function AvatarUpload({
  maxSize = 2 * 1024 * 1024, // 2MB default
  className,
  onFileChange,
  defaultAvatar,
  value, // file object
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const currentFile = value instanceof File ? value : null;
  const previewUrl = currentFile
    ? URL.createObjectURL(currentFile)
    : typeof value === "string"
      ? value
      : defaultAvatar;

  const handleFile = (file) => {
    setError(null);
    if (!file) return;
    if (file.size > maxSize) {
      setError(
        `Le fichier dépasse la taille maximale de ${formatBytes(maxSize)}`,
      );
      onFileChange?.(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Seules les images sont acceptées");
      onFileChange?.(null);
      return;
    }
    onFileChange?.(file);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    if (fileInputRef.current) fileInputRef.current.value = "";
    onFileChange?.(null);
  };

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {/* Avatar Preview */}
      <div className="relative">
        <div
          className={cn(
            "group/avatar relative h-24 w-24 cursor-pointer overflow-hidden rounded-full border border-dashed transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/20",
            previewUrl && "border-solid",
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <UserIcon className="text-muted-foreground h-6 w-6" />
            </div>
          )}
        </div>

        {/* Remove Button - only show when file is uploaded or default exists */}
        {(currentFile || previewUrl) && (
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={handleRemove}
            className="absolute right-1 -top-1 z-10 h-6 w-6 rounded-full bg-white dark:bg-zinc-800 hover:dark:bg-zinc-700 shadow-sm"
            aria-label="Remove avatar"
          >
            <XIcon className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Upload Instructions */}
      <div className="space-y-0.5 text-center">
        <p className="text-sm font-medium">
          {currentFile ? "Avatar ajouté" : "Ajouter une photo"}
        </p>
        <p className="text-xs text-muted-foreground">
          PNG, JPG jusqu'à {formatBytes(maxSize)}
        </p>
      </div>

      {/* Error Messages */}
      {error && (
        <Alert variant="destructive" className="mt-2 max-w-sm px-3 py-2">
          <CircleAlertIcon className="h-4 w-4" />
          <AlertTitle className="text-xs font-semibold mb-1">
            Erreur d'upload
          </AlertTitle>
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
