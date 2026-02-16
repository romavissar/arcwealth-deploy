import { redirect } from "next/navigation";

export default async function LearnTextbookRedirect({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = await params;
  redirect(`/textbook/${topicId}`);
}
