'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Search,
  Clock,
  User,
  ArrowRight,
  X,
  BookOpen,
  TrendingUp,
  ChevronRight,
  Check,
} from 'lucide-react';
import { siteConfig } from '@/config/site';
import NavHeader from '@/app/onboarding/navsection';

type Post = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  featured?: boolean;
  tag?: string;
};

const CATEGORIES = [
  'All',
  'ITSM',
  'Automation',
  'Security',
  'Analytics',
  'Best Practices',
  'Product Updates',
];

const POSTS: Post[] = [
  {
    id: 1,
    slug: 'modern-itsm-ai',
    title: 'How AI is Reshaping Modern ITSM in 2026',
    excerpt:
      'Discover how AI-driven ticket routing, predictive analytics, and intelligent automation are cutting resolution times by up to 60% for enterprise IT teams.',
    category: 'ITSM',
    author: 'Sarah Kennedy',
    authorRole: 'Head of Product',
    date: 'Feb 18, 2026',
    readTime: '8 min read',
    featured: true,
    tag: 'Trending',
  },
  {
    id: 2,
    slug: 'sla-management-guide',
    title: 'The Complete Guide to SLA Management',
    excerpt:
      'Stop missing SLAs. This step-by-step guide covers policy creation, breach notifications, escalation rules, and reporting for service desks of any size.',
    category: 'Best Practices',
    author: 'James Odhiam',
    authorRole: 'Solutions Architect',
    date: 'Feb 12, 2026',
    readTime: '6 min read',
    tag: 'Popular',
  },
  {
    id: 3,
    slug: 'automating-repetitive-tasks',
    title: '5 IT Tasks You Should Automate Right Now',
    excerpt:
      "Password resets, software provisioning, incident categorization — these five workflows are costing your team hours every week. Here's how to automate them.",
    category: 'Automation',
    author: 'Amina Hassan',
    authorRole: 'IT Consultant',
    date: 'Feb 8, 2026',
    readTime: '5 min read',
  },
  {
    id: 4,
    slug: 'zero-trust-itsm',
    title: 'Zero Trust Security in Your ITSM Workflow',
    excerpt:
      "Integrating zero trust principles into your service desk doesn't have to be painful. We break down practical steps for access control, audit trails, and compliance.",
    category: 'Security',
    author: 'David Wholey',
    authorRole: 'Security Engineer',
    date: 'Feb 3, 2026',
    readTime: '7 min read',
  },
  {
    id: 5,
    slug: 'service-desk-metrics',
    title: '10 Service Desk Metrics That Actually Matter',
    excerpt:
      'First contact resolution, MTTR, customer satisfaction — but are you measuring the right things? We review the metrics that drive real improvement.',
    category: 'Analytics',
    author: 'Sarah Kennedy',
    authorRole: 'Head of Product',
    date: 'Jan 28, 2026',
    readTime: '9 min read',
  },
  {
    id: 6,
    slug: 'helpedge-v2-4',
    title: "What's New in HelpEdge v2.4.0",
    excerpt:
      "AI ticket categorization, redesigned dashboards, new SLA breach alerts, and 14 quality-of-life improvements are now live. Here's everything that changed.",
    category: 'Product Updates',
    author: 'James Jade',
    authorRole: 'Solutions Architect',
    date: 'Jan 20, 2026',
    readTime: '4 min read',
    tag: 'New',
  },
  {
    id: 7,
    slug: 'knowledge-base-best-practices',
    title: 'Building a Knowledge Base Your Team Will Actually Use',
    excerpt:
      'A poorly maintained knowledge base is worse than none at all. Learn the structure, tagging, and maintenance habits that keep self-service working.',
    category: 'Best Practices',
    author: 'Amina Wanjiru',
    authorRole: 'IT Consultant',
    date: 'Jan 15, 2026',
    readTime: '6 min read',
  },
  {
    id: 8,
    slug: 'change-management-checklist',
    title: 'The Change Management Checklist for Risk-Free Deployments',
    excerpt:
      'Emergency changes that go wrong are costly. Use this CAB-approved checklist to assess risk, communicate changes, and roll back safely when needed.',
    category: 'ITSM',
    author: 'David Wholey',
    authorRole: 'Security Engineer',
    date: 'Jan 9, 2026',
    readTime: '7 min read',
  },
];

const TESTIMONIALS = [
  {
    quote:
      'The blog content here is genuinely actionable. We implemented the SLA guide and cut our breach rate by 40% in a month.',
    author: 'Rebecca Brown',
    role: 'IT Director, FinServe Africa',
    initials: 'RO',
  },
  {
    quote:
      "HelpEdge's blog keeps us ahead of the curve. The AI and automation articles alone have saved us countless hours of research.",
    author: 'Tom Kassandra',
    role: 'CTO, BuildTech Kenya',
    initials: 'TK',
  },
  {
    quote:
      "We share articles from this blog in our team Slack every week. It's become our go-to reference for IT service management.",
    author: 'Linet Albraight',
    role: 'Service Desk Manager, MediCorp',
    initials: 'LA',
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  ITSM: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  Automation: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
  Security: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  Analytics: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  'Best Practices': 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  'Product Updates': 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
};

const TAG_COLORS: Record<string, string> = {
  Trending: 'bg-orange-500 text-white',
  Popular: 'bg-blue-600 text-white',
  New: 'bg-emerald-500 text-white',
};

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 animate-pulse">
      <div className="h-4 w-24 bg-muted rounded-full mb-4" />
      <div className="h-6 bg-muted rounded-lg mb-2" />
      <div className="h-4 bg-muted rounded-lg mb-1 w-5/6" />
      <div className="h-4 bg-muted rounded-lg mb-6 w-4/6" />
      <div className="flex items-center gap-3 mt-auto">
        <div className="w-8 h-8 rounded-full bg-muted" />
        <div className="h-3 w-32 bg-muted rounded-full" />
      </div>
    </div>
  );
}

