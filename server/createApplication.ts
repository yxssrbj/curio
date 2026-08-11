import { createApp } from "./app.js";
import { LearningService } from "./learningService.js";
import { LocalQuizProvider, OpenAIQuizProvider } from "./quizProvider.js";
import {
  FileSessionRepository,
  RedisSessionRepository,
  type SessionRepository,
} from "./sessionRepository.js";

export function createApplication() {
  const repository = createSessionRepository();
  const quizProvider = process.env.OPENAI_API_KEY
    ? new OpenAIQuizProvider(process.env.OPENAI_API_KEY)
    : new LocalQuizProvider();

  return createApp(new LearningService(repository, quizProvider));
}

function createSessionRepository(): SessionRepository {
  const hasRedisUrl = Boolean(process.env.UPSTASH_REDIS_REST_URL);
  const hasRedisToken = Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

  if (hasRedisUrl !== hasRedisToken) {
    throw new Error(
      "Both UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required.",
    );
  }

  if (hasRedisUrl && hasRedisToken) {
    return new RedisSessionRepository();
  }

  if (process.env.VERCEL) {
    throw new Error(
      "Durable session storage is not configured. Connect Upstash Redis to this Vercel project and redeploy.",
    );
  }

  return new FileSessionRepository();
}
