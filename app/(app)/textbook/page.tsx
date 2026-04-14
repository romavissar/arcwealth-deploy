import { getAppUserId } from "@/lib/auth/server-user";
import { redirect } from "next/navigation";
import { BookOpenText, CheckCircle2, FileText, Layers3 } from "lucide-react";
import { TextbookTopicAccordion, type TopicGroup } from "@/components/textbook/TextbookTopicAccordion";
import { createServiceClient } from "@/lib/supabase/server";
import type { LessonTopic } from "@/lib/curriculum";
import { getLessonDescription, getSectionName, LEVEL_GOALS, LEVEL_NAMES, MODULE_CURRICULUM } from "@/lib/curriculum";
import { loadMarkdownTextbookLessons } from "@/lib/textbook-markdown";

export default async function TextbookIndexPage() {
  const userId = await getAppUserId();
  if (!userId) redirect("/sign-in");

  const supabase = createServiceClient();
  const curriculumTopicIds = MODULE_CURRICULUM.flatMap((module) => module.lessons.map((lesson) => `${module.level_number}.1.${lesson.lesson_number}`));
  const [{ data: rows }, markdownLessons] = await Promise.all([
    supabase
      .from("topics")
      .select("topic_id, level_number, section_number, lesson_number, title, description")
      .eq("topic_type", "lesson")
      .order("order_index"),
    loadMarkdownTextbookLessons(),
  ]);
  const { data: textbookProgressRows } = await supabase
    .from("user_textbook_progress")
    .select("topic_id")
    .eq("user_id", userId)
    .in("topic_id", curriculumTopicIds);
  const completedTextbookIds = new Set((textbookProgressRows ?? []).map((row) => row.topic_id));

  const topicsFromDb: LessonTopic[] = (rows ?? []).map((r) => ({
    topic_id: r.topic_id,
    level_number: r.level_number,
    section_number: r.section_number,
    lesson_number: r.lesson_number,
    levelName: LEVEL_NAMES[r.level_number] ?? `Level ${r.level_number}`,
    sectionName: getSectionName(r.level_number, r.section_number),
    title: r.title,
    description: r.description ?? getLessonDescription(r.topic_id),
  }));
  const topicIdsFromDb = new Set(topicsFromDb.map((topic) => topic.topic_id));
  const markdownOnlyTopics: LessonTopic[] = markdownLessons
    .filter((lesson) => !topicIdsFromDb.has(lesson.topicId))
    .map((lesson) => ({
      topic_id: lesson.topicId,
      level_number: lesson.levelNumber,
      section_number: lesson.sectionNumber,
      lesson_number: lesson.lessonNumber,
      levelName: LEVEL_NAMES[lesson.levelNumber] ?? `Level ${lesson.levelNumber}`,
      sectionName: getSectionName(lesson.levelNumber, lesson.sectionNumber),
      title: lesson.title,
      description: lesson.description,
    }));
  const topics = [...topicsFromDb, ...markdownOnlyTopics]
    .filter((topic) => topic.section_number === 1)
    .sort((a, b) =>
      a.level_number !== b.level_number
        ? a.level_number - b.level_number
        : a.section_number !== b.section_number
        ? a.section_number - b.section_number
        : a.lesson_number - b.lesson_number
    );
  const topicById = new Map(topics.map((topic) => [topic.topic_id, topic]));

  const groups: TopicGroup[] = MODULE_CURRICULUM.map((module) => {
    const sectionNum = 1;
    const sectionName = getSectionName(module.level_number, sectionNum);
    const sectionTopics = module.lessons.map((lesson) => {
      const topicId = `${module.level_number}.1.${lesson.lesson_number}`;
      const existing = topicById.get(topicId);
      return {
        topic_id: topicId,
        level_number: module.level_number,
        section_number: sectionNum,
        lesson_number: lesson.lesson_number,
        levelName: LEVEL_NAMES[module.level_number] ?? `Module ${module.level_number}`,
        sectionName,
        // Curriculum titles are the source of truth for textbook naming.
        title: lesson.title,
        description: existing?.description ?? lesson.description ?? getLessonDescription(topicId),
        hasReading: topicById.has(topicId),
        isCompleted: completedTextbookIds.has(topicId),
      };
    });
    const readingsCount = sectionTopics.filter((topic) => topic.hasReading).length;
    return {
      topicNum: module.level_number,
      topicName: module.title,
      topicGoal: LEVEL_GOALS[module.level_number] ?? module.goal,
      lessonsCount: module.lessons.length,
      readingsCount,
      sections: [
        {
          sectionNum,
          sectionName,
          topics: sectionTopics,
        },
      ],
    };
  });
  const totalLessons = MODULE_CURRICULUM.reduce((sum, module) => sum + module.lessons.length, 0);
  const completedLessonsCount = completedTextbookIds.size;
  const completedModulesCount = groups.filter((group) => group.sections.some((section) => section.topics.some((topic) => topic.isCompleted))).length;
  const moduleCoverage = `${completedModulesCount}/${groups.length}`;

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-12">
      <section className="rounded-2xl border border-[#8B5CF6]/55 bg-gradient-to-br from-primary/10 via-indigo-50/40 to-amber-50 p-6 shadow-sm dark:border-[#8B5CF6]/45 dark:from-primary/20 dark:via-indigo-950/25 dark:to-gray-900">
        <div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">ArcWealth Textbook</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">Read by module, master by lesson</h1>
            <p className="mt-2 max-w-3xl text-sm text-gray-700 dark:text-gray-300">
              Every lesson here is anchored to the latest draft curriculum. Open any module to read the lesson content or review
              curriculum-aligned lesson briefs where full reading content is still being expanded.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[#8B5CF6]/55 bg-white p-4 shadow-sm dark:border-[#8B5CF6]/45 dark:bg-gray-900/60">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <Layers3 className="h-4 w-4 text-primary" aria-hidden="true" />
            <p className="text-xs font-semibold uppercase tracking-wide">Modules</p>
          </div>
          <p className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">{groups.length}</p>
        </div>
        <div className="rounded-xl border border-[#8B5CF6]/55 bg-white p-4 shadow-sm dark:border-[#8B5CF6]/45 dark:bg-gray-900/60">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <BookOpenText className="h-4 w-4 text-primary" aria-hidden="true" />
            <p className="text-xs font-semibold uppercase tracking-wide">Lessons</p>
          </div>
          <p className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">{totalLessons}</p>
        </div>
        <div className="rounded-xl border border-[#8B5CF6]/55 bg-white p-4 shadow-sm dark:border-[#8B5CF6]/45 dark:bg-gray-900/60">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
            <p className="text-xs font-semibold uppercase tracking-wide">Reading Coverage</p>
          </div>
          <p className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">{completedLessonsCount}/{totalLessons}</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Modules covered: {moduleCoverage}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/60 md:p-5">
        <div className="mb-4 flex items-center gap-2 text-gray-700 dark:text-gray-200">
          <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
          <p className="text-sm font-semibold">Curriculum map</p>
        </div>
        <TextbookTopicAccordion groups={groups} />
      </section>
    </div>
  );
}
