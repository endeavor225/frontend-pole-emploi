import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Tag, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import CompanyAvatar from "@/components/shared/CompanyAvatar";

export default function CompanyListCard({ entreprise }) {
  const nom = entreprise.nomEntreprise || "Entreprise";
  const domaine = entreprise.domaine?.libelle;

  return (
    <Card className="group relative mx-auto w-full max-w-sm sm:max-w-none overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 bg-card border-border/60 flex flex-col h-full rounded-2xl pt-0 cursor-pointer">
      <Link
        to={`/entreprises/${entreprise.id}`}
        className="flex flex-col h-full focus:outline-none focus-visible:ring-2 ring-primary"
      >
        {/* IMAGE / LOGO (Aspect Video pleine largeur) - PREMIÈRE PARTIE */}
        <div className="relative w-full aspect-video bg-white overflow-hidden shrink-0 border-b border-border/40 flex items-center justify-center">
          {/* Overlay subtil au survol (similaire à bg-black/35 mais interactif) */}
          <div className="absolute inset-0 z-30 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />

          <CompanyAvatar
            name={nom}
            logoPath={entreprise.logoPath}
            className="relative z-20 w-full h-full rounded-none border-0 bg-transparent"
          />
        </div>

        {/* CONTENU (DEUXIÈME PARTIE : Haut et Bas) */}
        <div className="flex flex-col flex-1 relative p-6 pb-5">
          {/* Informations Utiles en HAUT */}
          <CardHeader className="p-0 flex-none mb-4">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {domaine && (
                <Badge
                  variant="secondary"
                  className="font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors border-0"
                >
                  {domaine}
                </Badge>
              )}
              {entreprise.ville && (
                <Badge
                  variant="outline"
                  className="font-medium text-muted-foreground gap-1 border-border/60"
                >
                  <MapPin className="w-3 h-3" />
                  <span className="truncate max-w-[120px]">
                    {entreprise.ville}
                  </span>
                </Badge>
              )}
            </div>

            <CardTitle className="text-xl font-bold line-clamp-2 leading-tight group-hover:text-primary transition-colors">
              {nom}
            </CardTitle>

            {entreprise.description ? (
              <CardDescription className="line-clamp-2 mt-2 leading-relaxed text-sm text-muted-foreground">
                {entreprise.description}
              </CardDescription>
            ) : (
              <CardDescription className="italic mt-2 text-sm text-muted-foreground/50">
                Aucune description fournie
              </CardDescription>
            )}
          </CardHeader>

          {/* L'espace flexible */}
          <CardContent className="flex-1 p-0" />

          {/* Informations Utiles en BAS (Le CTA) */}
          <CardFooter className="p-0 mt-auto pt-6 border-t border-border/40">
            <Button
              variant="default"
              className="w-full font-semibold shadow-sm group-hover:shadow-md transition-all"
            >
              Découvrir le profil
              <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardFooter>
        </div>
      </Link>
    </Card>
  );
}
