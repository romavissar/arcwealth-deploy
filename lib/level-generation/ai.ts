import { type GeneratedLevel } from "./schema";

interface OpenRouterMessage {
  role: "system" | "user";
  content: string;
}

interface OpenRouterResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

function extractJsonPayload(raw: string): string {
  const fenced = raw.match(/```json\s*([\s\S]+?)\s*```/i);
  if (fenced?.[1]) return fenced[1].trim();
  return raw.trim();
}

function getOpenRouterModel(): string {
  return process.env.LEVEL_GEN_MODEL?.trim() || "anthropic/claude-sonnet-4.5";
}

export async function refineLevelWithAi(
  baseLevel: GeneratedLevel,
  lessonMarkdown: string
): Promise<GeneratedLevel> {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) return baseLevel;

  const systemPrompt = [
    "You are a curriculum editor.",
    "Return ONLY JSON. No markdown.",
    "Do not change structure or counts.",
    "Keep word limits: concept card body <=40 words, correct feedback <=8 words, wrong feedback <=15 words, apply explanation <=50 words.",
    "The check questions must stay in valid order, start with multiple_choice, and include at least one multi_blank.",
    "Preserve key educational meaning from the lesson source.",
  ].join(" ");

  const userPrompt = JSON.stringify(
    {
      instruction:
        "Improve wording quality of existing fields only. Keep all arrays lengths and all indexes unchanged.",
      lessonExcerpt: lessonMarkdown.slice(0, 4000),
      level: baseLevel,
      allowedEditablePaths: [
        "hook.fact",
        "hook.question",
        "conceptCards[].title",
        "conceptCards[].body",
        "check.questions[].prompt",
        "check.questions[].statement",
        "check.questions[].whyPrompt",
        "check.questions[].sentence",
        "check.questions[].correctAnswers",
        "check.questions[].feedbackCorrect",
        "check.questions[].feedbackWrong",
        "check.questions[].explanation",
        "apply.tasks[].scenario",
        "apply.tasks[].prompt",
        "apply.tasks[].explanation",
        "lockIn.takeaway",
        "reviewQueueEntry.definition",
        "reviewQueueEntry.quickRecallPrompt",
      ],
    },
    null,
    2
  );

  const messages: OpenRouterMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: getOpenRouterModel(),
      temperature: 0.2,
      messages,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter request failed (${response.status})`);
  }

  const payload = (await response.json()) as OpenRouterResponse;
  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenRouter returned no content");
  }

  const raw = JSON.parse(extractJsonPayload(content)) as { level?: GeneratedLevel } | GeneratedLevel;
  const parsed = (raw as { level?: GeneratedLevel }).level ?? (raw as GeneratedLevel);
  if (!parsed || typeof parsed !== "object" || !("hook" in parsed)) {
    throw new Error("OpenRouter returned JSON without level structure");
  }

  return postProcessAiDraft(parsed);
}

function postProcessAiDraft(level: GeneratedLevel): GeneratedLevel {
  return structuredClone(level);
}
