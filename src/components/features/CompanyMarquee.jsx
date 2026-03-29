import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useEntreprisesList } from "@/hooks/useEntreprises";
import Marquee from "@/components/ui/marquee";
import { cn } from "@/lib/utils";
import CompanyAvatar from "@/components/shared/CompanyAvatar";
import { Link } from "react-router-dom";

const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:3333/api"
).replace(/\/api$/, "");

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const CompanyCard = ({ ent }) => {
  return (
    <figure
      className={cn(
        "relative cursor-pointer overflow-hidden",
        "bg-transparent",
        "flex items-center justify-center transition-all duration-300 mx-2",
      )}
    >
      <Link
        to={`/entreprises/${ent.id}`}
        className="shrink-0 hover:opacity-80 transition-opacity mx-auto sm:mx-0"
      >
        <CompanyAvatar
          name={ent.nomEntreprise}
          logoPath={ent.logoPath}
          size={122}
        />
      </Link>
    </figure>
  );
};
export default function CompanyMarquee() {
  const { entreprises, isLoading } = useEntreprisesList({
    limit: 30,
  });

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeInUp}
      className="max-w-7xl mx-auto mt-8 mb-15"
    >
      <div className="text-center mb-10 px-4">
        <h1 className="text-center font-bold text-foreground my-4 text-4xl">
          Ils nous{" "}
          <span className="text-primary tracking-wide">font confiance.</span>
        </h1>
        <div className="w-24 h-1.5 bg-primary mx-auto rounded-full"></div>
      </div>
      <p className="text-center mb-5 leading-relaxed text-[#696984] text-xl font-medium">
        Découvrez les entreprises qui recrutent leurs talents sur notre
        plateforme
      </p>

      {isLoading ? (
        <div className="flex justify-center items-center py-10 scale-150">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
          <Marquee repeat={12} pauseOnHover className="[--duration:20s] py-4">
            {entreprises?.map((ent) => (
              <CompanyCard key={ent.id} ent={ent} />
            ))}
          </Marquee>

          {/* Gradient Overlays */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-linear-to-r from-background"></div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-linear-to-l from-background"></div>
        </div>
      )}
    </motion.div>
  );
}
