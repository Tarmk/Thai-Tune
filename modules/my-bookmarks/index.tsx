"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronUp, ChevronDown, Star, BookmarkX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  getDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { Timestamp } from "firebase/firestore";
import debounce from "lodash.debounce";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { SearchBar } from "@/components/common/SearchBar";
import { toast } from "@/hooks/use-toast";

interface BookmarkedScore {
  id: string;
  name: string;
  author: string;
  modified: string;
  created: string;
  sharing: string;
  rating?: number;
  ratingCount?: number;
}

const MyBookmarks = () => {
  const { t } = useTranslation("community");
  const [scores, setScores] = useState<BookmarkedScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState<keyof BookmarkedScore | null>(
    null
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const { resolvedTheme } = useTheme();

  // Theme-aware colors
  const maroonColor = "#800000";
  const maroonDark = "#e5a3b4";
  const accentColor = resolvedTheme === "dark" ? maroonDark : maroonColor;

  // Background colors matching the landing page
  const pageBg = resolvedTheme === "dark" ? "#1a1f2c" : "#f3f4f6";
  const cardBg = resolvedTheme === "dark" ? "#242A38" : "white";

  const debouncedSetSearchQuery = useCallback(
    debounce((query: string) => setSearchQuery(query), 300),
    []
  );

  const handleSearchChange = (value: string) => {
    debouncedSetSearchQuery(value);
  };

  useEffect(() => {
    const fetchBookmarkedScores = async () => {
      try {
        setLoading(true);
        const user = auth.currentUser;
        if (!user) {
          setLoading(false);
          return;
        }

        // First get the user's bookmarks
        const bookmarksRef = collection(db, "bookmarks");
        const bookmarksQuery = query(
          bookmarksRef,
          where("userId", "==", user.uid)
        );
        const bookmarksSnapshot = await getDocs(bookmarksQuery);

        // Get all bookmarked score IDs
        const bookmarkedScoreIds = bookmarksSnapshot.docs.map(
          (doc) => doc.data().scoreId
        );

        // Then fetch only the bookmarked score docs (reading the whole `scores` collection
        // will fail under secure Firestore rules).
        if (bookmarkedScoreIds.length === 0) {
          setScores([]);
          return;
        }

        const scoreResults = await Promise.all(
          bookmarkedScoreIds.map(async (scoreId: string) => {
            try {
              const scoreSnap = await getDoc(doc(db, "scores", scoreId));
              if (!scoreSnap.exists()) return null;

              const data = scoreSnap.data();
              const modifiedTimestamp = data.modified as Timestamp | undefined;
              const createdTimestamp = data.created as Timestamp | undefined;

              return {
                id: scoreSnap.id,
                name: data.name || "",
                author: data.author || "",
                modified:
                  modifiedTimestamp && modifiedTimestamp.toDate
                    ? modifiedTimestamp.toDate().toLocaleString()
                    : t("unknownDate"),
                created:
                  createdTimestamp && createdTimestamp.toDate
                    ? createdTimestamp.toDate().toLocaleString()
                    : t("unknownDate"),
                sharing: data.sharing || "private",
                rating: data.rating || 0,
                ratingCount: data.ratingCount || 0,
              } satisfies BookmarkedScore;
            } catch (e) {
              // A bookmarked score may be private/unreadable; skip it.
              console.warn(`Cannot read bookmarked score ${scoreId}:`, e);
              return null;
            }
          })
        );

        const scoresList = scoreResults.filter(
          (s): s is BookmarkedScore => s !== null
        );
        setScores(scoresList);
      } catch (error) {
        console.error("Error fetching bookmarked scores:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarkedScores();
  }, [t]);

  const handleUnbookmark = async (scoreId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      // Find and remove the bookmark
      const bookmarksRef = collection(db, "bookmarks");
      const bookmarkQuery = query(
        bookmarksRef,
        where("userId", "==", user.uid),
        where("scoreId", "==", scoreId)
      );
      const bookmarkSnapshot = await getDocs(bookmarkQuery);

      if (!bookmarkSnapshot.empty) {
        await deleteDoc(doc(db, "bookmarks", bookmarkSnapshot.docs[0].id));

        // Remove from local state
        setScores((prevScores) =>
          prevScores.filter((score) => score.id !== scoreId)
        );

        toast({
          title: "Success",
          description: "Bookmark removed successfully",
          //type: "success",
        });
      }
    } catch (error) {
      console.error("Error removing bookmark:", error);
      toast({
        title: "Error",
        description: "Failed to remove bookmark. Please try again.",
        // type: "error",
      });
    }
  };

  const handleSort = (column: keyof BookmarkedScore) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }

    const sortedScores = [...scores].sort((a: any, b: any) => {
      if (a[column] < b[column]) return sortDirection === "asc" ? -1 : 1;
      if (a[column] > b[column]) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setScores(sortedScores);
  };

  const SortIcon = ({ column }: { column: keyof BookmarkedScore }) => {
    if (sortColumn !== column)
      return <ChevronDown className="ml-1 h-4 w-4 text-gray-400" />;
    return sortDirection === "asc" ? (
      <ChevronUp className="ml-1 h-4 w-4" style={{ color: accentColor }} />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4" style={{ color: accentColor }} />
    );
  };

  const filteredScores = useMemo(() => {
    return scores.filter(
      (score) =>
        score.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        score.author.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [scores, searchQuery]);

  return (
    <div
      className="flex flex-col min-h-screen bg-gray-50 dark:bg-[#1a1f2c] transition-colors duration-300"
      style={{ background: pageBg }}
    >
      <main className="flex-grow max-w-7xl mx-auto px-4 pt-8 md:pt-20 pb-6 w-full">
        <div className="flex justify-between items-center flex-wrap space-y-3 md:space-y-0 mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-[#333333] dark:text-white">
            My Bookmarked Scores
          </h1>
          <div className="flex items-center space-x-4">
            <SearchBar
              placeholder={t("searchPlaceholder")}
              onChange={handleSearchChange}
              className="w-64"
            />
          </div>
        </div>
        <Card
          className="bg-white shadow-md transition-colors duration-300 overflow-x-auto"
          style={{ background: cardBg }}
        >
          <CardContent>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b dark:border-gray-700 text-sm md:text-base">
                  <th className="py-2 font-medium text-[#333333] dark:text-white">
                    <button
                      className="flex items-center focus:outline-none"
                      onClick={() => handleSort("name")}
                    >
                      {t("scoreName")}
                      <SortIcon column="name" />
                    </button>
                  </th>
                  <th className="py-2 font-medium text-[#333333] dark:text-white">
                    <button
                      className="flex items-center focus:outline-none"
                      onClick={() => handleSort("author")}
                    >
                      {t("author")}
                      <SortIcon column="author" />
                    </button>
                  </th>
                  <th className="py-2 font-medium text-[#333333] dark:text-white">
                    <button
                      className="flex items-center focus:outline-none"
                      onClick={() => handleSort("rating")}
                    >
                      {t("rating", { ns: "dashboard" })}
                      <SortIcon column="rating" />
                    </button>
                  </th>
                  <th className="py-2 font-medium text-left text-[#333333] dark:text-white">
                    <button
                      className="flex items-center focus:outline-none"
                      onClick={() => handleSort("created")}
                    >
                      {t("created", { ns: "community" })}
                      <SortIcon column="created" />
                    </button>
                  </th>
                  <th className="py-2 font-medium text-left text-[#333333] dark:text-white">
                    <button
                      className="flex items-center focus:outline-none"
                      onClick={() => handleSort("modified")}
                    >
                      {t("modified")}
                      <SortIcon column="modified" />
                    </button>
                  </th>
                  <th className="py-2 dark:text-white">Remove</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr
                      key={i}
                      className="border-b last:border-b-0 dark:border-gray-700 text-sm md:text-base"
                    >
                      <td className="py-3">
                        <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </td>
                      <td className="py-3">
                        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </td>
                      <td className="py-3">
                        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </td>
                      <td className="py-3">
                        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </td>
                      <td className="py-3">
                        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </td>
                      <td className="py-3">
                        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : filteredScores.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-4 text-center text-gray-500 dark:text-gray-400 text-sm md:text-base"
                    >
                      No bookmarked scores found
                    </td>
                  </tr>
                ) : (
                  filteredScores.map((score) => (
                    <tr
                      key={score.id}
                      className="border-b last:border-b-0 dark:border-gray-700 text-sm md:text-base"
                    >
                      <td className="py-3 text-[#333333] dark:text-white">
                        <Link
                          href={`/score/${score.id}`}
                          className="hover:text-[#800000] dark:hover:text-maroon-lite"
                        >
                          {score.name}
                        </Link>
                      </td>
                      <td className="py-3 text-[#666666] dark:text-gray-300">
                        {score.author}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= (score.rating || 0)
                                    ? "fill-current text-yellow-400"
                                    : "text-gray-300 dark:text-gray-600"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-[#666666] dark:text-gray-400">
                            {score.rating !== undefined
                              ? score.rating.toFixed(1)
                              : "0.0"}
                            {score.ratingCount ? ` (${score.ratingCount})` : ""}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-[#666666] dark:text-gray-300">
                        {score.created}
                      </td>
                      <td className="py-3 text-[#666666] dark:text-gray-300">
                        {score.modified}
                      </td>
                      <td className="py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUnbookmark(score.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 transition-colors"
                          title="Remove bookmark"
                        >
                          <BookmarkX className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MyBookmarks;
