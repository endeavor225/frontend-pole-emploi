import { motion } from "framer-motion";
import {
  Target,
  Eye,
  Lightbulb,
  ShieldCheck,
  Zap,
  Award,
  Users,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative  overflow-hidden bg-primary/5 pb-10 pt-16 px-4 border-b border-border/50">
        {/* Cercles décoratifs */}
        <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[400px] h-[400px] rounded-full bg-secondary/10 blur-3xl pointer-events-none" />
        <div className="max-w-7xl px-8 mx-auto text-center relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <Badge
                variant="outline"
                className="mb-4 bg-background/50 backdrop-blur-sm border-primary/20 text-primary"
              >
                À propos de PAJDEF
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-6xl font-bold leading-tight mb-6"
            >
              Réinventer l'avenir professionnel de la{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-secondary">
                jeunesse ivoirienne
              </span>
              .
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-lg text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed"
            >
              PAJDEF est le fruit d'une ambition forte : créer un pont numérique
              innovant entre les jeunes talents et les opportunités
              professionnelles en Côte d'Ivoire.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap justify-center gap-4"
            >
              <Button
                size="lg"
                className="rounded-full px-8 h-14 text-lg font-bold shadow-xl shadow-primary/20 hover:scale-110 duration-300 ease-in-out"
                asChild
              >
                <Link to="/register/candidat">Nous rejoindre</Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8 h-14 text-lg font-bold bg-white/50 backdrop-blur-sm hover:scale-110 duration-300 ease-in-out"
                asChild
              >
                <Link to="/offres">Découvrir les offres</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-24 container px-8 mx-auto max-w-7xl">
        <div className="grid md:grid-cols-2 gap-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <div className="bg-primary/10 p-4 rounded-2xl w-fit mb-6">
              <Target className="size-10 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-6">Notre Mission</h2>
            <p className="text-lg text-[#696984] leading-relaxed mb-6">
              Notre mission est de démocratiser l'accès à l'emploi et à
              l'apprentissage pour tous les jeunes de Côte d'Ivoire. Nous
              croyons que chaque talent mérite une chance d'exceller, quels que
              soient son origine ou son réseau initial.
            </p>
            <ul className="space-y-4">
              {[
                "Faciliter la rencontre entre talents et recruteurs",
                "Offrir des outils de développement de carrière",
                "Promouvoir l'entrepreneuriat et l'innovation",
                "Accompagner les entreprises dans leur recherche de talents",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-foreground font-medium"
                >
                  <CheckCircle2 className="size-5 text-secondary" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="relative"
          >
            <div className="bg-secondary/10 p-4 rounded-2xl w-fit mb-6">
              <Eye className="size-10 text-secondary" />
            </div>
            <h2 className="text-3xl font-bold mb-6">Notre Vision</h2>
            <p className="text-lg text-[#696984] leading-relaxed mb-6">
              Devenir la plateforme de référence pour l'employabilité des jeunes
              en Afrique de l'Ouest. Nous aspirons à créer un écosystème
              dynamique où l'innovation technologique sert le progrès social et
              économique national.
            </p>
            <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-border relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-bl-full transition-transform group-hover:scale-150 duration-700" />
              <p className="italic text-xl text-foreground font-medium relative z-10">
                "Un avenir où la compétence est la seule monnaie d'échange, et
                où l'accès à l'opportunité est universel."
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="container px-8 mx-auto max-w-7xl relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Nos Valeurs Cardinales
            </h2>
            <p className="text-lg text-[#696984]">
              Ce qui nous anime au quotidien et guide chacune de nos décisions
              technologiques et humaines.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-4 gap-8"
          >
            {[
              {
                title: "Innovation",
                desc: "Nous repoussons sans cesse les limites technologiques.",
                icon: <Lightbulb className="size-8" />,
                color: "bg-amber-100 text-amber-600",
              },
              {
                title: "Intégrité",
                desc: "La transparence et l'éthique sont au cœur de nos échanges.",
                icon: <ShieldCheck className="size-8" />,
                color: "bg-blue-100 text-blue-600",
              },
              {
                title: "Accessibilité",
                desc: "Une plateforme pensée pour tous les usages, partout.",
                icon: <Zap className="size-8" />,
                color: "bg-emerald-100 text-emerald-600",
              },
              {
                title: "Excellence",
                desc: "Nous visons le plus haut standard de qualité pour nos utilisateurs.",
                icon: <Award className="size-8" />,
                color: "bg-rose-100 text-rose-600",
              },
            ].map((value, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 border border-transparent hover:border-primary/10 group text-center"
              >
                <div
                  className={`${value.color} size-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500`}
                >
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                <p className="text-[#696984]">{value.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Team/Spirit Section */}
      <section className="py-24 container px-8 mx-auto max-w-7xl">
        <div className="bg-primary/90 rounded-[50px] p-10 md:p-20 text-white flex flex-col md:flex-row items-center gap-12 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/20 rounded-full -ml-32 -mb-32 blur-3xl" />

          <div className="w-full md:w-1/2 relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-8">
              L'esprit PAJDEF
            </h2>
            <p className="text-xl opacity-90 leading-relaxed mb-8">
              Notre équipe est composée de passionnés de technologie, d'experts
              en ressources humaines et de visionnaires engagés pour la Côte
              d'Ivoire. Ensemble, nous construisons plus qu'une plateforme :
              nous bâtissons l'avenir.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="size-12 rounded-full border-4 border-primary bg-white/20 backdrop-blur-sm"
                  />
                ))}
              </div>
              <p className="font-medium">+20 experts dévoués</p>
            </div>
          </div>

          <div className="w-full md:w-1/2 flex justify-center relative z-10">
            <div className="relative group">
              <div className="absolute inset-0 bg-white/20 rounded-3xl rotate-6 transition-transform group-hover:rotate-12 duration-500" />
              <div className="bg-white rounded-3xl p-8 relative shadow-2xl text-primary max-w-sm">
                <Users className="size-12 mb-6" />
                <h4 className="text-2xl font-bold mb-4">
                  Rejoindre l'aventure
                </h4>
                <p className="text-primary/70 mb-6">
                  Vous souhaitez contribuer à l'insertion des jeunes ?
                  Contactez-nous pour explorer les opportunités de
                  collaboration.
                </p>
                <Button
                  variant="outline"
                  className="w-full rounded-full border-primary text-primary hover:bg-primary hover:text-white transition-all font-bold group"
                >
                  Contactez-nous
                  <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-background">
        <div className="container px-8 mx-auto max-w-4xl text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-4xl font-bold mb-8">
              Prêt à faire partie du changement ?
            </h2>
            <p className="text-xl text-[#696984] mb-12">
              Que vous soyez candidat à la recherche de votre prochain défi ou
              recruteur en quête de pépites, PAJDEF est votre allié.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-5">
              <Button
                size="lg"
                className="rounded-full px-12 h-14 text-lg font-bold bg-primary shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
                asChild
              >
                <Link to="/register/candidat">Créer mon profil</Link>
              </Button>
              <Button
                size="lg"
                className="rounded-full px-12 h-14 text-lg font-bold bg-secondary shadow-xl shadow-secondary/20 hover:scale-105 transition-transform text-white"
                asChild
              >
                <Link to="/register/recruteur">Recruter un talent</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
