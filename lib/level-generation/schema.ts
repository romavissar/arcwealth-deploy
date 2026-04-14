import { z } from "zod";

function wordCount(value: string): number {
  const normalized = value.trim();
  if (!normalized) return 0;
  return normalized.split(/\s+/).length;
}

const BoundedWordString = (maxWords: number, label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .superRefine((value, ctx) => {
      if (wordCount(value) > maxWords) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${label} must be <= ${maxWords} words`,
        });
      }
    });

export const SectionOrderSchema = z.tuple([
  z.literal("hook"),
  z.literal("concept"),
  z.literal("check"),
  z.literal("apply"),
  z.literal("lock_in"),
]);

export const LevelHookSchema = z.object({
  fact: BoundedWordString(25, "Hook fact"),
  question: BoundedWordString(25, "Hook question"),
});

export const ConceptCardSchema = z.object({
  title: BoundedWordString(8, "Concept card title"),
  body: BoundedWordString(40, "Concept card body"),
});

export const MultipleChoiceQuestionSchema = z.object({
  type: z.literal("multiple_choice"),
  prompt: BoundedWordString(30, "MC prompt"),
  options: z.array(BoundedWordString(12, "MC option")).length(4),
  correctIndex: z.number().int().min(0).max(3),
  feedbackCorrect: BoundedWordString(8, "MC correct feedback"),
  feedbackWrong: BoundedWordString(15, "MC wrong feedback"),
  explanation: BoundedWordString(50, "MC explanation"),
});

export const TrueFalseWhyQuestionSchema = z.object({
  type: z.literal("true_false_why"),
  statement: BoundedWordString(25, "TF statement"),
  correct: z.boolean(),
  whyPrompt: BoundedWordString(20, "TF why prompt"),
  feedbackCorrect: BoundedWordString(8, "TF correct feedback"),
  feedbackWrong: BoundedWordString(15, "TF wrong feedback"),
  explanation: BoundedWordString(50, "TF explanation"),
});

export const MatchPairsQuestionSchema = z.object({
  type: z.literal("match_pairs"),
  prompt: BoundedWordString(20, "Match prompt"),
  pairs: z
    .array(
      z.object({
        left: BoundedWordString(8, "Match left"),
        right: BoundedWordString(10, "Match right"),
      })
    )
    .min(3)
    .max(4),
  feedbackCorrect: BoundedWordString(8, "Match correct feedback"),
  feedbackWrong: BoundedWordString(15, "Match wrong feedback"),
  explanation: BoundedWordString(50, "Match explanation"),
});

export const FillBlankQuestionSchema = z.object({
  type: z.literal("fill_blank"),
  sentence: z
    .string()
    .trim()
    .min(1, "Fill blank sentence is required")
    .refine((value) => value.includes("___"), "Fill blank sentence must include ___ placeholder"),
  options: z.array(BoundedWordString(12, "Fill blank option")).length(4),
  correctIndex: z.number().int().min(0).max(3),
  keyTerm: BoundedWordString(6, "Fill blank key term"),
  feedbackCorrect: BoundedWordString(8, "Fill blank correct feedback"),
  feedbackWrong: BoundedWordString(15, "Fill blank wrong feedback"),
  explanation: BoundedWordString(50, "Fill blank explanation"),
});

export const MultiBlankQuestionSchema = z.object({
  type: z.literal("multi_blank"),
  sentence: z
    .string()
    .trim()
    .min(1, "Multi-blank sentence is required")
    .refine((value) => (value.match(/___/g) ?? []).length >= 2, "Multi-blank sentence must include at least 2 ___ placeholders")
    .refine((value) => (value.match(/___/g) ?? []).length <= 4, "Multi-blank sentence must include no more than 4 ___ placeholders"),
  options: z.array(BoundedWordString(6, "Multi-blank option")).min(5).max(6),
  correctAnswers: z.array(BoundedWordString(12, "Multi-blank correct answer")).min(2).max(4),
  keyTerm: BoundedWordString(6, "Multi-blank key term"),
  feedbackCorrect: BoundedWordString(8, "Multi-blank correct feedback"),
  feedbackWrong: BoundedWordString(15, "Multi-blank wrong feedback"),
  explanation: BoundedWordString(50, "Multi-blank explanation"),
});

export const OrderingQuestionSchema = z.object({
  type: z.literal("ordering"),
  prompt: BoundedWordString(25, "Ordering prompt"),
  items: z.array(BoundedWordString(8, "Ordering item")).min(4).max(5),
  correctOrder: z.array(z.number().int().min(0)).min(4).max(5),
  feedbackCorrect: BoundedWordString(8, "Ordering correct feedback"),
  feedbackWrong: BoundedWordString(15, "Ordering wrong feedback"),
  explanation: BoundedWordString(50, "Ordering explanation"),
});

export const NumericSliderQuestionSchema = z.object({
  type: z.literal("numeric_slider"),
  prompt: BoundedWordString(30, "Slider prompt"),
  min: z.number(),
  max: z.number(),
  correctValue: z.number(),
  tolerance: z.number().nonnegative(),
  unitLabel: BoundedWordString(6, "Slider unit label"),
  feedbackCorrect: BoundedWordString(8, "Slider correct feedback"),
  feedbackWrong: BoundedWordString(15, "Slider wrong feedback"),
  explanation: BoundedWordString(50, "Slider explanation"),
});

export const SpotMistakeQuestionSchema = z.object({
  type: z.literal("spot_mistake"),
  scenario: BoundedWordString(40, "Spot mistake scenario"),
  prompt: BoundedWordString(25, "Spot mistake prompt"),
  options: z.array(BoundedWordString(12, "Spot mistake option")).length(4),
  correctIndex: z.number().int().min(0).max(3),
  feedbackCorrect: BoundedWordString(8, "Spot mistake correct feedback"),
  feedbackWrong: BoundedWordString(15, "Spot mistake wrong feedback"),
  explanation: BoundedWordString(50, "Spot mistake explanation"),
});

export const CheckQuestionSchema = z.discriminatedUnion("type", [
  MultipleChoiceQuestionSchema,
  TrueFalseWhyQuestionSchema,
  MatchPairsQuestionSchema,
  FillBlankQuestionSchema,
  MultiBlankQuestionSchema,
  OrderingQuestionSchema,
  NumericSliderQuestionSchema,
  SpotMistakeQuestionSchema,
]);

export const CheckSectionSchema = z.object({
  questions: z.array(CheckQuestionSchema).min(6).max(8),
});

const ApplyChoiceAnswerSchema = z.object({
  answerMode: z.literal("choice"),
  options: z.array(BoundedWordString(12, "Apply option")).min(3).max(4),
  correctIndex: z.number().int().min(0).max(3),
});

const ApplyNumericAnswerSchema = z.object({
  answerMode: z.literal("numeric"),
  min: z.number(),
  max: z.number(),
  correctValue: z.number(),
  tolerance: z.number().nonnegative(),
  unitLabel: BoundedWordString(6, "Apply numeric unit label"),
});

const ApplyTypedAnswerSchema = z.object({
  answerMode: z.literal("typed_inputs"),
  inputFields: z
    .array(
      z.object({
        label: BoundedWordString(20, "Apply input label"),
        correctValue: BoundedWordString(12, "Apply input correct value"),
      })
    )
    .min(2)
    .max(6),
});

export const ApplyTaskSchema = z
  .object({
  taskType: z.enum(["build_plan", "decision_branch", "ranking", "budget_calculator", "spot_mistake"]),
  difficulty: z.enum(["moderate", "hard"]),
  character: BoundedWordString(3, "Apply character"),
  location: BoundedWordString(8, "Apply location"),
  scenario: BoundedWordString(70, "Apply scenario"),
  prompt: BoundedWordString(25, "Apply prompt"),
  explanation: BoundedWordString(50, "Apply explanation"),
  })
  .and(z.discriminatedUnion("answerMode", [ApplyChoiceAnswerSchema, ApplyNumericAnswerSchema, ApplyTypedAnswerSchema]));

export const ApplySectionSchema = z.object({
  tasks: z.tuple([ApplyTaskSchema, ApplyTaskSchema]),
});

export const LockInSchema = z.object({
  keyTerm: BoundedWordString(6, "Lock-in key term"),
  takeaway: BoundedWordString(20, "Lock-in takeaway"),
  continueLabel: z.string().trim().default("Continue"),
});

export const LevelUiSchema = z.object({
  colorTokens: z.object({
    keyTerm: z.literal("var(--amber-fill)"),
    correct: z.literal("var(--emerald-fill)"),
    wrong: z.literal("var(--red-fill)"),
    cta: z.literal("var(--indigo-fill)"),
  }),
  animations: z.object({
    maxDurationMs: z.number().int().max(400),
    xpCounterDurationMs: z.number().int().max(600),
    usesReducedMotionFallback: z.boolean(),
  }),
});

export const LevelXpSchema = z.object({
  base: z.literal(10),
  perCheckFirstTryCorrect: z.literal(2),
  perApplyFirstTryCorrect: z.literal(3),
  perfectRunBonus: z.literal(5),
});

export const LevelReviewQueueSchema = z.object({
  keyTerm: z.string().trim().min(1),
  definition: z.string().trim().min(1),
  moduleId: z.string().trim().min(1),
  quickRecallPrompt: BoundedWordString(20, "Quick recall prompt"),
});

export const GeneratedLevelSchema = z.object({
  schemaVersion: z.literal("2.0"),
  sourceLessonFile: z.string().trim().min(1),
  topicId: z.string().trim().min(1),
  moduleNumber: z.number().int().min(1),
  lessonNumber: z.number().int().min(1),
  lessonTitle: z.string().trim().min(1),
  concept: z.string().trim().min(1),
  estimatedDurationSeconds: z.number().int().min(120).max(300),
  sectionOrder: SectionOrderSchema,
  hook: LevelHookSchema,
  conceptCards: z.array(ConceptCardSchema).min(4).max(7),
  check: CheckSectionSchema,
  apply: ApplySectionSchema,
  lockIn: LockInSchema,
  xp: LevelXpSchema,
  reviewQueueEntry: LevelReviewQueueSchema,
  ui: LevelUiSchema,
});

export type GeneratedLevel = z.infer<typeof GeneratedLevelSchema>;
export { wordCount };
