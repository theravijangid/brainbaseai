"use client";

import { FileText, Plus, Quote, Search, Send, Sparkles, Loader2, MessageSquare } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isTextUIPart, type UIMessage } from "ai";
import { formatDistanceToNow } from "date-fns";
import { Streamdown } from "streamdown";
import { cjk } from "@streamdown/cjk";
import { code } from "@streamdown/code";
import { math } from "@streamdown/math";
import { mermaid } from "@streamdown/mermaid";

const streamdownPlugins = { cjk, code, math, mermaid };

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useConversations, useConversationDetails } from "@/hooks/use-conversations";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useUsage } from "@/hooks/use-company";
import { cn } from "@/lib/utils";
import { SourcePanel } from "@/components/workspace/source-panel";
import { CitationChip } from "@/components/workspace/citation";
import type { Citation } from "@/lib/types";

function MessageRenderer({ m, getMessageText, citations, sources, activeCitation, setActiveCitation, workspaceId }: any) {
  const rawContent = getMessageText(m);
  const preprocessedContent = rawContent.replace(/\[C(\d+)\]/g, '<cite id="$1"></cite>');
  
  const streamdownComponents = useMemo(() => ({
    cite: ({ id }: any) => {
      const cId = `C${id}`;
      if (citations && citations[cId]) {
        const c = citations[cId];
        const sourceObj = sources.find((s: any) => s.id === (c.sourceId || cId));
        const pageNum = c.pageNumber ?? c.page ?? c.metadata?.pageNumber ?? c.metadata?.page;
        return (
          <span className="mx-1 inline-flex">
            <CitationChip 
              citationId={cId} 
              label={parseInt(id, 10)} 
              active={activeCitation?.id === cId}
              onClick={() => {
                setActiveCitation({
                  id: cId,
                  sourceId: c.sourceId || cId,
                  sourceType: c.sourceType || c.metadata?.sourceType || sourceObj?.type || 'pdf',
                  sourceName: c.sourceName || c.metadata?.sourceName || sourceObj?.name || 'Source',
                  url: c.metadata?.url || c.url,
                  startTime: c.metadata?.startTime || c.startTime,
                  endTime: c.metadata?.endTime || c.endTime,
                  page: pageNum,
                  pageNumber: pageNum,
                  heading: c.metadata?.heading || c.heading,
                  headingPath: c.metadata?.headingPath || c.headingPath,
                  snippet: c.metadata?.snippet || c.snippet || c.content,
                  excerpt: c.excerpt || c.metadata?.excerpt || c.snippet || c.content,
                  score: c.metadata?.score || c.score,
                  denseRank: c.metadata?.denseRank || c.denseRank,
                  rerankScore: c.metadata?.rerankScore || c.rerankScore,
                  rerankRank: c.metadata?.rerankRank || c.rerankRank,
                  workspaceId,
                });
              }}
            />
          </span>
        );
      }
      return <span>[C{id}]</span>;
    }
  }), [citations, sources, activeCitation, setActiveCitation, workspaceId]);

  return (
    <Streamdown
      allowedTags={{ cite: ['id'] }}
      components={streamdownComponents}
      plugins={streamdownPlugins}
    >
      {preprocessedContent}
    </Streamdown>
  );
}

