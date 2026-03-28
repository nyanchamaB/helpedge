"use client";

export const dynamic = 'force-dynamic';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNavigation } from "@/contexts/NavigationContext";
import { ArrowLeft, CheckCircle, Copy, Info, Mail, Ticket } from "lucide-react";
import { toast } from "sonner";

const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "helpedge.itsm@google.com";

const HOW_IT_WORKS = [
  "Send an email to the support address below from your registered email",
  "Our system automatically converts your email into a support ticket",
  "The AI analyses your request and routes it to the right team",
  "You receive a confirmation email with your ticket number",
  "Track your ticket progress right here on the portal",
];

const TIPS = [
  {
    tip: "Use a clear, descriptive subject line",
    detail: 'e.g. "Excel crashes when opening large files on Windows 11"',
  },
  {
    tip: "Include any error messages",
    detail: "Copy and paste the full error text — it helps us diagnose faster",
  },
  {
    tip: "Describe the steps to reproduce",
    detail: "What were you doing when the problem occurred?",
  },
  {
    tip: "Mention the business impact",
    detail: "Are you blocked? Are other team members affected?",
  },
  {
    tip: "Attach screenshots or logs",
    detail: "Attach relevant files directly to your email",
  },
];

export default function PortalEmailTicket() {
  const { navigateTo, pageParams } = useNavigation();

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPPORT_EMAIL).then(() => {
      toast.success("Email address copied to clipboard");
    });
  };

  return (
    <div className="container max-w-2xl mx-auto py-6 space-y-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigateTo(pageParams?.from ?? "/portal/my-tickets")}
        className="-ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-1.5" />
        Back to My Tickets
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle>Submit Tickets via Email</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Raise a support request directly from your email client
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Support email address */}
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl border">
            <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-0.5">Support Email</p>
              <p className="font-mono font-semibold text-foreground">
                {SUPPORT_EMAIL}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="h-3.5 w-3.5 mr-1.5" />
              Copy
            </Button>
          </div>

          <Separator />

          {/* How it works */}
          <div>
            <h3 className="font-semibold mb-3">How it works</h3>
            <ol className="space-y-3">
              {HOW_IT_WORKS.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-sm text-muted-foreground leading-relaxed">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <Separator />

          {/* Tips */}
          <div>
            <h3 className="font-semibold mb-3">
              Tips for faster support
            </h3>
            <div className="space-y-3">
              {TIPS.map(({ tip, detail }, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{tip}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* What happens next */}
          <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20 space-y-2">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-amber-500 shrink-0" />
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
                Important note
              </p>
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-400/80 leading-relaxed">
              Tickets created via email are linked to your account using your
              registered email address. Make sure you send from the email you
              used to sign up, so the ticket appears in your portal.
            </p>
          </div>

          {/* CTA */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Ticket className="h-4 w-4" />
              <span>Prefer filling out a form?</span>
            </div>
            <Button onClick={() => navigateTo("/portal/create-ticket")}>
              Submit via Web Form
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
