"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Mail,
  MessageSquare,
  Phone,
  Globe,
  Smartphone,
  Slack,
  ArrowRight,
  CheckCircle2,
  Clock,
  ChevronDown,
  Zap,
  BarChart2,
  ShieldCheck,
  Users,
  RefreshCw,
  Layers,
  Bell,
} from "lucide-react";
import NavHeader from "@/app/onboarding/navsection";

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

const CHANNELS = [
  { icon: <Mail className="w-5 h-5" />, label: "Email", color: "bg-blue-50 dark:bg-blue-950 text-blue-600", desc: "Every inbound email auto-converts to a tracked ticket with full thread history." },
  { icon: <MessageSquare className="w-5 h-5" />, label: "Live Chat", color: "bg-emerald-50 dark:bg-emerald-950 text-emerald-600", desc: "Embedded chat widget on your portal or website. Agents see full context before they respond." },
  { icon: <Phone className="w-5 h-5" />, label: "Phone", color: "bg-violet-50 dark:bg-violet-950 text-violet-600", desc: "Call logs linked to tickets automatically. No more lost verbal commitments." },
  { icon: <Globe className="w-5 h-5" />, label: "Web Portal", color: "bg-amber-50 dark:bg-amber-950 text-amber-600", desc: "Self-service portal submissions routed alongside all other channels in one unified queue." },
  { icon: <Slack className="w-5 h-5" />, label: "Slack / Teams", color: "bg-pink-50 dark:bg-pink-950 text-pink-600", desc: "Employees raise tickets and get updates without leaving their collaboration tool." },
  { icon: <Smartphone className="w-5 h-5" />, label: "Mobile App", color: "bg-sky-50 dark:bg-sky-950 text-sky-600", desc: "Native iOS and Android app for submitting, tracking, and commenting on requests on the go." },
];

const STATS = [
  { value: "6+", label: "Channels unified" },
  { value: "92%", label: "First-contact resolution" },
  { value: "< 2min", label: "Average response time" },
  { value: "Zero", label: "Duplicate tickets" },
];

const CAPABILITIES = [
  {
    icon: <RefreshCw className="w-5 h-5" />,
    title: "Unified Inbox",
    desc: "Every channel — email, chat, Slack, phone — lands in one shared queue. No switching tabs. No missed messages.",
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Smart Routing",
    desc: "Tickets are automatically assigned based on channel, category, and agent availability. The right person gets it every time.",
  },
  {
    icon: <Bell className="w-5 h-5" />,
    title: "Cross-Channel Continuity",
    desc: "A user starts on chat, follows up by email — the agent sees the full conversation thread regardless of channel.",
  },
  {
    icon: <BarChart2 className="w-5 h-5" />,
    title: "Channel Analytics",
    desc: "See which channels drive the most volume, longest resolution times, and lowest satisfaction scores. Optimize accordingly.",
  },
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: "SLA Per Channel",
    desc: "Set different response and resolution targets per channel. Phone gets 1-hour response; email gets 4 hours. Fully configurable.",
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Team Assignment by Channel",
    desc: "Route Slack messages to your tier-1 team and phone calls to senior agents automatically. No manual triage needed.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Employee contacts via any channel",
    desc: "Whether they send an email, open a chat, message on Slack, or call — every interaction is captured and logged automatically.",
  },
  {
    number: "02",
    title: "Unified ticket is created instantly",
    desc: "A single ticket is created regardless of channel. Duplicate detection prevents the same issue from spawning multiple records.",
  },
  {
    number: "03",
    title: "Routed to the right agent",
    desc: "Smart routing assigns the ticket based on channel SLA, team availability, and category — no manual dispatch.",
  },
  {
    number: "04",
    title: "Agent responds from one place",
    desc: "Agents reply from the HelpEdge inbox and the response goes back through the original channel — email reply to email, Slack reply to Slack.",
  },
];

const FAQS = [
  {
    q: "Do we need to set up each channel separately?",
    a: "Each channel has a guided setup wizard. Email and web portal take under 10 minutes. Slack and Teams integrations use OAuth and are live in about 5 minutes.",
  },
  {
    q: "What happens if the same person contacts us on two channels for the same issue?",
    a: "Our duplicate detection engine links both contacts to a single ticket. The agent sees the full picture and the user never gets contradictory responses.",
  },
  {
    q: "Can we disable channels we don't use?",
    a: "Yes — enable only the channels relevant to your team. You can add more at any time without affecting existing configuration.",
  },
  {
    q: "Is chat available 24/7 or only during business hours?",
    a: "You control the schedule. Outside business hours, chat automatically surfaces knowledge base articles or collects a message for the next available agent.",
  },
];

const TESTIMONIAL = {
  quote: "Before HelpEdge, our agents were juggling five different inboxes. Now everything is in one place and our response time dropped from 6 hours to 47 minutes.",
  author: "Ashley Merley",
  role: "Service Desk Lead, EastAfrica Logistics",
  initials: "AM",
};

