import { motion } from "motion/react";
import { RotateCcw } from "lucide-react";
import type { LearningSession } from "../../shared/contracts";

interface ResultProps {
  session: LearningSession;
  onStartOver(): void;
}

export function Result({ session, onStartOver }: ResultProps) {
  const result = session.result;
  if (!result) return null;

  return (
    <motion.section className="result" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
      <div className="score-ring">
        <strong>{result.score}</strong>
        <span>out of 100</span>
      </div>
      <span className="section-index">WHAT HELD UP</span>
      <h1>{result.summary}</h1>

      <div className="feedback-list">
        {session.questions.map((question) => {
          const feedback = result.feedback.find((item) => item.questionId === question.id);
          return (
            <article key={question.id}>
              <div>
                <span>{question.intent}</span>
                <strong>{feedback?.score ?? 0}</strong>
              </div>
              <h2>{question.prompt}</h2>
              <p>{feedback?.comment}</p>
            </article>
          );
        })}
      </div>

      <button className="primary" onClick={onStartOver}>
        <RotateCcw /> Pick another question
      </button>
    </motion.section>
  );
}