export function BrainPage() {
  const { getToken } = useAuth();
  const { data: workspaces } = useWorkspaces();
  const workspaceId = workspaces?.[0]?.id || "";
  const sources = workspaces?.[0]?.sources || [];
  
  const { data: usageData } = useUsage();

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);
  
  const { data: conversations = [], isLoading: isConversationsLoading, refetch: refetchConversations } = useConversations(workspaceId, undefined, 'internal');
  const { data: conversationDetails, isLoading: isDetailsLoading } = useConversationDetails(workspaceId, activeConversationId || "");

  const [initialMessages, setInitialMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");

  // Auto-select the most recent conversation on page load
  useEffect(() => {
    if (!activeConversationId && conversations.length > 0) {
      setActiveConversationId(conversations[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations]);

  const justFinishedStreamingRef = useRef(false);

  const getMessageText = (m: UIMessage | any): string => {
    if (m.parts && Array.isArray(m.parts) && m.parts.length > 0) {
      const textFromParts = m.parts
        .filter(isTextUIPart)
        .map((p: any) => p.text)
        .join('');
      if (textFromParts) return textFromParts;
    }
    return m.content || '';
  };

  const transport = useMemo(() => {
    return new DefaultChatTransport({
      api: `${process.env.NEXT_PUBLIC_API_URL || ""}/api/v1/workspaces/${workspaceId}/chat`,
      prepareSendMessagesRequest: ({ id, messages }) => {
        const flattenedMessages = messages.map(msg => ({
          role: msg.role,
          content: getMessageText(msg)
        }));
        return {
          body: {
            conversationId: activeConversationId,
            messages: flattenedMessages
          }
        };
      },
      fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
        const token = await getToken();
        const headers = new Headers(init?.headers);
        headers.set("Authorization", `Bearer ${token}`);
        
        const res = await fetch(input, {
          ...init,
          headers
        });
        const newConvId = res.headers.get('x-conversation-id');
        if (newConvId && !activeConversationId) {
          setActiveConversationId(newConvId);
          refetchConversations();
        }
        return res;
      },
    });
  }, [workspaceId, activeConversationId, getToken, refetchConversations]);

  const chatHelpers = useChat({
    id: activeConversationId || undefined,
    initialMessages: initialMessages,
    transport,
    onFinish: () => {
      justFinishedStreamingRef.current = true;
      refetchConversations();
    }
  } as any);

  const { messages, setMessages, sendMessage, status } = chatHelpers as any;

  useEffect(() => {
    if (status === 'streaming' || status === 'submitted') return;

    if (justFinishedStreamingRef.current) {
      justFinishedStreamingRef.current = false;
      return;
    }

    if (activeConversationId && conversationDetails?.messages) {
      const msgs = conversationDetails.messages.map((m: any) => {
        // Build annotations from citations stored in DB
        const annotations: any[] = m.annotations || [];
        if (m.citations && typeof m.citations === 'object' && Object.keys(m.citations).length > 0) {
          const hasCitationAnnotation = annotations.some((a: any) => a.type === 'citation-metadata');
          if (!hasCitationAnnotation) {
            annotations.push({
              type: 'citation-metadata',
              citations: m.citations
            });
          }
        }
        return {
          id: m.id,
          role: m.role,
          content: m.content || '',
          annotations
        };
      });
      setInitialMessages(msgs);
      setMessages(msgs as any);
    } else if (!activeConversationId) {
      setInitialMessages([]);
      setMessages([]);
    }
  }, [conversationDetails, activeConversationId, status, setMessages]);

  const isLoading = status === 'submitted' || status === 'streaming';

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startNewConversation = () => {
    setActiveConversationId(null);
    setInitialMessages([]);
    setMessages([]);
    setActiveCitation(null);
  };



  const getCitationsForMessage = (m: any) => {
    // Check metadata (v7 format)
    if (m.metadata && m.metadata._annotations) {
      const citationMeta = m.metadata._annotations.find((a: any) => a.type === 'citation-metadata');
      if (citationMeta && citationMeta.citations) {
        return citationMeta.citations;
      }
    }
    // Legacy annotations fallback
    if (m.annotations) {
      const citationMeta = m.annotations.find((a: any) => a.type === 'citation-metadata');
      if (citationMeta && citationMeta.citations) {
        return citationMeta.citations;
      }
    }
    return null;
  };



  return (
    <div className="flex h-[calc(100vh-3.5rem)] min-h-0">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface md:flex">
        <div className="p-3 border-b border-border">
          <Button className="w-full" size="sm" onClick={startNewConversation}>
            <Plus className="size-4 mr-2" /> New conversation
          </Button>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-2" aria-label="Conversation history">
          {isConversationsLoading ? (
             <div className="p-4 text-center">
               <Loader2 className="size-4 animate-spin mx-auto text-muted-foreground" />
             </div>
          ) : conversations.length === 0 ? (
             <div className="p-4 text-center text-xs text-muted-foreground">
               No past conversations
             </div>
          ) : (
            conversations.map((h) => (
              <button
                key={h.id}
                onClick={() => setActiveConversationId(h.id)}
                className={cn(
                  "w-full rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-accent",
                  activeConversationId === h.id ? "bg-accent" : ""
                )}
              >
                <span className="block truncate text-[13px]">{h.title || 'Untitled'}</span>
                <span className="text-[11px] text-muted-foreground">{formatDistanceToNow(new Date(h.updatedAt), { addSuffix: true })}</span>
              </button>
            ))
          )}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col relative bg-background">
        <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-surface">
          <div>
            <h1 className="text-sm font-semibold">Company Brain</h1>
            <p className="text-xs text-muted-foreground">Answers cite your approved sources</p>
          </div>
          <Sheet>
            <SheetTrigger asChild className="xl:hidden">
              <Button variant="outline" size="sm">
                Sources
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[400px] p-0 sm:w-[540px]">
              <SheetTitle className="sr-only">Source context</SheetTitle>
              {activeCitation ? (
                <SourcePanel citation={activeCitation} onClose={() => setActiveCitation(null)} workspaceId={workspaceId} />
              ) : (
                <div className="p-5 space-y-4">
                  <div>
                    <h2 className="text-sm font-semibold">Source context</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Citations are internal only and never shown to customers.
                    </p>
                  </div>
                  <p className="rounded-lg border border-dashed border-border p-4 text-xs text-muted-foreground">
                    Select a citation to inspect the exact passage it came from.
                  </p>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mx-auto max-w-3xl space-y-5">
            {activeConversationId && isDetailsLoading ? (
              <div className="flex flex-col items-center justify-center pt-24 gap-3">
                <Loader2 className="size-6 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading conversation…</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-8 text-center mt-12 bg-surface">
                <Sparkles className="mx-auto size-5 text-primary" aria-hidden />
                <h2 className="mt-3 text-base font-semibold">Ask your company knowledge anything</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try "What's our refund window?" or "How do we onboard enterprise customers?"
                </p>
              </div>
            ) : null}
            {messages.map((m: any) => {
              const citations = getCitationsForMessage(m);

              return (
                <div key={m.id} className="animate-rise group">
                  {m.role === "user" ? (
                    <div className="flex justify-end">
                      <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground shadow-sm">
                        {getMessageText(m)}
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      <div className="size-8 rounded-full bg-primary-soft flex items-center justify-center shrink-0 border border-primary/20">
                        <Sparkles className="size-4 text-primary" />
                      </div>
                      <div className="max-w-[85%] pt-1">
                        <div className="prose prose-sm dark:prose-invert max-w-none text-[15px] leading-relaxed text-foreground [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                          <MessageRenderer 
                            m={m} 
                            getMessageText={getMessageText} 
                            citations={citations} 
                            sources={sources} 
                            activeCitation={activeCitation} 
                            setActiveCitation={setActiveCitation} 
                            workspaceId={workspaceId}
                          />
                        </div>
                        {citations && Object.keys(citations).length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2 pt-2 border-t border-border/50">
                            <span className="text-xs font-medium text-muted-foreground w-full">Citations Used:</span>
                            {Object.keys(citations).map((cId) => {
                              const c = citations[cId];
                              const sourceObj = sources.find(s => s.id === (c.sourceId || cId));
                              const pageNum = c.pageNumber ?? c.page ?? c.metadata?.pageNumber ?? c.metadata?.page;
                              return (
                                <CitationChip 
                                  key={cId}
                                  citationId={cId} 
                                  label={parseInt(cId.replace('C', ''), 10) || 1} 
                                  active={activeCitation?.id === cId}
                                  onClick={() => {
                                    setActiveCitation({
                                      id: cId,
                                      sourceId: c.sourceId || cId,
                                      sourceType: c.sourceType || c.metadata?.sourceType || sourceObj?.type || 'pdf',
                                      sourceName: c.sourceName || c.metadata?.sourceName || sourceObj?.name || 'Source',
                                      url: c.metadata?.url || c.url,
                                      startTime: c.metadata?.startTime || c.startTime,
                                      endTime: c.metadata?.endTime || c.endTime,
                                      page: pageNum,
                                      pageNumber: pageNum,
                                      heading: c.metadata?.heading || c.heading,
                                      headingPath: c.metadata?.headingPath || c.headingPath,
                                      snippet: c.metadata?.snippet || c.snippet || c.content,
                                      excerpt: c.excerpt || c.metadata?.excerpt || c.snippet || c.content,
                                      score: c.metadata?.score || c.score,
                                      denseRank: c.metadata?.denseRank || c.denseRank,
                                      rerankScore: c.metadata?.rerankScore || c.rerankScore,
                                      rerankRank: c.metadata?.rerankRank || c.rerankRank,
                                      workspaceId,
                                    });
                                  }}
                                />
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {isLoading && messages[messages.length - 1]?.role === 'user' ? (
              <div className="flex gap-4 animate-rise">
                <div className="size-8 rounded-full bg-primary-soft flex items-center justify-center shrink-0 border border-primary/20">
                  <Sparkles className="size-4 text-primary" />
                </div>
                <div className="flex items-center gap-1.5 pt-2" aria-live="polite">
                  <span className="sr-only">Company Brain is thinking</span>
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60"
                      style={{ animationDelay: `${i * 120}ms` }}
                    />
                  ))}
                </div>
              </div>
            ) : null}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="p-4 bg-background">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (!inputValue.trim() || !workspaceId || isLoading) return;
              // @ts-ignore
              sendMessage?.({ text: inputValue });
              setInputValue("");
            }} 
            className="mx-auto max-w-3xl relative"
          >
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask your company knowledge…"
              aria-label="Ask Company Brain"
              className="pr-12 h-12 rounded-xl bg-surface border-border focus-visible:ring-1 focus-visible:ring-primary/30"
              disabled={isLoading || !workspaceId}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="absolute right-1.5 top-1.5 h-9 w-9 rounded-lg" 
              aria-label="Send"
              disabled={isLoading || !inputValue.trim() || !workspaceId}
            >
              <Send className="size-4" />
            </Button>
          </form>
          {usageData?.usage?.knowledgeChat && (
            <p className="mx-auto mt-3 max-w-3xl text-center text-[11px] text-muted-foreground">
              {usageData.usage.knowledgeChat.used} of {usageData.usage.knowledgeChat.limit} Knowledge Chat messages used this month.
            </p>
          )}
        </div>
      </div>

      <aside className="hidden w-[400px] shrink-0 border-l border-border bg-surface xl:block">
        {activeCitation ? (
          <SourcePanel citation={activeCitation} onClose={() => setActiveCitation(null)} workspaceId={workspaceId} />
        ) : (
          <div className="p-5 space-y-4">
            <div>
              <h2 className="text-sm font-semibold">Source context</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Citations are internal only and never shown to customers.
              </p>
            </div>
            <p className="rounded-lg border border-dashed border-border p-4 text-xs text-muted-foreground">
              Select a citation to inspect the exact passage it came from.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
