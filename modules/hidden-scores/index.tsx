"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Music, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";

interface HiddenScore {
  id: string;
  title: string;
  author: string;
  thumbnailUrl?: string;
  sharing: string;
  createdAt?: string;
}

const HiddenScores = () => {
  const [hiddenScores, setHiddenScores] = useState<HiddenScore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fetch hidden scores data
  useEffect(() => {
    const fetchHiddenScores = async () => {
      setIsLoading(true);
      try {
        // Get hidden score IDs from localStorage
        const hiddenScoreIds = JSON.parse(
          localStorage.getItem("hiddenScores") || "[]"
        ) as string[];

        if (hiddenScoreIds.length === 0) {
          setHiddenScores([]);
          setIsLoading(false);
          return;
        }

        // Fetch score details from Firestore
        const scoresData: HiddenScore[] = [];
        for (const scoreId of hiddenScoreIds) {
          try {
            const scoreDoc = await getDoc(doc(db, "scores", scoreId));
            if (scoreDoc.exists()) {
              const data = scoreDoc.data();
              scoresData.push({
                id: scoreId,
                title: data.name || "Untitled Score",
                author: data.author || "Unknown Author",
                thumbnailUrl: data.flatid
                  ? `https://flat.io/api/v2/scores/${data.flatid}/revisions/last/thumbnail.png?width=300&height=400`
                  : undefined,
                sharing: data.sharing || "private",
                createdAt: data.created
                  ? new Date(data.created.toDate()).toLocaleDateString()
                  : undefined,
              });
            }
          } catch (error) {
            console.error(`Error fetching score ${scoreId}:`, error);
          }
        }

        setHiddenScores(scoresData);
      } catch (error) {
        console.error("Error fetching hidden scores:", error);
        toast({
          title: "Error",
          description: "Failed to load hidden scores",
          // type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchHiddenScores();
  }, []);

  const handleUnhideScore = (scoreId: string) => {
    try {
      // Remove from localStorage
      const hiddenScoreIds = JSON.parse(
        localStorage.getItem("hiddenScores") || "[]"
      ) as string[];
      const updatedIds = hiddenScoreIds.filter((id) => id !== scoreId);
      localStorage.setItem("hiddenScores", JSON.stringify(updatedIds));

      // Dispatch custom event to notify other components
      window.dispatchEvent(
        new CustomEvent("hiddenScoresChanged", {
          detail: { action: "unhide", scoreId, updatedIds },
        })
      );

      // Remove from state
      setHiddenScores((prev) => prev.filter((score) => score.id !== scoreId));

      toast({
        title: "Success",
        description:
          "Score has been unhidden and will appear in the community again",
        //type: "success",
      });
    } catch (error) {
      console.error("Error unhiding score:", error);
      toast({
        title: "Error",
        description: "Failed to unhide score",
        //type: "error",
      });
    }
  };

  const handleClearAllHidden = () => {
    try {
      localStorage.removeItem("hiddenScores");

      // Dispatch custom event to notify other components
      window.dispatchEvent(
        new CustomEvent("hiddenScoresChanged", {
          detail: { action: "clear", updatedIds: [] },
        })
      );

      setHiddenScores([]);
      toast({
        title: "Success",
        description: "All hidden scores have been restored",
        //type: "success",
      });
    } catch (error) {
      console.error("Error clearing hidden scores:", error);
      toast({
        title: "Error",
        description: "Failed to clear hidden scores",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1a1f2c]">
      <main className="pt-8 md:pt-20 pb-12">
        <div className="container max-w-4xl mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Hidden Scores
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Manage scores you've hidden from the community page
                </p>
              </div>

              {hiddenScores.length > 0 && (
                <Button
                  onClick={handleClearAllHidden}
                  variant="outline"
                  className="text-maroon dark:text-[#8A3D4C] border-maroon dark:border-[#8A3D4C] hover:bg-maroon hover:text-white dark:hover:bg-[#8A3D4C]"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Unhide All
                </Button>
              )}
            </div>
          </motion.div>

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maroon dark:border-[#8A3D4C]"></div>
            </div>
          ) : hiddenScores.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <EyeOff className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Hidden Scores
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                You haven't hidden any scores from the community page yet.
              </p>
              <Link href="/community">
                <Button className="bg-maroon hover:bg-[#3A1520] dark:bg-[#8A3D4C] dark:hover:bg-maroon-dark text-white">
                  Browse Community
                </Button>
              </Link>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {hiddenScores.map((score, index) => (
                <motion.div
                  key={score.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-300 group">
                    {/* Thumbnail */}
                    <div className="relative w-full h-48 bg-gray-50 dark:bg-gray-900">
                      {score.thumbnailUrl ? (
                        <Image
                          src={score.thumbnailUrl}
                          alt={score.title}
                          fill
                          style={{
                            objectFit: "contain",
                            objectPosition: "center",
                          }}
                          className="group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music className="h-16 w-16 text-gray-400" />
                        </div>
                      )}

                      {/* Overlay with unhide button */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Button
                          onClick={() => handleUnhideScore(score.id)}
                          size="sm"
                          className="bg-white text-gray-900 hover:bg-gray-100"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Unhide
                        </Button>
                      </div>
                    </div>

                    {/* Content */}
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">
                        {score.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        by {score.author}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              score.sharing === "public"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                : score.sharing === "unlisted"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {score.sharing}
                          </span>
                        </div>

                        <Button
                          onClick={() => handleUnhideScore(score.id)}
                          size="sm"
                          variant="ghost"
                          className="text-maroon dark:text-[#8A3D4C] hover:text-white hover:bg-maroon dark:hover:bg-[#8A3D4C]"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>

                      {score.createdAt && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Created: {score.createdAt}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HiddenScores;
