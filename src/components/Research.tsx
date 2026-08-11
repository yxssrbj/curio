import { motion } from "motion/react";
import { ArrowRight, BookOpen, Check, Clock3 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { LearningSession } from "../../shared/contracts";

interface ResearchProps {
  session: LearningSession;
  notes: string;
  busy: boolean;
  onNotesChange(notes: string): void;
  onFinish(): void;
}

export function Research({
  session,
  notes,
  busy,
  onNotesChange,
  onFinish,
}: ResearchProps) {
  const [secondsLeft, setSecondsLeft] = useState(15 * 60);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((seconds) => Math.max(0, seconds - 1));
    }, 1_000);
    return () => window.clearInterval(timer);
  }, []);

  const time = useMemo(() => {
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, [secondsLeft]);

  const wordCount = notes.trim() ? notes.trim().split(/\s+/).length : 0;

  return (
    <motion.section className="session" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
      <div className="session-top">
        <div>
          <span className="topic-eyebrow">{session.topic.category}</span>
          <h1>{session.topic.title}</h1>
        </div>
        <div className="timer">
          <Clock3 />
          <span>{time}</span>
          <small>remaining</small>
        </div>
      </div>

      <div className="session-grid">
        <article className="research-brief">
          <span className="section-index">A PLACE TO START</span>
          <h2>{session.topic.question}</h2>
          <p>{session.topic.brief}</p>
          <div className="tips">
            <span><Check /> Open more than one source</span>
            <span><Check /> Note disagreements, not just facts</span>
            <span><Check /> Write down what surprised you</span>
          </div>
        </article>

        <div className="notebook">
          <div className="notebook-head">
            <span><BookOpen /> Field notes</span>
            <small>{wordCount} {wordCount === 1 ? "word" : "words"}</small>
          </div>
          <textarea
            autoFocus
            value={notes}
            onChange={(event) => onNotesChange(event.target.value)}
            placeholder="Start with what you think you know…"
          />
          <button className="primary" onClick={onFinish} disabled={busy}>
            {busy ? "Writing your questions…" : "Close the tabs and test me"} <ArrowRight />
          </button>
        </div>
      </div>
    </motion.section>
  );
}
