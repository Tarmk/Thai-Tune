import { NextPage } from "next";
import UserDetails from "@/modules/user-details";

interface PageProps {
  params: Promise<{ id: string }>;
}

const Page: NextPage<PageProps> = async ({ params }) => {
  const { id } = await params;

  return <UserDetails userId={id} />;
};

export default Page;
