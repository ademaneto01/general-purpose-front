export type User = {
  name: string;
  email: string;
  role: string;
  goal: string;
};

export type BackendRole = 'human' | 'ai' | 'tool' | 'system';

export type UIRole = 'user' | 'assistant' | 'error';

export type Attachment = {
  name: string;
  size: number;
  type: string;
};

export type UIMessage = {
  id: string;
  role: UIRole;
  content: string;
  streaming?: boolean;
  hidden?: boolean;
  attachments?: Attachment[];
};

export type SSEStatusPayload = {
  type: 'status';
  content: string;
};

export type SSETokenPayload = {
  type: 'token';
  content: string;
};

export type SSEPayload = SSEStatusPayload | SSETokenPayload;

export type BackendMessage = {
  role: BackendRole;
  content: string;
};

export type SessionResponse = {
  thread_id: string;
  messages: BackendMessage[];
};

export type HealthResponse = {
  status: string;
};

export type UploadResponse = {
  file_path: string;
};

export type StreamChatOptions = {
  message: string;
  threadId: string;
  onStatus?: (status: string) => void;
  onToken?: (token: string) => void;
  signal?: AbortSignal;
};
