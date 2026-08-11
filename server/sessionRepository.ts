import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { Redis } from "@upstash/redis";
import type { LearningSession } from "../shared/contracts.js";

interface SessionFile {
  sessions: LearningSession[];
}

export interface SessionRepository {
  find(id: string): Promise<LearningSession | null>;
  save(session: LearningSession): Promise<void>;
}

export class FileSessionRepository implements SessionRepository {
  private writeQueue = Promise.resolve();

  constructor(private readonly filePath = path.resolve("data", "sessions.json")) {}

  async find(id: string): Promise<LearningSession | null> {
    const data = await this.read();
    return data.sessions.find((session) => session.id === id) ?? null;
  }

  async save(session: LearningSession): Promise<void> {
    const operation = this.writeQueue.then(async () => {
      const data = await this.read();
      const index = data.sessions.findIndex((item) => item.id === session.id);

      if (index === -1) data.sessions.push(session);
      else data.sessions[index] = session;

      await this.write(data);
    });

    this.writeQueue = operation.catch(() => undefined);
    return operation;
  }

  private async read(): Promise<SessionFile> {
    try {
      return JSON.parse(await readFile(this.filePath, "utf8")) as SessionFile;
    } catch (error) {
      if (isMissingFile(error)) return { sessions: [] };
      throw error;
    }
  }

  private async write(data: SessionFile): Promise<void> {
    await mkdir(path.dirname(this.filePath), { recursive: true });
    const temporaryPath = `${this.filePath}.tmp`;
    await writeFile(temporaryPath, JSON.stringify(data, null, 2), "utf8");
    await rename(temporaryPath, this.filePath);
  }
}

export class RedisSessionRepository implements SessionRepository {
  constructor(
    private readonly redis = Redis.fromEnv(),
    private readonly ttlSeconds = Number(process.env.SESSION_TTL_SECONDS ?? 604_800),
  ) {
    if (!Number.isFinite(this.ttlSeconds) || this.ttlSeconds < 60) {
      throw new Error("SESSION_TTL_SECONDS must be a number greater than 60.");
    }
  }

  find(id: string): Promise<LearningSession | null> {
    return this.redis.get<LearningSession>(this.key(id));
  }

  async save(session: LearningSession): Promise<void> {
    await this.redis.set(this.key(session.id), session, { ex: this.ttlSeconds });
  }

  private key(id: string): string {
    return `curio:session:${id}`;
  }
}

function isMissingFile(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}
