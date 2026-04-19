# general-purpose-front

Frontend em **React + TypeScript (Vite) + Tailwind CSS v4** para consumir uma API FastAPI de agente conversacional com streaming SSE.

## Features

- Login fake (nome, email, cargo, objetivo) persistido em `localStorage`
- Contexto global do usuário (`UserContext`) + `thread_id` único por conversa (`crypto.randomUUID()`)
- Chat com streaming SSE consumido via `fetch` + `ReadableStream` (sem `EventSource`)
- Injeção automática e única do contexto do usuário na primeira mensagem de cada thread
- Carregamento de histórico existente via `GET /sessions/:threadId`
- Mapeamento de papéis `human → user` / `ai → assistant` (demais papéis ocultos)
- Indicador de status discreto enquanto ferramentas são executadas
- Resposta do assistente renderizada token a token com caret piscante
- Scroll automático inteligente (pausa quando o usuário rola para cima)
- Botão de nova conversa, logout e tratamento amigável de erros
- Cancelamento de streams via `AbortController`
- Layout responsivo e tipado ponta a ponta

## Requisitos

- Node.js 18+
- A API FastAPI rodando e acessível (por padrão `http://localhost:8000`)

## Setup

```bash
npm install
cp .env.example .env
# ajuste VITE_API_URL conforme necessário
npm run dev
```

A aplicação sobe em `http://localhost:5173`.

### Variáveis de ambiente

| Variável       | Descrição                               | Exemplo                 |
| -------------- | --------------------------------------- | ----------------------- |
| `VITE_API_URL` | Base URL da API FastAPI (sem `/` final) | `http://localhost:8000` |

## Scripts

```bash
npm run dev      # Vite dev server
npm run build    # type-check + build de produção
npm run preview  # serve o build
npm run lint     # type-check
```

## Estrutura

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

## Fluxo de contexto do usuário

O backend só aceita `{ message, thread_id }`. Portanto, na primeira mensagem de um `thread_id`, o frontend envia automaticamente um bloco com o contexto do usuário:

```
Contexto do usuário:
Nome: ...
Email: ...
Perfil: ...
Objetivo: ...
Considere esse contexto nas próximas respostas.
```

Esse envio acontece em background (sem aparecer na UI). Um marcador em `localStorage` garante que a injeção aconteça apenas uma vez por thread. Ao abrir uma sessão já existente via `GET /sessions/:threadId`, o marcador é setado automaticamente.

## Notas

- Não há autenticação real. O login serve apenas para capturar dados locais.
- Ao clicar em "Nova conversa", é gerado um novo `thread_id` e o histórico local é limpo. O contexto do usuário será reenviado na primeira mensagem.
- O parser SSE respeita buffers parciais entre chunks e linhas `data:` multi-linhas.
