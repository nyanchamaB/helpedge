'use client';
import NavHeader from '../onboarding/navsection';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Ticket, Users, Zap, Clock, BarChart2, ShieldCheck } from 'lucide-react';

export default function ServicesPage() {
  return (
    <>
      <NavHeader />
      <div className="container mx-auto py-12">
        {/* Hero */}
        <section className="text-center mb-12">
          <h1 className="text-4xl font-extrabold mb-4">Ticketing Management System</h1>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            Streamline support operations with intelligent ticket routing, automated workflows, and
            comprehensive visibility across all customer interactions.
          </p>
          {/*<div className="flex items-center justify-center gap-4">
          <Link href="/GetStarted">
            <Button className="px-6">Request Demo</Button>
          </Link>
          <Link href="/ContactTeam/page">
            <Button variant="outline" className="px-6">Contact Sales</Button>
          </Link>
        </div>
        */}
        </section>

        {/* Core Capabilities */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Core Capabilities</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Ticket className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Ticket Management</h3>
              </div>
              <p className="text-sm text-gray-600">
                Create, track, and manage support tickets with automatic categorization and priority
                assignment.
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Assignment & Routing</h3>
              </div>
              <p className="text-sm text-gray-600">
                Intelligent routing based on agent skills, availability and workload for optimal
                resolution times.
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Zap className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Automation & Workflows</h3>
              </div>
              <p className="text-sm text-gray-600">
                Automated escalations, SLA tracking, and workflow automation to improve efficiency
                and transparency.
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">SLA Management</h3>
              </div>
              <p className="text-sm text-gray-600">
                Define and monitor SLAs with real-time alerts, escalations and compliance reporting.
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <BarChart2 className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Analytics & Insights</h3>
              </div>
              <p className="text-sm text-gray-600">
                Track KPIs: resolution time, satisfaction scores, agent productivity and customer
                trends.
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Security & Access Control</h3>
              </div>
              <p className="text-sm text-gray-600">
                Role-based permissions, audit trails, encryption and compliance with privacy
                regulations.
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">How it works</h2>
          <ol className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <li className="flex-1 p-4 border rounded-lg">
              <strong className="block mb-1">1. Create</strong>
              <span className="text-sm text-gray-600">
                Customers submit tickets via web, email, chat or API.
              </span>
            </li>
            <li className="flex-1 p-4 border rounded-lg">
              <strong className="block mb-1">2. Categorize</strong>
              <span className="text-sm text-gray-600">
                Automatic categorization and priority assignment based on rules.
              </span>
            </li>
            <li className="flex-1 p-4 border rounded-lg">
              <strong className="block mb-1">3. Route</strong>
              <span className="text-sm text-gray-600">
                Intelligent assignment to the best available agent.
              </span>
            </li>
            <li className="flex-1 p-4 border rounded-lg">
              <strong className="block mb-1">4. Resolve</strong>
              <span className="text-sm text-gray-600">
                Collaborate with team and customers to resolve issues quickly.
              </span>
            </li>
            <li className="flex-1 p-4 border rounded-lg">
              <strong className="block mb-1">5. Analyze</strong>
              <span className="text-sm text-gray-600">
                Track metrics and improve support performance continuously.
              </span>
            </li>
          </ol>
        </section>

        {/* Integrations & CTA */}
        <section className="mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold mb-2">Integrations & Extensibility</h3>
              <p className="text-gray-600 mb-3">
                Native integrations with helpdesk tools, CRM systems, communication platforms and
                custom apps via REST APIs and webhooks.
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-gray-700">
                <span className="px-3 py-1 border rounded">Email</span>
                <span className="px-3 py-1 border rounded">Chat</span>
                <span className="px-3 py-1 border rounded">CRM</span>
                <span className="px-3 py-1 border rounded">Knowledge Base</span>
                <span className="px-3 py-1 border rounded">Analytics</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Link href="/GetStarted">
                <Button>Start a Trial</Button>
              </Link>
              <Link href="/resources/docs">
                <Button variant="outline">Developer Docs</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="text-center py-8 border-t">
          <h4 className="text-lg font-semibold mb-2">
            Ready to streamline your support operations?
          </h4>
          <div className="flex items-center justify-center gap-4">
            <Link href="/GetStarted">
              <Button className="px-6">Request Demo</Button>
            </Link>
            <Link href="/ContactTeam/page">
              <Button variant="outline" className="px-6">
                Contact Us
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
