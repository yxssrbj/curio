# Curio

> Take one question. Follow it for fifteen minutes. Close the tabs and see what stayed.

[![TypeScript](https://img.shields.io/badge/TypeScript-strict-1f2320?style=flat-square)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-1f2320?style=flat-square)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5-1f2320?style=flat-square)](https://expressjs.com/)
[![Vercel](https://img.shields.io/badge/deploy-Vercel-1f2320?style=flat-square)](https://vercel.com/)

Curio is a small research ritual for people who want to remember more of what they read. It gives you a worthwhile question, fifteen minutes to investigate it, and three follow-up questions that test whether you can explain the idea without leaning on the source.

No feed, summaries, or points system. The interesting part is doing the reading.

## How a session works

1. **Take a question.** Shuffle through Curio’s topic catalog and choose a depth.
2. **Follow it for fifteen minutes.** Read freely and keep notes in your own words.
3. **Close the tabs.** Answer one explanation, one challenge, and one connection question.
4. **Find the thin spots.** Curio scores each answer and gives short, specific feedback.

Curio has two quiz providers:

- The **local provider** works without external services and is useful for development.
- The **OpenAI provider** uses the learner’s topic and notes to generate the quiz and assess the answers. The API key stays on the server.

## Stack

| Part | Choice |
| --- | --- |
| Web | React 19, Vite, TypeScript |
| Motion | Motion and Lucide icons |
| API | Express 5 with Zod validation |
| AI | OpenAI Responses API with Structured Outputs |
| Local storage | Atomic JSON file repository |
| Vercel storage | Upstash Redis |
| Deployment | One Vercel Function plus CDN-served frontend assets |

The UI uses Inter for interface text and Times New Roman MT, with a Times New Roman fallback, for editorial display type.

## Try it here : 
[https://curio-ten-amber.vercel.app/](https://curio-ten-amber.vercel.app/)

## Current scope

Curio is intentionally account-free. Sessions are addressed by a random identifier and expire automatically in Redis. Authentication, cross-device history, and scheduled review are good next steps, but they are not hidden inside this MVP.
