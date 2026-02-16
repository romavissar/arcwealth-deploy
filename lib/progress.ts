import type { ProgressStatus } from "@/types/user";

/** Section-relative lesson counts and checkpoint/boss placement (matches seed & curriculum). 200 lessons. */
const FLOW: { level: number; section: number; count: number; after: "checkpoint" | "boss" | "next_section" | "next_level" | "end" }[] = [
  { level: 1, section: 1, count: 12, after: "checkpoint" },
  { level: 1, section: 2, count: 12, after: "checkpoint" },
  { level: 1, section: 3, count: 12, after: "boss" },
  { level: 2, section: 1, count: 16, after: "checkpoint" },
  { level: 2, section: 2, count: 25, after: "boss" },
  { level: 2, section: 3, count: 10, after: "next_section" },
  { level: 2, section: 4, count: 5, after: "next_level" },
  { level: 3, section: 1, count: 20, after: "checkpoint" },
  { level: 3, section: 2, count: 10, after: "next_section" },
  { level: 3, section: 3, count: 23, after: "boss" },
  { level: 4, section: 1, count: 13, after: "checkpoint" },
  { level: 4, section: 2, count: 17, after: "next_section" },
  { level: 4, section: 3, count: 10, after: "next_level" },
  { level: 5, section: 1, count: 15, after: "end" },
];

export function getNextTopicToUnlock(completedTopicId: string): string | null {
  const parts = completedTopicId.split(".");
  if (parts[0] === "hero") return null;

  if (parts[1] === "boss") {
    const level = parseInt(parts[0], 10);
    if (level === 1) return "2.1.1";
    if (level === 2) return "3.1.1";
    if (level === 3) return "4.1.1";
    return null;
  }

  if (parts[2] === "checkpoint") {
    const level = parseInt(parts[0], 10);
    const section = parseInt(parts[1], 10);
    const idx = FLOW.findIndex((f) => f.level === level && f.section === section);
    if (idx < 0) return null;
    const next = FLOW[idx + 1];
    if (!next) return null;
    return `${next.level}.${next.section}.1`;
  }

  if (parts[2] === "boss") {
    const level = parseInt(parts[0], 10);
    const idx = FLOW.findIndex((f) => f.level === level && f.section === 3);
    if (level === 1) return "2.1.1";
    if (level === 2) return "3.1.1";
    if (level === 3) return "4.1.1";
    return null;
  }

  const level = parseInt(parts[0], 10);
  const section = parseInt(parts[1], 10);
  const lesson = parseInt(parts[2], 10);
  if (isNaN(level) || isNaN(section) || isNaN(lesson)) return null;

  const flowEntry = FLOW.find((f) => f.level === level && f.section === section);
  if (!flowEntry) return null;

  if (lesson < flowEntry.count) return `${level}.${section}.${lesson + 1}`;
  if (flowEntry.after === "checkpoint") return `${level}.${section}.checkpoint`;
  if (flowEntry.after === "boss") return `${level}.boss`;
  if (flowEntry.after === "next_section") {
    const next = FLOW.find((f) => f.level === level && f.section === section + 1);
    return next ? `${next.level}.${next.section}.1` : null;
  }
  if (flowEntry.after === "next_level") {
    const next = FLOW.find((f) => f.level === level + 1 && f.section === 1);
    return next ? `${next.level}.${next.section}.1` : null;
  }
  return null; // end
}

export function topicIdToOrderKey(topicId: string): number {
  const parts = topicId.split(".");
  if (parts[0] === "hero") return 1000;
  const level = parseInt(parts[0], 10) || 0;
  if (parts[1] === "boss") return level * 1000 + 99; // e.g. 2.boss => 2099
  const section = parseInt(parts[1], 10) || 0;
  const lesson = parts[2] === "checkpoint" ? 999 : parseInt(parts[2], 10) || 0;
  return level * 1000 + section * 100 + lesson;
}

export function canAccessTopic(
  topicId: string,
  progressByTopic: Map<string, ProgressStatus>
): boolean {
  if (topicId === "1.1.1") return true;
  const prev = getPreviousTopicId(topicId);
  if (!prev) return false;
  return progressByTopic.get(prev) === "completed";
}

function getPreviousTopicId(topicId: string): string | null {
  if (topicId === "1.1.1") return null;

  const parts = topicId.split(".");
  if (parts[1] === "boss") {
    const level = parseInt(parts[0], 10);
    const flowEntry = FLOW.find((f) => f.level === level && f.after === "boss");
    return flowEntry ? `${level}.${flowEntry.section}.${flowEntry.count}` : null;
  }

  if (parts[2] === "checkpoint") {
    const level = parseInt(parts[0], 10);
    const section = parseInt(parts[1], 10);
    const flowEntry = FLOW.find((f) => f.level === level && f.section === section);
    return flowEntry ? `${level}.${section}.${flowEntry.count}` : null;
  }

  if (parts[2] === "boss") {
    const level = parseInt(parts[0], 10);
    const flowEntry = FLOW.find((f) => f.level === level && f.section === 2);
    return flowEntry ? `${level}.${flowEntry.section}.${flowEntry.count}` : null;
  }

  const level = parseInt(parts[0], 10);
  const section = parseInt(parts[1], 10);
  const lesson = parseInt(parts[2], 10);
  if (isNaN(level) || isNaN(section) || isNaN(lesson)) return null;

  if (lesson > 1) return `${level}.${section}.${lesson - 1}`;

  // lesson === 1: previous is end of previous section or checkpoint or boss
  const idx = FLOW.findIndex((f) => f.level === level && f.section === section);
  if (idx <= 0) return null;
  const prev = FLOW[idx - 1];
  if (prev.after === "checkpoint") return `${level}.${section - 1}.checkpoint`;
  if (prev.after === "boss") return `${level}.boss`;
  return `${prev.level}.${prev.section}.${prev.count}`;
}
