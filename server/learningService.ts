import { randomUUID } from "node:crypto";
import type { Difficulty, LearningSession, SubmitAnswersRequest } from "../shared/contracts.js";
import { findTopic } from "./catalog.js";
import type { QuizProvider } from "./quizProvider.js";
import type { SessionRepository } from "./sessionRepository.js";

export class SessionNotFoundError extends Error {}
export class TopicNotFoundError extends Error {}
export class IncompleteAnswersError extends Error {}

export class LearningService {
  constructor(
    private readonly sessions: SessionRepository,
    private readonly quizzes: QuizProvider,
  ) {}

  async start(topicId: string, difficulty: Difficulty): Promise<LearningSession> {
    const topic = findTopic(topicId);
    if (!topic) throw new TopicNotFoundError(`Unknown topic: ${topicId}`);

    const session: LearningSession = {
      id: randomUUID(),
      topic,
      difficulty,
      notes: "",
      questions: [],
      result: null,
      startedAt: new Date().toISOString(),
      completedAt: null,
    };

    await this.sessions.save(session);
    return session;
  }

  async saveNotes(sessionId: string, notes: string): Promise<LearningSession> {
    const session = await this.requireSession(sessionId);
    session.notes = notes.trim();
    await this.sessions.save(session);
    return session;
  }

  async prepareQuiz(sessionId: string): Promise<LearningSession> {
    const session = await this.requireSession(sessionId);
    session.questions = await this.quizzes.createQuiz(session);
    await this.sessions.save(session);
    return session;
  }

  async submitAnswers(sessionId: string, request: SubmitAnswersRequest): Promise<LearningSession> {
    const session = await this.requireSession(sessionId);
    if (session.questions.length === 0) session.questions = await this.quizzes.createQuiz(session);

    const answeredIds = new Set(request.answers.map((answer) => answer.questionId));
    const hasEveryAnswer = session.questions.every((question) => answeredIds.has(question.id));
    if (!hasEveryAnswer || answeredIds.size !== session.questions.length) {
      throw new IncompleteAnswersError("Please answer each question once before submitting.");
    }

    session.result = await this.quizzes.grade({ ...session, answers: request.answers });
    session.completedAt = new Date().toISOString();
    await this.sessions.save(session);
    return session;
  }

  private async requireSession(sessionId: string): Promise<LearningSession> {
    const session = await this.sessions.find(sessionId);
    if (!session) throw new SessionNotFoundError(`Session not found: ${sessionId}`);
    return session;
  }
}
