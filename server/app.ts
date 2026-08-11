import express, { type NextFunction, type Request, type Response } from "express";
import { rateLimit } from "express-rate-limit";
import path from "node:path";
import { topics, pickTopic } from "./catalog.js";
import {
  IncompleteAnswersError,
  LearningService,
  SessionNotFoundError,
  TopicNotFoundError,
} from "./learningService.js";
import {
  createSessionSchema,
  submitAnswersSchema,
  updateNotesSchema,
} from "./validation.js";

export function createApp(service: LearningService) {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(express.json({ limit: "64kb" }));

  const quizRateLimit = rateLimit({
    windowMs: 15 * 60 * 1_000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.get("/api/health", (_request, response) => {
    response.set("Cache-Control", "no-store");
    response.json({ status: "ok" });
  });

  app.get("/api/topics", (_request, response) => {
    response.json({ topics });
  });

  app.get("/api/topics/random", (request, response) => {
    const excludedId = typeof request.query.exclude === "string"
      ? request.query.exclude
      : undefined;

    response.json({ topic: pickTopic(excludedId) });
  });

  app.post("/api/sessions", asyncHandler(async (request, response) => {
    const input = createSessionSchema.parse(request.body);
    const session = await service.start(input.topicId, input.difficulty);
    response.status(201).json({ session });
  }));

  app.patch("/api/sessions/:sessionId/notes", asyncHandler(async (request, response) => {
    const input = updateNotesSchema.parse(request.body);
    const session = await service.saveNotes(
      String(request.params.sessionId),
      input.notes,
    );
    response.json({ session });
  }));

  app.post(
    "/api/sessions/:sessionId/quiz",
    quizRateLimit,
    asyncHandler(async (request, response) => {
      const session = await service.prepareQuiz(String(request.params.sessionId));
      response.json({ session });
    }),
  );

  app.post(
    "/api/sessions/:sessionId/answers",
    quizRateLimit,
    asyncHandler(async (request, response) => {
      const input = submitAnswersSchema.parse(request.body);
      const session = await service.submitAnswers(
        String(request.params.sessionId),
        input,
      );
      response.json({ session });
    }),
  );

  const publicDirectory = path.resolve("public");
  app.use(express.static(publicDirectory));
  app.use((request, response, next) => {
    if (request.method === "GET" && !request.path.startsWith("/api/")) {
      response.sendFile(path.join(publicDirectory, "index.html"));
      return;
    }

    next();
  });

  app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
    if (error instanceof SessionNotFoundError || error instanceof TopicNotFoundError) {
      response.status(404).json({ error: error.message });
      return;
    }

    if (error instanceof IncompleteAnswersError) {
      response.status(400).json({ error: error.message });
      return;
    }

    if (error && typeof error === "object" && "issues" in error) {
      response.status(400).json({
        error: "The request was not valid.",
        details: error.issues,
      });
      return;
    }

    console.error(error);
    response.status(500).json({ error: "Something went wrong. Please try again." });
  });

  return app;
}

function asyncHandler(handler: (request: Request, response: Response) => Promise<void>) {
  return (request: Request, response: Response, next: NextFunction) => {
    handler(request, response).catch(next);
  };
}
