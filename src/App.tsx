import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";
import { Home } from "./components/Home";
import { Logo } from "./components/Logo";
import { Quiz } from "./components/Quiz";
import { Research } from "./components/Research";
import { Result } from "./components/Result";
import { useLearningSession } from "./useLearningSession";

export default function App() {
  const learning = useLearningSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main>
      <Navigation
        menuOpen={menuOpen}
        onMenuToggle={() => setMenuOpen((open) => !open)}
        onBegin={learning.begin}
      />

      {learning.error && (
        <div className="error-banner" role="alert">
          {learning.error}
        </div>
      )}

      <AnimatePresence mode="wait">
        {learning.screen === "home" && (
          <Home
            key="home"
            topic={learning.topic}
            difficulty={learning.difficulty}
            busy={learning.busy}
            onDifficultyChange={learning.setDifficulty}
            onShuffle={learning.shuffleTopic}
            onBegin={learning.begin}
          />
        )}

        {learning.screen === "research" && learning.session && (
          <Research
            key="research"
            session={learning.session}
            notes={learning.notes}
            busy={learning.busy}
            onNotesChange={learning.setNotes}
            onFinish={learning.finishResearch}
          />
        )}

        {learning.screen === "quiz" && learning.session && (
          <Quiz
            key="quiz"
            session={learning.session}
            busy={learning.busy}
            onSubmit={learning.submitAnswers}
          />
        )}

        {learning.screen === "result" && learning.session?.result && (
          <Result
            key="result"
            session={learning.session}
            onStartOver={learning.startOver}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

interface NavigationProps {
  menuOpen: boolean;
  onMenuToggle(): void;
  onBegin(): void;
}

function Navigation({ menuOpen, onMenuToggle, onBegin }: NavigationProps) {
  return (
    <>
      <nav>
        <Logo />
        <div className="nav-links">
          <a href="#how">How it works</a>
          <a href="#why">Why Curio</a>
          <button className="nav-cta" onClick={onBegin}>
            Begin a session <ArrowRight size={16} />
          </button>
        </div>
        <button className="menu-button" onClick={onMenuToggle} aria-label="Toggle menu">
          {menuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <a href="#how">How it works</a>
            <a href="#why">Why Curio</a>
            <button onClick={onBegin}>Begin a session</button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
