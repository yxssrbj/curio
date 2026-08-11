import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import test from "node:test";
import type { LearningSession } from "../shared/contracts.js";
import { createApp } from "./app.js";
import { LearningService } from "./learningService.js";
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

test("the HTTP API creates a session and rejects malformed input", async (context) => {
  const service = new LearningService(new MemorySessionRepository(), new LocalQuizProvider());
  const server = createApp(service).listen(0);
  context.after(() => server.close());

  await new Promise<void>((resolve) => server.once("listening", resolve));
  const port = (server.address() as AddressInfo).port;
  const baseUrl = `http://127.0.0.1:${port}`;

  const health = await fetch(`${baseUrl}/api/health`);
  assert.deepEqual(await health.json(), { status: "ok" });

  const created = await fetch(`${baseUrl}/api/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topicId: "emergence", difficulty: "curious" }),
  });
  assert.equal(created.status, 201);

  const payload = await created.json() as { session: LearningSession };
  assert.equal(payload.session.topic.id, "emergence");
  assert.equal(payload.session.questions.length, 0);

  const malformed = await fetch(`${baseUrl}/api/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topicId: "", difficulty: "impossible" }),
  });
  assert.equal(malformed.status, 400);
});
