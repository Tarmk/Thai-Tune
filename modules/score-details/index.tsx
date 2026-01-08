"use client";

import { FC, Suspense } from "react";
import ScoreDetailsPage from "./ScoreDetailsPage";

interface IProps {
  scoreId: string;
}

const ScoreDetails: FC<IProps> = ({ scoreId }) => {
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
      <ScoreDetailsPage id={scoreId} />
    </Suspense>
  );
};

export default ScoreDetails;
