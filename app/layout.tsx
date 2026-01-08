import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import GlobalProvider from "@/providers/global-providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ThaiTune - Traditional Thai Music Database",
  description: "Explore and contribute to the world of Traditional Thai Music",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} transition-colors duration-300`}>
        <ErrorBoundary>
          <GlobalProvider>{children}</GlobalProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
