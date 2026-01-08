import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { MusicIcon, Code, Headphones, Zap } from "lucide-react";
import { motion } from "framer-motion";

const headingVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 1 } },
};

const paragraphVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 1, delay: 0.2 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: 0.1 + i * 0.15,
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

const FeatureSection = () => {
  const { t } = useTranslation("common");

  return (
    <div className="w-full py-8 md:py-24 bg-white dark:bg-[#232838] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-maroon/5 via-transparent to-[#8A3D4C]/5 dark:from-[#8A3D4C]/8 dark:to-maroon/8"></div>
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-r from-maroon/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-r from-[#8A3D4C]/20 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container px-4 md:px-6 max-w-7xl mx-auto relative">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          className="text-center mb-16"
        >
          <motion.h2
            variants={headingVariants}
            className={
              "text-3xl font-bold tracking-tight sm:text-4xl mb-4 dark:text-white bg-gradient-to-r from-maroon via-[#8A3D4C] to-maroon dark:from-[#8A3D4C] dark:via-[#af5169] dark:to-[#8A3D4C] bg-clip-text text-transparent animate-gradient"
            }
          >
            {t("widenRepertoire")}
          </motion.h2>
          <motion.p
            variants={paragraphVariants}
            className={
              "text-xl text-gray-500 dark:text-gray-300 max-w-3xl mx-auto"
            }
          >
            {t("uploadDescription")}
          </motion.p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              icon: <MusicIcon className="h-8 w-8" />,
              title: t("feature1Title"),
              description: t("feature1Desc"),
            },
            {
              icon: <Code className="h-8 w-8" />,
              title: t("feature2Title"),
              description: t("feature2Desc"),
            },
            {
              icon: <Headphones className="h-8 w-8" />,
              title: t("feature3Title"),
              description: t("feature3Desc"),
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="transform"
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.4 }}
              custom={index}
            >
              <Card
                key={index}
                className={
                  "border-0 shadow-lg overflow-hidden dark:bg-[#2a3349] dark:border-none transition-all duration-700 hover:shadow-2xl hover:shadow-maroon/20 hover:scale-105 hover:-translate-y-3 cursor-pointer group"
                }
              >
                <div className="h-1 bg-gradient-to-r from-maroon to-[#8A3D4C] dark:from-[#8A3D4C] dark:to-[#af5169] group-hover:h-3 transition-all duration-500"></div>
                <CardContent className="p-6 relative overflow-hidden">
                  <div className="bg-[#F8F1F3] dark:bg-[#8a3d4c33]  rounded-full p-3 mb-5 inline-block transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 group-hover:shadow-lg">
                    <div className="text-maroon dark:text-maroon-lite transition-all duration-500 group-hover:scale-110">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-2 dark:text-white group-hover:text-maroon dark:group-hover:text-maroon-lite transition-all duration-500 group-hover:scale-105">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-300 transition-all duration-500 group-hover:text-gray-700 dark:group-hover:text-gray-200">
                    {feature.description}
                  </p>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                    <Zap className="h-5 w-5 text-maroon dark:text-maroon-lite animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeatureSection;
