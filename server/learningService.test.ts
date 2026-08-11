import assert from "node:assert/strict";
import test from "node:test";
import type { LearningSession } from "../shared/contracts.js";
import { LearningService, SessionNotFoundError } from "./learningService.js";
import { LocalQuizProvider } from "./quizProvider.js";
import type { SessionRepository } from "./sessionRepository.js";

class MemorySessionRepository implements SessionRepository {
  private readonly sessions = new Map<string, LearningSession>();

  async find(id: string) {
    return this.sessions.get(id) ?? null;
  }

  async save(session: LearningSession) {
    this.sessions.set(session.id, structuredClone(session));
  }
}

test("a session can move from topic to graded result", async () => {
  const service = new LearningService(new MemorySessionRepository(), new LocalQuizProvider());
  const session = await service.start("emergence", "curious");

  await service.saveNotes(session.id, "Ant colonies solve problems without a central planner.");
  const withQuiz = await service.prepareQuiz(session.id);

  assert.equal(withQuiz.questions.length, 3);
  assert.deepEqual(withQuiz.questions.map((question) => question.intent), [
    "explain",
    "challenge",
    "connect",
  ]);

  const completed = await service.submitAnswers(session.id, {
    answers: withQuiz.questions.map((question) => ({
      questionId: question.id,
      answer: "A detailed answer with a concrete example and a clear distinction between individual rules and group behavior.",
    })),
  });

  assert.ok(completed.result);
  assert.equal(completed.result.feedback.length, 3);
  assert.ok(completed.completedAt);
});

test("unknown sessions fail explicitly", async () => {
  const service = new LearningService(new MemorySessionRepository(), new LocalQuizProvider());

  await assert.rejects(
    () => service.prepareQuiz("missing"),
    SessionNotFoundError,
  );
});
