import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Clock,
  Building2,
  Briefcase,
  Heart,
  HeartOff,
} from "lucide-react";

export function OffreCard({
  offre,
  isFavori = false,
  onToggleFavori,
  showActions = true,
}) {
  const entreprise = offre.entreprise || {};

  return (
    <Card className="group relative flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30">
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1">
            <CardTitle className="text-lg leading-tight line-clamp-2">
              <Link
                to={`/offres/${offre.id}`}
                className="hover:text-primary transition-colors"
              >
                {offre.titre}
              </Link>
            </CardTitle>
            {entreprise.nomEntreprise && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Building2 className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{entreprise.nomEntreprise}</span>
              </div>
            )}
          </div>
          {showActions && onToggleFavori && (
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={(e) => {
                e.preventDefault();
                onToggleFavori(offre);
              }}
            >
              {isFavori ? (
                <Heart className="h-4 w-4 fill-destructive text-destructive" />
              ) : (
                <Heart className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-4 relative z-10">
        {offre.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
            {offre.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {offre.typeOffre && (
            <Badge variant="secondary">
              <Briefcase className="mr-1 h-3 w-3" />
              {offre.typeOffre}
            </Badge>
          )}
          {offre.localisation && (
            <Badge variant="outline">
              <MapPin className="mr-1 h-3 w-3" />
              {offre.localisation}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-4 border-t relative z-10 bg-muted/10 group-hover:bg-primary/5 transition-colors duration-300">
        <div className="flex w-full items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {offre.domaines?.map((d) => (
              <Badge key={d.id} variant="outline" className="text-xs">
                {d.libelle}
              </Badge>
            ))}
          </div>
          {offre.createdAt && (
            <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
              <Clock className="inline h-3 w-3 mr-1" />
              {new Date(offre.createdAt).toLocaleDateString("fr-FR")}
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
