import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import type { User } from '../types';

type FieldKey = keyof User;

const FIELDS: {
  key: FieldKey;
  label: string;
  type: 'text' | 'email';
  placeholder: string;
  autoComplete?: string;
}[] = [
  {
    key: 'name',
    label: 'Name',
    type: 'text',
    placeholder: 'What should we call you?',
    autoComplete: 'name',
  },
  {
    key: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'you@company.com',
    autoComplete: 'email',
  },
  {
    key: 'role',
    label: 'Role or profile',
    type: 'text',
    placeholder: 'e.g. Data Engineer',
    autoComplete: 'organization-title',
  },
  {
    key: 'goal',
    label: 'Goal',
    type: 'text',
    placeholder: 'What do you want to solve today?',
  },
];

export function LoginPage() {
  const navigate = useNavigate();
  const { login, user, hydrated } = useUser();
  const [form, setForm] = useState<User>({ name: '', email: '', role: '', goal: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (hydrated && user) {
      navigate('/chat', { replace: true });
    }
  }, [hydrated, user, navigate]);

  const handleChange = (key: FieldKey, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const cleaned: User = {
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role.trim(),
      goal: form.goal.trim(),
    };
    if (!cleaned.name || !cleaned.email || !cleaned.role || !cleaned.goal) return;
    setSubmitting(true);
    login(cleaned);
    navigate('/chat', { replace: true });
  };

  const disabled =
    submitting ||
    !form.name.trim() ||
    !form.email.trim() ||
    !form.role.trim() ||
    !form.goal.trim();

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 shadow-lg shadow-violet-500/30">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-6 w-6 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Conversational Agent
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Tell us a bit about yourself so we can tailor the conversation.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-xl shadow-black/20 backdrop-blur"
        >
          <div className="space-y-4">
            {FIELDS.map((field) => (
              <div key={field.key}>
                <label
                  htmlFor={field.key}
                  className="mb-1.5 block text-xs font-medium text-white/70"
                >
                  {field.label}
                </label>
                <input
                  id={field.key}
                  type={field.type}
                  value={form[field.key]}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  autoComplete={field.autoComplete}
                  required
                  className="w-full rounded-lg border border-white/10 bg-[#0b0b12]/60 px-3 py-2.5 text-sm text-white placeholder:text-white/25 transition focus:border-violet-400/60 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={disabled}
            className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>

          <p className="mt-4 text-center text-[11px] text-white/40">
            Your data stays only in this browser.
          </p>
        </form>
      </div>
    </div>
  );
}
