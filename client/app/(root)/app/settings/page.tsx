import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { Page, PageHeader } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

export const metadata = {
  title: "Settings — BrainbaseAI",
  description: "Company, workspace, security and notification settings.",
};

import { SettingsClient } from "./settings-client";

export default function RoutePage(props: any) {
  return <SettingsClient {...props} />;
}
