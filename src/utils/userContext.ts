import type { User } from '../types';

export function buildUserContextMessage(user: User): string {
  return [
    'User context:',
    `Name: ${user.name}`,
    `Email: ${user.email}`,
    `Role: ${user.role}`,
    `Goal: ${user.goal}`,
    'Keep this context in mind for the upcoming answers. Reply only with a brief acknowledgement.',
  ].join('\n');
}

export function newThreadId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `tid-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
