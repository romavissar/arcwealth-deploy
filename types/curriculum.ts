export type TopicType = "lesson" | "checkpoint" | "boss_challenge" | "hero";

export interface Topic {
  id: string;
  topic_id: string;
  level_number: number;
  section_number: number;
  lesson_number: number;
  title: string;
  description: string | null;
  topic_type: TopicType;
  xp_reward: number;
  order_index: number;
  created_at?: string;
}

export interface CurriculumLessonDefinition {
  lesson_number: number;
  title: string;
  description: string;
}

export interface CurriculumModuleDefinition {
  level_number: number;
  title: string;
  goal: string;
  lessons: CurriculumLessonDefinition[];
}

export interface TextbookContent {
  type: "textbook";
  sections: Array<{
    heading?: string;
    blocks: Array<
      | { kind: "paragraph"; text: string }
      | { kind: "key_concept"; title: string; body: string }
      | { kind: "real_world_example"; title: string; body: string }
      | { kind: "definition"; term: string; definition: string }
      | { kind: "chart"; chartType: "bar" | "line" | "pie"; data: object; caption: string }
      | { kind: "callout"; icon: string; text: string }
      | { kind: "bullet_list"; items: string[] }
    >;
  }>;
  key_takeaways: string[];
}

export type LessonExercise =
  | {
      kind: "multiple_choice";
      question: string;
      options: string[];
      correct_index: number;
      explanation: string;
    }
  | {
      /** Balance true_false exercises: aim for ~50% correct: true and ~50% correct: false so learners don't guess "true". Use false statements (common myths) with explanations that correct them. */
      kind: "true_false";
      statement: string;
      correct: boolean;
      explanation: string;
    }
  | {
      kind: "fill_blank";
      sentence: string;
      options: string[];
      correct_index: number;
      explanation: string;
    }
  | {
      kind: "multi_blank";
      sentence: string;
      options: string[];
      correct_answers: string[];
      explanation: string;
    }
  | {
      kind: "match_pairs";
      prompt?: string;
      pairs: Array<{ left: string; right: string }>;
      explanation?: string;
    }
  | {
      kind: "ordering";
      prompt: string;
      items: string[];
      correct_order: number[];
      explanation: string;
    }
  | {
      kind: "numeric_slider";
      prompt: string;
      min: number;
      max: number;
      correct_value: number;
      tolerance: number;
      unit_label?: string;
      explanation: string;
    }
  | {
      kind: "short_answer_ai";
      prompt: string;
      rubric: string;
      model_answer: string;
      fallback_mcq: {
        question: string;
        options: string[];
        correct_index: number;
        explanation: string;
      };
      explanation: string;
    }
  | {
      kind: "spot_mistake";
      scenario: string;
      question: string;
      options: string[];
      correct_index: number;
      explanation: string;
    }
  | {
      kind: "scenario";
      scenario: string;
      question: string;
      options: string[];
      correct_index: number;
      explanation: string;
      character?: string;
      location?: string;
    }
  | {
      kind: "apply_numeric";
      scenario: string;
      prompt: string;
      min: number;
      max: number;
      correct_value: number;
      tolerance: number;
      unit_label?: string;
      explanation: string;
      character?: string;
      location?: string;
    }
  | {
      kind: "apply_typed_inputs";
      scenario: string;
      prompt: string;
      fields: Array<{ label: string; correct_value: string }>;
      explanation: string;
      character?: string;
      location?: string;
    };

export interface LessonContent {
  type: "duolingo_lesson";
  exercises: LessonExercise[];
  level?: {
    hook: { fact: string; question: string };
    conceptCards: Array<{ title: string; body: string }>;
    check: {
      questions: LessonExercise[];
    };
    apply: {
      tasks: LessonExercise[];
    };
    lockIn: { keyTerm: string; takeaway: string; continueLabel: string };
    reviewQueueEntry: { keyTerm: string; definition: string; moduleId: string; quickRecallPrompt: string };
    xp: { base: number; perCheckFirstTryCorrect: number; perApplyFirstTryCorrect: number; perfectRunBonus: number };
    ui?: {
      colorTokens: { keyTerm: string; correct: string; wrong: string; cta: string };
      animations: { maxDurationMs: number; xpCounterDurationMs: number; usesReducedMotionFallback: boolean };
    };
  };
}

/** A lesson step is either content (text from textbook) or an exercise. Used for textbook-based lessons. */
export type LessonStep =
  | { type: "content"; title: string; body: string }
  | { type: "exercise"; exercise: LessonExercise };
