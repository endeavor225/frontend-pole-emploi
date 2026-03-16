import { FileText, Calendar, Users } from "lucide-react";
import { motion } from "framer-motion";
import CompanyMarquee from "@/components/features/CompanyMarquee";
import JobOffersSlider from "@/components/features/JobOffersSlider";
import HeroSection from "@/components/layout/HeroSection";

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

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] bg-background text-foreground">
      <HeroSection />

      {/* Main Content Area */}
      <div className="container px-4 mx-auto max-w-7xl text-gray-700 overflow-x-hidden">
        <CompanyMarquee />
        <JobOffersSlider />

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
          className="grid md:grid-cols-3 gap-16 md:gap-8 mb-24"
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
