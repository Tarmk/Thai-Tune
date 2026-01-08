"use client";

import {
  MoreVertical,
  DoorClosedIcon as CloseIcon,
  Star,
  EyeOff,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { WebcamIcon as ChatIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { SortableTable } from "@/components/common/SortableTable";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateScore } from "@/lib/flat";

interface Score {
  name: string;
  modified: string;
  created: string;
  sharing: string;
  rating: number;
  score_id: string;
}

const loadChatMessages = () => {
  if (typeof window === "undefined") return [];

  try {
    return JSON.parse(localStorage.getItem("chatMessages") || "[]");
  } catch (error) {
    console.error("Error parsing chat messages from localStorage:", error);
    return [];
  }
};

const saveChatMessages = (messages: string[]) => {
  localStorage.setItem("chatMessages", JSON.stringify(messages));
};

const Dashboard = () => {
  const [scores, setScores] = useState<Score[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] =
    useState<string[]>(loadChatMessages());
  const [isLoading, setIsLoading] = useState(true);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const { t } = useTranslation("dashboard");
  const { user } = useAuth();

  // Theme-aware colors
  const buttonColor = "hsl(var(--primary))";
  const linkColor = "hsl(var(--primary))";

  // NOTE: OpenAI calls should run server-side. The previous implementation used the
  // OpenAI SDK in the browser with an API key, which is unsafe and can also fail
  // if env vars aren't public at build time.

  useEffect(() => {
    const fetchUserScores = async () => {
      if (!user?.uid) return;

      try {
        setIsLoading(true);
        const q = query(
          collection(db, "scores"),
          where("userId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);

        const userScores = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            name: data.name,
            modified: new Date(data.modified.toDate()).toLocaleString(),
            created: data.created
              ? new Date(data.created.toDate()).toLocaleString()
              : "N/A",
            sharing: data.sharing || "Only me",
            rating: data.rating || 0,
            score_id: doc.id,
          };
        });

        setScores(userScores);
      } catch (error) {
        console.error("Error fetching scores:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserScores();
  }, [user]);

  const sendMessageToChatGPT = async (message: string) => {
    try {
      const res = await fetch("/api/message-to-gpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ textContent: message }),
      });

      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Failed to send message");

      const chatGPTResponse = (payload?.reply as string | undefined)?.trim?.()
        ? payload.reply.trim()
        : "";

      setChatMessages((prevMessages) => {
        const updatedMessages = [
          ...prevMessages,
          `MusicAI: ${chatGPTResponse}`,
        ];
        saveChatMessages(updatedMessages);
        return updatedMessages;
      });
    } catch (error) {
      console.error("Error communicating with ChatGPT:", error);
      setChatMessages((prevMessages) => {
        const updatedMessages = [
          ...prevMessages,
          `MusicAI: Sorry, I encountered an error.`,
        ];
        saveChatMessages(updatedMessages);
        return updatedMessages;
      });
    }
  };

  const toggleChat = () => setIsChatOpen(!isChatOpen);

  const handleChatInputKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      const input = event.target as HTMLInputElement;
      const newMessage = input.value.trim();
      if (newMessage) {
        setChatMessages((prevMessages) => {
          const updatedMessages = [...prevMessages, `You: ${newMessage}`];
          saveChatMessages(updatedMessages);
          return updatedMessages;
        });
        sendMessageToChatGPT(newMessage);
        input.value = "";
      }
    }
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const handleDeleteScore = async (scoreId: string) => {
    try {
      await deleteDoc(doc(db, "scores", scoreId));
      setScores(scores.filter((score) => score.score_id !== scoreId));
    } catch (error) {
      console.error("Error deleting score:", error);
    }
  };

  const handleRenameScore = async (scoreId: string, oldName: string) => {
    const newName = window.prompt("Enter new score name", oldName);
    if (!newName || newName.trim() === oldName) return;
    try {
      await updateDoc(doc(db, "scores", scoreId), { name: newName.trim() });
      setScores((prev) =>
        prev.map((s) =>
          s.score_id === scoreId ? { ...s, name: newName.trim() } : s
        )
      );
    } catch (error) {
      console.error("Error renaming score:", error);
    }
  };

  const handleToggleSharing = async (
    scoreId: string,
    currentSharing: string
  ) => {
    const newSharing = currentSharing === "public" ? "private" : "public";
    try {
      await updateDoc(doc(db, "scores", scoreId), { sharing: newSharing });
      // await updateScore(scoreId, { privacy: newSharing });
      setScores((prev) =>
        prev.map((s) =>
          s.score_id === scoreId ? { ...s, sharing: newSharing } : s
        )
      );
    } catch (error) {
      console.error("Error updating sharing:", error);
    }
  };

  const columns = [
    {
      key: "name" as keyof Score,
      label: t("scoreName"),
      render: (score: Score) => (
        <Link
          href={`/score/${score.score_id}`}
          className={`hover:text-[${linkColor}]`}
        >
          {score.name}
        </Link>
      ),
    },
    {
      key: "rating" as keyof Score,
      label: t("rating"),
      render: (score: Score) => (
        <div className="flex items-center gap-1">
          <Star
            className={`h-4 w-4 ${score.rating > 0 ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
          />
          <span>{score.rating.toFixed(1)}</span>
        </div>
      ),
    },
    { key: "created" as keyof Score, label: t("created", { ns: "community" }) },
    { key: "modified" as keyof Score, label: t("modified") },
    { key: "sharing" as keyof Score, label: t("sharing") },
  ];

  const renderActions = (score: Score) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="p-1">
          <MoreVertical className="h-5 w-5 text-[#666666] dark:text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-44 p-2 bg-white dark:bg-[#232838] dark:border-gray-700">
        <DropdownMenuItem className="focus:bg-gray-100" asChild>
          <Button
            variant="ghost"
            className="justify-start text-sm"
            onClick={() => handleRenameScore(score.score_id, score.name)}
          >
            <Pencil className="h-4 w-4 mr-2" /> Rename
          </Button>
        </DropdownMenuItem>
        <DropdownMenuItem className="focus:bg-gray-100" asChild>
          <Button
            variant="ghost"
            className="justify-start text-sm"
            onClick={() => handleToggleSharing(score.score_id, score.sharing)}
          >
            {score.sharing === "public" ? (
              <EyeOff className="h-4 w-4 mr-2" />
            ) : (
              <Eye className="h-4 w-4 mr-2" />
            )}
            {score.sharing === "public" ? "Make Private" : "Make Public"}
          </Button>
        </DropdownMenuItem>
        <DropdownMenuItem className="focus:bg-gray-100" asChild>
          <Button
            variant="ghost"
            className="justify-start text-sm text-red-600 dark:text-red-400"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteScore(score.score_id);
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" /> {t("delete")}
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  console.log("scores", scores);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-[#1a1f2c] transition-colors duration-300">
      <main className="flex-grow max-w-7xl mx-auto px-4 pt-20 pb-6 w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-[#333333] dark:text-white">
            {t("myScores")}
          </h1>

          <Link href="/new-score" className="inline-block">
            <Button
              className="shadow-sm font-medium transition-transform hover:scale-105"
              style={{ backgroundColor: buttonColor, color: "white" }}
            >
              {t("newScore")}
            </Button>
          </Link>
        </div>
        <Card className="bg-white dark:bg-[#232838] shadow-md transition-colors duration-300">
          <CardContent className="p-2 md:p-4">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-4"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <SortableTable
                  data={scores}
                  columns={columns}
                  initialSortColumn="name"
                  emptyMessage={t("noScores")}
                  actions={renderActions}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Chat Bubble */}
      <button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 bg-secondary text-white p-3 rounded-full shadow-lg hover:bg-secondary-hover focus:outline-none"
        style={{ backgroundColor: buttonColor }}
        aria-label="Open chat"
      >
        <ChatIcon className="h-6 w-6" />
      </button>

      {/* Chat UI */}
      {isChatOpen && (
        <div className="fixed bottom-16 right-4 bg-white dark:bg-[#232838] shadow-lg rounded-lg w-80 h-96 flex flex-col transition-colors duration-300">
          <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
            <h2 className="text-lg font-bold dark:text-white">{t("chat")}</h2>
            <button
              onClick={toggleChat}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              aria-label="Close chat"
            >
              <CloseIcon className="h-5 w-5" />
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
              placeholder={t("typeAMessage")}
              className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              onKeyDown={handleChatInputKeyDown}
              aria-label="Type a message"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
