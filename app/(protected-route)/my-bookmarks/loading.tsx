import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/layouts/main/header";
import Footer from "@/layouts/main/footer";

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-[#1a1f2c]">
      <Header />
      <main className="flex-grow max-w-7xl mx-auto px-4 pt-20 pb-6 w-full">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-64" />
          </div>
        </div>
        <Card>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between py-4">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
