import "dotenv/config";
import app from "../app.js";

const port = Number(process.env.PORT ?? 3001);
const server = app.listen(port, () => {
  const quizProvider = process.env.OPENAI_API_KEY ? "OpenAI" : "local";
  const sessionStore = process.env.UPSTASH_REDIS_REST_URL ? "Redis" : "file";

  console.log(
    `Curio is running at http://localhost:${port} (${quizProvider} quizzes, ${sessionStore} sessions)`,
  );
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    server.close((error) => {
      if (error) {
        console.error("Curio could not shut down cleanly.", error);
        process.exitCode = 1;
      }
    });
  });
}
