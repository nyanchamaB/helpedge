// for site-specific configuration

import { title } from "process";

export const siteConfig = {
    name: "HelpEdge Ticketing System",
    description: "A comprehensive ticketing system for efficient issue tracking and management.",
    mainNav: [
        {
            title: "Dashboard",
            href: "/dashboard",
        },
        {
            title: "Tickets",
            href: "/tickets",
        },
        {
            title: "Projects",
            href: "/projects",
        },
        {
            title: "Teams",
            href: "/teams",
        },
        {
            title: "Settings",
            href: "/settings",
        },
    ],
    links: {
        twitter: "https://twitter.com/itsmplatform",
        github: "https://github.com/itsmplatform",
        docs: "https://docs.itsmplatform.com",
    },

    navlinks: [
        { title: "Home", href: "/" },
        { title: "Features", href: "/features" },
        { title: "Resources", href: "/resources" },
        { title: "Support", href: "/support" },
    ],
    footerNav: [
        { title: "Privacy", href: "/privacy" },
        { title: "Terms", href: "/terms" },
    ],
    features: [
        { title: "Fast", description: "Quick ticket resolution.", Image: "/ticketresolution.PNG" },
        { title: "Secure", description: "Data protection." , Image: "/security.PNG" },
        { title: "User-Friendly", description: "Intuitive interface.", Image: "/userfriendly.PNG" },
        { title: "Customizable", description: "Tailored to your needs." , Image: "/customize.PNG" },
        { title: "Support", description: "24/7 customer support." , Image: "/support.PNG" },
    ],
    logo: "/globe.svg",  
    support: {
    title: "Support",
    description: "Get help with our ITSM platform",
    image: "/support.svg",
    links: {
      contact: "/contact",
      faqs: "/faqs",
      submitTicket: "/submit-ticket",
    },
    contact: {
      email: "support@itsmplatform.com",
      phone: "+254 700 000 000",
    },
    faqsLink: "/faqs",
    options: [
      {
        title: "Contact Us",
        description:
          "Reach out to our support team anytime via email or phone.",
      },
      {
        title: "FAQs",
        description: "Find answers to common questions about our ITSM platform.",
      },
      {
        title: "Submit a Ticket",
        description:
          "Report incidents or service requests directly from the platform.",
      },
    ],
    },

    resources: [
        { title: "Knowledge Base", description: "Access guides, troubleshooting steps, and best practices.", link: "/knowledge-base" },
        { title: "Documentation", description: "Read detailed technical documentation for the platform.", link: "/docs" },
        { title: "Video Tutorials", description: "Watch step-by-step tutorials to get started quickly.", link: "/videos" },
        { title: "Community Forum", description: "Engage with other users and our support team.", link: "/community" },
    ],

    footerLinks: [
        { title: "About", href: "/about" },
        { title: "Contact", href: "/contact" },
        { title: "Blog", href: "/blog" },
        { title: "Careers", href: "/careers" },
    ],
    socialLinks: {
        twitter: "https://twitter.com/yourprofile",
        facebook: "https://facebook.com/yourprofile",
        linkedin: "https://linkedin.com/in/yourprofile",
    },
    signupEnabled: true, // Toggle user sign-up availability
    apiBaseUrl: "https://api.yoursite.com", // Base URL for API requests
    analytics: {
        googleAnalyticsId: "UA-XXXXXX-X", // Google Analytics ID
        mixpanelToken: "your-mixpanel-token", // Mixpanel token
    },
    theme: {
        default: "system", // Default theme: 'light', 'dark', or 'system'
        allowSwitch: true, // Allow users to switch themes
    },
    i18n: {
        defaultLocale: "en", // Default language
        supportedLocales: ["en", "es", "fr", "de"], // Supported languages
    },
    notifications: {
        enableEmail: true, // Enable email notifications
        enableSMS: false, // Enable SMS notifications
    },
    performance: {
        enableCaching: true, // Enable caching for performance
        cacheDuration: 3600, // Cache duration in seconds
    },
    signupOptions: {
        google: true, // Enable Google sign-up
        facebook: false, // Enable Facebook sign-up
        linkedin: false, // Enable LinkedIn sign-up
    },
    companyName: "HelpEdge Inc.",
    year: new Date().getFullYear(),
    about: "HelpEdge is a leading provider of ITSM solutions, dedicated to improving service management for businesses worldwide.",
}