"use client";

import Link from "next/link";
import { Logo } from "@/components/common/Logo";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation("common");

  return (
    <footer className="bg-white dark:bg-[#232838] pt-16 pb-12 border-t border-gray-100 dark:border-gray-800">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        {/* Logo and description section */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-12">
          <div className="mb-8 md:mb-0 md:max-w-xs">
            <Logo
              size="lg"
              withText={true}
              variant="primary"
              borderRadius="rounded-lg"
            />
            <p className="mt-4 text-gray-500 dark:text-gray-300 text-sm">
              {t("footer.description")}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-8 xl:gap-12">
            <div>
              <h3 className="text-base font-bold mb-4 text-maroon dark:text-maroon-lite">
                {t("footer.thaitune.title")}
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="text-gray-600 hover:text-maroon transition-colors dark:text-gray-300 dark:hover:text-white"
                  >
                    {t("footer.organization.aboutUs")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/database"
                    className="text-gray-600 hover:text-maroon transition-colors dark:text-gray-300 dark:hover:text-white"
                  >
                    {t("footer.thaitune.databaseOverview")}
                  </Link>
                </li>

                <li>
                  <Link
                    href="/community"
                    className="text-gray-600 hover:text-maroon transition-colors dark:text-gray-300 dark:hover:text-white"
                  >
                    {t("footer.thaitune.community")}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-base font-bold mb-4 text-maroon dark:text-maroon-lite">
                {t("footer.support.title")}
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/help-center"
                    className="text-gray-600 hover:text-maroon transition-colors dark:text-gray-300 dark:hover:text-white"
                  >
                    {t("footer.support.helpCenter")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-service"
                    className="text-gray-600 hover:text-maroon transition-colors dark:text-gray-300 dark:hover:text-white"
                  >
                    {t("footer.support.termsOfService")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-gray-600 hover:text-maroon transition-colors dark:text-gray-300 dark:hover:text-white"
                  >
                    {t("footer.support.privacyPolicy")}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-base font-bold mb-4 text-maroon dark:text-maroon-lite">
                {t("footer.contact.title")}
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="#"
                    className="text-gray-600 hover:text-maroon transition-colors dark:text-gray-300 dark:hover:text-white"
                  >
                    {t("footer.contact.getInTouch")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/feedback"
                    className="text-gray-600 hover:text-maroon transition-colors dark:text-gray-300 dark:hover:text-white"
                  >
                    {t("footer.contact.feedback")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/report-issue"
                    className="text-gray-600 hover:text-maroon transition-colors dark:text-gray-300 dark:hover:text-white"
                  >
                    {t("footer.contact.reportAnIssue")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom section with socials and copyright */}
        <div className="border-t border-gray-100 dark:border-gray-800 pt-8 mt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
