import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatHeader } from '../components/ChatHeader';
import { ChatInput } from '../components/ChatInput';
import { ChatMessages } from '../components/ChatMessages';
import { useUser } from '../contexts/UserContext';
import { useChat } from '../hooks/useChat';

export function ChatPage() {
  const navigate = useNavigate();
  const { user, threadId, logout, newConversation } = useUser();
  const { messages, status, streaming, loadingSession, error, send, cancel, reset } =
    useChat({ user, threadId });

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleLogout = () => {
    cancel();
    reset();
    logout();
    navigate('/login', { replace: true });
  };

  const handleNewConversation = () => {
    cancel();
    reset();
    newConversation();
  };

  return (
    <div className="flex h-dvh flex-col">
      <ChatHeader
        user={user}
        onNewConversation={handleNewConversation}
        onLogout={handleLogout}
        disabled={streaming}
      />

      <ChatMessages
        messages={messages}
        status={status}
        streaming={streaming}
        loadingSession={loadingSession}
      />

      {error ? (
        <div className="border-t border-rose-500/20 bg-rose-500/10">
          <div className="mx-auto max-w-3xl px-4 py-2 text-center text-xs text-rose-200 sm:px-6">
            {error}
          </div>
        </div>
      ) : null}

      <ChatInput
        onSend={send}
        disabled={streaming || loadingSession}
        streaming={streaming}
        onCancel={cancel}
      />
    </div>
  );
}
