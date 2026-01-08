import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Music, Play, Volume2, Sparkles, Star } from "lucide-react";
import { Particles } from "@/components/common/particles";

const HeroParticles = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const scrollY = useMotionValue(0);

  // Mouse & Scroll tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    const handleScroll = () => scrollY.set(window.scrollY);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [mouseX, mouseY, scrollY]);

  // Transforms
  const leftOffset = useTransform(mouseX, (x) => 10 + x * 0.02);
  const rightOffset = useTransform(mouseX, (x) => 80 - x * 0.015);
  const iconLeft = useTransform(mouseX, (x) => 80 + x * 0.01);
  const iconBottomLeft = useTransform(mouseX, (x) => `${25 + x * 0.005}%`);

  const iconRightPercent = useTransform(mouseY, (y) => `${25 + y * 0.006}%`);
  const orbLeftPercent = useTransform(mouseY, (y) => `${30 + y * 0.01}%`);

  const orbTop = useTransform(scrollY, (y) => 20 + y * 0.1);
  const orbTop2 = useTransform(scrollY, (y) => 160 - y * 0.05);
  const orbBottom = useTransform(scrollY, (y) => 160 + y * 0.08);

  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      <motion.div
        className="absolute w-96 h-96 bg-gradient-to-r from-maroon/15 via-[#8A3D4C]/10 to-maroon-dark/15 rounded-full blur-3xl"
        style={{ top: orbTop, left: leftOffset }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[500px] h-[500px] bg-gradient-to-r from-[#8A3D4C]/8 via-maroon/5 to-maroon-dark/8 rounded-full blur-3xl"
        style={{ top: orbTop2, right: rightOffset }}
        animate={{ scale: [1, 1.12, 1] }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
      <motion.div
        className="absolute w-80 h-80 bg-gradient-to-r from-maroon-dark/12 via-maroon/8 to-[#8A3D4C]/12 rounded-full blur-3xl"
        style={{ bottom: orbBottom, left: orbLeftPercent }}
        animate={{ scale: [1, 1.07, 1] }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      <motion.div
        className="absolute"
        style={{ top: 128, left: iconLeft }}
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <Music className="h-8 w-8 text-maroon/40 dark:text-[#8A3D4C]/60" />
      </motion.div>

      <motion.div
        className="absolute"
        style={{ top: 240, right: iconRightPercent }}
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Volume2 className="h-6 w-6 text-[#8A3D4C]/40 dark:text-maroon/60" />
      </motion.div>

      <motion.div
        className="absolute"
        style={{ bottom: 320, left: iconBottomLeft }}
        animate={{ y: [0, 25, 0] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <Play className="h-5 w-5 text-maroon-dark/40 dark:text-[#8A3D4C]/60" />
      </motion.div>

      <motion.div
        className="absolute"
        style={{ top: 384, right: iconRightPercent }}
        animate={{ y: [0, 18, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Sparkles className="h-9 w-9 text-maroon/30 dark:text-[#8A3D4C]/50" />
      </motion.div>
      <Particles className="w-full h-full relative inset-0" />
    </div>
  );
};

export default HeroParticles;
