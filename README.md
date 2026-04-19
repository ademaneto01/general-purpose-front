# general-purpose-front

A **React + TypeScript (Vite) + Tailwind CSS v4** frontend that consumes a FastAPI conversational agent with SSE streaming.

## Features

- Fake login (name, email, role, goal) persisted in `localStorage`
- Global user context (`UserContext`) + a unique `thread_id` per conversation (`crypto.randomUUID()`)
- Chat streaming consumed via `fetch` + `ReadableStream` (no `EventSource`, since `/chat` is `POST`)
- Automatic, one-time user-context injection on the first message of each thread
- Existing history loaded from `GET /sessions/:threadId`
- Role mapping `human → user` / `ai → assistant` (other roles are hidden)
- Discreet status indicator while tools are running
- Assistant response rendered token by token with a blinking caret
- Smart auto-scroll (pauses when the user scrolls up)
- "New chat" button, sign-out, and friendly error handling
- Stream cancellation via `AbortController`
- Responsive layout, fully typed end to end

## Requirements

- Node.js 20+ (Tailwind CSS v4 requirement)
- FastAPI backend running and reachable (default `http://localhost:8000`)

## Setup

```bash
npm install
cp .env.example .env
# adjust VITE_API_URL if needed
npm run dev
```

The app runs at `http://localhost:5173`.

### Environment variables

| Variable       | Description                                  | Example                 |
| -------------- | -------------------------------------------- | ----------------------- |
| `VITE_API_URL` | Base URL of the FastAPI backend (no trailing slash) | `http://localhost:8000` |

## Scripts

```bash
npm run dev      # Vite dev server
npm run build    # type-check + production build
npm run preview  # serve the build
npm run lint     # type-check only
```

## Project structure

```
src/
├── main.tsx
├── App.tsx
├── index.css
├── vite-env.d.ts
├── types/
│   └── index.ts
├── contexts/
│   └── UserContext.tsx
├── services/
│   └── api.ts            # healthCheck, getSession, streamChat (SSE parser)
├── hooks/
│   ├── useChat.ts
│   └── useAutoScroll.ts
├── utils/
│   ├── storage.ts
│   └── userContext.ts
├── components/
│   ├── ChatHeader.tsx
│   ├── ChatMessages.tsx
│   ├── MessageBubble.tsx
│   ├── ChatInput.tsx
│   ├── StatusIndicator.tsx
│   └── ProtectedRoute.tsx
└── pages/
    ├── LoginPage.tsx
    └── ChatPage.tsx
```

## User context flow

The backend only accepts `{ message, thread_id }`. Therefore, on the first message of a given `thread_id`, the frontend automatically sends a context block:

```
User context:
Name: ...
Email: ...
Role: ...
Goal: ...
Keep this context in mind for the upcoming answers.
```

This call happens in the background (not shown in the UI). A `localStorage` marker ensures the injection happens only once per thread. When an existing session is loaded via `GET /sessions/:threadId`, the marker is set automatically.

## Notes

- There is no real authentication. The login only captures local metadata.
- Clicking "New chat" generates a new `thread_id` and clears the local history. The user context is re-sent on the first message of the new thread.
- The SSE parser supports partial chunk buffering and multi-line `data:` events.
