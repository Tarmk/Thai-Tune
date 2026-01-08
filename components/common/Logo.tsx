"use client";

import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  withText?: boolean;
  href?: string;
  variant?: "primary" | "secondary";
  borderRadius?: string;
  transparent?: boolean;
  scale?: number;
}

export function Logo({
  size = "md",
  withText = true,
  href = "/",
  variant = "primary",
  borderRadius = "rounded-lg", // Default rounded corners
  transparent = false,
  scale = 1.1, // Default scaling factor to make logo slightly larger
}: LogoProps) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // After mounting, we have access to the theme
  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted ? resolvedTheme || theme : "light";
  const isDark = currentTheme === "dark";

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  // Updated color classes to match button colors
  const colorClasses = {
    primary: isDark ? "text-maroon-lite" : "text-maroon",
    secondary: isDark ? "text-maroon-lite" : "text-[#800000]",
  };

  // Always use transparent logo, and control background color
  const logoPath = "/images/thaitune-logo-transparent.png";

  // Background color based on theme - matching the button colors
  const bgColor = isDark ? "#8A3D4C" : "#4A1D2C";

  // Show a placeholder during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex items-center gap-2">
        <div
          className={`relative ${sizeClasses[size]} ${borderRadius} bg-gray-200 dark:bg-gray-700`}
        ></div>
        {withText && (
          <div className="w-20 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
        )}
      </div>
    );
  }

  const logoContent = (
    <div className="flex items-center gap-2">
      <div
        className={`relative ${sizeClasses[size]} overflow-hidden ${borderRadius}`}
        style={{ backgroundColor: bgColor }}
      >
        <Image
          src={logoPath}
          alt="ThaiTune Logo"
          width={512}
          height={512}
          className="object-cover"
          style={{ transform: `scale(${scale})` }}
          priority
        />
      </div>
      {withText && (
        <span
          className={`text-lg font-bold ${colorClasses[variant]} transition-colors`}
        >
          ThaiTune
        </span>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{logoContent}</Link>;
  }

  return logoContent;
}
