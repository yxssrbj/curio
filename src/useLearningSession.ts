import { useEffect, useState } from "react";
import type {
  Difficulty,
  LearningSession,
  SubmitAnswersRequest,
  Topic,
} from "../shared/contracts";
import { api } from "./api";

export type Screen = "home" | "research" | "quiz" | "result";

export function useLearningSession() {
  const [screen, setScreen] = useState<Screen>("home");
  const [topic, setTopic] = useState<Topic | null>(null);
  const [session, setSession] = useState<LearningSession | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("curious");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadTopic();
  }, []);

  async function loadTopic(excludedId?: string) {
    setError("");
    try {
      const response = await api.randomTopic(excludedId);
      setTopic(response.topic);
    } catch (cause) {
      setError(messageFrom(cause));
    }
  }

  async function shuffleTopic() {
    if (busy) return;
    setBusy(true);
    await loadTopic(topic?.id);
    setBusy(false);
  }

  async function begin() {
    if (!topic || busy) return;
    setBusy(true);
    setError("");

    try {
      const response = await api.createSession({
        topicId: topic.id,
        difficulty,
      });
      setSession(response.session);
      setNotes("");
      setScreen("research");
      window.scrollTo(0, 0);
    } catch (cause) {
      setError(messageFrom(cause));
    } finally {
      setBusy(false);
    }
  }

  async function finishResearch() {
    if (!session || busy) return;
    setBusy(true);
    setError("");

    try {
      await api.saveNotes(session.id, { notes });
      const response = await api.createQuiz(session.id);
      setSession(response.session);
      setScreen("quiz");
      window.scrollTo(0, 0);
    } catch (cause) {
      setError(messageFrom(cause));
    } finally {
      setBusy(false);
    }
  }

  async function submitAnswers(answers: SubmitAnswersRequest["answers"]) {
    if (!session || busy) return;
    setBusy(true);
    setError("");

    try {
      const response = await api.submitAnswers(session.id, { answers });
      setSession(response.session);
      setScreen("result");
      window.scrollTo(0, 0);
    } catch (cause) {
      setError(messageFrom(cause));
    } finally {
      setBusy(false);
    }
  }

  async function startOver() {
    const previousTopicId = topic?.id;
    setSession(null);
    setNotes("");
    setScreen("home");
    setBusy(true);
    await loadTopic(previousTopicId);
    setBusy(false);
    window.scrollTo(0, 0);
  }

  return {
    screen,
    topic,
    session,
    difficulty,
    notes,
    busy,
    error,
    setDifficulty,
    setNotes,
    shuffleTopic,
    begin,
    finishResearch,
    submitAnswers,
    startOver,
  };
}

function messageFrom(cause: unknown): string {
  return cause instanceof Error ? cause.message : "Something went wrong. Please try again.";
}
