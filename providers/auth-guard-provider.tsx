"use client";

import type React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import GlobalLoader from "@/components/common/global-loader";

export function AuthGuardProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  if (!user) return <GlobalLoader />;

  return <>{children}</>;
}
