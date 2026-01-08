import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { MusicIcon, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import HeroParticles from "./hero-particles";
import Hero3DImage from "./hero-3d-image";

const HeroSection = () => {
  const { t } = useTranslation("common");
  const [isClient, setIsClient] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const { user } = useAuth();

  useEffect(() => {
    setIsClient(true);
  });

  return (
    <div className="w-full py-8 md:py-24 relative">
      <HeroParticles />
      <div className="container px-4 md:px-6 max-w-7xl mx-auto">
        <div className="grid gap-4 md:gap-16 lg:grid-cols-2 items-center">
          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-4 md:space-y-8">
              <div className="relative min-h-[4rem]">
                <div className="absolute -top-3 -left-3 w-6 h-6 bg-gradient-to-r from-maroon to-[#8A3D4C] rounded-full animate-ping"></div>
                <div className="absolute -top-3 -left-3 w-6 h-6 bg-gradient-to-r from-maroon to-[#8A3D4C] rounded-full animate-pulse"></div>
                <motion.h1
                  initial={{ opacity: 0, x: -80, scale: 0.95 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    scale: 1,
                    transition: { duration: 1 },
                  }}
                  viewport={{ once: true }}
                  className={`text-3xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white lg:text-5xl leading-relaxed bg-gradient-to-r from-maroon via-[#8A3D4C] to-maroon dark:from-[#8A3D4C] dark:via-[#af5169] dark:to-[#8A3D4C] bg-clip-text text-transparent animate-gradient`}
                >
                  {t("learnTitle", "Discover Traditional Thai Music")}
                </motion.h1>
              </div>
              <motion.p
                initial={{ opacity: 0, y: 32 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { duration: 1, delay: 0.3 },
                }}
                viewport={{ once: true }}
                className={`text-xl text-gray-500 dark:text-gray-300 max-w-[600px]`}
              >
                {t(
                  "description",
                  "Explore and contribute to the world of Traditional Thai Music"
                )}
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 48 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { duration: 1, delay: 0.5 },
              }}
              viewport={{ once: true }}
              className={`flex flex-col sm:flex-row gap-4`}
            >
              {!user && (
                <Link href="/signup">
                  <Button className="text-base px-8 py-4 shadow-xl transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:shadow-maroon/30 bg-gradient-to-r from-maroon to-[#8A3D4C] hover:from-[#3A1520] hover:to-maroon-dark dark:from-[#8A3D4C] dark:to-[#af5169] text-white relative overflow-hidden group transform hover:rotate-1">
                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12"></span>
                    <span className="relative z-10 flex items-center">
                      {t("getStarted")}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-2 group-hover:scale-110" />
                    </span>
                  </Button>
                </Link>
              )}
              <Link href="/community">
                <Button
                  variant="outline"
                  className="text-base px-8 py-4 border-2 border-maroon text-maroon dark:border-[#8A3D4C] dark:text-gray-200 hover:bg-maroon hover:text-white dark:hover:bg-[#8A3D4C] transition-all duration-500 hover:scale-105 hover:shadow-lg hover:shadow-maroon/20 relative overflow-hidden group hover:-rotate-1"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-maroon/0 via-maroon/20 to-maroon/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-12"></span>
                  <span className="relative z-10 transition-all duration-300 group-hover:scale-105">
                    {t("exploreCommunity")}
                  </span>
                </Button>
              </Link>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 80, scale: 0.95 }}
            animate={{
              opacity: 1,
              x: 0,
              scale: 1,
              transition: { duration: 1, delay: 0.7 },
            }}
            viewport={{ once: true }}
          >
            <Hero3DImage />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
