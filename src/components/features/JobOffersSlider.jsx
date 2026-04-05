import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Briefcase, ChevronRight, Loader2, MapPin } from "lucide-react";
import { useOffres } from "@/hooks/useOffres";
import CompanyAvatar from "@/components/shared/CompanyAvatar";
import { Button } from "@/components/ui/button";

// Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, FreeMode } from "swiper/modules";

// Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/free-mode";
import { TYPE_OFFRE_COLORS } from "@/lib/constants";

/* ── Badge coloré selon le type d'offre ─────────────────── */
function TypeOfreBadge({ type }) {
  const colors = TYPE_OFFRE_COLORS[type] ?? {
    bg: "#F3F4F6",
    text: "#374151",
    border: "#E5E7EB",
  };
  return (
    <span
      className="inline-flex gap-2 items-center capitalize font-semibold text-[12px] px-4 py-1 rounded-full border"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        borderColor: colors.border,
      }}
    >
      <Briefcase className="size-3" />
      {type}
    </span>
  );
}

export default function JobOffersSlider() {
  const { offres, isLoading } = useOffres({ limit: 10, all: true });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="size-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!offres || offres.length === 0) return null;

  return (
    <section className="py-15 overflow-hidden">
      <div className="container px-4 mx-auto max-w-7x">
        <div className="text-center mb-10 px-4">
          <h2 className="text-4xl md:text-5xl font-black text-[#2f327d] mb-4 tracking-tight">
            Dernières offres d'emploi
          </h2>
          <div className="w-24 h-1.5 bg-primary mx-auto rounded-full"></div>
        </div>

        <div className="relative pb-8">
          <Swiper
            modules={[Pagination, Autoplay, FreeMode]}
            spaceBetween={30}
            slidesPerView={1}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
            }}
            freeMode={{
              enabled: true,
              sticky: true,
            }}
            breakpoints={{
              640: { slidesPerView: 1.5 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="px-4! pb-12! pt-10!"
          >
            {offres.map((offre) => (
              <SwiperSlide key={offre.id} className="h-auto!">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="h-full flex flex-col"
                >
                  <Link
                    to={`/offres/${offre.id}`}
                    state={{ offre }}
                    className="group flex flex-col h-full bg-white rounded-3xl p-8 border border-gray-100 shadow-xs hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 relative overflow-hidden"
                  >
                    {/* Hover Decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full translate-x-16 -translate-y-16 group-hover:translate-x-8 group-hover:-translate-y-8 transition-transform duration-500"></div>

                    <div className="flex flex-col h-full relative z-10">
                      {/* Logo Section */}
                      <div className="mb-8 flex justify-center">
                        <div className="relative">
                          <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-60"></div>
                          <CompanyAvatar
                            name={offre.entreprise?.nomEntreprise}
                            logoPath={offre.entreprise?.logoPath}
                            size={96}
                            className="relative z-10 rounded-2xl bg-white p-2"
                          />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 text-center">
                        <div className="flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest text-[#696984] mb-3">
                          <span>
                            {new Date(offre.createdAt).toLocaleDateString(
                              "fr-FR",
                            )}
                          </span>
                          <span className="w-1.5 h-1.5 bg-secondary rounded-full"></span>
                          <span className="text-[#2f327d]">
                            {offre.entreprise?.nomEntreprise}
                          </span>
                        </div>

                        <h3 className="text-xl font-extrabold text-[#2f327d] mb-4 group-hover:text-primary transition-colors line-clamp-2 min-h-14">
                          {offre.titre}
                        </h3>

                        <p
                          className="text-gray-500 text-sm leading-relaxed line-clamp-4 mb-6 italic"
                          dangerouslySetInnerHTML={{
                            __html: `${offre.description}`,
                          }}
                        ></p>
                      </div>

                      {/* Footer */}
                      <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-center gap-3">
                        <div className="flex items-center gap-2 bg-primary/10 px-4 py-1 rounded-full text-primary font-semibold text-[12px] capitalize tracking-wider transition-all duration-300 hover:bg-primary/20">
                          <MapPin className="size-3" />
                          <span>{offre?.localisation || "Abidjan"}</span>
                        </div>

                        {offre.typeOffre && (
                          <TypeOfreBadge type={offre.typeOffre} />
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button
            asChild
            size="lg"
            className="rounded-full px-12 py-7 text-lg bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 font-bold group"
          >
            <Link to="/offres" className="flex items-center gap-3">
              Toutes les offres d'emploi
              <ChevronRight className="size-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>

      <style>{`
        .swiper-pagination-bullet { width: 10px; height: 10px; background: #e2e8f0; opacity: 1; }
        .swiper-pagination-bullet-active { background: #f48c06; width: 30px; border-radius: 5px; }
      `}</style>
    </section>
  );
}
