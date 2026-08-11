import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, BookOpen, Clock3, Dices, Sparkles } from "lucide-react";
import type { Difficulty, Topic } from "../../shared/contracts";
import { Logo } from "./Logo";

const depthLabels: Record<Difficulty, string> = {
  curious: "Curious",
  "deep-dive": "Deep dive",
  expert: "Expert",
};

interface HomeProps {
  topic: Topic | null;
  difficulty: Difficulty;
  busy: boolean;
  onDifficultyChange(difficulty: Difficulty): void;
  onShuffle(): void;
  onBegin(): void;
}

export function Home({ topic, difficulty, busy, onDifficultyChange, onShuffle, onBegin }: HomeProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <section className="hero">
        <div className="orb orb-one" />
        <div className="orb orb-two" />

        <motion.div className="hero-copy" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7 }}>
          <span className="kicker"><Sparkles size={14} /> Fifteen minutes, one good question</span>
          <h1>Read past the answer.<br /><em>Keep the idea.</em></h1>
          <p className="lede">Pick a subject, follow the interesting parts, and explain what you found without leaning on the tab you just closed.</p>
          <div className="hero-actions">
            <button className="primary" onClick={onBegin} disabled={!topic || busy}>Start a session <ArrowRight size={18} /></button>
            <span>No account. No feed. Just a timer.</span>
          </div>
        </motion.div>

        <motion.div className="topic-stage" initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.18, duration: 0.7 }}>
          <div className="stage-label">
            <span>Today’s question</span>
            <button onClick={onShuffle} disabled={busy}><Dices size={15} /> {busy ? "Finding one…" : "Shuffle"}</button>
          </div>

          <TopicCard topic={topic} difficulty={difficulty} busy={busy} onDifficultyChange={onDifficultyChange} onBegin={onBegin} />
          <div className="floating-note note-one">Read more than<br />the first result.</div>
          <div className="floating-note note-two">Say it in<br />your own words.</div>
        </motion.div>
      </section>

      <section className="manifesto" id="why">
        <span className="section-index">01 — THE POINT</span>
        <p>Finding an answer is quick.<br /><em>Knowing what it means takes longer.</em></p>
      </section>

      <section className="steps" id="how">
        <div className="steps-heading">
          <span className="section-index">02 — THE ROUTINE</span>
          <h2>Nothing fancy.<br /><em>That’s the point.</em></h2>
        </div>
        <div className="step-grid">
          <Step number="01" icon={<Dices />} title="Take a question">Shuffle until something makes you stop and wonder.</Step>
          <Step number="02" icon={<Clock3 />} title="Follow it for a while">You get fifteen minutes and an empty page. The web is yours to use.</Step>
          <Step number="03" icon={<BookOpen />} title="Close the tabs">Answer three questions from memory. Curio tells you where the idea is still thin.</Step>
        </div>
      </section>

      <section className="closing">
        <div className="closing-ring"><Sparkles /></div>
        <span className="section-index">ONE QUESTION. FIFTEEN MINUTES.</span>
        <h2>See what stays<br /><em>after the tab closes.</em></h2>
        <button className="primary inverse" onClick={onBegin} disabled={!topic || busy}>Start here <ArrowRight /></button>
      </section>

      <footer><Logo /><p>For people who still like finding things out.</p><span>© 2026 Curio</span></footer>
    </motion.div>
  );
}

interface TopicCardProps {
  topic: Topic | null;
  difficulty: Difficulty;
  busy: boolean;
  onDifficultyChange(difficulty: Difficulty): void;
  onBegin(): void;
}

function TopicCard({ topic, difficulty, busy, onDifficultyChange, onBegin }: TopicCardProps) {
  return (
    <div className="spotlight-card topic-card">
      <div className="topic-number">15 min</div>
      <span className="topic-eyebrow">{topic?.category ?? "Finding a topic"}</span>

      <AnimatePresence mode="wait">
        <motion.div key={topic?.id ?? "loading"} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
          <h2>{topic?.title ?? "One moment…"}</h2>
          <p>{topic?.question ?? "Curio is looking through the question drawer."}</p>
        </motion.div>
      </AnimatePresence>

      <div className="difficulty">
        <span>Your depth</span>
        {(Object.keys(depthLabels) as Difficulty[]).map((value) => (
          <button key={value} className={difficulty === value ? "active" : ""} onClick={() => onDifficultyChange(value)}>
            {depthLabels[value]}
          </button>
        ))}
      </div>

      <button className="card-start" onClick={onBegin} disabled={!topic || busy}>
        <span>{busy ? "Setting the table…" : "Explore this question"}</span>
        <span className="round-arrow"><ArrowRight /></span>
      </button>
    </div>
  );
}

interface StepProps {
  number: string;
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

function Step({ number, icon, title, children }: StepProps) {
  return (
    <motion.article whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 250 }}>
      <span>{number}</span>
      <div className="step-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{children}</p>
    </motion.article>
  );
}
