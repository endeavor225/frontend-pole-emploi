import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  UserPlus,
  Building2,
  ArrowRight,
  Play,
  Calendar,
  Users,
  GraduationCap,
  BarChart3,
  Video,
  FileText,
  MessageSquare,
  CheckCircle2,
  PieChart,
  Layout,
  Globe,
} from "lucide-react";
import { motion } from "framer-motion";
import girlImg from "@/assets/img/girl.png";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const fadeInRight = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const fadeInLeft = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } },
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

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative bg-(--cream)">
        <div className="max-w-7xl px-8 mx-auto flex flex-col lg:flex-row items-start">
          {/* Left Col */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="flex flex-col w-full lg:w-6/12 justify-center lg:pt-24 items-start text-center lg:text-left mb-5 md:mb-0"
          >
            <motion.h1 
              variants={fadeInUp}
              className="my-4 text-5xl font-bold leading-tight text-foreground"
            >
              <span className="text-primary tracking-wide">L'insertion</span>{" "}
              des jeunes est désormais beaucoup plus{" "}
              <span className="text-secondary">simple.</span>
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="leading-normal text-xl mb-8 text-[#696984]"
            >
              PAJDEF est une plateforme innovante qui connecte les jeunes
              talents ivoiriens avec les recruteurs de manière interactive.
            </motion.p>
            <motion.div
              variants={fadeInUp}
              className="w-full md:flex items-center justify-center lg:justify-start md:space-x-5 gap-5"
            >
              <Link
                to="/register/candidat"
                className="lg:mx-0 bg-primary text-white text-xl font-bold rounded-full py-4 px-9 focus:outline-none transform transition hover:scale-110 duration-300 ease-in-out shadow-xl shadow-primary/20 inline-block"
              >
                Rejoindre gratuitement
              </Link>
              <div className="flex items-center justify-center space-x-3 mt-5 md:mt-0 focus:outline-none transform transition hover:scale-110 duration-300 ease-in-out cursor-pointer group">
                <button className="bg-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
                  <Play className="w-5 h-5 ml-1 fill-secondary text-secondary" />
                </button>
                <span className="cursor-pointer font-medium text-foreground">
                  Comment ça marche ?
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Col */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="w-full lg:w-6/12 lg:-mt-10 relative"
            id="girl"
          >
            <img
              className="w-10/12 mx-auto 2xl:-mb-20"
              src={girlImg}
              alt="Jeune talent"
            />
            {/* Calendar mimic */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-20 -left-6 sm:top-32 sm:left-10 md:top-40 md:left-16 lg:-left-4 lg:top-52 z-20"
            >
              <div className="bg-white/90 backdrop-blur-md rounded-xl sm:rounded-2xl p-1.5 sm:p-2 shadow-xl sm:shadow-2xl flex items-center gap-2 border border-white/40">
                <div className="bg-secondary/20 p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-secondary">
                  <Calendar className="size-5 sm:size-8" />
                </div>
                <div className="block">
                  <div className="font-bold text-xs sm:text-base text-foreground">
                    250k+
                  </div>
                  <div className="text-[9px] sm:text-xs text-[#696984] font-semibold">
                    Candidats assistés
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Red chart mimic */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-20 right-4 lg:top-32 lg:right-16 z-20"
            >
              <div className="bg-[#F3627C] p-2 sm:p-4 rounded-[16px] sm:rounded-[24px] shadow-xl sm:shadow-2xl shadow-[#F3627C]/30 flex items-center justify-center text-white border-2 border-white">
                <BarChart3 className="size-4 sm:size-6" />
              </div>
            </motion.div>

            {/* UX class mimic */}
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-14 -left-4 sm:left-2 sm:bottom-20 lg:bottom-16 lg:-left-1 z-20"
            >
              <div className="bg-white/90 backdrop-blur-md rounded-xl sm:rounded-2xl p-1.5 sm:p-2 shadow-xl sm:shadow-2xl flex items-center gap-2 border border-white/40">
                <div className="bg-accent/20 p-2 sm:p-3 rounded-lg sm:rounded-xl text-accent">
                  <Users className="size-4 sm:size-6" />
                </div>
                <div className="block">
                  <div className="text-[10px] sm:text-sm font-bold text-foreground">
                    Profils Vérifiés
                  </div>
                  <div className="flex -space-x-2 sm:-space-x-3 mt-1 sm:mt-0">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="size-4 sm:size-6 rounded-full border-2 border-white bg-slate-200"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Congrats mimic */}
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute bottom-30 md:bottom-48 lg:bottom-52 -right-6 lg:right-8 z-20"
            >
              <div className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl p-1.5 sm:p-2 shadow-xl sm:shadow-2xl flex items-center gap-2 sm:gap-4 border border-white/40">
                <div className="bg-primary/20 p-2 sm:p-3 rounded-lg sm:rounded-xl text-primary font-bold px-3 sm:px-4">
                  <GraduationCap className="size-4 sm:size-6" />
                </div>
                <div>
                  <div className="text-[10px] sm:text-sm font-bold text-foreground">
                    Félicitations
                  </div>
                  <div className="text-[9px] sm:text-xs text-[#696984] font-bold">
                    Votre profil est retenu !
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Wave SVG */}
        <div className="text-background -mt-14 sm:-mt-24 lg:-mt-36 z-40 relative">
          <svg
            className="xl:h-40 xl:w-full"
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M600,112.77C268.63,112.77,0,65.52,0,7.23V120H1200V7.23C1200,65.52,931.37,112.77,600,112.77Z"
              fill="currentColor"
            />
          </svg>
          <div className="bg-background w-full h-20 -mt-px"></div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container px-8 mx-auto max-w-7xl text-gray-700 overflow-x-hidden">
        {/* Trusted By Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="max-w-4xl mx-auto -mt-10 mb-32"
        >
          <h1 className="text-center mb-10 text-[#696984] font-semibold text-xl tracking-tight">
            Plus de 5 000 entreprises nous font confiance
          </h1>
          <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-20 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
            <span className="text-3xl font-extrabold tracking-tighter">
              google
            </span>
            <span className="text-3xl font-extrabold tracking-tighter">
              netflix
            </span>
            <span className="text-3xl font-extrabold tracking-tighter">
              airbnb
            </span>
            <span className="text-3xl font-extrabold tracking-tighter">
              amazon
            </span>
            <span className="text-3xl font-extrabold tracking-tighter">
              facebook
            </span>
          </div>
        </motion.div>

        {/* All-In-One Platform Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="max-w-xl mx-auto text-center mb-24"
        >
          <h1 className="font-bold text-foreground my-4 text-4xl">
            L'écosystème{" "}
            <span className="text-primary tracking-wide">tout-en-un.</span>
          </h1>
          <p className="leading-relaxed text-[#696984] text-xl font-medium">
            PAJDEF est une plateforme puissante combinant tous les outils
            nécessaires pour la réussite professionnelle des jeunes.
          </p>
        </motion.div>

        {/* Feature Cards stagger */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-16 md:gap-8 mb-48"
        >
          {[
            {
              title: "Gestion des Contrats",
              desc: "Contrôle simple et sécurisé des transactions financières et des engagements contractuels.",
              icon: <FileText className="size-10 text-white" />,
              color: "#5B72EE",
            },
            {
              title: "Planification Agile",
              desc: "Gérez vos entretiens et suivez les disponibilités de vos recruteurs Preferred en temps réel.",
              icon: <Calendar className="size-10 text-white" />,
              color: "#F48C06",
            },
            {
              title: "Suivi des Candidats",
              desc: "Automatisez et suivez les échanges avec les candidats. Un système centralisé pour rester organisé.",
              icon: <Users className="size-10 text-white" />,
              color: "#29B9E7",
            },
          ].map((card, idx) => (
            <motion.div
              key={idx}
              variants={fadeInUp}
              className="bg-background shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] p-10 text-center rounded-[40px] relative pt-20 hover:-translate-y-4 transition-transform duration-500 border border-border"
            >
              <div
                style={{ backgroundColor: card.color }}
                className="rounded-full size-24 flex items-center justify-center mx-auto shadow-2xl absolute -top-12 left-1/2 -translate-x-1/2 border-12 border-background"
              >
                {card.icon}
              </div>
              <h1 className="font-bold text-2xl mb-5 text-foreground leading-tight">
                {card.title}
              </h1>
              <p className="text-[#696984] text-lg leading-relaxed">
                {card.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
