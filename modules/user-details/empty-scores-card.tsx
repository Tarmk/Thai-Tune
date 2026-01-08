import { FC } from "react";
import { Card } from "@/components/ui/card";
import { Music, PlusCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface IProps {
  isOwnProfile: boolean;
}

const EmptyScoresCard: FC<IProps> = ({ isOwnProfile }) => (
  <Card className="h-full flex items-center justify-center p-8 border-dashed border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300">
    <div className="text-center space-y-4">
      <div className="w-16 h-16 mx-auto bg-gradient-to-br from-maroon to-maroon-dark rounded-full flex items-center justify-center">
        <Music className="w-8 h-8 text-white" />
      </div>
      <div>
        <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
          {isOwnProfile ? "No scores yet" : "No public scores"}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          {isOwnProfile
            ? "Start creating your first musical score to share with the community"
            : "This user hasn't shared any public scores yet"}
        </p>
        {isOwnProfile && (
          <Link href="/new-score">
            <Button className="mt-2 bg-gradient-to-r from-maroon to-maroon-dark hover:from-[#5A2D3C] hover:to-[#7A3D4C] text-white transition-all duration-300">
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Your First Score
            </Button>
          </Link>
        )}
      </div>
    </div>
  </Card>
);

export default EmptyScoresCard;
