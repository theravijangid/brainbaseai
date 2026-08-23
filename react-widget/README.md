# @brainbaseai/react-widget

> The official native React chat widget and headless hook for **Brainbase Support Agents**.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Embed a full-featured, accessible AI support chat widget into your React or Next.js application in less than 2 minutes without iframes.

---

## Features

- 🚀 **Native DOM Rendering**: Zero iframes, zero layout shifting, and high performance.
- 🎨 **Auto-Themed**: Automatically syncs branding colors, avatars, and welcome messages from your Brainbase dashboard.
- 🛡️ **Hardened Security**: Includes XSS protections, CSS injection guards, ambient cookie isolation (`credentials: 'omit'`), and payload size limits.
- 🧩 **Headless Hook**: Includes `useBrainbaseChat` to build your own custom support UI with any design system (Tailwind, shadcn/ui, MUI, etc.).
- ♿ **Accessible**: WCAG compliant with ARIA roles, live regions for typing indicators, and keyboard navigation (Escape to close).

---

## Installation

```bash
npm install @brainbaseai/react-widget @ai-sdk/react ai
# or
pnpm add @brainbaseai/react-widget @ai-sdk/react ai
# or
yarn add @brainbaseai/react-widget @ai-sdk/react ai
```

> **Note**: `@ai-sdk/react`, `ai`, `react`, and `react-dom` are peer dependencies.

---

## Quick Start (Drop-in Widget)

Add the widget to your app layout or root component:

```tsx
// app/layout.tsx or src/App.tsx
import { BrainbaseWidget } from "@brainbaseai/react-widget";
import "@brainbaseai/react-widget/dist/index.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <BrainbaseWidget publishableKey="bb_live_your_key_here" />
      </body>
    </html>
  );
}
```

---

## Props Reference

### `<BrainbaseWidget />`

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `publishableKey` | `string` | **(Required)** | The public agent key (`bb_live_...`) from your Brainbase dashboard. |
| `defaultOpen` | `boolean` | `false` | Whether the chat panel starts open when mounted. |

---

## Headless Usage (`useBrainbaseChat`)

For complete control over the chat interface, use the headless `useBrainbaseChat` hook:

```tsx
'use client';

import { useBrainbaseChat } from '@brainbaseai/react-widget';

export function CustomChatWidget() {
  const {
    state,
    branding,
    messages,
    input,
    setInput,
    handleSubmit,
    isLoading
  } = useBrainbaseChat({
    publishableKey: 'bb_live_your_key_here'
  });

  if (state === 'loading') return <div>Loading support...</div>;
  if (state === 'error' || state === 'unavailable') return <div>Support unavailable</div>;

  return (
    <div className="custom-chat-window">
      <header style={{ backgroundColor: branding?.primaryColor }}>
        <h3>{branding?.title || 'Support'}</h3>
      </header>

      <div className="messages-container">
        {messages.map((m) => (
          <div key={m.id} className={m.role === 'user' ? 'user-msg' : 'bot-msg'}>
            {m.parts?.map((p) => (p.type === 'text' ? p.text : '')).join('') || (m as any).content}
          </div>
        ))}
        {isLoading && <p>Thinking...</p>}
      </div>

      <form onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(e, { data: { role: 'user', parts: [{ type: 'text', text: input }] } });
        setInput('');
      }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
        />
        <button type="submit" disabled={isLoading || !input.trim()}>Send</button>
      </form>
    </div>
  );
}
```

---

## Security Best Practices

1. **Public Key Authorization**: Always use your public key (`bb_live_...`) in client applications. Never expose your account API keys or secrets in client code.
2. **Origin Verification**: Configure allowed domains in your Brainbase Agent Dashboard to ensure your key can only be initialized on your domain.
3. **Cookie Isolation**: All API requests use `credentials: 'omit'` to prevent cross-origin cookie sharing.

---

## Development & Publishing

### Build
```bash
npm run build
```

### Dry Run (Verify package tarball contents)
```bash
npm pack --dry-run
```

### Publish to NPM
```bash
npm login
npm publish --access public
```

---

## License

MIT © [BrainbaseAI]