function InboxMock() {
  const { ref, visible } = useFadeIn(0.1);
  const [active, setActive] = useState(0);

  const tickets = [
    { id: "INC-3041", channel: "email", channelIcon: <Mail className="w-3 h-3" />, channelColor: "text-blue-600 bg-blue-50 dark:bg-blue-950", from: "grace.njoroge@company.com", subject: "Cannot access shared drive", time: "2m ago", status: "New", statusColor: "bg-red-100 text-red-600 dark:bg-red-950" },
    { id: "INC-3040", channel: "slack", channelIcon: <Slack className="w-3 h-3" />, channelColor: "text-pink-600 bg-pink-50 dark:bg-pink-950", from: "#it-support", subject: "Printer offline on 3rd floor", time: "8m ago", status: "Open", statusColor: "bg-amber-100 text-amber-600 dark:bg-amber-950" },
    { id: "INC-3039", channel: "chat", channelIcon: <MessageSquare className="w-3 h-3" />, channelColor: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950", from: "james.mwangi", subject: "VPN keeps disconnecting", time: "14m ago", status: "In Progress", statusColor: "bg-blue-100 text-blue-600 dark:bg-blue-950" },
    { id: "INC-3038", channel: "phone", channelIcon: <Phone className="w-3 h-3" />, channelColor: "text-violet-600 bg-violet-50 dark:bg-violet-950", from: "+254 712 345 678", subject: "Software licence expired", time: "31m ago", status: "Resolved", statusColor: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950" },
  ];

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
            app.helpedge.com/inbox
          </div>
        </div>

        <div className="flex h-72">
          {/* Sidebar */}
          <div className="w-2/5 border-r border-border overflow-y-auto">
            <div className="px-3 py-2 border-b border-border">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">All Channels · 4 open</p>
            </div>
            {tickets.map((t, i) => (
              <button
                key={t.id}
                onClick={() => setActive(i)}
                className={`w-full text-left px-3 py-2.5 border-b border-border transition-colors ${active === i ? "bg-blue-50 dark:bg-blue-950/50" : "hover:bg-muted/60"}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`flex items-center justify-center w-4 h-4 rounded ${t.channelColor}`}>{t.channelIcon}</span>
                    <span className="text-[10px] font-bold">{t.id}</span>
                  </div>
                  <span className="text-[9px] text-muted-foreground">{t.time}</span>
                </div>
                <p className="text-xs font-medium truncate">{t.subject}</p>
                <p className="text-[10px] text-muted-foreground truncate">{t.from}</p>
              </button>
            ))}
          </div>

          {/* Detail pane */}
          <div className="flex-1 p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-bold">{tickets[active].subject}</p>
                <p className="text-[10px] text-muted-foreground">{tickets[active].from}</p>
              </div>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${tickets[active].statusColor}`}>
                {tickets[active].status}
              </span>
            </div>

            <div className="flex-1 bg-muted/40 rounded-xl p-3 mb-3 space-y-2">
              <div className="flex gap-2">
                <div className="w-5 h-5 rounded-full bg-muted shrink-0" />
                <div className="bg-background rounded-lg px-2.5 py-1.5 text-[10px] max-w-[80%]">
                  Hi, I can&rsquo;t seem to access the shared drive. Getting a permission error since this morning.
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <div className="bg-blue-600 text-white rounded-lg px-2.5 py-1.5 text-[10px] max-w-[80%]">
                  Thanks for reporting. Checking your permissions now — will update you in 10 minutes.
                </div>
                <div className="w-5 h-5 rounded-full bg-blue-600 shrink-0" />
              </div>
            </div>

            <div className="flex gap-2">
              <input className="flex-1 text-[10px] border border-border rounded-lg px-2.5 py-1.5 bg-background" placeholder="Reply via email..." readOnly />
              <button className="bg-blue-600 text-white text-[10px] px-3 py-1.5 rounded-lg font-semibold">Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChannelCard({ ch, index }: { ch: typeof CHANNELS[0]; index: number }) {
  const { ref, visible } = useFadeIn();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${index * 80}ms` }}
      className={`group rounded-2xl border border-border bg-card p-6 hover:border-blue-400 hover:shadow-lg hover:-translate-y-1
        transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${ch.color} group-hover:scale-110 transition-transform duration-300`}>
        {ch.icon}
      </div>
      <h3 className="font-semibold text-base mb-2">{ch.label}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{ch.desc}</p>
    </div>
  );
}

function CapabilityCard({ cap, index }: { cap: typeof CAPABILITIES[0]; index: number }) {
  const { ref, visible } = useFadeIn();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${index * 80}ms` }}
      className={`group flex gap-4 rounded-2xl border border-border bg-card p-5 hover:border-blue-400 hover:shadow-md
        transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
    >
      <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
        {cap.icon}
      </div>
      <div>
        <h3 className="font-semibold text-sm mb-1">{cap.title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{cap.desc}</p>
      </div>
    </div>
  );
}

function StepItem({ step, index }: { step: typeof STEPS[0]; index: number }) {
  const { ref, visible } = useFadeIn();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${index * 120}ms` }}
      className={`flex gap-5 transition-all duration-700 ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}
    >
      <div className="shrink-0 w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-sm">
        {step.number}
      </div>
      <div className="pt-1">
        <h3 className="font-semibold mb-1 text-sm">{step.title}</h3>
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

export default function MultiChannelSupportPage() {
  return (
    <>
    <NavHeader />
    <main className="overflow-hidden">

      {/* ── Hero ── */}
      <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-24 grid md:grid-cols-2 gap-16 items-center">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-emerald-100 dark:bg-emerald-950/20 rounded-full blur-3xl opacity-40 pointer-events-none" />

        <div className="relative space-y-6">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-emerald-600 border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-full">
            <Layers className="w-3.5 h-3.5" /> Multi-Channel Support
          </span>

          <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight">
            Meet your employees<br />
            <span className="text-emerald-600">wherever they are.</span>
          </h1>

          <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
            Email, chat, Slack, Teams, phone, portal — every channel unified into one intelligent inbox. No ticket falls through the cracks.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Get started free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/resources/docs/multi-channel-support"
              className="inline-flex items-center gap-2 border border-border bg-background hover:bg-muted text-sm font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Read the docs
            </Link>
          </div>

          <div className="flex items-center gap-4 pt-2">
            {[
              { icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />, text: "6 channels out of the box" },
              { icon: <Clock className="w-4 h-4 text-blue-500" />, text: "Setup in under 30 minutes" },
            ].map((s) => (
              <span key={s.text} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {s.icon} {s.text}
              </span>
            ))}
          </div>
        </div>

        <InboxMock />
      </section>

      {/* ── Stats ── */}
      <section className="border-y border-border bg-muted/30 py-16">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-10">
          {STATS.map((s, i) => {
            const { ref, visible } = useFadeIn();
            return (
              <div
                key={s.label}
                ref={ref}
                style={{ transitionDelay: `${i * 100}ms` }}
                className={`text-center transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              >
                <div className="text-4xl md:text-5xl font-black text-emerald-600 mb-1">{s.value}</div>
                <div className="text-sm text-muted-foreground font-medium">{s.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Channels ── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black mb-3">Every channel. One platform.</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Stop asking employees to use a specific channel. Support them on the one they already use.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CHANNELS.map((ch, i) => <ChannelCard key={ch.label} ch={ch} index={i} />)}
        </div>
      </section>

      {/* ── Capabilities ── */}
      <section className="bg-muted/30 border-y border-border py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black mb-3">Built for agents, not just managers.</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              The features that make every agent faster and every conversation better.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CAPABILITIES.map((cap, i) => <CapabilityCard key={cap.title} cap={cap} index={i} />)}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="max-w-5xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-3 block">How it works</span>
          <h2 className="text-3xl md:text-4xl font-black mb-10 leading-tight">
            Any channel in.<br />One inbox out.
          </h2>
          <div className="space-y-8">
            {STEPS.map((step, i) => <StepItem key={step.number} step={step} index={i} />)}
          </div>
        </div>

        {/* Proof cards */}
        <div className="space-y-4">
          {[
            { icon: <Mail className="w-5 h-5 text-blue-600" />, title: "1,840 emails processed this month", sub: "Zero missed · avg 38min response" },
            { icon: <Slack className="w-5 h-5 text-pink-600" />, title: "Slack tickets up 3× since launch", sub: "Employees prefer it over email" },
            { icon: <MessageSquare className="w-5 h-5 text-emerald-600" />, title: "Chat resolves in < 8 minutes avg", sub: "Fastest channel for tier-1 issues" },
            { icon: <BarChart2 className="w-5 h-5 text-violet-600" />, title: "92% first-contact resolution rate", sub: "Up from 61% before unification" },
          ].map((item, i) => {
            const { ref, visible } = useFadeIn();
            return (
              <div
                key={item.title}
                ref={ref}
                style={{ transitionDelay: `${i * 100}ms` }}
                className={`flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm
                  transition-all duration-600 ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
              >
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">{item.icon}</div>
                <div>
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Testimonial ── */}
      <section className="bg-muted/30 border-y border-border py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="text-5xl text-emerald-200 dark:text-emerald-900 font-serif mb-6">&ldquo;</div>
          <p className="text-xl md:text-2xl font-semibold leading-snug mb-8 italic">{TESTIMONIAL.quote}</p>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
              {TESTIMONIAL.initials}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold">{TESTIMONIAL.author}</p>
              <p className="text-xs text-muted-foreground">{TESTIMONIAL.role}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl font-black mb-10 text-center">Frequently asked questions</h2>
          <div className="rounded-2xl border border-border bg-card px-6 divide-y divide-border">
            {FAQS.map((faq) => <FaqItem key={faq.q} faq={faq} />)}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="relative rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-800 px-8 md:px-16 py-16 text-white overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />
          <div className="relative z-10 max-w-xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black mb-4">Stop managing five inboxes. Start managing one.</h2>
            <p className="text-emerald-100 mb-8 text-base">
              Unify all your support channels in under 30 minutes. No engineering work required.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/auth"
                className="inline-flex items-center justify-center gap-2 bg-white text-emerald-700 font-bold px-8 py-3 rounded-xl hover:bg-emerald-50 transition-colors text-sm"
              >
                Start for free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/resources/docs/multi-channel-support"
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