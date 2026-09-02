"use client";

import { AlertCircle, MessageSquare, RefreshCw, Send, X, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, UIMessage } from "ai";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type WidgetState = "chat" | "empty" | "error" | "expired" | "rate-limited" | "unavailable";

const stateCopy: Record<Exclude<WidgetState, "chat" | "empty">, { title: string; body: string; action: string }> = {
  error: {
    title: "Something went wrong",
    body: "We couldn't reach the support assistant just now. Please try again.",
    action: "Try again",
  },
  expired: {
    title: "Session expired",
    body: "This conversation has been idle for a while. Start a new one to continue.",
    action: "Start new chat",
  },
  "rate-limited": {
    title: "Too many messages",
    body: "You've sent a lot of messages in a short time. Please wait a moment and try again.",
    action: "Retry",
  },
  unavailable: {
    title: "Assistant unavailable",
    body: "Support isn't available on this page right now. Please contact us by email.",
    action: "Reload",
  },
};

export function SupportWidgetPanel({
  state = "chat",
  onClose,
  className,
  title = "Support Assistant",
  subtitle = "Typically replies instantly",
  agentId,
  workspaceId,
  primaryColor = "#2563eb",
  welcomeMessage = "Hi! How can I help you?",
}: {
  state?: WidgetState;
  onClose?: () => void;
  className?: string;
  title?: string;
  subtitle?: string;
  agentId?: string;
  workspaceId?: string;
  primaryColor?: string;
  welcomeMessage?: string;
}) {
  const { getToken } = useAuth();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (agentId && workspaceId) {
      getToken().then(setToken);
    }
  }, [agentId, workspaceId, getToken]);

  const apiEndpoint = (agentId && workspaceId) 
    ? `http://localhost:3000/api/v1/workspaces/${workspaceId}/support-agents/${agentId}/chat` 
    : undefined;

  const [input, setInput] = useState("");

  const { messages, sendMessage, setMessages } = useChat({
    transport: apiEndpoint ? new DefaultChatTransport({
      api: apiEndpoint,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
        if (init && init.body) {
          try {
            const bodyStr = typeof init.body === "string" ? init.body : init.body.toString();
            const bodyObj = JSON.parse(bodyStr);
            if (bodyObj.messages && Array.isArray(bodyObj.messages)) {
              bodyObj.messages = bodyObj.messages.map((msg: any) => {
                let content = msg.content;
                if (!content && msg.parts && Array.isArray(msg.parts)) {
                  content = msg.parts
                    .filter((p: any) => p.type === 'text')
                    .map((p: any) => p.text || '')
                    .join('\n');
                }
                return {
                  role: msg.role,
                  content: content || ''
                };
              });
              init.body = JSON.stringify(bodyObj);
            }
          } catch (e) {
            // Ignore parse errors, let the backend handle validation
          }
        }
        return fetch(input, init);
      },
    }) : undefined,
    messages: [
      { id: "welcome", role: "assistant", parts: [{ type: "text", text: welcomeMessage }] }
    ] as UIMessage[]
  });

  useEffect(() => {
    if (!apiEndpoint) {
      setMessages([
        { id: "welcome", role: "assistant", parts: [{ type: "text", text: welcomeMessage }] }
      ] as UIMessage[]);
    }
  }, [welcomeMessage, apiEndpoint, setMessages]);

  const isLoading = messages.length > 0 && messages[messages.length - 1]?.role === "user";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !apiEndpoint) return;
    sendMessage({ role: "user", parts: [{ type: "text", text: input }] } as UIMessage);
    setInput("");
  };

  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, isLoading]);

  const problem = state !== "chat" && state !== "empty" ? stateCopy[state] : null;
  const safePrimaryColor = primaryColor?.trim() || "#2563eb";

  return (
    <div
      className={cn(
        "flex h-[560px] w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-elevated shadow-[var(--shadow-pop)]",
        className,
      )}
      role="dialog"
      aria-label="Support chat"
    >
      <header 
        className="flex items-center gap-3 border-b border-border px-4 py-3.5 text-white" 
        style={{ backgroundColor: safePrimaryColor }}
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-black/15 text-xs font-semibold">
          A
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{title}</p>
          <p className="truncate text-xs opacity-90">{subtitle}</p>
        </div>
        {onClose ? (
          <button onClick={onClose} aria-label="Close chat" className="rounded-md p-1 hover:bg-black/15">
            <X className="size-4" />
          </button>
        ) : null}
      </header>

      {problem ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
          <AlertCircle className="size-6 text-warning" aria-hidden />
          <p className="text-sm font-semibold">{problem.title}</p>
          <p className="text-sm text-muted-foreground">{problem.body}</p>
          <Button size="sm" variant="outline" className="mt-1">
            <RefreshCw className="size-3.5" /> {problem.action}
          </Button>
        </div>
      ) : (
        <div className="flex-1 space-y-3 overflow-y-auto bg-surface px-4 py-4">
          {messages.map((m) => (
            <div key={m.id} className={cn("flex animate-rise", m.role === "user" && "justify-end")}>
              <div
                className={cn(
                  "max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                  m.role === "user"
                    ? "rounded-br-sm text-white"
                    : "rounded-bl-sm border border-border bg-elevated text-foreground",
                )}
                style={m.role === "user" ? { backgroundColor: safePrimaryColor } : {}}
              >
                {m.parts?.map((p: any) => p.type === "text" ? p.text : "").join("") || (m as any).content || ""}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-border bg-elevated px-3.5 py-3 w-fit" aria-live="polite">
              <span className="sr-only">Assistant is typing</span>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="size-1.5 animate-bounce rounded-full bg-muted-foreground"
                  style={{ animationDelay: `${i * 120}ms` }}
                />
              ))}
            </div>
          )}
          <div ref={endRef} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-border bg-elevated px-3 py-3">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Write a message…"
          aria-label="Message"
          disabled={!!problem || !apiEndpoint}
          className="bg-surface text-foreground caret-foreground placeholder:text-muted-foreground border-border focus-visible:ring-primary"
        />
        <Button 
          type="submit" 
          size="icon" 
          aria-label="Send message" 
          disabled={!!problem || !apiEndpoint || !input.trim() || isLoading}
          style={{ backgroundColor: safePrimaryColor }}
        >
          {isLoading ? <Loader2 className="size-4 animate-spin text-white" /> : <Send className="size-4 text-white" />}
        </Button>
      </form>
      <p className="border-t border-border bg-elevated pb-2 text-center text-[11px] text-muted-foreground">
        Powered by BrainbaseAI
      </p>
    </div>
  );
}

export function SupportWidgetLauncher({ state = "chat" }: { state?: WidgetState }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open ? <SupportWidgetPanel state={state} onClose={() => setOpen(false)} className="h-[70vh] sm:h-[560px]" /> : null}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close support chat" : "Open support chat"}
        className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-pop)] transition-transform hover:scale-105 active:scale-95"
      >
        {open ? <X className="size-6" /> : <MessageSquare className="size-6" />}
      </button>
    </div>
  );
}
