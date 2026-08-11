import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import type { LearningSession, SubmitAnswersRequest } from "../../shared/contracts";

interface QuizProps {
  session: LearningSession;
  busy: boolean;
  onSubmit(answers: SubmitAnswersRequest["answers"]): void;
}

export function Quiz({ session, busy, onSubmit }: QuizProps) {
  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState("");
  const [answers, setAnswers] = useState<SubmitAnswersRequest["answers"]>([]);
  const question = session.questions[index];
  const isLast = index === session.questions.length - 1;

  function continueQuiz() {
    const nextAnswers = [...answers, { questionId: question.id, answer: draft.trim() }];

    if (isLast) {
      onSubmit(nextAnswers);
      return;
    }

    setAnswers(nextAnswers);
    setDraft("");
    setIndex((current) => current + 1);
  }

  return (
    <motion.section className="quiz" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
      <span className="section-index">QUESTION {index + 1} OF {session.questions.length}</span>
      <div className="progress">
        <i style={{ width: `${((index + 1) / session.questions.length) * 100}%` }} />
      </div>
      <span className="topic-eyebrow">{session.topic.title}</span>
      <h1>{question.prompt}</h1>
      <textarea
        autoFocus
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Answer from memory. It does not have to sound polished."
      />
      <button className="primary" disabled={!draft.trim() || busy} onClick={continueQuiz}>
        {busy ? "Reading your answers…" : isLast ? "See what held up" : "Next question"} <ArrowRight />
      </button>
    </motion.section>
  );
}
