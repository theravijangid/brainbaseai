export type PlanId = "free" | "pro" | "business";

export type Plan = {
  id: PlanId;
  name: string;
  price: number;
  tagline: string;
  limits: {
    workspaces: string;
    sourcesPerWorkspace: string;
    agents: string;
    knowledgeChat: string;
    supportConversations: string;
  };
  features: string[];
  highlighted?: boolean;
};

export const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    tagline: "Explore your Company Brain",
    limits: {
      workspaces: "2 workspaces",
      sourcesPerWorkspace: "5 sources / workspace",
      agents: "1 active Support Agent",
      knowledgeChat: "100 Knowledge Chat messages / month",
      supportConversations: "100 Support Agent conversations / month",
    },
    features: ["PDF, TXT, SRT & website sources", "Citations inside Company Brain", "Website embed"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 12,
    tagline: "For growing support teams",
    highlighted: true,
    limits: {
      workspaces: "5 workspaces",
      sourcesPerWorkspace: "50 sources / workspace",
      agents: "5 active Support Agents",
      knowledgeChat: "1,000 Knowledge Chat messages / month",
      supportConversations: "2,000 Support Agent conversations / month",
    },
    features: ["Everything in Free", "Manual website re-sync", "Conversation inbox & analytics"],
  },
  {
    id: "business",
    name: "Business",
    price: 39,
    tagline: "Scale knowledge across teams",
    limits: {
      workspaces: "Unlimited workspaces",
      sourcesPerWorkspace: "200 sources / workspace",
      agents: "15 active Support Agents",
      knowledgeChat: "5,000 Knowledge Chat messages / month",
      supportConversations: "10,000 Support Agent conversations / month",
    },
    features: ["Everything in Pro", "Per-agent knowledge scoping", "Priority support"],
  },
];

export type Integration = {
  name: string;
  category: "Website" | "Knowledge" | "Communication" | "Customer Support" | "Automation";
  description: string;
  available: boolean;
};

export const integrations: Integration[] = [
  { name: "Website Embed", category: "Website", description: "Embed the Support Agent on any page with one snippet.", available: true },
  { name: "Notion", category: "Knowledge", description: "Import pages and databases as knowledge sources.", available: false },
  { name: "Google Drive", category: "Knowledge", description: "Sync documents from shared drives.", available: false },
  { name: "Slack", category: "Communication", description: "Ask your Company Brain from any channel.", available: false },
  { name: "Discord", category: "Communication", description: "Run the Support Agent inside your community.", available: false },
  { name: "Zendesk", category: "Customer Support", description: "Deflect tickets with agent answers.", available: false },
  { name: "Intercom", category: "Customer Support", description: "Hand off conversations to your inbox.", available: false },
  { name: "HubSpot", category: "Automation", description: "Push conversation context into CRM records.", available: false },
];

export const faqs = [
  { q: "What is Company Brain?", a: "Company Brain is your private workspace where employees can ask questions and get answers drawn from your approved company knowledge, with citations back to the exact source." },
  { q: "How does the AI learn from our company?", a: "You connect sources such as documents and website pages. BrainbaseAI reads and indexes them into the workspace so your agents answer from your material, not the open internet." },
  { q: "What sources can I connect?", a: "PDF, TXT and SRT files, plus website URLs. More connectors are marked Coming Soon on the Integrations page." },
  { q: "Can I update my knowledge?", a: "Yes. Files can be replaced with a new version and websites can be re-synced manually. If a re-ingestion fails, your last known-good knowledge stays live." },
  { q: "Can I create multiple agents?", a: "Yes, subject to your plan's active agent limit. Each agent can use all workspace knowledge or a selected subset." },
  { q: "Can I embed the agent on my website?", a: "Yes. Copy the embed snippet from the agent's Integrate tab and add approved domains." },
  { q: "Does the public agent show citations?", a: "No. Citations are only available inside the authenticated Company Brain experience. Customers see a clean, helpful answer." },
  { q: "How is company data isolated?", a: "Knowledge is scoped to a workspace inside your company, and public widgets are limited to approved origins with secure sessions." },
  { q: "What happens when I reach my plan limit?", a: "You'll see clear in-product usage warnings before you hit a limit, then an upgrade prompt instead of a raw error." },
  { q: "Can I upgrade later?", a: "Yes, plans can be changed at any time from Billing." },
];
