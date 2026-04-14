import type { SupabaseClient } from "@supabase/supabase-js";

import { getAllLessonTopics } from "@/lib/curriculum";
import { loadMarkdownTextbookLessons } from "@/lib/textbook-markdown";
import type { Database } from "@/types/database";
import type { TextbookContent } from "@/types/curriculum";

type GlossaryRow = Database["public"]["Tables"]["glossary"]["Row"];
type LessonContentRow = Database["public"]["Tables"]["lesson_content"]["Row"];
type LessonContentGlossarySlice = Pick<LessonContentRow, "topic_id" | "content">;

type SourcePriority = "curriculum" | "markdown" | "database";

interface TermCandidate {
  term: string;
  definition: string;
  example: string | null;
  topicId: string;
  source: SourcePriority;
}

interface AggregatedTerm {
  term: string;
  definition: string;
  example: string | null;
  relatedTopicIds: Set<string>;
  source: SourcePriority;
}

const SOURCE_WEIGHT: Record<SourcePriority, number> = {
  curriculum: 1,
  markdown: 2,
  database: 3,
};

function normalizeTerm(value: string): string {
  return value
    .replace(/\s+/g, " ")
    .replace(/[.]+$/g, "")
    .trim();
}

function normalizeTermKey(value: string): string {
  return normalizeTerm(value).toLowerCase();
}

function shortSentenceFromAround(markdown: string, index: number): string {
  const start = Math.max(0, markdown.lastIndexOf(".", index - 1) + 1);
  const tail = markdown.slice(index);
  const endOffset = tail.indexOf(".");
  const end = endOffset >= 0 ? index + endOffset + 1 : markdown.length;
  const sentence = markdown.slice(start, end).replace(/\s+/g, " ").trim();
  if (!sentence) return "";
  return sentence.length > 220 ? `${sentence.slice(0, 217)}...` : sentence;
}

function extractMarkdownTermCandidates(topicId: string, markdown: string): TermCandidate[] {
  const candidates: TermCandidate[] = [];

  for (const match of markdown.matchAll(/\*\*Key term:\*\*\s*([^\n]+)/gi)) {
    const term = normalizeTerm(match[1] ?? "");
    if (!term) continue;
    candidates.push({
      term,
      definition: `Core concept introduced in lesson ${topicId}.`,
      example: null,
      topicId,
      source: "markdown",
    });
  }

  for (const match of markdown.matchAll(/\*\*([^*\n]{3,80})\s+\(([A-Z]{2,})\)\*\*/g)) {
    const longTerm = normalizeTerm(match[1] ?? "");
    const acronym = normalizeTerm(match[2] ?? "");
    const sentence = shortSentenceFromAround(markdown, match.index ?? 0);
    if (longTerm) {
      candidates.push({
        term: longTerm,
        definition: sentence || `Key concept covered in lesson ${topicId}.`,
        example: null,
        topicId,
        source: "markdown",
      });
    }
    if (acronym) {
      candidates.push({
        term: acronym,
        definition: sentence || `${acronym} appears in lesson ${topicId}.`,
        example: null,
        topicId,
        source: "markdown",
      });
    }
  }

  return candidates;
}

function isTextbookContent(value: unknown): value is TextbookContent {
  if (!value || typeof value !== "object") return false;
  const maybe = value as Partial<TextbookContent>;
  return maybe.type === "textbook" && Array.isArray(maybe.sections);
}

function collectDatabaseTermCandidates(topicId: string, content: TextbookContent): TermCandidate[] {
  const candidates: TermCandidate[] = [];
  for (const section of content.sections) {
    for (const block of section.blocks) {
      if (block.kind !== "definition") continue;
      const term = normalizeTerm(block.term);
      const definition = block.definition?.trim();
      if (!term || !definition) continue;
      candidates.push({
        term,
        definition,
        example: null,
        topicId,
        source: "database",
      });
    }
  }
  return candidates;
}

function mergeCandidates(candidates: TermCandidate[]): GlossaryRow[] {
  const byTerm = new Map<string, AggregatedTerm>();

  for (const candidate of candidates) {
    const key = normalizeTermKey(candidate.term);
    if (!key) continue;
    const existing = byTerm.get(key);

    if (!existing) {
      byTerm.set(key, {
        term: normalizeTerm(candidate.term),
        definition: candidate.definition.trim(),
        example: candidate.example,
        relatedTopicIds: new Set([candidate.topicId]),
        source: candidate.source,
      });
      continue;
    }

    existing.relatedTopicIds.add(candidate.topicId);

    const currentWeight = SOURCE_WEIGHT[existing.source];
    const candidateWeight = SOURCE_WEIGHT[candidate.source];
    const shouldOverride =
      candidateWeight > currentWeight ||
      (candidateWeight === currentWeight && candidate.definition.length > existing.definition.length);

    if (shouldOverride) {
      existing.term = normalizeTerm(candidate.term);
      existing.definition = candidate.definition.trim();
      existing.example = candidate.example;
      existing.source = candidate.source;
    }
  }

  return Array.from(byTerm.values())
    .map((entry) => ({
      id: "",
      created_at: "",
      term: entry.term,
      definition: entry.definition,
      example: entry.example,
      related_topic_ids: Array.from(entry.relatedTopicIds).sort(),
    }))
    .sort((a, b) => a.term.localeCompare(b.term));
}

export async function buildGlossaryFromCurrentTextbook(
  client: SupabaseClient<Database>
): Promise<Array<Pick<GlossaryRow, "term" | "definition" | "example" | "related_topic_ids">>> {
  const lessonTopics = getAllLessonTopics();
  const topicIds = lessonTopics.map((topic) => topic.topic_id);
  const topicIdSet = new Set(topicIds);

  const [{ data: textbookRowsRaw }, markdownLessons] = await Promise.all([
    client
      .from("lesson_content")
      .select("topic_id, content")
      .eq("content_type", "textbook")
      .in("topic_id", topicIds),
    loadMarkdownTextbookLessons(),
  ]);
  const textbookRows: LessonContentGlossarySlice[] = (textbookRowsRaw ?? []) as LessonContentGlossarySlice[];

  const candidates: TermCandidate[] = [];
  const topicsWithDatabaseDefinitions = new Set<string>();

  for (const row of textbookRows) {
    const topicId = row.topic_id;
    if (!topicId || !topicIdSet.has(topicId)) continue;
    if (!isTextbookContent(row.content)) continue;
    const parsed = collectDatabaseTermCandidates(topicId, row.content);
    if (parsed.length > 0) {
      topicsWithDatabaseDefinitions.add(topicId);
      candidates.push(...parsed);
    }
  }

  for (const lesson of markdownLessons) {
    if (!topicIdSet.has(lesson.topicId)) continue;
    if (topicsWithDatabaseDefinitions.has(lesson.topicId)) continue;
    candidates.push(...extractMarkdownTermCandidates(lesson.topicId, lesson.markdown));
  }

  const coveredTopics = new Set(candidates.map((candidate) => candidate.topicId));
  for (const topic of lessonTopics) {
    if (coveredTopics.has(topic.topic_id)) continue;
    candidates.push({
      term: topic.title,
      definition: topic.description ?? `Core concept covered in lesson ${topic.topic_id}.`,
      example: null,
      topicId: topic.topic_id,
      source: "curriculum",
    });
  }

  return mergeCandidates(candidates).map((entry) => ({
    term: entry.term,
    definition: entry.definition,
    example: entry.example,
    related_topic_ids: entry.related_topic_ids,
  }));
}
