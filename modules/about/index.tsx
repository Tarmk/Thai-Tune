"use client";

import { Music, Heart, Users, BookOpen, Globe } from "lucide-react";
import { motion } from "framer-motion";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const fadeInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const About = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#1a1f2c] flex flex-col transition-colors duration-300">
      <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-maroon/10 to-maroon-dark/10 dark:from-maroon/20 dark:to-maroon-dark/20"></div>
          <div className="relative container mx-auto px-4 py-16 md:py-24">
            <div className="max-w-4xl mx-auto text-center">
              <motion.h1
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-maroon to-maroon-dark bg-clip-text text-transparent dark:from-maroon-lite dark:to-[#f5c7d1]"
              >
                About ThaiTune
              </motion.h1>
              <motion.p
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ delay: 0.2 }}
                className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8"
              >
                Preserving the Soul of Thai Music for Future Generations
              </motion.p>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={scaleIn}
                transition={{ delay: 0.4 }}
                className="flex justify-center"
              >
                <Music className="w-16 h-16 text-maroon dark:text-maroon-lite animate-pulse" />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-16 max-w-6xl">
          {/* Founder Story */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="mb-16"
          >
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div variants={fadeInLeft}>
                <motion.h2
                  variants={fadeInUp}
                  className="text-3xl font-bold mb-6 text-maroon dark:text-maroon-lite"
                >
                  Meet Krittaphas Kunkhongkaphan
                </motion.h2>
                <motion.p
                  variants={fadeInUp}
                  transition={{ delay: 0.1 }}
                  className="text-gray-600 dark:text-gray-300 mb-6 text-lg leading-relaxed"
                >
                  Growing up in the heart of Thailand, I was surrounded by the
                  enchanting melodies of traditional Thai music. My grandmother,
                  a skilled khim player, would fill our home with the delicate
                  sounds of classical Thai compositions every evening. Those
                  moments ignited a passion that would shape my entire life.
                </motion.p>
                <motion.p
                  variants={fadeInUp}
                  transition={{ delay: 0.2 }}
                  className="text-gray-600 dark:text-gray-300 mb-6 text-lg leading-relaxed"
                >
                  As a child, I spent countless hours learning the intricate
                  fingering techniques of the ranat ek (Thai xylophone) and the
                  expressive melodies of the saw duang (Thai fiddle). What
                  struck me most was how each piece carried stories of ancient
                  kingdoms, royal courts, and the everyday lives of Thai people
                  across centuries.
                </motion.p>
              </motion.div>
              <motion.div variants={fadeInRight} className="relative">
                <div className="bg-gradient-to-br from-maroon to-maroon-dark rounded-2xl p-8 text-white dark:from-[#2A1D2C] dark:to-[#4A2D3C]">
                  <div className="text-center">
                    <motion.div
                      variants={scaleIn}
                      transition={{ delay: 0.3 }}
                      className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <Music className="w-12 h-12 text-white" />
                    </motion.div>
                    <motion.h3
                      variants={fadeInUp}
                      transition={{ delay: 0.4 }}
                      className="text-xl font-bold mb-2"
                    >
                      Krittaphas Kunkhongkaphan
                    </motion.h3>
                    <motion.p
                      variants={fadeInUp}
                      transition={{ delay: 0.5 }}
                      className="text-white/80"
                    >
                      Founder & Cultural Preservationist
                    </motion.p>
                    <motion.div
                      variants={fadeInUp}
                      transition={{ delay: 0.6 }}
                      className="mt-4 flex justify-center space-x-4"
                    >
                      <div className="flex items-center">
                        <Heart className="w-4 h-4 mr-2" />
                        <span className="text-sm">Thai Music Enthusiast</span>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* The Mission */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            className="mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl font-bold mb-8 text-center text-maroon dark:text-maroon-lite"
            >
              The Mission Behind ThaiTune
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-8">
              <motion.div
                variants={staggerItem}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
              >
                <motion.div variants={scaleIn} transition={{ delay: 0.2 }}>
                  <BookOpen className="w-12 h-12 text-maroon dark:text-maroon-lite mx-auto mb-4" />
                </motion.div>
                <motion.h3
                  variants={fadeInUp}
                  transition={{ delay: 0.3 }}
                  className="text-xl font-bold mb-3 text-maroon dark:text-maroon-lite"
                >
                  Preserve Heritage
                </motion.h3>
                <motion.p
                  variants={fadeInUp}
                  transition={{ delay: 0.4 }}
                  className="text-gray-600 dark:text-gray-300"
                >
                  Document and preserve thousands of traditional Thai melodies
                  before they're lost to time.
                </motion.p>
              </motion.div>
              <motion.div
                variants={staggerItem}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
              >
                <motion.div variants={scaleIn} transition={{ delay: 0.2 }}>
                  <Users className="w-12 h-12 text-maroon dark:text-maroon-lite mx-auto mb-4" />
                </motion.div>
                <motion.h3
                  variants={fadeInUp}
                  transition={{ delay: 0.3 }}
                  className="text-xl font-bold mb-3 text-maroon dark:text-maroon-lite"
                >
                  Build Community
                </motion.h3>
                <motion.p
                  variants={fadeInUp}
                  transition={{ delay: 0.4 }}
                  className="text-gray-600 dark:text-gray-300"
                >
                  Connect musicians, scholars, and enthusiasts worldwide to
                  share knowledge and passion.
                </motion.p>
              </motion.div>
              <motion.div
                variants={staggerItem}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg"
              >
                <motion.div variants={scaleIn} transition={{ delay: 0.2 }}>
                  <Globe className="w-12 h-12 text-maroon dark:text-maroon-lite mx-auto mb-4" />
                </motion.div>
                <motion.h3
                  variants={fadeInUp}
                  transition={{ delay: 0.3 }}
                  className="text-xl font-bold mb-3 text-maroon dark:text-maroon-lite"
                >
                  Share Culture
                </motion.h3>
                <motion.p
                  variants={fadeInUp}
                  transition={{ delay: 0.4 }}
                  className="text-gray-600 dark:text-gray-300"
                >
                  Make Thai music accessible to learners and performers around
                  the globe.
                </motion.p>
              </motion.div>
            </div>
          </motion.div>

          {/* Personal Journey */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            className="mb-16"
          >
            <motion.div
              variants={fadeInUp}
              className="bg-gradient-to-r from-maroon/5 to-maroon-dark/5 dark:from-maroon/10 dark:to-maroon-dark/10 rounded-2xl p-8"
            >
              <motion.h2
                variants={fadeInUp}
                className="text-3xl font-bold mb-8 text-maroon dark:text-maroon-lite"
              >
                My Journey with Thai Music
              </motion.h2>
              <div className="space-y-6">
                <motion.div
                  variants={staggerItem}
                  whileHover={{ x: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="border-l-4 border-maroon dark:border-maroon-lite pl-6"
                >
                  <motion.h3
                    variants={fadeInUp}
                    className="text-xl font-bold mb-2 text-maroon dark:text-maroon-lite"
                  >
                    The Awakening
                  </motion.h3>
                  <motion.p
                    variants={fadeInUp}
                    transition={{ delay: 0.1 }}
                    className="text-gray-600 dark:text-gray-300"
                  >
                    During my university years studying computer science, I
                    realized that many traditional Thai melodies existed only in
                    the memories of aging masters. I witnessed firsthand how
                    precious musical knowledge was disappearing with each
                    passing generation.
                  </motion.p>
                </motion.div>
                <motion.div
                  variants={staggerItem}
                  whileHover={{ x: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="border-l-4 border-maroon dark:border-maroon-lite pl-6"
                >
                  <motion.h3
                    variants={fadeInUp}
                    className="text-xl font-bold mb-2 text-maroon dark:text-maroon-lite"
                  >
                    The Vision
                  </motion.h3>
                  <motion.p
                    variants={fadeInUp}
                    transition={{ delay: 0.1 }}
                    className="text-gray-600 dark:text-gray-300"
                  >
                    I envisioned a digital platform where musicians could
                    contribute their knowledge, where ancient melodies could be
                    preserved in digital notation, and where learners worldwide
                    could access this cultural treasure. ThaiTune was born from
                    this vision.
                  </motion.p>
                </motion.div>
                <motion.div
                  variants={staggerItem}
                  whileHover={{ x: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="border-l-4 border-maroon dark:border-maroon-lite pl-6"
                >
                  <motion.h3
                    variants={fadeInUp}
                    className="text-xl font-bold mb-2 text-maroon dark:text-maroon-lite"
                  >
                    The Impact
                  </motion.h3>
                  <motion.p
                    variants={fadeInUp}
                    transition={{ delay: 0.1 }}
                    className="text-gray-600 dark:text-gray-300"
                  >
                    Today, ThaiTune serves as a bridge between traditional Thai
                    music masters and curious learners worldwide. Every melody
                    uploaded, every notation shared, and every discussion
                    started contributes to preserving our musical heritage for
                    future generations.
                  </motion.p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          {/* Vision for the Future */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            className="text-center"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl font-bold mb-6 text-maroon dark:text-maroon-lite"
            >
              Vision for the Future
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto"
            >
              My dream is for ThaiTune to become the world's most comprehensive
              repository of traditional Thai music, fostering a global community
              of learners and preserving our cultural heritage for generations
              to come. Together, we can ensure that the beautiful melodies of
              Thailand continue to inspire and connect people across cultures
              and time.
            </motion.p>
            <motion.div
              variants={fadeInUp}
              transition={{ delay: 0.2 }}
              className="flex justify-center items-center space-x-2"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              >
                <Heart className="w-6 h-6 text-red-500" />
              </motion.div>
              <motion.span
                variants={fadeInUp}
                className="text-lg font-medium text-gray-700 dark:text-gray-300"
              >
                With love for Thai music and culture
              </motion.span>
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, -10, 10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: 0.5,
                }}
              >
                <Heart className="w-6 h-6 text-red-500" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
export default About;
