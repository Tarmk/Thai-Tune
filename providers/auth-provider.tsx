"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, type User } from "firebase/auth";
import { AuthContext } from "@/context/auth-context";
import GlobalLoader from "@/components/common/global-loader";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (mounted) {
          setUser(user);
          setLoading(false);
          // Set initialLoad to false after first auth check
          if (initialLoad) {
            setInitialLoad(false);
          }
        }
      },
      (error) => {
        // Handle auth errors silently to prevent flashing
        if (mounted) {
          console.warn("Auth state change error:", error);
          setLoading(false);
          if (initialLoad) {
            setInitialLoad(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [initialLoad]);

  // Show minimal loading only on very first load and only for a short time
  if (initialLoad && loading) {
    // Set a timeout to show content even if auth is still loading
    setTimeout(() => {
      if (initialLoad) {
        setInitialLoad(false);
      }
    }, 800); // Max 800ms loading screen

    return <GlobalLoader />;
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
