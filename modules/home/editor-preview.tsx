import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Play } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { useScriptLoad } from "@/hooks/use-script-load";

const EditorPreview = () => {
  const { t } = useTranslation("common");
  const { theme } = useTheme();

  const scriptLoaded = useScriptLoad(
    "https://prod.flat-cdn.com/embed-js/v2.4.1/embed.min.js"
  );

  useEffect(() => {
    if (typeof window === "undefined" || !scriptLoaded) return;

    const container = document.getElementById("embed-container");

    if (container && (window as any).Flat) {
      container.innerHTML = "";

      // Theme colors
      const isDark = theme === "dark";
      const embedColors = {
        themePrimary: isDark ? "#8A3D4C" : "#4A1D2C",
        themePrimaryDark: isDark ? "#6A2D3C" : "#3A1520",
        themeControlsBackground: isDark ? "#2a3349" : "#F8F1F3",
        themeSlider: isDark ? "#af5169" : "#6A2D3C",
        themeCursorV0: isDark ? "#e5a3b4" : "#8A3D4C",
        themeCursorV1: isDark ? "#B85C70" : "#B85C70",
        themeSelection: isDark ? "#8A3D4C" : "#E5A3B4",
      };

      new (window as any).Flat.Embed(container, {
        width: "100%",
        height: "100%",
        score: "688856b573b9c1497c731b74",
        embedParams: {
          mode: "edit",
          branding: false,
          appId: "6755790be2eebcce112acde7",
          ...embedColors,
        },
      });
    }
  }, [scriptLoaded, theme]);

  return (
    <div className="w-full py-8 md:py-24 bg-gray-50 dark:bg-[#1a1f2c] relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-maroon/8 via-transparent to-[#8A3D4C]/8 dark:from-[#8A3D4C]/15 dark:to-maroon/15"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-maroon/30 to-transparent rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-[#8A3D4C]/30 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
      </div>

      <div className="container px-4 md:px-6 max-w-7xl mx-auto relative">
        <div className="space-y-12">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { duration: 1 },
              }}
              className={`text-3xl font-bold tracking-tight sm:text-4xl mb-4 dark:text-white bg-gradient-to-r from-maroon via-[#8A3D4C] to-maroon dark:from-[#8A3D4C] dark:via-[#af5169] dark:to-[#8A3D4C] bg-clip-text text-transparent animate-gradient`}
            >
              {t("advancedEditor")}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 32, scale: 0.95 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { duration: 1, delay: 0.2 },
              }}
              className={`text-xl text-gray-500 dark:text-gray-300`}
            >
              {t("editorDescription")}
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 80, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { duration: 1, delay: 0.8 },
            }}
            className={`relative rounded-xl overflow-hidden shadow-2xl bg-white dark:bg-[#2a3349] aspect-[2/1] transition-all duration-700 hover:shadow-3xl hover:shadow-maroon/20 hover:scale-105 group`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-maroon/8 to-[#8A3D4C]/8 dark:from-[#8A3D4C]/15 dark:to-[#af5169]/15"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1500"></div>
            <div className="w-full h-full relative overflow-hidden">
              {/* Flat.io Music Editor Embed */}
              <div
                id="embed-container"
                className="w-full h-full transition-transform duration-700 group-hover:scale-105"
                style={{ minHeight: "450px" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            </div>

            {/* Enhanced Floating UI Elements */}
            <div className="absolute top-4 right-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-6 group-hover:translate-x-0 shadow-lg">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium">Live Preview</span>
              </div>
            </div>

            <div className="absolute bottom-4 left-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg p-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-6 group-hover:translate-y-0 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-maroon/10 dark:bg-[#8A3D4C]/20 rounded-full">
                  <Play className="h-5 w-5 text-maroon dark:text-[#8A3D4C]" />
                </div>
                <div className="flex gap-1">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-maroon dark:bg-[#8A3D4C] rounded-full animate-pulse transition-all duration-300"
                      style={{
                        height: `${12 + Math.random() * 8}px`,
                        animationDelay: `${i * 100}ms`,
                        animationDuration: `${1 + Math.random() * 0.5}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none">
              <div className="w-16 h-16 border-2 border-white/30 rounded-full flex items-center justify-center animate-spin">
                <div className="w-8 h-8 bg-white/20 rounded-full animate-pulse"></div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EditorPreview;
