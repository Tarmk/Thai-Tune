"use client";

import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { VerificationCodeInput } from "@/components/auth/VerificationCodeInput";
import { useState, useEffect } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";
import { setDoc, doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  UserPlus,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";

import { useTranslation } from "react-i18next";

const Signup = () => {
  const router = useRouter();
  // We no longer use email verification codes to keep signup simple and reliable
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "musician",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { t } = useTranslation(["auth", "common"]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use standardized theme colors
  const buttonColor = "hsl(var(--primary))";
  const bgGradient =
    "linear-gradient(to right, hsl(var(--primary)), hsl(var(--primary-hover)))";
  const iconBgColor = "hsl(var(--primary-foreground))";
  const linkColor = "hsl(var(--primary))";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    // Basic validation
    if (password.length < 6) {
      setError("Password should be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      // Create the user account directly (no email verification step)
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(userCredential.user, { displayName: name || "" });

      // Create user document in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        displayName: name || "",
        email,
        bio: "",
        createdAt: new Date(),
        followers: [],
        following: [],
      });

      // Navigate to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Signup error:", err);

      // Prefer structured Firebase error codes when available
      const code = typeof err?.code === "string" ? err.code : "";

      if (code === "permission-denied") {
        setError(
          "Missing or insufficient permissions. Fix Firestore rules to allow creating users/{uid} for the signed-in user."
        );
        return;
      }

      // Handle Firebase Auth errors
      if (err instanceof Error) {
        if (err.message.includes("email-already-in-use")) {
          setError("Email is already in use");
        } else if (err.message.includes("invalid-email")) {
          setError("Invalid email address");
        } else if (err.message.includes("weak-password")) {
          setError("Password should be at least 6 characters");
        } else if (err.message.includes("network-request-failed")) {
          setError("Network request failed. Please check your connection.");
        } else {
          setError(err.message || "An unexpected error occurred. Please try again.");
        }
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // No verification-code UI path anymore; signup is a single step

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 relative overflow-hidden">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => router.push("/")}
        className="absolute top-4 left-4 z-10 flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 backdrop-blur-sm bg-white/10 dark:bg-gray-800/10 border border-white/20 dark:border-gray-700/20"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <Card className="w-full max-w-md overflow-hidden border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm dark:border-gray-700 relative z-10">
        <div className="h-2" style={{ background: bgGradient }} />

        <CardHeader className="space-y-1 pt-6 pb-4">
          <div className="flex justify-center mb-2">
            <div
              className="rounded-full p-2"
              style={{ backgroundColor: iconBgColor }}
            >
              <UserPlus className="h-8 w-8" style={{ color: buttonColor }} />
            </div>
          </div>
          <h2 className="text-center text-2xl font-bold tracking-tight dark:text-white">
            Sign Up
          </h2>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Create an account to get started
          </p>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 mb-4">
              <p className="flex items-center text-sm font-medium text-red-800 dark:text-red-400">
                <AlertCircle className="mr-2 h-4 w-4" />
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium dark:text-gray-300"
              >
                Name
              </Label>
              <div className="relative">
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  required
                  className="h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white/5 dark:bg-gray-900/40 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b1455b] focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium dark:text-gray-300"
              >
                Email
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  className="h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white/5 dark:bg-gray-900/40 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b1455b] focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium dark:text-gray-300"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="password"
                  required
                  className="h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white/5 dark:bg-gray-900/40 text-sm pr-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b1455b] focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      document.querySelector("form")?.requestSubmit();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className={`w-full text-white`}
              style={{ backgroundColor: buttonColor }}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
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
                  Signing up...
                </span>
              ) : (
                <span className="flex items-center">
                  Sign Up
                  <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pb-6">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium transition-colors"
              style={{ color: linkColor }}
            >
              Log In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};
export default Signup;
