# CEO of Self — Pilot App

A working prototype of the **CEO of Self (CEOOS)** mobile app, built to test
the core product experience with real users before committing to native
development. CEO of Self is an integrated self-leadership and wellness
program: it frames a person's life as five "departments" — Career, Health,
Wealth, Fun, and Love & Family — that they lead the way a CEO leads a company,
through short guided reflections, committed actions, and mood tracking.

This is **not** the production app. It's a click-through prototype meant to
validate flows, copy, and interaction design with pilot users, and to give the
team a shared, live reference while the real native app is built.

## Live demo

Deployed on Netlify: https://ceeo-of-self.netlify.app

## What's in the prototype

- **Login → onboarding** — a short intro (privacy, departments, coach, name)
  before entering the app.
- **Orbit hub** — the five departments arranged around "You"; tapping one
  opens its department flow.
- **Department flow** — a guided conversation (intro → questions → commit to
  an action → schedule a reminder → mark it done → log mood → recommendation),
  plus a running chat history and stats for that department.
- **My Actions** — all committed actions across departments in one place.
- **Mood** — a daily mood check-in and a weekly view.
- **LLM-powered coach acknowledgements** — a short, in-persona reaction to
  what the user just answered, generated via a Netlify Function that calls the
  Claude API. It's scoped narrowly (1–2 sentences, inserted before the next
  fixed question) — not a free-form chatbot.

All state (identity, department progress, conversations, plans, mood) is kept
in the browser's `localStorage`, so the prototype works without a backend or
account system. An avatar-menu "Reset account" flow clears it all and returns
to Login, to make repeat testing easy.

## Tech stack

- [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vite.dev) for dev server and build
- [React Router](https://reactrouter.com) for client-side routing
- [Vitest](https://vitest.dev) + Testing Library for tests
- [Netlify Functions](https://docs.netlify.com/functions/overview/) for the
  one server-side call (the coach acknowledgement), backed by the
  [Claude API](https://docs.claude.com)

## Running locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. This runs the UI only — the coach
acknowledgement call will silently no-op (it fails gracefully, by design)
since it needs the Netlify Function running alongside it.

To run the full prototype, including the LLM coach acknowledgements, use the
Netlify CLI instead so the function runs locally too:

```bash
npm install -g netlify-cli   # if you don't already have it
cp .env.example .env         # then fill in ANTHROPIC_API_KEY
netlify dev
```

## Other scripts

```bash
npm run build       # typecheck + production build to dist/
npm run test         # run the test suite once
npm run test:watch  # run tests in watch mode
npm run lint         # oxlint
```

## Deployment

Deploys automatically via Netlify's GitHub integration on every push to
`main` (see `netlify.toml`: `npm run build` publishes `dist/`, with
`netlify/functions` deployed alongside it and a catch-all redirect to
`index.html` for client-side routing).

The Claude API key used by the coach-acknowledgement function is set as an
environment variable (`ANTHROPIC_API_KEY`) in Netlify's dashboard under
Site configuration → Environment variables — never committed, and never
prefixed with `VITE_` (that prefix would inline it into the public client
bundle).
