import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Clock,
  Users,
  Eye,
  Pencil,
  Trash2,
  MoreVertical,
  CheckCircle2,
  Archive,
  AlertTriangle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * ── RecruiterJobCard ──
 * Composant de carte pour afficher une offre d'emploi dans le catalogue du recruteur.
 */
export default function RecruiterJobCard({ offre, onDelete, onStatusChange }) {
  const status = offre.statut || "active";

  // Logique d'expiration (comparaison par date sans l'heure)
  const isExpired =
    offre.dateLimite &&
    new Date(offre.dateLimite).setHours(0, 0, 0, 0) <
      new Date().setHours(0, 0, 0, 0);

  const getStatusBadge = () => {
    // Si suspendue, on affiche uniquement le badge Suspendue
    if (status === "suspendue") {
      return (
        <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-[10px] uppercase font-bold tracking-wider">
          <Clock className="w-3 h-3 mr-1" /> Suspendue
        </Badge>
      );
    }

    // Si le délai est dépassé, on affiche uniquement le badge Délai dépassé
    if (isExpired) {
      return (
        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] uppercase font-bold tracking-wider">
          <Clock className="w-3 h-3 mr-1" /> Expirée
        </Badge>
      );
    }

    // Sinon, on affiche le statut administratif (si pas active) + En cours
    return (
      <>
        {status === "expiree" && (
          <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-[10px] uppercase font-bold tracking-wider">
            <AlertTriangle className="w-3 h-3 mr-1" /> Expirée
          </Badge>
        )}
        <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px] uppercase font-bold tracking-wider">
          <Clock className="w-3 h-3 mr-1" /> En cours
        </Badge>
      </>
    );
  };

  return (
    <Card className="group hover:ring-2 hover:ring-primary/20 transition-all duration-300 border-none shadow-sm flex flex-col bg-white overflow-hidden">
      <CardContent className="p-6 flex flex-col flex-1 pb-0">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {offre.typeOffre && (
                <Badge
                  variant="outline"
                  className="text-[10px] uppercase font-bold tracking-wider"
                >
                  {offre.typeOffre}
                </Badge>
              )}

              {getStatusBadge()}
            </div>
            <h4 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2 pr-2">
              {offre.titre}
            </h4>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onStatusChange(offre, "active")}
                disabled={status === "active"}
                className="cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />
                Rendre Actif
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onStatusChange(offre, "suspendue")}
                disabled={status === "suspendue"}
                className="cursor-pointer"
              >
                <Clock className="w-4 h-4 mr-2 text-red-500" />
                Suspendre
              </DropdownMenuItem>
              {/* <DropdownMenuItem
                onClick={() => onStatusChange(offre, "expiree")}
                disabled={status === "expiree"}
                className="cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" />
                Marquer comme Expiré
              </DropdownMenuItem> */}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link to={`/recruteur/offres/${offre.id}/modifier`}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Modifier
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(offre)}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-3 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary/60" />
            <span className="truncate">
              {offre.localisation || "Localisation non précisée"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary/60" />
            Publié le {new Date(offre.createdAt).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2 bg-primary/5 p-3 rounded-xl border border-primary/10">
            <Users className="w-5 h-5 text-primary" />
            <div className="">
              <span className="font-bold text-primary leading-none">
                {offre.candidatures?.length ||
                  offre.candidaturesCount ||
                  0}{" "}
              </span>
              <span className="text-[10px] uppercase font-bold text-primary/60 pl-0.5">
                {offre.candidaturesCount <= 1 ? "candidature" : "candidatures"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-muted flex items-center justify-between pb-6">
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full transition-all"
                  asChild
                >
                  <Link to={`/offres/${offre.id}`}>
                    <Eye className="w-4 h-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Aperçu public</TooltipContent>
            </Tooltip>

            {/* <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full transition-all"
                  asChild
                >
                  <Link to={`/recruteur/offres/${offre.id}/candidatures`}>
                    <Users className="w-4 h-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Voir les candidatures</TooltipContent>
            </Tooltip> */}
          </div>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-full h-8 text-xs hover:bg-primary hover:text-white transition-all"
          >
            <Link to={`/recruteur/offres/${offre.id}/candidatures`}>
              Voir les candidatures
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
