export const difficulties = ["curious", "deep-dive", "expert"] as const;

export type Difficulty = (typeof difficulties)[number];

export interface Topic {
  id: string;
  title: string;
  category: string;
  question: string;
  brief: string;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  intent: "explain" | "challenge" | "connect";
}

export interface AnswerFeedback {
  questionId: string;
  score: number;
  comment: string;
}

export interface SessionResult {
  score: number;
  summary: string;
  feedback: AnswerFeedback[];
}

export interface LearningSession {
  id: string;
  topic: Topic;
  difficulty: Difficulty;
  notes: string;
  questions: QuizQuestion[];
  result: SessionResult | null;
  startedAt: string;
  completedAt: string | null;
}

export interface CreateSessionRequest {
  topicId: string;
  difficulty: Difficulty;
}

export interface UpdateNotesRequest {
  notes: string;
}

export interface SubmitAnswersRequest {
  answers: Array<{ questionId: string; answer: string }>;
}
