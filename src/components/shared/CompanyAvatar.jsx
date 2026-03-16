import { useState } from "react";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:3333/api"
).replace(/\/api$/, "");

/**
 * Shared CompanyAvatar component with fallback to initials/icon
 * @param {string} name - The name of the company
 * @param {string} logoPath - The path to the company logo
 * @param {number} size - The size in pixels (width and height)
 * @param {string} className - Additional CSS classes
 */
export default function CompanyAvatar({
  name = "",
  logoPath = null,
  size,
  className,
}) {
  const [imgError, setImgError] = useState(false);

  // Palette de couleurs dérivée du premier caractère du nom
  const palettes = [
    { bg: "#FEE2E2", fg: "#991B1B" },
    { bg: "#D1FAE5", fg: "#065F46" },
    { bg: "#DBEAFE", fg: "#1E40AF" },
    { bg: "#FEF3C7", fg: "#92400E" },
    { bg: "#EDE9FE", fg: "#5B21B6" },
    { bg: "#CCFBF1", fg: "#134E4A" },
    { bg: "#FFEDD5", fg: "#9A3412" },
    { bg: "#FCE7F3", fg: "#9D174D" },
  ];

  const idx = (name?.charCodeAt(0) || 0) % palettes.length;
  const { bg, fg } = palettes[idx];

  /* URL complète du logo */
  const logoUrl = logoPath && !imgError ? `${API_BASE}${logoPath}` : null;

  const style = size ? { width: size, height: size } : {};

  if (logoUrl) {
    return (
      <div
        className={cn(
          "shrink-0 rounded-xl overflow-hidden border border-border bg-muted/30 flex items-center justify-center",
          className,
        )}
        style={style}
      >
        <img
          src={logoUrl}
          alt={name}
          className="w-full h-full object-contain p-1"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl font-semibold select-none shrink-0",
        className,
      )}
      style={{
        backgroundColor: bg,
        color: fg,
        ...style,
        fontSize: size ? size * 0.35 : "inherit",
      }}
    >
      {name && name.length > 0 ? (
        name.charAt(0).toUpperCase()
      ) : (
        <Building2 className="opacity-80 w-1/2 h-1/2" />
      )}
    </div>
  );
}
