import { z } from "zod";
import { difficulties } from "../shared/contracts.js";

export const createSessionSchema = z.object({
  topicId: z.string().min(1),
  difficulty: z.enum(difficulties),
});

export const updateNotesSchema = z.object({
  notes: z.string().max(20_000),
});

export const submitAnswersSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string().min(1),
    answer: z.string().trim().min(1).max(5_000),
  })).min(1).max(10),
});
