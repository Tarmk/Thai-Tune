"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import type { User } from "firebase/auth";

interface FlatEmbed {
  getMusicXML: (options: { compressed: boolean }) => Promise<ArrayBuffer>;
}

declare global {
  interface Window {
    Flat: {
      Embed: new (container: HTMLDivElement, options: any) => FlatEmbed;
    };
  }
}

// Separate component for the editor
const Editor = dynamic(() => import("./editor"), { ssr: false });

// Main component
const CreateNewScore = ({
  title,
  user,
  scoreDocId,
}: {
  title: string;
  user: User | null;
  scoreDocId: string;
}) => {
  const editorRef = useRef<any>(null);
  const [isLoadingDescription, setIsLoadingDescription] = useState(false);

  const handleGenerateDescription = async () => {
    if (editorRef.current && editorRef.current.getScoreJSON) {
      setIsLoadingDescription(true);
      const json = await editorRef.current.getScoreJSON();
      // Extract music sheet data (copied from ScoreDetailsPage.tsx)
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
      try {
        const res = await fetch("/api/generate-score-description", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ extractedData }),
        });

        const payload = await res.json();
        if (!res.ok) {
          throw new Error(payload?.error || "Failed to generate description");
        }

        const chatGPTResponse = (payload?.description as string | undefined)
          ?.trim?.()
          ? payload.description.trim()
          : "";

        // Set the description in the editor
        if (editorRef.current && editorRef.current.setScoreDescription) {
          editorRef.current.setScoreDescription(chatGPTResponse);
        } else {
          // fallback: try to set textarea value directly if possible
          const textarea = document.getElementById(
            "description"
          ) as HTMLTextAreaElement;
          if (textarea) textarea.value = chatGPTResponse || "";
        }
      } catch (error) {
        console.error("Error communicating with ChatGPT:", error);
        alert("Failed to generate description. Please try again.");
      } finally {
        setIsLoadingDescription(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Editor
        ref={editorRef}
        title={title}
        user={user}
        scoreDocId={scoreDocId}
        onGenerateDescription={handleGenerateDescription}
      />
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
    </div>
  );
};

export default CreateNewScore;
