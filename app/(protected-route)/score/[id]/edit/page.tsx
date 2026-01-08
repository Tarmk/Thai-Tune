import { NextPage } from "next";
import ScoreEdit from "@/modules/score-edit";

interface PageProps {
  params: Promise<{ id: string }>;
}

const Page: NextPage<PageProps> = async ({ params }) => {
  const { id } = await params;

  return <ScoreEdit scoreId={id} />;
};

export default Page;
