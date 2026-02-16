import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getAllLessonTopics } from "@/lib/curriculum";
import { BookText } from "lucide-react";
import { TextbookTopicAccordion, type TopicGroup } from "@/components/textbook/TextbookTopicAccordion";

export default async function TextbookIndexPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const topics = getAllLessonTopics();

  const byLevel = topics.reduce<Record<number, typeof topics>>((acc, t) => {
    if (!acc[t.level_number]) acc[t.level_number] = [];
    acc[t.level_number].push(t);
    return acc;
  }, {});

  const topicNumbers = [1, 2, 3, 4, 5];
  const groups: TopicGroup[] = topicNumbers.map((topicNum) => {
    const levelTopics = byLevel[topicNum] ?? [];
    const topicName = levelTopics[0]?.levelName ?? `Topic ${topicNum}`;
    const bySection = levelTopics.reduce<Record<number, typeof levelTopics>>((acc, t) => {
      if (!acc[t.section_number]) acc[t.section_number] = [];
      acc[t.section_number].push(t);
      return acc;
    }, {});
    const sections = Object.entries(bySection).map(([sectionNum, sectionTopics]) => ({
      sectionNum: Number(sectionNum),
      sectionName: sectionTopics[0]?.sectionName ?? `Section ${sectionNum}`,
      topics: sectionTopics,
    }));
    return { topicNum, topicName, sections };
  });

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <BookText className="h-7 w-7 text-primary" />
          Textbook
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          All 200 lessons — pick a topic to read.
        </p>
      </header>

      <TextbookTopicAccordion groups={groups} />
    </div>
  );
}
