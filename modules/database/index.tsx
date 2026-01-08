"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  Music,
  Users,
  Download,
  Filter,
  Star,
  Clock,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

const Database = () => {
  const { t } = useTranslation("common");

  return (
    <div className="min-h-screen bg-white dark:bg-[#1a1f2c] flex flex-col transition-colors duration-300">
      {/* Hero Section */}
      <main className="flex-1">
        <section className="w-full py-20 bg-gradient-to-br from-maroon to-maroon-dark dark:from-[#1a1f2c] dark:to-[#2a1f2c]">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div className="flex flex-col justify-center space-y-8">
                <div className="space-y-6">
                  <div className="inline-block">
                    <span className="bg-maroon dark:bg-[#8A3D4C] text-white px-3 py-1 rounded-full text-sm font-medium">
                      {t("database.overview")}
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white lg:text-6xl/none">
                    {t("database.title")}
                  </h1>
                  <p className="text-xl text-gray-200 dark:text-gray-300 max-w-[600px]">
                    {t("database.description")}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/community">
                    <Button className="bg-maroon hover:bg-[#3A1520] dark:bg-[#8A3D4C] dark:hover:bg-maroon-dark text-white text-base px-6 py-3 shadow-md transition-transform hover:scale-105">
                      {t("database.browseDatabase")}
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button
                      variant="ghost"
                      className="text-white border-white hover:bg-white/10 dark:hover:bg-white/5 text-base px-6 py-3"
                    >
                      {t("database.contributeSongs")}
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-full aspect-square max-w-md">
                  <div className="w-full h-full bg-gradient-to-br from-maroon to-maroon-dark dark:from-[#8A3D4C] dark:to-[#af5169] rounded-2xl flex items-center justify-center shadow-2xl">
                    <div className="text-center">
                      <Music className="h-24 w-24 text-white mx-auto mb-4" />
                      <div className="text-white text-lg font-semibold">
                        {t("database.songsCount")}
                      </div>
                      <div className="text-gray-200 dark:text-gray-300 text-sm">
                        {t("database.songsLabel")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Database Features Section */}
        <section className="w-full py-20 bg-gray-50 dark:bg-[#232838]">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl mb-4">
                {t("database.featuresTitle")}
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                {t("database.featuresDescription")}
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card className="bg-white dark:bg-[#2a3349] shadow-lg hover:shadow-xl dark:shadow-none dark:border-none transition-shadow">
                <div className="h-1 bg-gradient-to-t from-[#4A1D2C] to-[#6A2D3C] dark:from-[#8A3D4C] dark:to-[#af5169]" />
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-[#4a1d2c1a] dark:bg-[#8a3d4c33] rounded-full flex items-center justify-center mx-auto my-6">
                    <Search className="h-8 w-8 text-[#4A1D2C] dark:text-[#e5a3b4]" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {t("database.advancedSearchTitle")}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {t("database.advancedSearchDesc")}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-[#2a3349] shadow-lg hover:shadow-xl dark:shadow-none dark:border-none transition-shadow">
                <div className="h-1 bg-gradient-to-t from-[#4A1D2C] to-[#6A2D3C] dark:from-[#8A3D4C] dark:to-[#af5169]" />
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-[#4a1d2c1a] dark:bg-[#8a3d4c33] rounded-full flex items-center justify-center mx-auto my-6">
                    <Filter className="h-8 w-8 text-[#4A1D2C] dark:text-[#e5a3b4]" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {t("database.smartFilteringTitle")}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {t("database.smartFilteringDesc")}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-[#2a3349] shadow-lg hover:shadow-xl dark:shadow-none dark:border-none transition-shadow">
                <div className="h-1 bg-gradient-to-t from-[#4A1D2C] to-[#6A2D3C] dark:from-[#8A3D4C] dark:to-[#af5169]" />
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-[#4a1d2c1a] dark:bg-[#8a3d4c33] rounded-full flex items-center justify-center mx-auto my-6">
                    <Users className="h-8 w-8 text-[#4A1D2C] dark:text-[#e5a3b4]" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {t("database.communityContributionsTitle")}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {t("database.communityContributionsDesc")}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-[#2a3349] shadow-lg hover:shadow-xl dark:shadow-none dark:border-none transition-shadow">
                <div className="h-1 bg-gradient-to-t from-[#4A1D2C] to-[#6A2D3C] dark:from-[#8A3D4C] dark:to-[#af5169]" />
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-[#4a1d2c1a] dark:bg-[#8a3d4c33] rounded-full flex items-center justify-center mx-auto my-6">
                    <Download className="h-8 w-8 text-[#4A1D2C] dark:text-[#e5a3b4]" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {t("database.multipleFormatsTitle")}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {t("database.multipleFormatsDesc")}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-[#2a3349] shadow-lg hover:shadow-xl dark:shadow-none dark:border-none transition-shadow">
                <div className="h-1 bg-gradient-to-t from-[#4A1D2C] to-[#6A2D3C] dark:from-[#8A3D4C] dark:to-[#af5169]" />
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-[#4a1d2c1a] dark:bg-[#8a3d4c33] rounded-full flex items-center justify-center mx-auto my-6">
                    <Star className="h-8 w-8 text-[#4A1D2C] dark:text-[#e5a3b4]" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {t("database.qualityAssuranceTitle")}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {t("database.qualityAssuranceDesc")}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-[#2a3349] shadow-lg hover:shadow-xl dark:shadow-none dark:border-none transition-shadow">
                <div className="h-1 bg-gradient-to-t from-[#4A1D2C] to-[#6A2D3C] dark:from-[#8A3D4C] dark:to-[#af5169]" />
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-[#4a1d2c1a] dark:bg-[#8a3d4c33] rounded-full flex items-center justify-center mx-auto my-6">
                    <Clock className="h-8 w-8 text-[#4A1D2C] dark:text-[#e5a3b4]" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {t("database.historicalContextTitle")}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {t("database.historicalContextDesc")}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Database Statistics */}
        <section className="w-full py-20 bg-white dark:bg-[#1a1f2c]">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl mb-4">
                {t("database.statsTitle")}
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                {t("database.statsDescription")}
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-maroon dark:text-[#8A3D4C] mb-2">
                  10,000+
                </div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">
                  {t("database.traditionalSongs")}
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-maroon-dark dark:text-[#af5169] mb-2">
                  500+
                </div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">
                  {t("database.contributors")}
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-maroon dark:text-[#8A3D4C] mb-2">
                  77
                </div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">
                  {t("database.thaiProvinces")}
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-maroon-dark dark:text-[#af5169] mb-2">
                  50+
                </div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">
                  {t("database.musicalStyles")}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full py-20 bg-gray-50 dark:bg-[#232838]">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl mb-4">
                {t("database.howItWorksTitle")}
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                {t("database.howItWorksDescription")}
              </p>
            </div>

            <div className="grid gap-12 lg:grid-cols-3">
              <div className="text-center">
                <div className="w-20 h-20 bg-maroon dark:bg-[#8A3D4C] rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {t("database.step1Title")}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t("database.step1Description")}
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-maroon-dark dark:bg-[#af5169] rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {t("database.step2Title")}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t("database.step2Description")}
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-maroon dark:bg-[#8A3D4C] rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {t("database.step3Title")}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t("database.step3Description")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="w-full py-20 bg-gradient-to-r from-maroon to-maroon-dark dark:from-[#2a1f2c] dark:to-[#3a1f2c]">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto text-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white sm:text-5xl">
                {t("database.ctaTitle")}
              </h2>
              <p className="text-xl text-gray-200 dark:text-gray-300 max-w-3xl mx-auto">
                {t("database.ctaDescription")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/community">
                  <Button className="bg-white text-maroon hover:bg-gray-100 dark:bg-gray-200 dark:text-[#2a1f2c] dark:hover:bg-gray-300 text-base px-8 py-3 shadow-md transition-transform hover:scale-105">
                    <Globe className="mr-2 h-5 w-5" />
                    {t("database.exploreDatabase")}
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    variant="ghost"
                    className="text-white border-white hover:bg-white/10 dark:hover:bg-white/5 text-base px-8 py-3"
                  >
                    <Music className="mr-2 h-5 w-5" />
                    {t("database.contributeSongsIcon")}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
export default Database;
