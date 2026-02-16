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
      kind: "match_pairs";
      pairs: Array<{ left: string; right: string }>;
    }
  | {
      kind: "scenario";
      scenario: string;
      question: string;
      options: string[];
      correct_index: number;
      explanation: string;
    };

export interface LessonContent {
  type: "duolingo_lesson";
  exercises: LessonExercise[];
}

/** A lesson step is either content (text from textbook) or an exercise. Used for textbook-based lessons. */
export type LessonStep =
  | { type: "content"; title: string; body: string }
  | { type: "exercise"; exercise: LessonExercise };
