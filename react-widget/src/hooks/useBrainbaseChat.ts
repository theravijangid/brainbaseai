import { useState, useEffect, useCallback, useMemo, ChangeEvent, FormEvent } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, UIMessage } from 'ai';
import { getSafeBackendUrl, isValidAgentKey, sanitizeText, getSafePrimaryColor } from '../utils/security';

export type WidgetState = 'loading' | 'chat' | 'error' | 'unavailable' | 'rate-limited' | 'expired';

export interface WidgetBranding {
  primaryColor?: string;
  welcomeMessage?: string;
  title?: string;
  subtitle?: string;
}

export interface UseBrainbaseChatProps {
  /**
   * The public key of your Brainbase Support Agent (e.g., "pk_live_...")
   */
  agentKey: string;
}

export interface BrainbaseChatContext {
  state: WidgetState;
  branding: WidgetBranding | null;
  messages: UIMessage[];
  input: string;
  setInput: (value: string) => void;
  handleInputChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  sendMessage: (message: { role: 'user'; parts: Array<{ type: 'text'; text: string }> }) => void;
  isLoading: boolean;
}

export function useBrainbaseChat({ agentKey }: UseBrainbaseChatProps): BrainbaseChatContext {
  const [state, setState] = useState<WidgetState>('loading');
  const [token, setToken] = useState<string | null>(null);
  const [branding, setBranding] = useState<WidgetBranding | null>(null);
  const [input, setInput] = useState<string>('');

  const backendUrl = useMemo(() => getSafeBackendUrl(), []);

  useEffect(() => {
    if (!isValidAgentKey(agentKey)) {
      setState('error');
      return;
    }

    const abortController = new AbortController();

    async function initSession() {
      try {
        const origin =
          typeof window !== 'undefined' && window.location.origin && window.location.origin !== 'null'
            ? window.location.origin
            : '';

        const res = await fetch(`${backendUrl}/api/v1/widget/init`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'omit',
          signal: abortController.signal,
          body: JSON.stringify({
            publicKey: agentKey.trim(),
            origin,
          }),
        });

        if (abortController.signal.aborted) return;

        if (!res.ok) {
          setState(res.status === 429 ? 'rate-limited' : 'unavailable');
          return;
        }

        const data = await res.json();
        if (data.status === 200 && data.data?.token) {
          const rawBranding = data.data.branding || {};
          const safeBranding: WidgetBranding = {
            primaryColor: getSafePrimaryColor(rawBranding.primaryColor),
            title: sanitizeText(rawBranding.title, 60) || 'Support',
            subtitle: sanitizeText(rawBranding.subtitle, 100) || 'Typically replies instantly',
            welcomeMessage: sanitizeText(rawBranding.welcomeMessage, 500) || 'Hi! How can I help you?',
          };

          setToken(data.data.token);
          setBranding(safeBranding);
          setState('chat');
        } else {
          setState('error');
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        console.error('Failed to init widget session:', err);
        setState('error');
      }
    }

    initSession();

    return () => {
      abortController.abort();
    };
  }, [agentKey, backendUrl]);

  const apiEndpoint = token ? `${backendUrl}/api/v1/widget/chat` : undefined;

  const fetcher = useCallback(async (inputInfo: RequestInfo | URL, init?: RequestInit) => {
    const fetchOptions: RequestInit = {
      ...init,
      credentials: 'omit',
    };

    if (fetchOptions.body) {
      try {
        const bodyStr = typeof fetchOptions.body === 'string' ? fetchOptions.body : fetchOptions.body.toString();
        const bodyObj = JSON.parse(bodyStr);
        if (bodyObj.messages && Array.isArray(bodyObj.messages)) {
          bodyObj.messages = bodyObj.messages.map((msg: { role: string; content?: string; parts?: Array<{ type: string; text?: string }> }) => {
            let content = msg.content;
            if (!content && msg.parts && Array.isArray(msg.parts)) {
              content = msg.parts
                .filter((p) => p.type === 'text')
                .map((p) => p.text || '')
                .join('\n');
            }
            return {
              role: msg.role,
              content: sanitizeText(content || '', 2000),
            };
          });
          fetchOptions.body = JSON.stringify(bodyObj);
        }
      } catch {
        // Ignore parse errors
      }
    }
    return fetch(inputInfo, fetchOptions);
  }, []);

  const initialMessages = useMemo(
    () =>
      [
        {
          id: 'welcome',
          role: 'assistant',
          parts: [{ type: 'text', text: branding?.welcomeMessage || 'Hi! How can I help you?' }],
        },
      ] as UIMessage[],
    [branding?.welcomeMessage]
  );

  const transport = useMemo(() => {
    if (!apiEndpoint) return undefined;
    return new DefaultChatTransport({
      api: apiEndpoint,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      fetch: fetcher,
    });
  }, [apiEndpoint, token, fetcher]);

  const { messages, sendMessage } = useChat({
    transport,
    messages: initialMessages,
  });

  const isLoading = messages.length > 0 && messages[messages.length - 1]?.role === 'user';

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInput(e.target.value);
  }, []);

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const cleanInput = sanitizeText(input, 2000);
      if (!cleanInput || !apiEndpoint || isLoading || state !== 'chat') {
        return;
      }
      sendMessage({
        role: 'user',
        parts: [{ type: 'text', text: cleanInput }],
      });
      setInput('');
    },
    [input, apiEndpoint, isLoading, state, sendMessage]
  );

  return {
    state,
    branding,
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    sendMessage,
    isLoading,
  };
}
