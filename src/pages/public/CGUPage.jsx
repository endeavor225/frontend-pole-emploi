import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  FileText,
  UserCheck,
  Scale,
  AlertCircle,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const CGUPage = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const lastUpdate = "16 Mars 2026";

  const sections = [
    {
      id: "definitions",
      title: "1. Définitions",
      icon: <FileText className="h-5 w-5 text-primary" />,
      content: (
        <div className="space-y-4">
          <p>
            Dans les présentes Conditions Générales d'Utilisation, les termes
            suivants ont la signification ci-dessous :
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Plateforme :</strong> Désigne le site web pajdef.com et
              tous ses services associés.
            </li>
            <li>
              <strong>PAJDEF :</strong> Plateforme d’Actions de la Jeunesse pour
              le Développement du Département de Ferké.
            </li>
            <li>
              <strong>Utilisateur :</strong> Toute personne (Candidat ou
              Recruteur) accédant aux services de la Plateforme.
            </li>
            <li>
              <strong>Services :</strong> L'ensemble des fonctionnalités mises à
              disposition par la Plateforme (recherche d'emploi, dépôt de CV,
              publication d'offres).
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "objet",
      title: "2. Objet",
      icon: <Scale className="h-5 w-5 text-primary" />,
      content: (
        <p>
          Les présentes CGU ont pour objet de définir les modalités et
          conditions dans lesquelles la PAJDEF met à la disposition des
          Utilisateurs sa Plateforme de mise en relation entre demandeurs
          d'emploi (Candidats) et employeurs (Recruteurs), principalement dans
          le département de Ferkessédougou et la région du Tchologo.
        </p>
      ),
    },
    {
      id: "services",
      title: "3. Description des Services",
      icon: <ChevronRight className="h-5 w-5 text-primary" />,
      content: (
        <div className="space-y-4">
          <p>La Plateforme permet notamment :</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-muted/50 border-none">
              <CardContent className="pt-6">
                <h4 className="font-bold mb-2">Pour les Candidats</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Création d'un profil professionnel</li>
                  <li>• Consultation et postulation aux offres</li>
                  <li>• Gestion des candidatures et favoris</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-muted/50 border-none">
              <CardContent className="pt-6">
                <h4 className="font-bold mb-2">Pour les Recruteurs</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Publication d'offres d'emploi</li>
                  <li>• Gestion des entreprises et logos</li>
                  <li>• Suivi des candidatures reçues</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },
    {
      id: "engagements",
      title: "4. Engagements de l'Utilisateur",
      icon: <UserCheck className="h-5 w-5 text-primary" />,
      content: (
        <div className="space-y-4 text-muted-foreground">
          <p>
            L'Utilisateur s'engage à utiliser la Plateforme conformément aux
            lois en vigueur et aux présentes CGU.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Fournir des informations exactes et sincères lors de son
              inscription.
            </li>
            <li>Ne pas usurper l'identité d'un tiers.</li>
            <li>
              Respecter la confidentialité de ses identifiants de connexion.
            </li>
            <li>
              Ne pas publier de contenus illicites, injurieux ou
              discriminatoires.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: "donnees",
      title: "5. Protection des Données Personnelles",
      icon: <ShieldCheck className="h-5 w-5 text-primary" />,
      content: (
        <div className="space-y-3">
          <p>
            Conformément à la législation sur la protection des données à
            caractère personnel, la PAJDEF s'engage à protéger la vie privée de
            ses Utilisateurs.
          </p>
          <p className="text-muted-foreground">
            Les données collectées sont nécessaires à la fourniture des
            services. Elles ne sont jamais cédées à des tiers à des fins
            commerciales sans votre consentement explicite.
          </p>
          <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 flex gap-3">
            <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm">
              Vous disposez d'un droit d'accès, de modification et de
              suppression de vos données via les paramètres de votre compte.
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 pt-10">
      <div className="container max-w-5xl px-4 mx-auto">
        {/* Header Section */}
        <div className="mb-12 space-y-4">
          <Link to="/">
            <Button variant="ghost" className="gap-1.5 -ml-2 mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Button>
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground lg:text-6xl">
            Conditions Générales{" "}
            <span className="text-primary italic">d'Utilisation</span>
          </h1>
          <div className="flex items-center gap-2 text-muted-foreground font-medium bg-muted/50 w-fit px-4 py-1 rounded-full text-sm">
            <FileText className="h-4 w-4" />
            Dernière mise à jour : {lastUpdate}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Navigation Sidebar (Desktop) */}
          <div className="hidden lg:block space-y-2 sticky top-24 h-fit">
            <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground px-4 mb-4">
              Sommaire
            </h3>
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="block px-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all border-l-2 border-transparent hover:border-primary"
              >
                {section.title}
              </a>
            ))}
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3 space-y-12">
            <ScrollArea className="h-full">
              <Card className="border-none shadow-xl bg-background/50 backdrop-blur-sm sm:rounded-3xl">
                <CardContent className="p-8 md:p-12 space-y-12">
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    <p className="text-lg leading-relaxed text-muted-foreground">
                      Bienvenue sur la plateforme de recrutement de la PAJDEF.
                      La Plateforme d’Actions de la Jeunesse pour le
                      Développement du Département de Ferké (PAJDEF) est une
                      organisation dédiée à l'épanouissement de la jeunesse et
                      au développement communautaire à Ferkessédougou.
                    </p>
                    <p className="text-muted-foreground">
                      L'accès et l'utilisation de cette plateforme sont soumis à
                      l'acceptation sans réserve des présentes conditions.
                    </p>
                  </div>

                  <Separator />

                  {sections.map((section) => (
                    <section
                      key={section.id}
                      id={section.id}
                      className="scroll-mt-24 space-y-6"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                          {section.icon}
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight">
                          {section.title}
                        </h2>
                      </div>
                      <div className="pl-0 md:pl-12 text-foreground/90 leading-relaxed">
                        {section.content}
                      </div>
                    </section>
                  ))}

                  <Separator />

                  <div className="bg-muted/30 p-8 rounded-2xl space-y-4 border border-border">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-primary" />
                      Contact et Support
                    </h3>
                    <p className="text-muted-foreground">
                      Pour toute question relative aux présentes conditions ou
                      pour signaler un abus, n'hésitez pas à nous contacter
                      directement sur{" "}
                      <a
                        href="https://www.pajdef.com"
                        className="text-primary font-semibold hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        www.pajdef.com
                      </a>{" "}
                      ou via nos réseaux sociaux.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CGUPage;
