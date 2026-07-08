# Kanban

A single-board Kanban app. Client-rendered Next.js, no backend, no persistence -
the board resets to dummy data on reload.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Testing

```bash
npm run test       # unit tests (Vitest)
npm run test:e2e   # end-to-end tests (Playwright)
```

## Stack

- Next.js (App Router), React, TypeScript
- Tailwind CSS
- dnd-kit for drag and drop
