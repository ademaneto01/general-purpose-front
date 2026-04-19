import type { User } from '../types';

export function buildUserContextMessage(user: User): string {
  return [
    'Contexto do usuário:',
    `Nome: ${user.name}`,
    `Email: ${user.email}`,
    `Perfil: ${user.role}`,
    `Objetivo: ${user.goal}`,
    'Considere esse contexto nas próximas respostas. Responda apenas com uma breve confirmação.',
  ].join('\n');
}

export function newThreadId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `tid-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
