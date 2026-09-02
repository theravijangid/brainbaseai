import React, { useRef, useEffect, useState, useCallback } from 'react';
import { AlertCircle, MessageSquare, RefreshCw, Send, X, Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useBrainbaseChat, WidgetState } from '../hooks/useBrainbaseChat';
import { getSafePrimaryColor, sanitizeText } from '../utils/security';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const stateCopy: Record<Exclude<WidgetState, 'chat' | 'loading'>, { title: string; body: string; action: string }> = {
  error: {
    title: 'Something went wrong',
    body: "We couldn't reach the support assistant just now. Please try again.",
    action: 'Try again',
  },
  expired: {
    title: 'Session expired',
    body: 'This conversation has been idle for a while. Start a new one to continue.',
    action: 'Start new chat',
  },
  'rate-limited': {
    title: 'Too many messages',
    body: "You've sent a lot of messages in a short time. Please wait a moment and try again.",
    action: 'Retry',
  },
  unavailable: {
    title: 'Assistant unavailable',
    body: "Support isn't available on this page right now. Please contact us by email.",
    action: 'Reload',
  },
};

export interface BrainbaseWidgetProps {
  /**
   * The public key of your Brainbase Support Agent (e.g., "bb_live_..." or "pk_live_...")
   */
  agentKey?: string;
  /**
   * Alias for agentKey.
   */
  publishableKey?: string;
  /**
   * Whether the widget panel starts open by default.
   */
  defaultOpen?: boolean;
  /**
   * Optional custom backend API URL (defaults to "https://brainbaseai.onrender.com").
   */
  apiUrl?: string;
}

export function BrainbaseWidget({
  agentKey,
  publishableKey,
  defaultOpen = false,
  apiUrl,
}: BrainbaseWidgetProps) {
  const [open, setOpen] = useState(defaultOpen);

  // Close on Escape key press for accessibility
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, handleKeyDown]);

  return (
    <div className="bb-widget-root">
      {open ? (
        <div className="bb-widget-panel">
          <WidgetPanel
            agentKey={agentKey}
            publishableKey={publishableKey}
            apiUrl={apiUrl}
            onClose={() => setOpen(false)}
          />
        </div>
      ) : null}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close support chat' : 'Open support chat'}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="bb-widget-launcher"
      >
        {open ? <X className="bb-icon" /> : <MessageSquare className="bb-icon" />}
      </button>
    </div>
  );
}

function WidgetPanel({
  agentKey,
  publishableKey,
  apiUrl,
  onClose,
}: {
  agentKey?: string;
  publishableKey?: string;
  apiUrl?: string;
  onClose: () => void;
}) {
  const { state, branding, messages, input, setInput, handleSubmit, isLoading } = useBrainbaseChat({
    agentKey,
    publishableKey,
    apiUrl,
  });

  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, isLoading]);

  const primaryColor = getSafePrimaryColor(branding?.primaryColor);
  const title = branding?.title || 'Support';
  const subtitle = branding?.subtitle || 'Typically replies instantly';
  const problem = state !== 'chat' && state !== 'loading' ? stateCopy[state] : null;

  return (
    <div className="bb-panel-container" role="dialog" aria-label="Support chat" aria-modal="true">
      <header className="bb-header" style={{ backgroundColor: primaryColor }}>
        <span className="bb-avatar">
          <Sparkles className="bb-icon-xs" />
        </span>
        <div className="bb-header-text">
          <p className="bb-title">{title}</p>
          <p className="bb-subtitle">{subtitle}</p>
        </div>
        <button onClick={onClose} aria-label="Close chat" className="bb-close-btn">
          <X className="bb-icon-sm" />
        </button>
      </header>

      {state === 'loading' ? (
        <div className="bb-state-container">
          <div className="bb-loading-pulse-ring">
            <div className="bb-avatar-loading" style={{ backgroundColor: primaryColor }}>
              <Sparkles className="bb-icon-sm bb-pulse-icon" />
            </div>
          </div>
          <p className="bb-state-text">Connecting to assistant...</p>
        </div>
      ) : problem ? (
        <div className="bb-state-container">
          <AlertCircle className="bb-error-icon bb-icon-lg" aria-hidden />
          <p className="bb-error-title">{problem.title}</p>
          <p className="bb-error-body">{problem.body}</p>
          <button className="bb-retry-btn" onClick={() => window.location.reload()}>
            <RefreshCw className="bb-icon-sm bb-mr-2" /> {problem.action}
          </button>
        </div>
      ) : (
        <div className="bb-messages-area">
          {messages.map((m) => {
            const textContent =
              m.parts
                ?.filter((p) => p.type === 'text')
                .map((p) => (p as { type: 'text'; text: string }).text || '')
                .join('') || (typeof (m as unknown as { content: string }).content === 'string' ? (m as unknown as { content: string }).content : '');

            return (
              <div key={m.id} className={cn('bb-message-row', m.role === 'user' && 'bb-message-user')}>
                <div
                  className={cn('bb-message-bubble', m.role === 'user' ? 'bb-bubble-user' : 'bb-bubble-ai')}
                  style={m.role === 'user' ? { backgroundColor: primaryColor } : undefined}
                >
                  {m.role === 'user' ? (
                    textContent
                  ) : (
                    <div className="bb-markdown-content">
                      <ReactMarkdown
                        components={{
                          a: ({ node, ...props }) => (
                            <a {...props} target="_blank" rel="noopener noreferrer" />
                          ),
                        }}
                      >
                        {textContent}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {isLoading && (
            <div className="bb-message-row">
              <div className="bb-typing-container">
                <div
                  className="bb-typing-avatar"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Sparkles className="bb-icon-xs" />
                </div>
                <div className="bb-typing-indicator" aria-label="Assistant is typing" role="status">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="bb-typing-dot"
                      style={{
                        animationDelay: `${i * 180}ms`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="bb-input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Write a message..."
          aria-label="Message"
          maxLength={2000}
          disabled={!!problem}
          className="bb-input"
        />
        <button
          type="submit"
          aria-label="Send message"
          disabled={!!problem || !input.trim() || isLoading}
          style={{ backgroundColor: primaryColor }}
          className="bb-send-btn"
        >
          {isLoading ? <Loader2 className="bb-spinner bb-icon-sm" /> : <Send className="bb-icon-sm" />}
        </button>
      </form>
      <p className="bb-footer">Powered by BrainbaseAI</p>
    </div>
  );
}
