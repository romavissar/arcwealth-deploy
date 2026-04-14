import { promises as fs } from "node:fs";
import path from "node:path";

export interface MarkdownTextbookLesson {
  topicId: string;
  levelNumber: number;
  sectionNumber: number;
  lessonNumber: number;
  title: string;
  description: string | null;
  markdown: string;
}

interface ParsedMarkdownLessonId {
  levelNumber: number;
  sectionNumber: number;
  lessonNumber: number;
}

function parseLessonIdFromFilename(filename: string): ParsedMarkdownLessonId | null {
  const legacyMatch = filename.match(/^lesson_(\d+)\.md$/i);
  if (legacyMatch) {
    const lessonNumber = Number(legacyMatch[1]);
    if (!Number.isFinite(lessonNumber) || lessonNumber <= 0) return null;
    return { levelNumber: 1, sectionNumber: 1, lessonNumber };
  }

  const moduleLessonMatch = filename.match(/^lesson_(\d+)_(\d+)\.md$/i);
  if (moduleLessonMatch) {
    const levelNumber = Number(moduleLessonMatch[1]);
    const lessonNumber = Number(moduleLessonMatch[2]);
    if (!Number.isFinite(levelNumber) || !Number.isFinite(lessonNumber) || levelNumber <= 0 || lessonNumber <= 0) return null;
    return { levelNumber, sectionNumber: 1, lessonNumber };
  }

  const fullTopicMatch = filename.match(/^lesson_(\d+)_(\d+)_(\d+)\.md$/i);
  if (fullTopicMatch) {
    const levelNumber = Number(fullTopicMatch[1]);
    const sectionNumber = Number(fullTopicMatch[2]);
    const lessonNumber = Number(fullTopicMatch[3]);
    if (
      !Number.isFinite(levelNumber) ||
      !Number.isFinite(sectionNumber) ||
      !Number.isFinite(lessonNumber) ||
      levelNumber <= 0 ||
      sectionNumber <= 0 ||
      lessonNumber <= 0
    ) {
      return null;
    }
    return { levelNumber, sectionNumber, lessonNumber };
  }

  return null;
}

function extractTitle(markdown: string, lessonNumber: number): string {
  const h1 = markdown.match(/^#\s+(.+)$/m)?.[1]?.trim();
  if (!h1) return `Lesson ${lessonNumber}`;
  const split = h1.split(":");
  if (split.length > 1) return split.slice(1).join(":").trim();
  return h1;
}

function extractDescription(markdown: string): string | null {
  const lines = markdown.split("\n").map((line) => line.trim());
  for (const line of lines) {
    if (!line) continue;
    if (line.startsWith("#")) continue;
    if (line.startsWith(">")) continue;
    if (line === "---") continue;
    return line;
  }
  return null;
}

export async function loadMarkdownTextbookLessons(): Promise<MarkdownTextbookLesson[]> {
  const textbookDir = path.join(process.cwd(), "textbook");
  const entries = await fs.readdir(textbookDir);
  const lessonFiles = entries
    .map((name) => ({ name, lessonId: parseLessonIdFromFilename(name) }))
    .filter((item): item is { name: string; lessonId: ParsedMarkdownLessonId } => item.lessonId !== null)
    .sort((a, b) => {
      if (a.lessonId.levelNumber !== b.lessonId.levelNumber) {
        return a.lessonId.levelNumber - b.lessonId.levelNumber;
      }
      if (a.lessonId.sectionNumber !== b.lessonId.sectionNumber) {
        return a.lessonId.sectionNumber - b.lessonId.sectionNumber;
      }
      return a.lessonId.lessonNumber - b.lessonId.lessonNumber;
    });

  const lessons = await Promise.all(
    lessonFiles.map(async ({ name, lessonId }) => {
      const markdown = await fs.readFile(path.join(textbookDir, name), "utf8");
      return {
        topicId: `${lessonId.levelNumber}.${lessonId.sectionNumber}.${lessonId.lessonNumber}`,
        levelNumber: lessonId.levelNumber,
        sectionNumber: lessonId.sectionNumber,
        lessonNumber: lessonId.lessonNumber,
        title: extractTitle(markdown, lessonId.lessonNumber),
        description: extractDescription(markdown),
        markdown,
      };
    })
  );

  return lessons;
}
