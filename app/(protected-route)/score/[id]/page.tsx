import { NextPage } from "next";
import ScoreDetails from "@/modules/score-details";

interface PageProps {
  params: Promise<{ id: string }>;
}

const Page: NextPage<PageProps> = async ({ params }) => {
  const { id } = await params;

  return <ScoreDetails scoreId={id} />;
};

export default Page;
