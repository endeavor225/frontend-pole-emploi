import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import candidateIllus from "/registration_candidate_illus.png";
import recruiterIllus from "/registration_recruiter_illus.png";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function RegisterChoicePage() {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-background flex flex-col">
      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-10 lg:p-12">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-7xl w-full"
        >
          {/* Candidate Card */}
          <motion.div
            variants={fadeInUp}
            className="group flex flex-col items-center"
          >
            <h2 className="text-2xl font-bold text-slate-700 tracking-wide">
              <Link
                to="/register/candidat"
                className="text-center hover:underline hover:text-primary transition-colors"
              >
                Candidat
              </Link>
            </h2>
            <Card className="w-full overflow-hidden border-none shadow-none bg-transparent">
              <CardContent className="p-0 flex flex-col items-center space-y-5">
                <div className="relative w-full aspect-4/3 rounded-3xl overflow-hidden bg-white/50 group-hover:bg-white transition-all duration-500">
                  <img
                    src={candidateIllus}
                    alt="Illustration Candidat"
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <Button
                  asChild
                  size="lg"
                  className="text-white px-12 py-7 rounded-full text-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                >
                  <Link to="/register/candidat">Cliquez ici</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recruiter Card */}
          <motion.div
            variants={fadeInUp}
            className="group flex flex-col items-center"
          >
            <h2 className="text-2xl font-bold text-slate-700 tracking-wide">
              <Link
                to="/register/recruteur"
                className="text-center hover:underline hover:text-primary transition-colors"
              >
                Recruteur
              </Link>
            </h2>
            <Card className="w-full overflow-hidden border-none shadow-none bg-transparent">
              <CardContent className="p-0 flex flex-col items-center space-y-5">
                <div className="relative w-full aspect-4/3 rounded-3xl overflow-hidden bg-white/50 group-hover:bg-white transition-all duration-500">
                  <img
                    src={recruiterIllus}
                    alt="Illustration Recruteur"
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <Button
                  asChild
                  size="lg"
                  className="text-white px-12 py-7 rounded-full text-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                >
                  <Link to="/register/recruteur">Cliquez ici</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
