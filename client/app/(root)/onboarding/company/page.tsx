"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, PartyPopper, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useOnboardCompany, useCompany } from "@/hooks/use-company";

export default function RoutePage(props: any) {
  return <OnboardingPage {...props} />;
}

const steps = ["Company", "About", "Workspace", "Complete"];

function OnboardingPage() {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const { data: company, isLoading: isCompanyLoading } = useCompany();
  const { mutateAsync: onboardCompany, isPending } = useOnboardCompany();

  useEffect(() => {
    if (!isCompanyLoading && company) {
      router.replace("/app");
    }
  }, [company, isCompanyLoading, router]);

  const [formData, setFormData] = useState({
    name: "",
    website: "",
    industry: "",
    companySize: "",
    country: "",
    description: "",
    supportEmail: "",
    workspaceName: "Main Workspace",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
    if (step === 0 && !formData.name) {
      return; // Basic validation
    }
    
    if (step === 2) {
      try {
        await onboardCompany(formData);
        setStep(3);
      } catch (err) {
        console.error("Failed to onboard", err);
      }
    } else {
      setStep((s) => s + 1);
    }
  };

  if (isCompanyLoading || company) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label="BrainbaseAI home">
            <Logo />
          </Link>
          <span className="text-xs text-muted-foreground">Step {Math.min(step + 1, 4)} of 4</span>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <ol className="mb-8 flex items-center gap-2" aria-label="Onboarding progress">
          {steps.map((s, i) => (
            <li key={s} className="flex flex-1 items-center gap-2">
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold",
                  i < step && "border-primary bg-primary text-primary-foreground",
                  i === step && "border-primary text-primary",
                  i > step && "border-border text-muted-foreground",
                )}
              >
                {i < step ? <Check className="size-3" /> : i + 1}
              </span>
              <span
                className={cn(
                  "hidden text-xs sm:inline",
                  i === step ? "font-medium text-foreground" : "text-muted-foreground",
                )}
              >
                {s}
              </span>
              {i < steps.length - 1 ? <span className="h-px flex-1 bg-border" /> : null}
            </li>
          ))}
        </ol>

        <div className="surface-panel p-6 sm:p-8">
          {step === 0 ? (
            <div className="space-y-5 animate-rise">
              <div>
                <h1 className="text-xl font-semibold">Tell us about your company</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  This becomes the home for your workspaces, knowledge and agents.
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company">Company name *</Label>
                <Input 
                  id="company" 
                  required 
                  placeholder="Acme Inc." 
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="website">Website</Label>
                  <Input 
                    id="website" 
                    placeholder="https://acme.com" 
                    value={formData.website}
                    onChange={(e) => handleChange("website", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={formData.industry} onValueChange={(v) => handleChange("industry", v)}>
                    <SelectTrigger id="industry">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {["SaaS", "E-commerce", "Fintech", "Healthcare", "Education", "Other"].map((o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="size">Company size</Label>
                  <Select value={formData.companySize} onValueChange={(v) => handleChange("companySize", v)}>
                    <SelectTrigger id="size">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {["1-10", "11-50", "51-200", "201-1000", "1000+"].map((o) => (
                        <SelectItem key={o} value={o}>
                          {o} people
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="country">Country</Label>
                  <Input 
                    id="country" 
                    placeholder="United States" 
                    value={formData.country}
                    onChange={(e) => handleChange("country", e.target.value)}
                  />
                </div>
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="space-y-5 animate-rise">
              <div>
                <h1 className="text-xl font-semibold">A little more context</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Helps your agents write answers that sound like your company.
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="desc">Company description</Label>
                <Textarea
                  id="desc"
                  rows={5}
                  placeholder="Acme sells sustainable home goods to customers across North America…"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="support">Support email</Label>
                <Input 
                  id="support" 
                  type="email" 
                  placeholder="support@acme.com" 
                  value={formData.supportEmail}
                  onChange={(e) => handleChange("supportEmail", e.target.value)}
                />
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-5 animate-rise">
              <div>
                <h1 className="text-xl font-semibold">Create your first workspace</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Workspaces help you organize your company's knowledge and AI agents.
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ws">Workspace name</Label>
                <Input 
                  id="ws" 
                  placeholder="Acme Support" 
                  value={formData.workspaceName}
                  onChange={(e) => handleChange("workspaceName", e.target.value)}
                />
              </div>
              <div className="rounded-lg border border-border bg-surface p-4 text-sm text-muted-foreground">
                Knowledge added to a workspace stays isolated to that workspace. You can add more
                workspaces later — your Free plan includes 2.
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-5 py-6 text-center animate-rise">
              <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary-soft">
                <PartyPopper className="size-5 text-primary" aria-hidden />
              </span>
              <h1 className="text-2xl font-semibold">Your Company Brain is ready.</h1>
              <p className="mx-auto max-w-md text-sm text-muted-foreground">
                We created {formData.name || "your company"}, the {formData.workspaceName || "Main"} workspace and your Free subscription. Add your
                first knowledge source next.
              </p>
              <Button size="lg" onClick={() => router.push("/app")}>
                Go to Dashboard <ArrowRight className="size-4" />
              </Button>
            </div>
          ) : null}

          {step < 3 ? (
            <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
              <Button
                variant="ghost"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0 || isPending}
              >
                <ArrowLeft className="size-4" /> Back
              </Button>
              <Button onClick={handleNext} disabled={isPending || (step === 0 && !formData.name)}>
                {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                {step === 2 ? "Complete Setup" : "Continue"} <ArrowRight className="size-4" />
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
