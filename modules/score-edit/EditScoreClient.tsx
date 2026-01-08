"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { generateScoreDescription } from "@/lib/openAI/score-description";

interface ClientProps {
  id: string;
}

// Component that uses useSearchParams inside Suspense
function SearchParamsHandler({
  onParamsReady,
}: {
  onParamsReady: (params: URLSearchParams) => void;
}) {
  const { useSearchParams } = require("next/navigation");
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams) {
      onParamsReady(searchParams);
    }
  }, [searchParams, onParamsReady]);

  return null;
}

export default function EditScoreClient({ id }: ClientProps) {
  const { t } = useTranslation("editor");
  const [user, setUser] = useState<any>(null);
  const [flatId, setFlatId] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("");
  const [score, setScore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParamsObj, setSearchParamsObj] =
    useState<URLSearchParams | null>(null);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const embedRef = useRef<any>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [themeKey, setThemeKey] = useState(0);

  const [exportCount, setExportCount] = useState(0);
  const exportInterval = 30000;
  const [sharingSetting, setSharingSetting] = useState<string>("private");
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Add description state
  const [scoreDescription, setScoreDescription] = useState<string>("");

  // Add loading state for description generation
  const [isLoadingDescription, setIsLoadingDescription] = useState(false);

  // Add saving state
  const [isSaving, setIsSaving] = useState(false);

  // Function to handle search params
  const handleSearchParams = React.useCallback((params: URLSearchParams) => {
    setSearchParamsObj(params);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Effect to update themeKey when resolvedTheme changes
  useEffect(() => {
    if (mounted) {
      setThemeKey((prevKey) => prevKey + 1);
    }
  }, [resolvedTheme, mounted]);

  // Clean up function to remove script and reset embed
  const cleanupEmbed = React.useCallback(() => {
    // Reset the embed reference
    if (embedRef.current) {
      embedRef.current = null;
    }

    // Remove the script if it exists
    if (scriptRef.current && document.body.contains(scriptRef.current)) {
      document.body.removeChild(scriptRef.current);
      scriptRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!id) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    const fetchScore = async () => {
      setLoading(true);
      try {
        const scoreDoc = await getDoc(doc(db, "scores", id));
        console.log("Score id:", id);
        if (scoreDoc.exists()) {
          const scoreData = scoreDoc.data();
          setScore(scoreData);
          if (scoreData) {
            if (scoreData.flatid) setFlatId(scoreData.flatid);
            if (scoreData.name) setTitle(scoreData.name);
            if (scoreData.sharing) setSharingSetting(scoreData.sharing);
            if (scoreData.description)
              setScoreDescription(scoreData.description);
          } else {
            setError("Score data is undefined");
          }
        } else {
          setError("Score not found");
        }
      } catch (err: any) {
        console.error("Error fetching score:", err.message || err);
        setError("Error fetching score");
      } finally {
        setLoading(false);
      }
    };

    fetchScore();
    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    if (!flatId || !mounted) return;

    // Clean up previous embed and script
    cleanupEmbed();

    console.log("Creating embed with theme:", resolvedTheme);

    const script = document.createElement("script");
    script.src = "https://prod.flat-cdn.com/embed-js/v1.5.1/embed.min.js";
    script.async = true;
    scriptRef.current = script;

    script.onload = () => {
      if (containerRef.current && window.Flat && flatId) {
        // Use theme-aware color for the embed
        const embedThemeColor =
          resolvedTheme === "dark" ? "#8A3D4C" : "#4A1D2C";
        const embedControlsBackground =
          resolvedTheme === "dark" ? "#1F2937" : "#FFFFFF";
        const embedScoreBackground =
          resolvedTheme === "dark" ? "transparent" : "white";

        embedRef.current = new window.Flat.Embed(containerRef.current, {
          score: flatId,
          embedParams: {
            mode: "edit",
            appId: "6755790be2eebcce112acde7",
            branding: false,
            controlsPosition: "top",
            themePrimary: embedThemeColor,
            themePrimaryDark: embedThemeColor,
            themeControlsBackground: embedControlsBackground,
            themeScoreBackground: embedScoreBackground,
            themeCursorV0: embedThemeColor,
            themePageBackgroundV0:
              resolvedTheme === "dark" ? "#272727" : "white",
            themePageMarginBackgroundV0:
              resolvedTheme === "dark" ? "#272727" : "white",
            themePageColor: resolvedTheme === "dark" ? "#FFFFFF" : "#000000",
            themeTimeSignatureV0:
              resolvedTheme === "dark" ? "#FFFFFF" : "#000000",
            themeColorWe: resolvedTheme === "dark" ? "#FFFFFF" : "#000000",
            forceBackgroundMode: resolvedTheme === "dark" ? "dark" : "light",
          },
        });
        console.log("Embed ready with theme:", resolvedTheme);
      }
    };

    document.body.appendChild(script);

    return () => {
      cleanupEmbed();
    };
  }, [flatId, mounted, resolvedTheme, themeKey, cleanupEmbed]);

  const handleManualSave = async () => {
    if (embedRef.current && flatId) {
      setIsSaving(true);
      try {
        const buffer = await embedRef.current.getMusicXML({ compressed: true });

        const base64String = btoa(
          new Uint8Array(buffer).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );

        // Save to localStorage
        const saveData = {
          title,
          description: scoreDescription,
          timestamp: new Date().toISOString(),
          content: base64String,
        };

        const storageKey = `score_${title}_manual_${Date.now()}`;
        localStorage.setItem(storageKey, JSON.stringify(saveData));

        // Update versions list
        const versionsList = JSON.parse(
          localStorage.getItem(`score_${title}_versions`) || "[]"
        );
        versionsList.push({
          version: `Manual Save ${versionsList.length + 1}`,
          timestamp: saveData.timestamp,
          storageKey,
        });
        localStorage.setItem(
          `score_${title}_versions`,
          JSON.stringify(versionsList)
        );

        // Save to Flat.io API
        try {
          const response = await axios({
            method: "post",
            url: `https://api.flat.io/v2/scores/${flatId}/revisions`,
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization:
                "069432b451ffceb35e2407e24093bd43a99e6a560963f9e92254da031a2e04e1527f86dfade9eb5cdb222720566f7a8dd8ac3beeed9a2d9d15a6d398123d125c",
            },
            data: {
              data: base64String,
              dataEncoding: "base64",
              autosave: false, // Set to false for manual saves
            },
          });
          console.log("Manual save to Flat.io successful:", response.data);
        } catch (apiError) {
          console.error("Error saving to Flat.io:", apiError);
        }

        // Save description to Firestore
        try {
          await updateDoc(doc(db, "scores", id), {
            description: scoreDescription,
          });
        } catch (firestoreError) {
          console.error(
            "Error saving description to Firestore:",
            firestoreError
          );
        }

        setLastSavedTime(new Date().toLocaleTimeString());

        // Navigate back to the score details page
        router.push(`/score/${id}`);
      } catch (error) {
        console.error("Error in manual save:", error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleAutoSave = React.useCallback(async () => {
    console.log("Auto-save triggered");
    if (embedRef.current && flatId) {
      try {
        const buffer = await embedRef.current.getMusicXML({ compressed: true });

        const base64String = btoa(
          new Uint8Array(buffer).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );

        // Update modified timestamp using Firestore's serverTimestamp
        const scoreRef = doc(db, "scores", id);
        await updateDoc(scoreRef, {
          modified: serverTimestamp(),
          description: scoreDescription,
        });

        const saveData = {
          title,
          description: scoreDescription,
          timestamp: new Date().toISOString(),
          content: base64String,
        };

        const storageKey = `score_${title}_autosave_${exportCount + 1}`;
        localStorage.setItem(storageKey, JSON.stringify(saveData));

        const versionsList = JSON.parse(
          localStorage.getItem(`score_${title}_versions`) || "[]"
        );
        versionsList.push({
          version: `Auto Save ${exportCount + 1}`,
          timestamp: saveData.timestamp,
          storageKey,
        });
        localStorage.setItem(
          `score_${title}_versions`,
          JSON.stringify(versionsList)
        );

        // Save to Flat.io API
        try {
          const response = await axios({
            method: "post",
            url: `https://api.flat.io/v2/scores/${flatId}/revisions`,
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization:
                "069432b451ffceb35e2407e24093bd43a99e6a560963f9e92254da031a2e04e1527f86dfade9eb5cdb222720566f7a8dd8ac3beeed9a2d9d15a6d398123d125c",
            },
            data: {
              data: base64String,
              dataEncoding: "base64",
              autosave: true,
            },
          });
          console.log("Auto-save to Flat.io successful:", response.data);
        } catch (apiError) {
          console.error("Error auto-saving to Flat.io:", apiError);
        }

        setLastSavedTime(new Date().toLocaleTimeString());
        setExportCount((prev) => prev + 1);
      } catch (error) {
        console.error("Error in auto-save:", error);
      }
    } else {
      console.log("Auto-save skipped - conditions not met:", {
        hasEmbed: !!embedRef.current,
        flatId,
      });
    }
  }, [flatId, exportCount, title, id, scoreDescription]);

  // Set up auto-save interval
  useEffect(() => {
    if (!flatId) return;

    handleAutoSave();
    console.log("Setting up auto-save interval");
    const intervalId = setInterval(handleAutoSave, exportInterval);

    return () => {
      console.log("Clearing auto-save interval");
      clearInterval(intervalId);
    };
  }, [flatId, handleAutoSave]);

  const updateSharingSetting = async (newSetting: string) => {
    if (!id) return;
    try {
      await updateDoc(doc(db, "scores", id), {
        sharing: newSetting,
      });
      setSharingSetting(newSetting);
    } catch (error) {
      console.error("Error updating sharing setting:", error);
    }
  };

  const handleSharingChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSetting = event.target.value;
    updateSharingSetting(newSetting);
  };

  const handleGenerateDescription = async () => {
    if (!embedRef.current) {
      console.error("Embed not ready");
      return;
    }

    setIsLoadingDescription(true);
    try {
      const json = await embedRef.current.getJSON();

      // Extract music sheet data
      const extractMusicSheetData = (fullData: any) => {
        return {
          work: {
            title: fullData?.work?.["work-title"],
          },
          partList: fullData?.["part-list"]?.["score-part"]?.map(
            (part: any) => ({
              id: part["$id"],
              name: part["part-name"],
              abbreviation: part["part-abbreviation"],
              instrument: part["score-instrument"]?.["instrument-name"],
            })
          ),
          parts: fullData?.part?.map((part: any) => ({
            id: part["$id"],
            measures: part.measure?.map((measure: any) => ({
              number: measure["$number"],
              attributes: measure.attributes,
              notes: measure.note,
              directions: measure.direction,
              harmony: measure.harmony,
            })),
          })),
        };
      };

      const extractedData = extractMusicSheetData(json?.["score-partwise"]);

      const gptResponse = await generateScoreDescription(extractedData);
      setScoreDescription(gptResponse || "");
    } catch (error) {
      console.error("Error generating description:", error);
      alert("Failed to generate description. Please try again.");
    } finally {
      setIsLoadingDescription(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1a1f2c]">
        <div className="flex flex-col items-center space-y-3">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-maroon dark:border-[#8A3D4C] border-r-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            {t("loading", { ns: "common" })}...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 bg-gray-50 dark:bg-[#1a1f2c]">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-[#1a1f2c]">
      <Suspense fallback={null}>
        <SearchParamsHandler onParamsReady={handleSearchParams} />
      </Suspense>
      <main className="container mx-auto px-6 mt-24 flex-grow">
        <div className="flex mb-2">
          <Button
            variant="outline"
            className="text-rose-300 flex items-center"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          {title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          By {user?.displayName || "Anonymous"}
        </p>

        {/* Score Editor */}
        <div className="score-editor-container rounded-md overflow-hidden shadow-lg border border-gray-700 mb-4 bg-white dark:bg-gray-800">
          <div
            ref={containerRef}
            className="w-full"
            style={{ height: "470px" }}
          />
        </div>

        {/* Description Form */}
        <TooltipProvider>
          <div className="mb-6 bg-white dark:bg-[#232838] rounded-md shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Description
              </label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-400 cursor-pointer">
                    <Sparkles className="w-4 h-4 text-white" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">
                  The AI can help you generate description of music based on
                  your music sheet
                </TooltipContent>
              </Tooltip>
              <Button
                className="ml-2"
                type="button"
                onClick={handleGenerateDescription}
                size="sm"
                variant="outline"
                disabled={isLoadingDescription}
              >
                {isLoadingDescription
                  ? "Generating..."
                  : "Generate Description"}
              </Button>
            </div>
            <textarea
              id="description"
              value={scoreDescription}
              onChange={(e) => setScoreDescription(e.target.value)}
              placeholder="Enter a description for your score..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-maroon dark:focus:ring-[#8A3D4C] focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              rows={3}
            />
          </div>
        </TooltipProvider>

        {/* Loading Overlay */}
        {isLoadingDescription && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-maroon dark:border-[#8A3D4C] mb-4"></div>
              <span className="text-lg font-semibold dark:text-white">
                Generating description...
              </span>
            </div>
          </div>
        )}

        {/* Saving Modal Overlay */}
        {isSaving && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-maroon dark:border-[#8A3D4C] mb-4"></div>
              <span className="text-lg font-semibold dark:text-white">
                Saving...
              </span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="py-3 px-4 bg-white dark:bg-[#232838] rounded-md border border-gray-200 dark:border-gray-700 flex justify-between items-center mb-8">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Modified:{" "}
            {lastSavedTime ? lastSavedTime : new Date().toLocaleString()}
          </div>

          <div className="flex items-center space-x-2">
            <select
              id="sharing"
              className="text-sm border border-gray-300 dark:border-gray-600 rounded py-1 px-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              value={sharingSetting}
              onChange={handleSharingChange}
            >
              <option value="private">Private</option>
              <option value="unlisted">Unlisted</option>
              <option value="public">Public</option>
            </select>

            <Button
              onClick={handleManualSave}
              className="text-sm bg-red-800 text-white hover:bg-red-700 px-4 py-1"
              size="sm"
            >
              Save
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
