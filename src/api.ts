import type {
  CreateSessionRequest,
  LearningSession,
  SubmitAnswersRequest,
  Topic,
  UpdateNotesRequest,
} from "../shared/contracts";

interface TopicResponse {
  topic: Topic;
}

interface SessionResponse {
  session: LearningSession;
}

export const api = {
  randomTopic(excludedId?: string) {
    const query = excludedId ? `?exclude=${encodeURIComponent(excludedId)}` : "";
    return request<TopicResponse>(`/api/topics/random${query}`);
  },

  createSession(input: CreateSessionRequest) {
    return request<SessionResponse>("/api/sessions", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  saveNotes(sessionId: string, input: UpdateNotesRequest) {
    return request<SessionResponse>(`/api/sessions/${sessionId}/notes`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  createQuiz(sessionId: string) {
    return request<SessionResponse>(`/api/sessions/${sessionId}/quiz`, {
      method: "POST",
    });
  },

  submitAnswers(sessionId: string, input: SubmitAnswersRequest) {
    return request<SessionResponse>(`/api/sessions/${sessionId}/answers`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  const body = await response.json().catch(() => null) as { error?: string } | null;
  if (!response.ok) {
    throw new Error(body?.error ?? "Curio could not reach the server.");
  }

  return body as T;
}
