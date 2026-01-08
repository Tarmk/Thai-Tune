import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function NotFoundClientContent() {
  // We are NOT using useSearchParams here intentionally
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl mb-6">Page Not Found</h2>
      <p className="text-gray-500 mb-8 max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Button asChild>
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  );
}

export default function NotFound() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1f2c]">
          <div className="flex flex-col items-center space-y-3">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-maroon dark:border-[#8A3D4C] border-r-transparent"></div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Loading...
            </p>
          </div>
        </div>
      }
    >
      <NotFoundClientContent />
    </Suspense>
  );
}
