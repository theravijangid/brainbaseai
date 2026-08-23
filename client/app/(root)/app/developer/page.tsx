"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Check,
  Code2,
  Copy,
  Cpu,
  ExternalLink,
  FileCode,
  Globe,
  Key,
  Layers,
  Play,
  ShieldCheck,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";

import { Page, PageHeader } from "@/components/app/AppShell";
import { StatusPill } from "@/components/app/primitives";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function DeveloperDocsPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const reactInstallSnippet = `npm install @brainbaseai/react-widget @ai-sdk/react ai
# or
pnpm add @brainbaseai/react-widget @ai-sdk/react ai
# or
yarn add @brainbaseai/react-widget @ai-sdk/react ai`;

  const reactDropInSnippet = `import { BrainbaseWidget } from '@brainbaseai/react-widget';
import '@brainbaseai/react-widget/dist/index.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        
        {/* Drop-in AI Support Widget */}
        <BrainbaseWidget 
          agentKey="pk_live_your_agent_key_here" 
          defaultOpen={false} 
        />
      </body>
    </html>
  );
}`;

  const reactHeadlessSnippet = `"use client";

import { useBrainbaseChat } from '@brainbaseai/react-widget';

export function CustomSupportChat() {
  const {
    state,        // 'loading' | 'chat' | 'error' | 'unavailable' | 'rate-limited'
    branding,     // { primaryColor, title, subtitle, welcomeMessage }
    messages,     // Array of UIMessage from Vercel AI SDK
    input,        // Current text input
    setInput,     // Update text input
    handleSubmit, // Form submit handler
    isLoading     // Whether assistant is generating a response
  } = useBrainbaseChat({
    agentKey: "pk_live_your_agent_key_here"
  });

  if (state === 'loading') return <div>Connecting to support...</div>;
  if (state === 'error' || state === 'unavailable') return <div>Support unavailable</div>;

  return (
    <div className="flex flex-col h-[500px] w-full max-w-md rounded-xl border bg-card p-4 shadow-lg">
      <header className="pb-3 border-b" style={{ color: branding?.primaryColor || '#2563eb' }}>
        <h3 className="font-semibold text-base">{branding?.title || 'Support'}</h3>
        <p className="text-xs text-muted-foreground">{branding?.subtitle}</p>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-3 space-y-2">
        {messages.map((m) => (
          <div
            key={m.id}
            className={\`p-2.5 rounded-lg text-sm max-w-[85%] \${
              m.role === 'user' ? 'ml-auto bg-primary text-primary-foreground' : 'mr-auto bg-muted'
            }\`}
          >
            {m.parts?.map((p) => p.type === 'text' ? p.text : '').join('') || (m as any).content}
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 pt-2 border-t">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 px-3 py-1.5 text-sm rounded-md border bg-background"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-4 py-1.5 text-sm font-medium rounded-md bg-primary text-primary-foreground disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}`;

  const htmlEmbedSnippet = `<!-- Add this script right before the closing </body> tag -->
<script
  src="https://unpkg.com/@brainbaseai/react-widget/dist/embed.js"
  data-agent-key="pk_live_your_agent_key_here"
  defer
></script>`;

  const curlInitSnippet = `curl -X POST https://app.brainbase.ai/api/v1/widget/init \\
  -H "Content-Type: application/json" \\
  -d '{
    "publicKey": "pk_live_your_agent_key_here",
    "origin": "https://yourwebsite.com"
  }'`;

  const curlChatSnippet = `curl -X POST https://app.brainbase.ai/api/v1/widget/chat \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <session_jwt_token>" \\
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "How do I reset my password?"
      }
    ]
  }'`;

  const initResponseJson = `{
  "status": 200,
  "message": "Session initialized",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "sessionExpiresIn": 86400,
    "branding": {
      "primaryColor": "#2563eb",
      "title": "Support Assistant",
      "subtitle": "Typically replies instantly",
      "welcomeMessage": "Hi! How can I help you today?"
    }
  }
}`;

  return (
    <Page>
      <PageHeader
        title="Developer Documentation & API"
        description="Comprehensive integration guides, React SDK, Script embeds, and REST API contracts for Brainbase Support Agents."
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" asChild>
              <Link href="/app/test-widget">
                <Play className="mr-1.5 size-3.5" /> Test Sandbox
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/app/agents">
                <Layers className="mr-1.5 size-3.5" /> Manage Agents
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://www.npmjs.com/package/@brainbaseai/react-widget"
                target="_blank"
                rel="noreferrer"
              >
                View on NPM
                <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        }
      />

      {/* Quick Info Grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="surface-panel p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Protocol</span>
            <Zap className="size-4 text-primary" />
          </div>
          <p className="mt-2 font-display text-lg font-semibold">Streaming SSE / AI-SDK</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Real-time token streaming</p>
        </div>

        <div className="surface-panel p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Auth Architecture</span>
            <Key className="size-4 text-primary" />
          </div>
          <p className="mt-2 font-display text-lg font-semibold">Stateless Public Key</p>
          <p className="mt-0.5 text-xs text-muted-foreground">No server secret keys exposed</p>
        </div>

        <div className="surface-panel p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Package</span>
            <FileCode className="size-4 text-primary" />
          </div>
          <p className="mt-2 font-display text-lg font-semibold">@brainbase/react-widget</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Native React 18 & 19 support</p>
        </div>

        <div className="surface-panel p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Security</span>
            <ShieldCheck className="size-4 text-success" />
          </div>
          <p className="mt-2 font-display text-lg font-semibold">Origin & Cookie Isolated</p>
          <p className="mt-0.5 text-xs text-muted-foreground">XSS & CSS injection protected</p>
        </div>
      </div>

      {/* Main Documentation Tabs */}
      <Tabs defaultValue="react" className="mt-8">
        <TabsList className="flex-wrap">
          <TabsTrigger value="react" className="gap-2">
            <Cpu className="size-4" /> React Widget
          </TabsTrigger>
          <TabsTrigger value="headless" className="gap-2">
            <Sparkles className="size-4" /> Headless Hook
          </TabsTrigger>
          <TabsTrigger value="script" className="gap-2">
            <Globe className="size-4" /> HTML / Script Tag
          </TabsTrigger>
          <TabsTrigger value="rest" className="gap-2">
            <Terminal className="size-4" /> REST API Contract
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <ShieldCheck className="size-4" /> Security & Guardrails
          </TabsTrigger>
        </TabsList>

        {/* 1. React Drop-in Widget Tab */}
        <TabsContent value="react" className="mt-6 space-y-6">
          <div className="surface-panel p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">1. Drop-in React Component</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  The fastest way to embed a floating AI support bubble into your React or Next.js application.
                </p>
              </div>
              <StatusPill tone="success">Recommended</StatusPill>
            </div>

            {/* Step 1: Install */}
            <div className="mt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Step 1: Install Package</h3>
              <div className="mt-2 relative rounded-lg border border-border bg-surface p-4">
                <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-foreground">{reactInstallSnippet}</pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute right-3 top-3"
                  onClick={() => copyToClipboard(reactInstallSnippet, "install")}
                >
                  {copiedId === "install" ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
                  <span className="ml-1.5 text-xs">{copiedId === "install" ? "Copied" : "Copy"}</span>
                </Button>
              </div>
            </div>

            {/* Step 2: Implementation */}
            <div className="mt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Step 2: Add to App Layout</h3>
              <div className="mt-2 relative rounded-lg border border-border bg-surface p-4">
                <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-foreground">{reactDropInSnippet}</pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute right-3 top-3"
                  onClick={() => copyToClipboard(reactDropInSnippet, "dropin")}
                >
                  {copiedId === "dropin" ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
                  <span className="ml-1.5 text-xs">{copiedId === "dropin" ? "Copied" : "Copy"}</span>
                </Button>
              </div>
            </div>

            {/* Props Table */}
            <div className="mt-8">
              <h3 className="text-sm font-semibold">Component Props Reference</h3>
              <div className="mt-3 overflow-hidden rounded-lg border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-elevated text-muted-foreground">
                    <tr>
                      <th className="p-3 font-semibold">Prop</th>
                      <th className="p-3 font-semibold">Type</th>
                      <th className="p-3 font-semibold">Required</th>
                      <th className="p-3 font-semibold">Default</th>
                      <th className="p-3 font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="p-3 font-mono font-medium text-primary">agentKey</td>
                      <td className="p-3 font-mono text-muted-foreground">string</td>
                      <td className="p-3"><Badge variant="default" className="text-[10px]">Yes</Badge></td>
                      <td className="p-3 font-mono text-muted-foreground">—</td>
                      <td className="p-3">Your Support Agent public key (<code className="font-mono">pk_live_...</code>).</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-medium text-primary">defaultOpen</td>
                      <td className="p-3 font-mono text-muted-foreground">boolean</td>
                      <td className="p-3"><Badge variant="outline" className="text-[10px]">No</Badge></td>
                      <td className="p-3 font-mono text-muted-foreground">false</td>
                      <td className="p-3">Whether the chat panel automatically renders in open state on mount.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* 2. Headless Hook Tab */}
        <TabsContent value="headless" className="mt-6 space-y-6">
          <div className="surface-panel p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold">2. Headless React Hook (<code className="font-mono text-primary">useBrainbaseChat</code>)</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Build 100% custom UI that fits your own design system (Tailwind, shadcn/ui, MUI) while Brainbase handles real-time AI streaming and session auth.
                </p>
              </div>
              <Badge variant="outline">Enterprise Ready</Badge>
            </div>

            <div className="mt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Example Custom Implementation</h3>
              <div className="mt-2 relative rounded-lg border border-border bg-surface p-4">
                <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-foreground">{reactHeadlessSnippet}</pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute right-3 top-3"
                  onClick={() => copyToClipboard(reactHeadlessSnippet, "headless")}
                >
                  {copiedId === "headless" ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
                  <span className="ml-1.5 text-xs">{copiedId === "headless" ? "Copied" : "Copy"}</span>
                </Button>
              </div>
            </div>

            {/* Hook Return Values Table */}
            <div className="mt-8">
              <h3 className="text-sm font-semibold">Hook Return Values</h3>
              <div className="mt-3 overflow-hidden rounded-lg border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-elevated text-muted-foreground">
                    <tr>
                      <th className="p-3 font-semibold">Property</th>
                      <th className="p-3 font-semibold">Type</th>
                      <th className="p-3 font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="p-3 font-mono font-medium text-primary">state</td>
                      <td className="p-3 font-mono text-muted-foreground">&apos;loading&apos; | &apos;chat&apos; | &apos;error&apos; | &apos;unavailable&apos; | &apos;rate-limited&apos;</td>
                      <td className="p-3">Current lifecycle and connection status of the agent session.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-medium text-primary">branding</td>
                      <td className="p-3 font-mono text-muted-foreground">WidgetBranding | null</td>
                      <td className="p-3">Theme configuration configured in dashboard (primaryColor, title, subtitle, welcomeMessage).</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-medium text-primary">messages</td>
                      <td className="p-3 font-mono text-muted-foreground">UIMessage[]</td>
                      <td className="p-3">Array of chat conversation messages from Vercel AI SDK.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-medium text-primary">input / setInput</td>
                      <td className="p-3 font-mono text-muted-foreground">string / (val: string) =&gt; void</td>
                      <td className="p-3">State binding for the text input field.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-medium text-primary">handleSubmit</td>
                      <td className="p-3 font-mono text-muted-foreground">(e: FormEvent) =&gt; void</td>
                      <td className="p-3">Form submit handler that streams user query to the AI engine.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-medium text-primary">isLoading</td>
                      <td className="p-3 font-mono text-muted-foreground">boolean</td>
                      <td className="p-3">True while the AI is streaming tokens or initializing.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* 3. HTML / Script Tag Tab */}
        <TabsContent value="script" className="mt-6 space-y-6">
          <div className="surface-panel p-6">
            <h2 className="text-base font-semibold">3. HTML & Static Site Embed</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Embed Brainbase Support Agent into Webflow, WordPress, Shopify, Wix, or static HTML pages with a single script tag.
            </p>

            <div className="mt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Universal Embed Snippet</h3>
              <div className="mt-2 relative rounded-lg border border-border bg-surface p-4">
                <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-foreground">{htmlEmbedSnippet}</pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute right-3 top-3"
                  onClick={() => copyToClipboard(htmlEmbedSnippet, "script")}
                >
                  {copiedId === "script" ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
                  <span className="ml-1.5 text-xs">{copiedId === "script" ? "Copied" : "Copy"}</span>
                </Button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-surface p-4">
                <h4 className="text-sm font-semibold">Webflow & Shopify</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Paste the snippet inside your Site Settings under <strong>Custom Code &gt; Footer Code</strong> (before &lt;/body&gt;).
                </p>
              </div>
              <div className="rounded-lg border border-border bg-surface p-4">
                <h4 className="text-sm font-semibold">WordPress</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Add the snippet using the <strong>Insert Headers and Footers</strong> plugin or directly in your theme&apos;s <code className="font-mono">footer.php</code>.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* 4. REST API Tab */}
        <TabsContent value="rest" className="mt-6 space-y-6">
          <div className="surface-panel p-6 space-y-8">
            <div>
              <h2 className="text-base font-semibold">4. Direct REST API Specification</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Integrate directly via HTTP for mobile apps, backend microservices, or custom client libraries.
              </p>
            </div>

            {/* Endpoint 1: Init */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/30">POST</Badge>
                <code className="font-mono text-sm font-semibold">/api/v1/widget/init</code>
                <span className="text-xs text-muted-foreground">— Initialize session &amp; fetch branding</span>
              </div>

              <div className="rounded-lg border border-border bg-surface p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">cURL Request</p>
                <pre className="mt-2 overflow-x-auto font-mono text-xs leading-relaxed text-foreground">{curlInitSnippet}</pre>
              </div>

              <div className="rounded-lg border border-border bg-surface p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Response (200 OK)</p>
                <pre className="mt-2 overflow-x-auto font-mono text-xs leading-relaxed text-foreground">{initResponseJson}</pre>
              </div>
            </div>

            {/* Endpoint 2: Chat */}
            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">POST</Badge>
                <code className="font-mono text-sm font-semibold">/api/v1/widget/chat</code>
                <span className="text-xs text-muted-foreground">— Stream AI response using session token</span>
              </div>

              <div className="rounded-lg border border-border bg-surface p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">cURL Request</p>
                <pre className="mt-2 overflow-x-auto font-mono text-xs leading-relaxed text-foreground">{curlChatSnippet}</pre>
              </div>
              <p className="text-xs text-muted-foreground">
                The <code className="font-mono">/chat</code> endpoint returns a real-time SSE stream adhering to the Vercel AI SDK stream protocol (<code className="font-mono">0:&quot;token&quot;\n</code>).
              </p>
            </div>
          </div>
        </TabsContent>

        {/* 5. Security & Guardrails Tab */}
        <TabsContent value="security" className="mt-6 space-y-6">
          <div className="surface-panel p-6 space-y-6">
            <div>
              <h2 className="text-base font-semibold">5. Security Architecture &amp; Best Practices</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                How Brainbase ensures tenant isolation, prompt defense, and prevents credential leakage.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-surface p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <ShieldCheck className="size-4 text-success" />
                  Public Key vs Secret Keys
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Only use the public key (<code className="font-mono">pk_live_...</code>) in client-side applications. It is strictly scoped to chat conversations and cannot read private workspace documents or mutate billing details.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-surface p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Globe className="size-4 text-primary" />
                  Origin Whitelisting
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Lock your Support Agent to authorized domain names in the Agent Settings. Requests originating from unauthorized hostnames will receive a <code className="font-mono">403 Forbidden</code> response.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-surface p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Key className="size-4 text-warning" />
                  Ambient Cookie Isolation
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  All requests initiated by <code className="font-mono">@brainbaseai/react-widget</code> use <code className="font-mono">credentials: &apos;omit&apos;</code> to prevent passing ambient authentication cookies across domains.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-surface p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Zap className="size-4 text-info" />
                  Rate Limiting
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Endpoints are protected by IP-based rate limiting (100 session inits / 15 minutes, 30 chat messages / minute) to prevent bot scraping and denial of service.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Page>
  );
}
