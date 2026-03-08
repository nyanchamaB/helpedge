import { Monitor, Settings, BarChart3 } from "lucide-react";

// Navigation links for in-page sections
export const navLinks = [
  {
    label: "Features",
    href: "/features",
    dropdown: [
     { label: "Incident Management", href: "/features/incident-management" },
      { label: "Self-Service Portal", href: "/features/self-service-portal" },
      { label: "Multi-Channel Support", href: "/features/multi-channel-support" },
      { label: "Collaboration Tools", href: "/features/collaboration-tools" },
      { label: "User Management", href: "/features/user-management" },
      { label: "Reporting & Dashboards", href: "/features/reporting-dashboards" },
    ],
  },
  {
    label: "Resources",
    href: "/resources",
    dropdown: [
      { label: "Blog", href: "/resources/blog" },
      { label: "Docs", href: "/resources/docs" },
      { label: "Ebooks", href: "/resources/ebooks" },
      { label: "Case Studies", href: "/resources/case-studies" },
      { label: "API Reference", href: "/resources/api-reference" },
      { label: "Release Notes", href: "/resources/release-notes" },
      { label: "Tutorials", href: "/resources/tutorials" },
    ],
  },
  { label: "Services", href: "/services" },
];

// Features section data
export const features = [
  {
    icon: <Monitor className="w-12 h-12 text-blue-700" />,
    title: "Service Desk",
    desc: "Centralized support for IT requests.",
  },
  {
    icon: <Settings className="w-12 h-12 text-blue-700" />,
    title: "Automation",
    desc: "Automate repetitive IT processes.",
  },
  {
    icon: <BarChart3 className="w-12 h-12 text-blue-700" />,
    title: "Analytics",
    desc: "Get insights from your service data.",
  },
];

export const ebooks = [
  {
    id: 1,
    title: "The Future of AI in Business",
    description: "Explore how AI is transforming modern businesses and creating new opportunities.",
    image: "/ebooks/ai-business.jpg",
    type: "E-book",
    author: "John Smith",
    pages: 42,
    tags: ["AI", "Business", "Innovation"],
    premium: true,
    rating: 4.5,
    views: 1200,
    readtime: "15 min read",
    downloadUrl: "#"
  },
  {
    id: 2,
    title: "Sustainable Growth Strategies",
    description: "Practical guide for building sustainable growth in modern organizations.",
    image: "/ebooks/sustainable-growth.jpg",
    type: "E-book",
    author: "Emily Johnson",
    pages: 35,
    tags: ["Sustainability", "Growth", "Strategy"],
    premium: false,
    rating: 4.2,
    views: 800,
    readtime: "12 min read",
    downloadUrl: "#"
  },
  {
    id: 3,
    title: "Case Study: Digital Transformation",
    description: "How Company X successfully navigated digital transformation challenges.",
    image: "/ebooks/digital-transformation.jpg",
    type: "Case Study",
    author: "Michael Lee",
    pages: 18,
    tags: ["Case Study", "Technology", "Transformation"],
    premium: false,
    rating: 4.8,
    views: 1500,
    readtime: "8 min read",
    downloadUrl: "#"
  },
  {
    id: 4,
    title: "Webinar: Future of Remote Work",
    description: "Expert panel discussion on the evolving landscape of remote work.",
    image: "/ebooks/remote-work.jpg",
    type: "Webinar",
    author: "Panel Experts",
    pages: 28,
    tags: ["Remote Work", "Future", "Workplace"],
    premium: true,
    rating: 4.6,
    views: 1000,
    readtime: "20 min read",
    downloadUrl: "#"
  },
  {
    id: 5,
    title: "Industry Report 2024",
    description: "Comprehensive analysis of industry trends and future predictions.",
    image: "/ebooks/industry-report.jpg",
    type: "Report",
    author: "Research Team",
    pages: 52,
    tags: ["Report", "Trends", "Market"],
    premium: false,
    rating: 4.3,
    views: 600,
    readtime: "25 min read",
    downloadUrl: "#"
  }
] as const;

// Metrics section data
export const metrics = [
  { value: "95%", label: "Faster Resolution" },
  { value: "80%", label: "Reduced Downtime" },
  { value: "70%", label: "Improved Efficiency" },
];

// Testimonials section data
export const testimonials = [
  {
    quote: '"HelpEdge cut our response times in half!"',
    author: "– TechCorp CIO",
  },
  {
    quote: '"Finally, an ITSM platform that scales with us."',
    author: "– FinServe CTO",
  },
];

export const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Incident Management", href: "/features/incident-management" },
      { label: "Self-Service Portal", href: "/features/self-service-portal" },
      { label: "Reporting & Dashboards", href: "/features/reporting-dashboards" },
      { label: "Collaboration Tools", href: "/features/collaboration-tools" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/resources/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Help Center", href: "/help-center" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
  {
    title: "Follow Us",
    links: [
      { label: "Twitter", href: "https://twitter.com/HelpEdge" },
      { label: "LinkedIn", href: "https://www.linkedin.com/company/helpedge/" },
      { label: "Facebook", href: "https://www.facebook.com/HelpEdge" },
    ],
  },
];

