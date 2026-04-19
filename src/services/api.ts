import type {
  HealthResponse,
  SSEPayload,
  SessionResponse,
  StreamChatOptions,
} from '../types';

const rawBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
const API_URL = rawBaseUrl.replace(/\/+$/, '');

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function parseJsonOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new ApiError(
      text || `Requisição falhou (${res.status} ${res.statusText})`,
      res.status,
    );
  }
  return (await res.json()) as T;
}

export async function healthCheck(signal?: AbortSignal): Promise<HealthResponse> {
  const res = await fetch(`${API_URL}/`, { signal });
  return parseJsonOrThrow<HealthResponse>(res);
}

export async function getSession(
  threadId: string,
  signal?: AbortSignal,
): Promise<SessionResponse> {
  const res = await fetch(`${API_URL}/sessions/${encodeURIComponent(threadId)}`, {
    signal,
  });
  return parseJsonOrThrow<SessionResponse>(res);
}

export function getGraphImageUrl(): string {
  return `${API_URL}/graph-image`;
}

/**
 * Faz POST em /chat e consome o SSE via fetch + ReadableStream.
 * Não usa EventSource porque o endpoint é POST.
 */
export async function streamChat(options: StreamChatOptions): Promise<void> {
  const { message, threadId, onStatus, onToken, signal } = options;

  const res = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify({ message, thread_id: threadId }),
    signal,
  });

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => '');
    throw new ApiError(
      text || `Falha ao iniciar stream (${res.status} ${res.statusText})`,
      res.status,
    );
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  const dispatch = (dataLine: string) => {
    const payloadRaw = dataLine.trim();
    if (!payloadRaw || payloadRaw === '[DONE]') return;
    let parsed: SSEPayload;
    try {
      parsed = JSON.parse(payloadRaw) as SSEPayload;
    } catch {
      return;
    }
    if (parsed.type === 'token') {
      onToken?.(parsed.content);
    } else if (parsed.type === 'status') {
      onStatus?.(parsed.content);
    }
  };

  const processEventBlock = (block: string) => {
    const dataParts: string[] = [];
    for (const rawLine of block.split('\n')) {
      const line = rawLine.replace(/\r$/, '');
      if (!line || line.startsWith(':')) continue;
      if (line.startsWith('data:')) {
        dataParts.push(line.slice(5).replace(/^ /, ''));
      }
    }
    if (dataParts.length > 0) {
      dispatch(dataParts.join('\n'));
    }
  };

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let sepIndex: number;
      while ((sepIndex = findEventSeparator(buffer)) !== -1) {
        const block = buffer.slice(0, sepIndex);
        buffer = buffer.slice(sepIndex).replace(/^(\r?\n){2}/, '');
        processEventBlock(block);
      }
    }
    const tail = buffer + decoder.decode();
    if (tail.trim().length > 0) {
      processEventBlock(tail);
    }
  } finally {
    try {
      reader.releaseLock();
    } catch {
      // noop
    }
  }
}

function findEventSeparator(buffer: string): number {
  const lf = buffer.indexOf('\n\n');
  const crlf = buffer.indexOf('\r\n\r\n');
  if (lf === -1) return crlf;
  if (crlf === -1) return lf;
  return Math.min(lf, crlf);
}
