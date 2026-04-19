import type { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

export function ProtectedRoute({ children }: { children: ReactElement }) {
  const { user, hydrated } = useUser();

  if (!hydrated) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
