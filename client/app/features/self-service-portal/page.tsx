"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Search,
  Ticket,
  BookOpen,
  Bell,
  CheckCircle2,
  Clock,
  ArrowRight,
  ChevronDown,
  Zap,
  ShieldCheck,
  BarChart2,
  Users,
  MessageSquare,
  Layers,
} from "lucide-react";
import  NavHeader from "@/app/onboarding/navsection";
function useFadeIn(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

const CAPABILITIES = [
  {
    icon: <Ticket className="w-5 h-5" />,
    title: "Ticket Submission",
    desc: "Employees submit and track requests without ever picking up the phone. Smart forms auto-categorize and route to the right team instantly.",
  },
  {
    icon: <BookOpen className="w-5 h-5" />,
    title: "Knowledge Base Access",
    desc: "Surfaced answers before a ticket is even raised. AI-ranked articles reduce repeat requests by up to 45%.",
  },
  {
    icon: <Bell className="w-5 h-5" />,
    title: "Real-Time Notifications",
    desc: "Users get live status updates at every stage — assigned, in progress, resolved. No more chasing agents for updates.",
  },
  {
    icon: <BarChart2 className="w-5 h-5" />,
    title: "Request History",
    desc: "A full timeline of every request, resolution, and document. Employees always have context; agents always have history.",
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Automated Resolutions",
    desc: "Common requests like password resets and software access are resolved instantly — zero agent involvement required.",
  },
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: "Role-Based Access",
    desc: "Each user sees only what they're entitled to. Sensitive forms and data stay locked behind permission walls.",
  },
];

const STATS = [
  { value: "68%", label: "Reduction in ticket volume" },
  { value: "4.8★", label: "Average user satisfaction" },
  { value: "3min", label: "Average self-resolution time" },
  { value: "24/7", label: "Always-on availability" },
];

const STEPS = [
  {
    number: "01",
    title: "Employee searches or submits",
    desc: "The portal surfaces knowledge base articles the moment a user starts typing. If no answer exists, a smart form guides them through submission.",
  },
  {
    number: "02",
    title: "Instant routing & acknowledgement",
    desc: "Requests are categorized, prioritized, and routed automatically. The user gets an immediate confirmation with an estimated resolution time.",
  },
  {
    number: "03",
    title: "Transparent progress tracking",
    desc: "A live tracker shows exactly where the request stands. Agents can post updates visible directly in the portal.",
  },
  {
    number: "04",
    title: "Resolution & feedback",
    desc: "Once resolved, the user is notified and prompted to rate the experience. That feedback feeds directly into your CSAT reports.",
  },
];

const FAQS = [
  {
    q: "Can we brand the portal with our company's identity?",
    a: "Yes — logo, colors, fonts, and domain are all customizable. Most teams have their branded portal live within a day.",
  },
  {
    q: "Does it work on mobile?",
    a: "Fully responsive out of the box. Employees can submit and track requests from any device without installing an app.",
  },
  {
    q: "How does the AI article suggestion work?",
    a: "As users type their request, our NLP engine matches their query against your knowledge base and surfaces the top 3 relevant articles before they submit.",
  },
  {
    q: "Can we restrict which services different departments see?",
    a: "Absolutely. Service catalogs are scoped by department, location, or role — so HR only sees HR services and IT sees IT services.",
  },
];

const TESTIMONIAL = {
  quote:
    "We went from 1,200 monthly tickets to under 400 in three months. Our agents now focus on real problems instead of password resets.",
  author: "Grace Njoroge",
  role: "IT Manager, Savanna Financial Group",
  initials: "GN",
};


function StatCard({ value, label, index }: { value: string; label: string; index: number }) {
  const { ref, visible } = useFadeIn();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${index * 100}ms` }}
      className={`text-center transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
    >
      <div className="text-4xl md:text-5xl font-black text-blue-600 mb-1">{value}</div>
      <div className="text-sm text-muted-foreground font-medium">{label}</div>
    </div>
  );
}

