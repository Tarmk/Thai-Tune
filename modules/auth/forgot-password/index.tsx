"use client";

import { useState, useEffect } from "react";
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
  KeyRound,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // The specific maroon color
  const maroonColor = "#4A1D2C";
  const maroonDark = "#8A3D4C";
  const maroonLighter = "#6A2D3C";
  const maroonLightest = "#F8F1F3";

  // Use theme-aware colors
  const buttonColor =
    mounted && resolvedTheme === "dark" ? maroonDark : maroonColor;
  const bgGradient =
    mounted && resolvedTheme === "dark"
      ? `linear-gradient(to right, ${maroonDark}, #9A4D5C)`
      : `linear-gradient(to right, ${maroonColor}, ${maroonLighter})`;
  const iconBgColor =
    mounted && resolvedTheme === "dark" ? "#3A2D35" : maroonLightest;
  const linkColor =
    mounted && resolvedTheme === "dark" ? "#e5a3b4" : maroonColor;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err) {
      if (err instanceof Error) {
        switch (err.message) {
          case "Firebase: Error (auth/user-not-found).":
            setError("No account found with this email address");
            break;
          case "Firebase: Error (auth/invalid-email).":
            setError("Invalid email address");
            break;
          case "Firebase: Error (auth/network-request-failed).":
            setError("Network error. Please try again");
            break;
          default:
            setError("An unexpected error occurred");
        }
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => router.push("/login")}
        className="absolute top-4 left-4 z-10 flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <Card className="w-full max-w-md overflow-hidden border-0 shadow-lg dark:bg-gray-800 dark:border-gray-700">
        <div className="h-2" style={{ background: bgGradient }} />

        <CardHeader className="space-y-1 pt-6 pb-4">
          <div className="flex justify-center mb-2">
            <div
              className="p-3 rounded-full"
              style={{ backgroundColor: iconBgColor }}
            >
              <KeyRound size={40} style={{ color: buttonColor }} />
            </div>
          </div>
          <h2 className="text-center text-2xl font-bold tracking-tight dark:text-white">
            Reset Password
          </h2>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Enter your email to receive a password reset link
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

          {success ? (
            <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4 text-center">
              <CheckCircle className="h-8 w-8 text-green-500 dark:text-green-400 mx-auto mb-2" />
              <h3 className="text-lg font-medium text-green-800 dark:text-green-300 mb-1">
                Check your email
              </h3>
              <p className="text-sm text-green-700 dark:text-green-400">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium dark:text-gray-300"
                >
                  Email
                </Label>
                <div className="relative group">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="m@example.com"
                    required
                    className="h-10 w-full border-gray-200 dark:border-gray-700 dark:bg-gray-800"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        document.querySelector("form")?.requestSubmit();
                      }
                    }}
                  />
                </div>
              </div>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pb-6">
          {success ? (
            <Link href="/login" className="w-full">
              <Button
                className={`w-full text-white`}
                style={{ backgroundColor: buttonColor }}
                //   disabled={isNavigating}
              >
                <span className="flex items-center">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                </span>
              </Button>
            </Link>
          ) : (
            <>
              <Button
                type="submit"
                className={`w-full text-white`}
                style={{ backgroundColor: buttonColor }}
                disabled={isLoading || !email}
                onClick={() => document.querySelector("form")?.requestSubmit()}
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
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Send Reset Link <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                )}
              </Button>

              <div className="text-center text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  Remember your password?
                </span>{" "}
                <Link
                  href="/login"
                  className="font-medium transition-colors"
                  style={{ color: linkColor }}
                >
                  Back to login
                </Link>
              </div>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default ForgotPassword;
