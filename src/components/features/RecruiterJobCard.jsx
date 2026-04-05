import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Users, Eye, Pencil, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * ── RecruiterJobCard ──
 * Composant de carte pour afficher une offre d'emploi dans le catalogue du recruteur.
 */
export default function RecruiterJobCard({ offre, onDelete }) {
  // Le statut vient du serveur (active, expirée, etc.)
  const status = offre.statut || "active";
  const isActive = status === "active";

  return (
    <Card className="group hover:ring-2 hover:ring-primary/20 transition-all duration-300 border-none shadow-sm flex flex-col">
      <CardContent className="p-6 flex flex-col flex-1 pb-0">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {isActive ? (
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] uppercase font-bold tracking-wider">
                  Actif
                </Badge>
              ) : (
                <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-[10px] uppercase font-bold tracking-wider">
                  Expiré
                </Badge>
              )}
              {offre.typeOffre && (
                <Badge
                  variant="outline"
                  className="text-[10px] uppercase font-bold tracking-wider"
                >
                  {offre.typeOffre}
                </Badge>
              )}
            </div>
            <h4 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-3">
              {offre.titre}
            </h4>
          </div>
        </div>

        <div className="space-y-3 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary/60" />
            {offre.localisation || "Localisation non précisée"}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary/60" />
            Publié le {new Date(offre.createdAt).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2 bg-primary/5 p-2 rounded-lg border border-primary/10">
            <Users className="w-4 h-4 text-primary" />
            <span className="font-semibold text-primary">
              {offre.candidatures?.length || offre.candidaturesCount || 0}
            </span>
            <span className="text-xs">
              {" "}
              {offre.candidaturesCount <= 1 ? "candidature" : "candidatures"}
            </span>
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-muted flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5"
                  asChild
                >
                  <Link to={`/offres/${offre.id}`}>
                    <Eye className="w-4 h-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Aperçu</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5"
                  asChild
                >
                  <Link to={`/recruteur/offres/${offre.id}/candidatures`}>
                    <Users className="w-4 h-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Candidatures</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5"
                  asChild
                >
                  <Link to={`/recruteur/offres/${offre.id}/modifier`}>
                    <Pencil className="w-4 h-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Modifier</TooltipContent>
            </Tooltip>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                onClick={() => onDelete(offre)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Supprimer</TooltipContent>
          </Tooltip>
        </div>
      </CardContent>
    </Card>
  );
}
