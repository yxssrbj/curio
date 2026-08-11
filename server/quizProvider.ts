import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import type { Difficulty, QuizQuestion, SessionResult, Topic } from "../shared/contracts.js";

interface QuizContext {
  topic: Topic;
  difficulty: Difficulty;
  notes: string;
}

interface GradeContext extends QuizContext {
  questions: QuizQuestion[];
  answers: Array<{ questionId: string; answer: string }>;
}

export interface QuizProvider {
  createQuiz(context: QuizContext): Promise<QuizQuestion[]>;
  grade(context: GradeContext): Promise<SessionResult>;
}

const questionSchema = z.object({
  questions: z.array(z.object({
    prompt: z.string(),
    intent: z.enum(["explain", "challenge", "connect"]),
  })),
});

const resultSchema = z.object({
  score: z.number(),
  summary: z.string(),
  feedback: z.array(z.object({
    questionIndex: z.number(),
    score: z.number(),
    comment: z.string(),
  })),
});

export class OpenAIQuizProvider implements QuizProvider {
  private readonly client: OpenAI;

  constructor(
    apiKey: string,
    private readonly model = process.env.OPENAI_MODEL ?? "gpt-5.6",
  ) {
    this.client = new OpenAI({ apiKey });
  }

  async createQuiz({ topic, difficulty, notes }: QuizContext): Promise<QuizQuestion[]> {
    const response = await this.client.responses.parse({
      model: this.model,
      input: [
        {
          role: "system",
          content: "Write short oral-exam questions for independent learners. Sound like a thoughtful tutor, not a test-prep bot. Return exactly three questions: explain, challenge, then connect. Use the learner’s notes to notice what they covered, but do not quote or reveal the notes.",
        },
        {
          role: "user",
          content: `Topic: ${topic.title}\nGuiding question: ${topic.question}\nDepth: ${difficulty}\nLearner notes:\n${notes || "(none)"}`,
        },
      ],
      text: { format: zodTextFormat(questionSchema, "curio_quiz") },
    });

    const generated = response.output_parsed?.questions;
    if (!generated || generated.length !== 3) {
      throw new Error("The quiz provider returned an incomplete quiz.");
    }

    return generated.map((question, index) => ({
      id: `q${index + 1}`,
      prompt: question.prompt,
      intent: question.intent,
    }));
  }

  async grade(context: GradeContext): Promise<SessionResult> {
    const response = await this.client.responses.parse({
      model: this.model,
      input: [
        {
          role: "system",
          content: "Assess understanding, not polish. Score each answer from 0 to 100 and give one specific, plain-spoken comment. Reward accurate explanation, useful distinctions, and honest connections. Do not praise an answer unless you can say what it did well. questionIndex must be zero-based and match the order supplied.",
        },
        {
          role: "user",
          content: JSON.stringify({
            topic: context.topic,
            difficulty: context.difficulty,
            questions: context.questions,
            answers: context.answers,
          }),
        },
      ],
      text: { format: zodTextFormat(resultSchema, "curio_result") },
    });

    const result = response.output_parsed;
    if (!result || result.feedback.length !== context.questions.length) {
      throw new Error("The quiz provider returned incomplete feedback.");
    }

    return {
      score: clampScore(result.score),
      summary: result.summary,
      feedback: result.feedback.map((item) => ({
        questionId: context.questions[item.questionIndex]?.id ?? context.questions[0].id,
        score: clampScore(item.score),
        comment: item.comment,
      })),
    };
  }
}

export class LocalQuizProvider implements QuizProvider {
  async createQuiz({ topic }: QuizContext): Promise<QuizQuestion[]> {
    return [
      { id: "q1", intent: "explain", prompt: `Without using a definition, how would you explain ${topic.title} to a friend?` },
      { id: "q2", intent: "challenge", prompt: `What is the easiest thing to misunderstand about “${topic.question}”?` },
      { id: "q3", intent: "connect", prompt: "Where else have you seen this pattern, tension, or idea show up?" },
    ];
  }

  async grade({ questions, answers }: GradeContext): Promise<SessionResult> {
    const feedback = questions.map((question) => {
      const answer = answers.find((item) => item.questionId === question.id)?.answer.trim() ?? "";
      const wordCount = answer.split(/\s+/).filter(Boolean).length;
      const score = Math.min(92, Math.max(20, 25 + wordCount * 2));

      return {
        questionId: question.id,
        score,
        comment: wordCount < 20
          ? "There is a useful start here, but the reasoning needs one concrete detail or example."
          : "This has enough substance to show your line of thought. Tighten it by naming the key distinction explicitly.",
      };
    });

    const score = Math.round(feedback.reduce((total, item) => total + item.score, 0) / feedback.length);
    return {
      score,
      feedback,
      summary: score >= 75
        ? "You can explain the idea without leaning on the source material. Revisit it in a few days and see what remains."
        : "You found the shape of the idea. One more pass focused on examples and counterarguments would make it stick.",
    };
  }
}

function clampScore(score: number): number {
  return Math.round(Math.min(100, Math.max(0, score)));
}
