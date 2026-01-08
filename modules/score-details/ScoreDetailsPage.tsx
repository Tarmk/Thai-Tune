"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MessageCircle,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Star,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import OpenAI from "openai";
import { useAuth } from "@/hooks/use-auth";
import { useScriptLoad } from "@/hooks/use-script-load";
import { messageToGpt } from "@/lib/openAI/message-to-gpt";

interface Comment {
  id: string;
  text: string;
  userId: string;
  userName: string;
  createdAt: Date;
  scoreId: string;
}

interface Score {
  id: string;
  name: string;
  author: string;
  modified: Date;
  flatid: string;
  userId: string;
  sharing: string;
  description?: string;
  rating?: number;
  ratingCount?: number;
  userRating?: number;
  comments?: Comment[];
}

interface ScoreDetailsPageProps {
  id: string;
}

// Star Rating Component
const StarRating = ({
  rating,
  onRatingChange,
  userRating,
  disabled = false,
}: {
  rating: number;
  onRatingChange: (rating: number) => void;
  userRating?: number;
  disabled?: boolean;
}) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const starColor = mounted && resolvedTheme === "dark" ? "#FFD700" : "#FFD700";
  const emptyStarColor =
    mounted && resolvedTheme === "dark" ? "#4B5563" : "#D1D5DB";

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => !disabled && onRatingChange(star)}
          disabled={disabled}
          className={`transition-colors duration-200 ${
            disabled ? "cursor-default" : "cursor-pointer hover:scale-110"
          }`}
        >
          <Star
            className={`h-5 w-5 ${
              star <= (userRating || rating) ? "fill-current" : ""
            }`}
            style={{
              color:
                star <= (userRating || rating) ? starColor : emptyStarColor,
            }}
          />
        </button>
      ))}
    </div>
  );
};