function CapabilityCard({ cap, index }: { cap: typeof CAPABILITIES[0]; index: number }) {
  const { ref, visible } = useFadeIn();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${index * 80}ms` }}
      className={`group rounded-2xl border border-border bg-card p-6 hover:border-blue-400 hover:shadow-lg hover:-translate-y-1
        transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    >
      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
        {cap.icon}
      </div>
      <h3 className="font-semibold text-base mb-2">{cap.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{cap.desc}</p>
    </div>
  );
}

function StepItem({ step, index }: { step: typeof STEPS[0]; index: number }) {
  const { ref, visible } = useFadeIn();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${index * 120}ms` }}
      className={`flex gap-6 transition-all duration-700 ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}
    >
      <div className="shrink-0 w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-sm">
        {step.number}
      </div>
      <div className="pt-1">
        <h3 className="font-semibold mb-1">{step.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
      </div>
    </div>
  );
}

function FaqItem({ faq }: { faq: typeof FAQS[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left text-sm font-semibold hover:text-blue-600 transition-colors"
      >
        {faq.q}
        <ChevronDown className={`w-4 h-4 shrink-0 ml-4 transition-transform duration-300 ${open ? "rotate-180 text-blue-600" : "text-muted-foreground"}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? "max-h-40 pb-4" : "max-h-0"}`}>
        <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
      </div>
    </div>
  );
}

function PortalMock() {
  const { ref, visible } = useFadeIn(0.1);
  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
    >
      <div className="rounded-3xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Browser bar */}
        <div className="bg-muted px-4 py-3 flex items-center gap-2 border-b border-border">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 mx-4 bg-background rounded-lg px-3 py-1 text-xs text-muted-foreground border border-border">
            portal.helpedge.com
          </div>
        </div>

        {/* Portal content */}
        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Welcome back,</p>
              <p className="font-bold text-base">Grace Njoroge 👋</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">GN</div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <div className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-muted text-sm text-muted-foreground">
              How do I reset my VPN password?
            </div>
          </div>

          {/* Suggested article */}
          <div className="rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 p-3">
            <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider mb-1.5">Suggested Article</p>
            <p className="text-sm font-medium">VPN Password Reset — Step by Step Guide</p>
            <p className="text-xs text-muted-foreground mt-0.5">Resolves in ~2 minutes · 94% found this helpful</p>
          </div>

          {/* Active tickets */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">My Requests</p>
            <div className="space-y-2">
              {[
                { id: "INC-2041", title: "Laptop screen flickering", status: "In Progress", color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40" },
                { id: "INC-2038", title: "New software license request", status: "Resolved", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40" },
              ].map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-3.5 h-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-semibold">{t.id}</p>
                      <p className="text-[10px] text-muted-foreground">{t.title}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${t.color}`}>{t.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: <Ticket className="w-4 h-4" />, label: "New Request" },
              { icon: <BookOpen className="w-4 h-4" />, label: "Browse Docs" },
              { icon: <MessageSquare className="w-4 h-4" />, label: "Live Chat" },
            ].map((a) => (
              <button key={a.label} className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-muted/40 p-3 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors group">
                <span className="text-muted-foreground group-hover:text-blue-600 transition-colors">{a.icon}</span>
                <span className="text-[10px] font-medium text-muted-foreground group-hover:text-blue-600 transition-colors">{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
interface StaticCardItem {
  icon: React.ReactNode;
  title: string;
  sub: string;
}
const HIGHLIGHTS = [
  { icon: <Users className="w-5 h-5 text-blue-600" />, title: "1,200+ employees onboarded", sub: "Savanna Financial — Day 1" },
  { icon: <Zap className="w-5 h-5 text-amber-500" />, title: "Auto-resolved in 47 seconds", sub: "Password reset via automation" },
  { icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />, title: "4.9 / 5 satisfaction score", sub: "Q1 2026 · 2,400 responses" },
  { icon: <BarChart2 className="w-5 h-5 text-violet-500" />, title: "68% fewer tickets logged", sub: "3 months post-deployment" },
];
function HighlightCard({ item, index }: { item: StaticCardItem; index: number }) {
  const { ref, visible } = useFadeIn();  
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${index * 100}ms` }}
      className={`flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm
        transition-all duration-600 ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
    >
      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
        {item.icon}
      </div>
      <div>
        <p className="text-sm font-semibold">{item.title}</p>
        <p className="text-xs text-muted-foreground">{item.sub}</p>
      </div>
    </div>
  );
}
export default function SelfServicePortalPage() {
  return (
    <>
    <NavHeader />
    <main className="overflow-hidden">

      {/* ── Hero ── */}
      <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-24 grid md:grid-cols-2 gap-16 items-center">
        {/* Background blob */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-blue-100 dark:bg-blue-950/30 rounded-full blur-3xl opacity-50 pointer-events-none" />

        <div className="relative space-y-6">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-600 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 px-3 py-1.5 rounded-full">
            <Layers className="w-3.5 h-3.5" /> Self-Service Portal
          </span>

          <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight">
            IT help that doesn&rsquo;t<br />
            <span className="text-blue-600">need an agent.</span>
          </h1>

          <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
            Give employees a branded, intelligent portal where they can submit requests, find answers, and track progress — without ever contacting the service desk.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Get started free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/resources/docs/self-service-portal"
              className="inline-flex items-center gap-2 border border-border bg-background hover:bg-muted text-sm font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Read the docs
            </Link>
          </div>

          {/* Trust signals */}
          <div className="flex items-center gap-4 pt-2">
            {[
              { icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />, text: "No credit card required" },
              { icon: <Clock className="w-4 h-4 text-blue-500" />, text: "Live in under 1 hour" },
            ].map((s) => (
              <span key={s.text} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {s.icon} {s.text}
              </span>
            ))}
          </div>
        </div>

        {/* Portal mock UI */}
        <PortalMock />
      </section>

      {/* ── Stats ── */}
      <section className="border-y border-border bg-muted/30 py-16">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-10">
          {STATS.map((s, i) => <StatCard key={s.label} {...s} index={i} />)}
        </div>
      </section>

      {/* ── Capabilities ── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black mb-3">Everything employees need. Nothing they don&rsquo;t.</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            A focused, powerful set of tools that makes self-service actually work — not just exist.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CAPABILITIES.map((cap, i) => <CapabilityCard key={cap.title} cap={cap} index={i} />)}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-muted/30 border-y border-border py-24">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3 block">How it works</span>
            <h2 className="text-3xl md:text-4xl font-black mb-10 leading-tight">
              From request to resolution in four steps.
            </h2>
            <div className="space-y-8">
              {STEPS.map((step, i) => <StepItem key={step.number} step={step} index={i} />)}
            </div>
          </div>

          {/* Visual aside */}
          <div className="space-y-4">
  {HIGHLIGHTS.map((item, i) => (
    <HighlightCard key={item.title} item={item} index={i} />  // ✅ hook in component
  ))}
</div>
        </div>
      </section>

      {/* ── Testimonial ── */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <div className="text-5xl text-blue-200 dark:text-blue-900 font-serif mb-6">&ldquo;</div>
        <p className="text-xl md:text-2xl font-semibold leading-snug mb-8 italic">
          {TESTIMONIAL.quote}
        </p>
        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
            {TESTIMONIAL.initials}
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold">{TESTIMONIAL.author}</p>
            <p className="text-xs text-muted-foreground">{TESTIMONIAL.role}</p>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-muted/30 border-t border-border py-24">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl font-black mb-10 text-center">Frequently asked questions</h2>
          <div className="rounded-2xl border border-border bg-card px-6 divide-y divide-border">
            {FAQS.map((faq) => <FaqItem key={faq.q} faq={faq} />)}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="relative rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 px-8 md:px-16 py-16 text-white overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />
          <div className="relative z-10 max-w-xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black mb-4">Ready to deflect 68% of your tickets?</h2>
            <p className="text-blue-100 mb-8 text-base">
              Set up your branded self-service portal in under an hour. No IT project required.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/auth"
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors text-sm"
              >
                Start for free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/resources/docs/self-service-portal"
                className="inline-flex items-center justify-center gap-2 border border-white/30 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/10 transition-colors text-sm"
              >
                View documentation
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
    </>
  );
}