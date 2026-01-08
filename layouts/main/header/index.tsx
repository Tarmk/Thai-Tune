"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  LogOut,
  Settings,
  HelpCircle,
  Menu,
  Bookmark,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState, useEffect, FC } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/common/Logo";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { useAuth } from "@/hooks/use-auth";

interface IProps {
  user?: any;
  collapsible?: boolean;
}

const Header: FC<IProps> = ({ user: propUser, collapsible = false }) => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { user: contextUser, loading } = useAuth();

  // Collapsible header state
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Use context user if available, otherwise fall back to prop user
  const user = contextUser || propUser;

  // Handle scroll for collapsible header
  useEffect(() => {
    if (!collapsible) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show header when scrolling up or at the top
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setIsVisible(true);
      }
      // Hide header when scrolling down (after 100px threshold)
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Add scroll event listener
    window.addEventListener("scroll", throttledHandleScroll, { passive: true });

    // Cleanup
    return () => {
      window.removeEventListener("scroll", throttledHandleScroll);
    };
  }, [collapsible, lastScrollY]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Preload translations for common navigation items
  const translatedStrings = {
    myScore: t("myScore"),
    community: t("community"),
    features: t("features"),
    ourProducts: t("ourProducts"),
    login: t("login"),
    getStarted: t("getStarted"),
    settings: t("settings"),
    logout: t("logout"),
    myBookmarks: t("myBookmarks", { ns: "community" }),
    feedback: t("footer.contact.feedback"),
  };

  return (
    <header
      className={`sticky top-0 left-0 right-0 z-50 flex h-16 items-center px-6 ${
        collapsible
          ? "bg-white/95 dark:bg-[#1a1f2c]/95 backdrop-blur-sm"
          : "bg-white dark:bg-[#1a1f2c]"
      } shadow-sm dark:shadow-none border-b border-transparent dark:border-gray-800 transition-all duration-300 ${
        collapsible ? (isVisible ? "translate-y-0" : "-translate-y-full") : ""
      }`}
      style={{ pointerEvents: "auto" }}
    >
      <div className="container mx-auto p-0 flex justify-between items-center">
        <div className="flex items-center gap-12">
          <Logo
            size="lg"
            withText={true}
            variant="primary"
            borderRadius="rounded-lg"
            scale={1.3}
            href="/"
          />

          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button
                    variant="ghost"
                    className="font-medium text-gray-700 hover:text-maroon transition-colors dark:text-gray-200 dark:hover:text-white"
                  >
                    {translatedStrings.myScore}
                  </Button>
                </Link>
                <Link href="/community">
                  <Button
                    variant="ghost"
                    className="font-medium text-gray-700 hover:text-maroon transition-colors dark:text-gray-200 dark:hover:text-white"
                  >
                    {translatedStrings.community}
                  </Button>
                </Link>
                <Link href="/my-bookmarks">
                  <Button
                    variant="ghost"
                    className="font-medium text-gray-700 hover:text-maroon transition-colors dark:text-gray-200 dark:hover:text-white flex items-center gap-2"
                  >
                    <Bookmark className="h-4 w-4" />
                    {translatedStrings.myBookmarks}
                  </Button>
                </Link>
                <Link href="/feedback">
                  <Button
                    variant="ghost"
                    className="font-medium text-gray-700 hover:text-maroon transition-colors dark:text-gray-200 dark:hover:text-white"
                  >
                    {translatedStrings.feedback}
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className="font-medium text-gray-700 hover:text-maroon transition-colors dark:text-gray-200 dark:hover:text-white flex items-center gap-1.5"
                    >
                      {translatedStrings.features}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-2 dark:bg-[#232838] dark:border-gray-700">
                    <div className="space-y-1">
                      <Link
                        href="/database"
                        className="block px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-200"
                      >
                        Database
                      </Link>
                      <Link
                        href="#"
                        className="block px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-200"
                      >
                        Editor
                      </Link>
                      <Link
                        href="#"
                        className="block px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-200"
                      >
                        Learning Resources
                      </Link>
                      <Link
                        href="/about"
                        className="block px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-200"
                      >
                        About
                      </Link>
                    </div>
                  </PopoverContent>
                </Popover>

                <Link href="/community">
                  <Button
                    variant="ghost"
                    className="font-medium text-gray-700 hover:text-maroon transition-colors dark:text-gray-200 dark:hover:text-white"
                  >
                    {translatedStrings.community}
                  </Button>
                </Link>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className="font-medium text-gray-700 hover:text-maroon transition-colors dark:text-gray-200 dark:hover:text-white flex items-center gap-1.5"
                    >
                      {translatedStrings.ourProducts}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-2 dark:bg-[#232838] dark:border-gray-700">
                    <div className="space-y-1">
                      <Link
                        href="#"
                        className="block px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-200"
                      >
                        ThaiTune Database
                      </Link>
                      <Link
                        href="#"
                        className="block px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-200"
                      >
                        ThaiTune for Education
                      </Link>
                    </div>
                  </PopoverContent>
                </Popover>

                <Link href="/feedback">
                  <Button
                    variant="ghost"
                    className="font-medium text-gray-700 hover:text-maroon transition-colors dark:text-gray-200 dark:hover:text-white"
                  >
                    {translatedStrings.feedback}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* <div className="flex items-center gap-3"> */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex gap-3 items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex px-1 items-center gap-2 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full text-white flex items-center justify-center bg-primary">
                      {user?.displayName ? user.displayName.charAt(0) : "U"}
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 p-1 shadow-md dark:bg-[#232838] dark:border-gray-700"
                >
                  <div className="px-4 py-3 border-b dark:border-gray-700">
                    <div className="font-medium dark:text-white">
                      {user?.displayName || "User"}
                    </div>
                    <button
                      onClick={() => router.push(`/user/${user?.uid}`)}
                      className="text-sm text-gray-500 dark:text-gray-200 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
                    >
                      View profile
                    </button>
                  </div>
                  <DropdownMenuItem
                    className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-md dark:text-gray-200 dark:hover:bg-gray-700"
                    onClick={() => router.push("/settings")}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Account settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-md dark:text-gray-200 dark:hover:bg-gray-700">
                    <HelpCircle className="h-4 w-4" />
                    <span>Help</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-md dark:text-gray-200 dark:hover:bg-gray-700"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="font-medium text-gray-700 hover:text-maroon transition-colors dark:text-gray-200 dark:hover:text-white"
                  >
                    {translatedStrings.login}
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="shadow-sm font-medium transition-transform hover:scale-105 bg-maroon hover:bg-[#3A1520] dark:bg-[#8A3D4C] dark:hover:bg-maroon-dark text-white">
                    {translatedStrings.getStarted}
                  </Button>
                </Link>
              </div>
            )}

            <ThemeToggle />
            <LanguageToggle />
          </div>

          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" className="p-2" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[80%] sm:w-[350px] dark:bg-[#232838] dark:border-[#1a1f2c]"
            >
              <SheetTitle className="sr-only">mobile drawer</SheetTitle>
              <div className="mb-8 mt-4">
                <Logo
                  size="lg"
                  withText={true}
                  variant="primary"
                  borderRadius="rounded-lg"
                  scale={1.3}
                  href={user ? "/dashboard" : "/"}
                />
              </div>

              <nav className="flex flex-col gap-4">
                {!user && (
                  <>
                    <Link href="/login">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-lg dark:text-gray-200"
                      >
                        {translatedStrings.login}
                      </Button>
                    </Link>
                    <Link href="/signup" className="mb-2">
                      <Button className="w-full text-lg bg-maroon hover:bg-[#3A1520] dark:bg-[#8A3D4C] dark:hover:bg-maroon-dark text-white transition-colors">
                        {translatedStrings.getStarted}
                      </Button>
                    </Link>
                  </>
                )}
                <Link href={user ? "/dashboard" : "/"}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-lg dark:text-gray-200"
                  >
                    {user
                      ? translatedStrings.myScore
                      : translatedStrings.features}
                  </Button>
                </Link>
                <Link href="/community">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-lg dark:text-gray-200"
                  >
                    {translatedStrings.community}
                  </Button>
                </Link>
                {user && (
                  <Link href="/my-bookmarks">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-lg dark:text-gray-200 flex items-center gap-2"
                    >
                      <Bookmark className="h-4 w-4" />
                      {translatedStrings.myBookmarks}
                    </Button>
                  </Link>
                )}
                <Link href="/feedback">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-lg dark:text-gray-200"
                  >
                    {translatedStrings.feedback}
                  </Button>
                </Link>
                <div className="flex items-center gap-4 w-full">
                  <ThemeToggle />
                  <LanguageToggle />
                </div>

                {!user && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-lg dark:text-gray-200"
                  >
                    {translatedStrings.ourProducts}
                  </Button>
                )}
                {user && (
                  <>
                    <div className="flex items-center gap-3 px-3 py-4 border-b dark:border-gray-700 mb-2">
                      <div className="h-10 w-10 rounded-full text-white flex items-center justify-center text-lg bg-primary">
                        {user?.displayName ? user.displayName.charAt(0) : "U"}
                      </div>
                      <div>
                        <div className="font-medium dark:text-white">
                          {user?.displayName || "User"}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 dark:hover:bg-gray-700">
                          Account
                        </div>
                      </div>
                    </div>
                    <Link href="/settings">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-lg dark:text-gray-200 dark:hover:bg-gray-700"
                      >
                        {translatedStrings.settings}
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-lg text-red-600 dark:text-red-400"
                      onClick={handleLogout}
                    >
                      {translatedStrings.logout}
                    </Button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