// Truncated Description Component
const TruncatedDescription = ({
  text,
  maxPreviewLines = 2,
  title,
}: {
  text: string;
  maxPreviewLines?: number;
  title: string;
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const textRef = React.useRef<HTMLParagraphElement>(null);
  const [isOverflowing, setIsOverflowing] = React.useState(false);
  const { t } = useTranslation(["dashboard"]);

  React.useEffect(() => {
    if (textRef.current) {
      const lineHeight = parseInt(
        window.getComputedStyle(textRef.current).lineHeight
      );
      const maxHeight = lineHeight * maxPreviewLines;
      setIsOverflowing(textRef.current.scrollHeight > maxHeight);
    }
  }, [maxPreviewLines, text]);

  return (
    <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
      <div className="p-4">
        <h3 className="text-md font-semibold mb-2 text-[#333] dark:text-white">
          {title}
        </h3>
        <div>
          <p
            ref={textRef}
            className={cn(
              "text-gray-700 dark:text-gray-300 whitespace-pre-line",
              !isExpanded && "line-clamp-2"
            )}
          >
            {text}
          </p>
          {isOverflowing && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 text-sm text-maroon-600 dark:text-maroon-400 hover:underline focus:outline-none"
            >
              {isExpanded
                ? t("showLess", { ns: "dashboard", defaultValue: "Show less" })
                : t("showMore", { ns: "dashboard", defaultValue: "Show more" })}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Comment Component
const CommentSection = ({ scoreId, user }: { scoreId: string; user: any }) => {
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [newComment, setNewComment] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { t } = useTranslation(["dashboard"]);

  React.useEffect(() => {
    if (!scoreId) return;

    // Subscribe to comments for this specific score only
    const commentsRef = collection(db, "comments");
    const q = query(
      commentsRef, 
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        const newComments: Comment[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          // Only include comments for this score
          if (data.scoreId === scoreId) {
            newComments.push({
              id: doc.id,
              text: data.text,
              userId: data.userId,
              userName: data.userName,
              createdAt: data.createdAt.toDate(),
              scoreId: data.scoreId,
            });
          }
        });
        setComments(newComments);
      },
      (error) => {
        // Handle permission errors gracefully
        console.error("Error listening to comments:", error);
        // Still set empty array so UI doesn't break
        setComments([]);
      }
    );

    return () => unsubscribe();
  }, [scoreId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const commentsRef = collection(db, "comments");
      await addDoc(commentsRef, {
        text: newComment.trim(),
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        createdAt: Timestamp.now(),
        scoreId: scoreId,
      });
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("default", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="mt-6 bg-white dark:bg-[#232838] rounded-lg shadow">
      <div className="p-4">
        <h3 className="text-md font-semibold mb-4 text-gray-900 dark:text-white">
          {t("comments", { ns: "dashboard", defaultValue: "Comments" })}
        </h3>
        {user ? (
          <form onSubmit={handleSubmitComment} className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={t("writeAComment", {
                  ns: "dashboard",
                  defaultValue: "Write a comment...",
                })}
                className="flex-1 min-w-0 rounded-md bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-maroon dark:focus:ring-[#8A3D4C]"
                disabled={isSubmitting}
              />
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="px-4 py-2 bg-maroon dark:bg-[#8A3D4C] text-white rounded-md text-sm font-medium hover:bg-[#3A1520] dark:hover:bg-maroon-dark focus:outline-none focus:ring-2 focus:ring-maroon dark:focus:ring-[#8A3D4C] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("post", { ns: "dashboard", defaultValue: "Post" })}
              </button>
            </div>
          </form>
        ) : (
          <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            {t("loginToComment", {
              ns: "dashboard",
              defaultValue: "Please login to post comments",
            })}
          </p>
        )}

        <div className="space-y-6">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="border-b border-[#2a2f3e] last:border-0 pb-4 last:pb-0"
            >
              <p className="text-neutral-700 dark:text-white text-sm whitespace-pre-line mb-2">
                {comment.text}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400 dark:text-gray-200">
                  {comment.userName}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-100">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-4">
              {t("noComments", {
                ns: "dashboard",
                defaultValue: "No comments yet",
              })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ScoreDetailsPage({ id }: ScoreDetailsPageProps) {
  const { user } = useAuth();
  const [score, setScore] = React.useState<Score | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [ratingLoading, setRatingLoading] = React.useState(false);
  const router = useRouter();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const embedRef = React.useRef<any>(null);
  const scriptRef = React.useRef<HTMLScriptElement | null>(null);
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const [chatMessages, setChatMessages] = React.useState<string[]>([]);
  const chatEndRef = React.useRef<HTMLDivElement | null>(null);
  const { t } = useTranslation(["common", "dashboard"]);
  const { resolvedTheme } = useTheme();
  const [themeKey, setThemeKey] = React.useState(0);
  const [isAutoZoom, setIsAutoZoom] = React.useState(false);

  const scriptLoaded = useScriptLoad(
    "https://prod.flat-cdn.com/embed-js/v2.4.1/embed.min.js"
  );

  // Theme-aware colors
  const buttonColor = "hsl(var(--primary))";
  const linkColor = "hsl(var(--primary))";

  React.useEffect(() => {
    if (!user) return;

    const fetchScore = async () => {
      setLoading(true);
      setError(null);
      try {
        const scoreDoc = await getDoc(doc(db, "scores", id));
        if (scoreDoc.exists()) {
          const scoreData = scoreDoc.data();

          console.log("Score sharing:", scoreData.sharing);
          console.log("Current user:", user?.uid);
          console.log("Score user:", scoreData.userId);

          // Check if score is private and user is not the owner
          if (scoreData.sharing === "private" && (!user || user.uid !== scoreData.userId)) {
            setError("This score is private");
            setLoading(false);
            return;
          }

          // For public and unlisted scores, anyone can view
          // For private scores, only the owner can view

          // Check if user has already rated this score
          let userRating = 0;
          if (user && scoreData.ratings && scoreData.ratings[user.uid]) {
            userRating = scoreData.ratings[user.uid];
          }

          setScore({
            id: scoreDoc.id,
            name: scoreData.name,
            author: scoreData.author,
            modified: scoreData.modified.toDate(),
            flatid: scoreData.flatid,
            userId: scoreData.userId,
            sharing: scoreData.sharing,
            description: scoreData.description || "",
            rating: scoreData.rating || 0,
            ratingCount: scoreData.ratingCount || 0,
            userRating: userRating,
            comments: scoreData.comments || [],
          });
        } else {
          setError("Score not found");
        }
      } catch (err) {
        console.error("Error fetching score:", err);
        setError("An error occurred while fetching the score");
      } finally {
        setLoading(false);
      }
    };

    fetchScore();
  }, [id, user]);

  React.useEffect(() => {
    setThemeKey((prevKey) => prevKey + 1);
  }, [resolvedTheme]);

  const cleanupEmbed = React.useCallback(() => {
    if (embedRef.current) {
      embedRef.current = null;
    }

    if (scriptRef.current && document.body.contains(scriptRef.current)) {
      document.body.removeChild(scriptRef.current);
      scriptRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    console.log("Creating embed with theme:", resolvedTheme);
    console.log("Score:", score);

    //if (!score || !score.flatid || !mounted) return;
    if (
      typeof window === "undefined" ||
      !scriptLoaded ||
      !score ||
      !score.flatid
    )
      return;
    cleanupEmbed();

    if (!containerRef.current || !window.Flat) return;

    const embedThemeColor = resolvedTheme === "dark" ? "#8A3D4C" : "#4A1D2C";
    const embedControlsBackground =
      resolvedTheme === "dark" ? "#8A3D4C" : "#4A1D2C";
    const embedScoreBackground =
      resolvedTheme === "dark" ? "transparent" : "transparent";

    embedRef.current = new window.Flat.Embed(containerRef.current, {
      score: score.flatid,
      embedParams: {
        mode: "view",
        appId: "6755790be2eebcce112acde7",
        branding: false,
        themePrimary: embedThemeColor,
        themePrimaryDark: embedThemeColor,
        themeControlsBackground: embedControlsBackground,
        themeScoreBackground: embedScoreBackground,
        themeCursorV0: embedThemeColor,
        controlsZoom: true,
      },
    });

    if (!embedRef.current) {
      console.error("Failed to initialize Flat.Embed");
    }

    embedRef.current.ready().then(() => {
      console.log("Embed ready with theme:", resolvedTheme);
      embedRef.current
        .getPNG({
          result: "dataURL",
          layout: "track",
          dpi: 300,
        })
        .then((png: string) => {
          console.log("PNG generated on load:", png);
        });
    });

    return () => {
      cleanupEmbed();
    };
  }, [score, resolvedTheme, themeKey, scriptLoaded]);

  React.useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const handleEdit = () => {
    router.push(`/score/${id}/edit`);
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const sendMessageToChatGPT = async (message: string) => {
    try {
      if (!score) return;

      const gptResponse = messageToGpt(
        `User question: ${message}\nScore Title: ${score.name}\nAuthor: ${score.author}\nDescription: ${score.description || "No description available"}`
      );

      console.log("ChatGPT Response:", gptResponse);

      setChatMessages((prevMessages) => {
        const updatedMessages = [...prevMessages, `MusicAI: ${gptResponse}`];
        return updatedMessages;
      });
    } catch (error) {
      console.error("Error communicating with ChatGPT:", error);
      setChatMessages((prevMessages) => [
        ...prevMessages,
        `MusicAI: Sorry, I encountered an error.`,
      ]);
    }
  };

  const handleChatInputKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      const input = event.target as HTMLInputElement;
      const newMessage = input.value.trim();
      if (newMessage) {
        setChatMessages((prevMessages) => [
          ...prevMessages,
          `You: ${newMessage}`,
        ]);
        sendMessageToChatGPT(newMessage);
        input.value = "";
      }
    }
  };

  // Handle rating submission
  const handleRating = async (rating: number) => {
    if (!user || !score) return;

    setRatingLoading(true);
    try {
      const scoreRef = doc(db, "scores", id);
      const scoreDoc = await getDoc(scoreRef);

      if (!scoreDoc.exists()) {
        throw new Error("Score not found");
      }

      const scoreData = scoreDoc.data();
      const currentRatings = scoreData.ratings || {};
      const currentRating = scoreData.rating || 0;
      const currentRatingCount = scoreData.ratingCount || 0;
      const previousUserRating = currentRatings[user.uid] || 0;

      // Update user's rating
      const newRatings = {
        ...currentRatings,
        [user.uid]: rating,
      };

      // Calculate new average rating
      let newRating = currentRating;
      let newRatingCount = currentRatingCount;

      if (previousUserRating === 0) {
        // New rating
        newRating =
          (currentRating * currentRatingCount + rating) /
          (currentRatingCount + 1);
        newRatingCount = currentRatingCount + 1;
      } else {
        // Updated rating
        newRating =
          (currentRating * currentRatingCount - previousUserRating + rating) /
          currentRatingCount;
      }

      // Update the document
      await updateDoc(scoreRef, {
        ratings: newRatings,
        rating: Math.round(newRating * 10) / 10, // Round to 1 decimal place
        ratingCount: newRatingCount,
      });

      // Update local state
      setScore((prev) =>
        prev
          ? {
              ...prev,
              rating: Math.round(newRating * 10) / 10,
              ratingCount: newRatingCount,
              userRating: rating,
            }
          : null
      );
    } catch (error) {
      console.error("Error updating rating:", error);
    } finally {
      setRatingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-[#1a1f2c] font-sans">
        <main className="flex-grow max-w-7xl mx-auto px-4 py-6 mt-16 w-full">
          <div className="mb-6">
            {/* Back button skeleton */}
            <div className="flex items-center">
              <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded mr-2 animate-pulse"></div>
              <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Title skeleton */}
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse"></div>

          {/* Author skeleton */}
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-6 animate-pulse"></div>

          {/* Rating section skeleton */}
          <div className="mb-6 bg-white dark:bg-[#232838] p-4 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {/* Star rating skeleton */}
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                      ></div>
                    ))}
                  </div>
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Score viewer skeleton */}
          <div className="rounded-lg overflow-hidden mb-6">
            <div className="bg-white dark:bg-[#232838] shadow-md rounded-lg">
              <div className="p-4">
                <div className="h-[450px] bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-maroon dark:border-[#8A3D4C] border-r-transparent mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">
                      {t("loading", { ns: "dashboard" })}...
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                      Loading music score
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Control buttons skeleton */}
          <div className="flex justify-end gap-2 mb-6">
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
          </div>

          {/* Footer info skeleton */}
          <div className="mt-6 bg-white dark:bg-[#232838] p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-center">
              <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Description skeleton */}
          <div className="mt-4 bg-white dark:bg-[#232838] rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="p-4">
              <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Comments skeleton */}
          <div className="mt-6 bg-white dark:bg-[#232838] rounded-lg shadow">
            <div className="p-4">
              <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse"></div>
              <div className="space-y-3">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  console.log("error", error);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 font-sans bg-gray-50 dark:bg-[#1a1f2c]">
        {error}
      </div>
    );
  }

  if (!score) {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans bg-gray-50 dark:bg-[#1a1f2c] text-gray-900 dark:text-white">
        {t("noScores", { ns: "dashboard" })}
      </div>
    );
  }

  const isOwner = user?.uid === score.userId;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-[#1a1f2c] font-sans">
      <main className="flex-grow max-w-7xl mx-auto px-4 py-6 mt-16 w-full">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center hover:underline"
            style={{ color: linkColor }}
          >
            <ArrowLeft className="mr-2" />
            {t("back", { ns: "dashboard", defaultValue: "Back" })}
          </button>
        </div>
        <h1 className="text-2xl font-bold text-[#333333] dark:text-white mb-4">
          {score.name}
        </h1>
        <p className="text-lg text-[#666666] dark:text-gray-300 mb-6">
          {t("by", { ns: "dashboard" })}{" "}
          <Link
            href={`/user/${score.userId}`}
            className="hover:underline"
            style={{ color: linkColor }}
          >
            {score.author}
          </Link>
        </p>
        <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <StarRating
                  rating={score.rating || 0}
                  onRatingChange={handleRating}
                  userRating={score.userRating}
                  disabled={ratingLoading || !user}
                />
                <span className="text-sm text-[#666666] dark:text-gray-400">
                  {score.rating ? `${score.rating.toFixed(1)}` : "0.0"}
                  {score.ratingCount
                    ? ` (${score.ratingCount} ${score.ratingCount === 1 ? t("vote", { ns: "dashboard" }) : t("votes", { ns: "dashboard" })})`
                    : ""}
                </span>
              </div>
            </div>
            {!user && (
              <p className="text-sm text-[#666666] dark:text-gray-400">
                {t("loginToRate", {
                  ns: "dashboard",
                  defaultValue: "Login to rate this score",
                })}
              </p>
            )}
          </div>
        </div>
        <div className="rounded-lg overflow-hidden mb-6">
          <Card className="bg-white dark:bg-gray-800 shadow-md flex-1 flex items-stretch rounded-lg">
            <CardContent className="p-4 flex justify-center items-center w-full">
              <div
                key={themeKey}
                ref={containerRef}
                style={{ height: "450px", width: "100%" }}
                className="flex-1 flex items-center justify-center"
              />
            </CardContent>
          </Card>
        </div>
        <div className="flex justify-end gap-2 mb-6">
          <button
            onClick={async () => {
              if (embedRef.current) {
                const currentZoom = await embedRef.current.getZoom();
                await embedRef.current.setZoom(
                  Math.max(0.5, currentZoom - 0.1)
                );
              }
            }}
            className="p-1.5 rounded-full text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: buttonColor }}
            title={t("zoomOut", { ns: "dashboard" })}
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={async () => {
              if (embedRef.current) {
                const currentZoom = await embedRef.current.getZoom();
                await embedRef.current.setZoom(Math.min(2, currentZoom + 0.1));
              }
            }}
            className="p-1.5 rounded-full text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: buttonColor }}
            title={t("zoomIn", { ns: "dashboard" })}
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={async () => {
              if (embedRef.current) {
                const newAutoZoomState = !isAutoZoom;
                await embedRef.current.setAutoZoom(newAutoZoomState);
                setIsAutoZoom(newAutoZoomState);
              }
            }}
            className={`p-1.5 rounded-full text-white hover:opacity-90 transition-opacity ${isAutoZoom ? "bg-opacity-100" : "bg-opacity-70"}`}
            style={{ backgroundColor: buttonColor }}
            title={t("autoZoom", { ns: "dashboard" })}
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-6 flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <p className="text-sm text-[#666666] dark:text-gray-400">
            {t("modified", { ns: "dashboard" })}:{" "}
            {score.modified.toLocaleString()}
          </p>
          {isOwner && (
            <>
              <button
                onClick={handleEdit}
                className="font-medium hover:text-[#800000] dark:hover:text-maroon-lite dark:text-white"
              >
                {t("edit", { ns: "dashboard" })}
              </button>
            </>
          )}
        </div>
        {score.description && score.description.trim() !== "" && (
          <TruncatedDescription
            text={score.description}
            title={t("description", {
              ns: "dashboard",
              defaultValue: "Description",
            })}
            maxPreviewLines={2}
          />
        )}

        <CommentSection scoreId={id} user={user} />
      </main>

      <button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 text-white p-3 rounded-full shadow-lg hover:bg-opacity-90 focus:outline-none"
        style={{ backgroundColor: buttonColor }}
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {isChatOpen && (
        <div className="fixed bottom-16 right-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg w-80 h-96 flex flex-col">
          <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
            <h2 className="text-lg font-bold dark:text-white">
              {t("chat", { ns: "dashboard" })}
            </h2>
            <button
              onClick={toggleChat}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {chatMessages.map((message, index) => (
              <div
                key={index}
                className="mb-2 p-2 bg-gray-200 dark:bg-gray-700 rounded-lg max-w-xs"
                style={{ alignSelf: "flex-start" }}
              >
                <span className="dark:text-white">{message}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="p-4 border-t dark:border-gray-700">
            <input
              type="text"
              placeholder={t("typeAMessage", { ns: "dashboard" })}
              className="w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              onKeyDown={handleChatInputKeyDown}
            />
          </div>
        </div>
      )}
    </div>
  );
}
