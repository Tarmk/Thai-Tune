"use client";
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Globe,
  Lock,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import CreateNewScore from "./createNewScore";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/use-auth";

const NewScore = () => {
  const { t, i18n } = useTranslation("editor");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateScore, setShowCreateScore] = useState(false);
  const [scoreDocId, setScoreDocId] = useState<string | null>(null);
  const [sharing, setSharing] = useState("public");
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();

  // Debug i18n
  //const [debug, setDebug] = useState("");

  // Make sure translations are loaded
  useEffect(() => {
    if (i18n.isInitialized) {
      i18n.reloadResources(i18n.language, ["editor"]).then(() => {
        console.log("Reloaded editor translations");
      });
    }
  }, [i18n.isInitialized, i18n.language]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // The specific maroon color
  // Use standardized theme colors
  const buttonColor = "hsl(var(--primary))";
  const bgGradient =
    "linear-gradient(to right, hsl(var(--primary)), hsl(var(--primary-hover)))";
  const iconBgColor = "hsl(var(--primary-foreground))";
  const linkColor = "hsl(var(--primary))";

  // Theme-aware background and text colors
  const cardBg = mounted && resolvedTheme === "dark" ? "#242A38" : "white";
  const inputBg = mounted && resolvedTheme === "dark" ? "#212838" : "#f9fafb";
  const inputBorder =
    mounted && resolvedTheme === "dark" ? "#323A4B" : "#e5e7eb";
  const textColor = mounted && resolvedTheme === "dark" ? "white" : "#111827";
  const labelColor =
    mounted && resolvedTheme === "dark" ? "#D1D5DB" : "#374151";
  const subtitleColor =
    mounted && resolvedTheme === "dark" ? "#9CA3AF" : "#6b7280";
  const pageBg = mounted && resolvedTheme === "dark" ? "#1a1f2c" : "#f3f4f6";

  // Option colors
  const optionBorderInactive =
    mounted && resolvedTheme === "dark" ? "#323A4B" : "#e5e7eb";
  const optionBgActive =
    mounted && resolvedTheme === "dark"
      ? "rgba(154, 53, 72, 0.1)"
      : "rgba(74, 29, 44, 0.05)";
  const optionBorderActive = "hsl(var(--primary))";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!user) throw new Error(t("errors.loginRequired"));
      if (!name.trim()) throw new Error(t("errors.nameRequired"));

      const scoreData = {
        name: name.trim(),
        author: user.displayName || "Anonymous",
        created: serverTimestamp(),
        modified: serverTimestamp(),
        userId: user.uid,
        sharing: sharing,
        flatid: "",
      };

      console.log("scoreData", scoreData);

      const docRef = await addDoc(collection(db, "scores"), scoreData);
      setScoreDocId(docRef.id);
      setShowCreateScore(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.unexpected"));
    } finally {
      setIsLoading(false);
    }
  };

  if (showCreateScore) {
    if (!scoreDocId) return null;
    return <CreateNewScore title={name} user={user} scoreDocId={scoreDocId} />;
  }

  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-[#1a1f2c] transition-colors duration-300"
      style={{ background: pageBg }}
    >
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-4">
        <div
          className="w-full max-w-md rounded-lg shadow-lg overflow-hidden border-0 dark:bg-gray-800 dark:border-gray-700 transition-colors duration-300"
          style={{ background: cardBg }}
        >
          <div className="h-2" style={{ background: bgGradient }}></div>

          <div className="p-6">
            <div className="flex flex-col items-center mb-6">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: iconBgColor }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 17.5V5.5L19 4V16"
                    stroke={buttonColor}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="6"
                    cy="17.5"
                    r="3"
                    stroke={buttonColor}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="16"
                    cy="16"
                    r="3"
                    stroke={buttonColor}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h1
                className="text-2xl font-bold text-center"
                style={{ color: textColor }}
              >
                {t("createNewScore")}
              </h1>
              <p
                className="text-center mt-1 text-sm"
                style={{ color: subtitleColor }}
              >
                {t("scoreDescription")}
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-[#9a3548]/40 p-3">
                <p className="flex items-center text-sm font-medium text-red-800 dark:text-red-400">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  {error}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium"
                  style={{ color: labelColor }}
                >
                  {t("scoreName")}
                </label>
                <input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("enterScoreName")}
                  className="w-full px-4 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#9a3548] focus:border-[#9a3548] border-gray-200 dark:border-gray-700"
                  style={{
                    background: inputBg,
                    borderColor: inputBorder,
                    borderWidth: "1px",
                    borderStyle: "solid",
                    color: textColor,
                  }}
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  className="block text-sm font-medium"
                  style={{ color: labelColor }}
                >
                  {t("sharingOption")}
                </label>
                <div className="space-y-2">
                  <div
                    className={`flex items-center space-x-3 rounded-lg border p-3 cursor-pointer`}
                    style={{
                      borderColor:
                        sharing === "public"
                          ? optionBorderActive
                          : optionBorderInactive,
                      background:
                        sharing === "public" ? optionBgActive : "transparent",
                    }}
                    onClick={() => setSharing("public")}
                  >
                    <div className="flex items-center justify-center h-5 w-5">
                      <div
                        className={`h-3 w-3 rounded-full ${sharing === "public" ? "" : "bg-transparent border border-gray-500"}`}
                        style={{
                          background:
                            sharing === "public" ? buttonColor : "transparent",
                        }}
                      ></div>
                    </div>
                    <Globe className="w-5 h-5" style={{ color: buttonColor }} />
                    <div className="flex-1">
                      <div className="font-medium" style={{ color: textColor }}>
                        {t("public")}
                      </div>
                      <div className="text-xs" style={{ color: subtitleColor }}>
                        {t("publicDescription", "Anyone can view this score")}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`flex items-center space-x-3 rounded-lg border p-3 cursor-pointer`}
                    style={{
                      borderColor:
                        sharing === "private"
                          ? optionBorderActive
                          : optionBorderInactive,
                      background:
                        sharing === "private" ? optionBgActive : "transparent",
                    }}
                    onClick={() => setSharing("private")}
                  >
                    <div className="flex items-center justify-center h-5 w-5">
                      <div
                        className={`h-3 w-3 rounded-full ${sharing === "private" ? "" : "bg-transparent border border-gray-500"}`}
                        style={{
                          background:
                            sharing === "private" ? buttonColor : "transparent",
                        }}
                      ></div>
                    </div>
                    <Lock className="w-5 h-5" style={{ color: buttonColor }} />
                    <div className="flex-1">
                      <div className="font-medium" style={{ color: textColor }}>
                        {t("private")}
                      </div>
                      <div className="text-xs" style={{ color: subtitleColor }}>
                        {t(
                          "privateDescription",
                          "Only you can view this score"
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full text-white py-2.5 rounded-lg transition-colors mt-6 flex items-center justify-center"
                style={{ backgroundColor: buttonColor }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="mr-2 h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    {t("creating")}
                  </span>
                ) : (
                  <span className="flex items-center">
                    {t("next")} <ChevronRight className="ml-2 h-4 w-4" />
                  </span>
                )}
              </button>
            </form>

            <div className="mt-4 text-center">
              <Link
                href="/dashboard"
                className="text-sm flex items-center justify-center mx-auto transition-colors"
                style={{ color: linkColor }}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                {t("backToMyScores")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewScore;
