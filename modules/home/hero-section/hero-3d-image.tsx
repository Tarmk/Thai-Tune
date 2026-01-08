"use client";

import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { MusicIcon } from "lucide-react";
import { useEffect } from "react";

const Hero3DImage = () => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [0, window.innerHeight], [15, -15]);
  const rotateY = useTransform(x, [0, window.innerWidth], [-15, 15]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [x, y]);

  return (
    <CardContainer className="size-full py-4">
      <CardBody className="size-full">
        <CardItem>
          <div className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl transition-all duration-500 hover:shadow-3xl hover:scale-105 hover:shadow-maroon/20 group">
            <div className="w-full h-full bg-gradient-to-br from-maroon via-[#8A3D4C] to-maroon flex items-center justify-center p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 via-transparent to-white/5 animate-pulse"></div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl w-full h-full flex items-center justify-center relative group-hover:bg-white/15 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 rotate-45 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1500"></div>
                <MusicIcon className="h-32 w-32 text-white animate-pulse group-hover:scale-110 group-hover:rotate-12 transition-all duration-500" />
                <div className="absolute top-4 right-4 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
                <div className="absolute top-4 right-4 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                <div className="absolute bottom-4 left-4 w-3 h-3 bg-yellow-400 rounded-full animate-pulse delay-500"></div>
                <div className="absolute top-8 left-8 w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-1000"></div>
                <div className="absolute bottom-8 right-8 w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-1500"></div>
              </div>
            </div>
          </div>
        </CardItem>
      </CardBody>
    </CardContainer>
  );
};

export default Hero3DImage;
