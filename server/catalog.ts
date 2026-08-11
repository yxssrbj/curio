import type { Topic } from "../shared/contracts.js";

export const topics: Topic[] = [
  { id: "ship-of-theseus", title: "The Ship of Theseus", category: "Philosophy", question: "When every part changes, is it still the same thing?", brief: "Trace the original thought experiment, then compare at least two ways philosophers have tried to answer it." },
  { id: "bioluminescence", title: "Bioluminescence", category: "Natural world", question: "Why do living things make their own light?", brief: "Look at how the chemistry works and why light evolved independently in such different species." },
  { id: "lindy-effect", title: "The Lindy Effect", category: "Ideas", question: "Why can age predict how long an idea will survive?", brief: "Find the argument behind the effect, where it seems useful, and where the reasoning breaks down." },
  { id: "library-of-alexandria", title: "The Library of Alexandria", category: "History", question: "What was really lost—and what belongs to the legend?", brief: "Separate the documented history from the popular story of a single catastrophic fire." },
  { id: "emergence", title: "Emergence", category: "Complexity", question: "How do simple rules create surprising intelligence?", brief: "Use one concrete example to understand how complex group behavior can arise without central control." },
  { id: "fermi-paradox", title: "The Fermi Paradox", category: "Space", question: "If life should be common, why does the universe seem quiet?", brief: "Compare several proposed answers and note which assumptions each one challenges." },
  { id: "placebo-effect", title: "The Placebo Effect", category: "Medicine", question: "How can expectation change what the body experiences?", brief: "Distinguish symptom relief from disease treatment and find out why placebos matter in clinical trials." },
  { id: "dunbars-number", title: "Dunbar’s Number", category: "Human behavior", question: "Is there a natural limit to the number of relationships we can maintain?", brief: "Start with the original primate research, then look at the debate around applying it to modern social life." },
];

export function findTopic(topicId: string): Topic | undefined {
  return topics.find((topic) => topic.id === topicId);
}

export function pickTopic(excludedId?: string): Topic {
  const choices = excludedId ? topics.filter((topic) => topic.id !== excludedId) : topics;
  return choices[Math.floor(Math.random() * choices.length)] ?? topics[0];
}
