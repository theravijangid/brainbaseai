
import { AppShell } from "@/components/app/AppShell";

export const metadata = {
  title: "Company Brain — BrainbaseAI",
  description: "Manage company knowledge, agents and conversations.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}


function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      {children}
    </AppShell>
  );
}