function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;

    if (!el) {return;}
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

function BlogCard({ post, index }: { post: Post; index: number }) {
  const { ref, visible } = useFadeIn();
  const initials = post.author
    .split(' ')
    .map((n) => n[0])
    .join('');

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${index * 80}ms` }}
      className={`group relative flex flex-col rounded-2xl border border-border bg-card p-6 transition-all duration-500 ease-out
        hover:shadow-xl hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
    >
      {/* Tag */}
      {post.tag && (
        <span
          className={`absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full ${TAG_COLORS[post.tag]}`}
        >
          {post.tag}
        </span>
      )}

      {/* Category */}
      <span
        className={`text-xs font-semibold px-2.5 py-1 rounded-full w-fit mb-4 ${CATEGORY_COLORS[post.category]}`}
      >
        {post.category}
      </span>

      {/* Title */}
      <h3 className="font-bold text-lg leading-snug mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
        {post.title}
      </h3>

      {/* Excerpt */}
      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-6 flex-1">
        {post.excerpt}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-xs font-medium leading-none">{post.author}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{post.date}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          {post.readTime}
        </div>
      </div>

      {/* Hover arrow */}
      <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
        <ArrowRight className="w-4 h-4 text-blue-600" />
      </div>
    </div>
  );
}

function FeaturedPost({ post }: { post: Post }) {
  const { ref, visible } = useFadeIn();

  return (
    <div
      ref={ref}
      className={`group relative rounded-3xl border border-border bg-gradient-to-br from-blue-600 to-blue-800 p-8 md:p-12 text-white overflow-hidden transition-all duration-700 cursor-pointer
        hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />

      <div className="relative z-10 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <span className="bg-white/20 backdrop-blur text-white text-xs font-semibold px-3 py-1 rounded-full">
            {post.category}
          </span>
          <span className="bg-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Featured
          </span>
        </div>

        <h2 className="text-2xl md:text-4xl font-bold leading-tight mb-4 group-hover:text-blue-100 transition-colors">
          {post.title}
        </h2>

        <p className="text-blue-100 leading-relaxed mb-8 text-sm md:text-base">{post.excerpt}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">
              SK
            </div>
            <div>
              <p className="text-sm font-semibold">{post.author}</p>
              <p className="text-xs text-blue-200">
                {post.date} · {post.readTime}
              </p>
            </div>
          </div>
          <Link
            href={`/resources/blog/${post.slug}`}
            className="flex items-center gap-2 bg-white text-blue-700 text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors"
          >
            Read article <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function Newsletter() {
  const { ref, visible } = useFadeIn();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <div
      ref={ref}
      className={`rounded-3xl border border-border bg-muted/40 px-8 py-12 text-center transition-all duration-700
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-4">
        <BookOpen className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-2xl font-bold mb-2">Stay ahead of the curve</h3>
      <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
        Get the latest ITSM insights, product updates, and best practices delivered to your inbox
        every week. No spam, ever.
      </p>
      {submitted ? (
        <div className="text-emerald-600 font-semibold text-sm">
          <Check className="w-4 h-4 text-teal-400 mr-2 inline" /> You&rsquo;re subscribed! Check
          your inbox for a confirmation.
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (email) {setSubmitted(true);}
          }}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
            className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors shrink-0"
          >
            Subscribe
          </button>
        </form>
      )}
      <p className="text-xs text-muted-foreground mt-3">
        Join 4,200+ IT professionals. Unsubscribe anytime.
      </p>
    </div>
  );
}

function Testimonials() {
  const { ref, visible } = useFadeIn();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      <h3 className="text-xl font-bold mb-6 text-center">What readers are saying</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TESTIMONIALS.map((t, i) => (
          <div
            key={i}
            style={{ transitionDelay: `${i * 100}ms` }}
            className="rounded-2xl border border-border bg-card p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            <div className="text-3xl text-blue-200 dark:text-blue-800 font-serif mb-3">"</div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5 italic">{t.quote}</p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {t.initials}
              </div>
              <div>
                <p className="text-xs font-semibold">{t.author}</p>
                <p className="text-[10px] text-muted-foreground">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BlogPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);

    return () => clearTimeout(t);
  }, []);

  const featuredPost = POSTS.find((p) => p.featured);
  const filtered = POSTS.filter((p) => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.excerpt.toLowerCase().includes(search.toLowerCase());

    return matchesCategory && matchesSearch && !p.featured;
  });

  return (
    <>
      <NavHeader />
      <main className="max-w-6xl mx-auto px-6 py-16 space-y-16">
        {/* ── Page Header ── */}
        <div className="text-center space-y-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-blue-600">
            <img src={siteConfig.logo} className="h-15 inline-block mr-1" />
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Insights for modern IT teams
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Practical guides, product updates, and ITSM best practices from the people building
            HelpEdge.
          </p>
        </div>

        {/* ── Featured Post ── */}
        {featuredPost && <FeaturedPost post={featuredPost} />}

        {/* ── Search + Filter ── */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-200
                ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── Cards Grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No articles found</p>
            <p className="text-sm">Try a different search or category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post, i) => (
              <Link key={post.id} href={`/resources/blog/${post.slug}`}>
                <BlogCard post={post} index={i} />
              </Link>
            ))}
          </div>
        )}

        {/* ── Testimonials ── */}
        <Testimonials />

        {/* ── Newsletter ── */}
        <Newsletter />
      </main>
    </>
  );
}
