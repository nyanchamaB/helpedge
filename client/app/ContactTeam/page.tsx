'use client';
import NavHeader from '@/app/onboarding/navsection';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import React, { useEffect } from 'react';
import { useForm, ValidationError } from '@formspree/react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, CheckmarkCircle03Icon } from '@hugeicons/core-free-icons';

const companySizes = [
  '1-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '501-1000 employees',
  '1000+ employees',
];

const inquiryTypes = [
  'Schedule a demo',
  'Partnership opportunity',
  'Product information',
  'Technical support',
  'Pricing inquiry',
  'Other',
];

export default function ContactTeamPage() {
  const [state, handleSubmit] = useForm('mwvwvwrb');

  useEffect(() => {
    if (state.succeeded) {
      window.scrollTo({ top: 0, behavior: 'smooth' });

      const timer = setTimeout(() => {
        window.location.href = '/ContactTeam';
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [state.succeeded]);

  return (
    <>
      <NavHeader />
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 p-6">
        <div className="max-w-4xl mx-auto pt-12">
          <h1 className="text-4xl font-bold mb-6 text-center text-gray-900">Contact Our Team</h1>
          <p className="text-center text-gray-600 mb-8">
            We are happy to answer questions and get you acquainted with HelpEdge.
          </p>

          {/* New Feature Highlights Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-lg mb-2 text-blue-600">Schedule a demo</h3>
              <p className="text-gray-600">See our product in action with a personalized demo.</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-lg mb-2 text-blue-600">Get pricing information</h3>
              <p className="text-gray-600">Learn about our flexible pricing options.</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-lg mb-2 text-blue-600">Explore use cases</h3>
              <p className="text-gray-600">Discover how teams like yours use our platform.</p>
            </div>
          </div>

          <p className="text-center text-gray-600 mb-8">
            For technical issues and product questions, please visit our{' '}
            <a href="/help" className="text-blue-600 hover:underline">
              Help Center
            </a>
            .
          </p>

          <Card className="p-8 shadow-xl bg-white/95 backdrop-blur-sm rounded-xl hover:shadow-2xl transition-shadow duration-300">
            <form
              className="space-y-6"
              action="https://formspree.io/f/mwvwvwrb"
              method="POST"
              onSubmit={handleSubmit}
            >
              {/* Success banner */}
              {state.succeeded && (
                <div className="flex items-center gap-3 bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-md text-sm">
                  <span className="text-lg">
                    <HugeiconsIcon
                      icon={CheckmarkCircle03Icon}
                      size={24}
                      className="text-teal-400"
                      strokeWidth={1.5}
                    />
                  </span>
                  <div>
                    <p className="font-semibold">Inquiry submitted successfully!</p>
                    <p className="text-green-600 text-xs mt-0.5">
                      Our team will be in touch shortly. Redirecting you back...
                    </p>
                  </div>
                </div>
              )}

              {/* Error banner */}
              {state.errors && Object.keys(state.errors).length > 0 && !state.succeeded && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-md text-sm">
                  <span className="text-lg">
                    <HugeiconsIcon
                      icon={Cancel01Icon}
                      size={24}
                      className="text-red-400"
                      strokeWidth={1.5}
                    />
                  </span>
                  <div>
                    <p className="font-semibold">Submission failed.</p>
                    <p className="text-red-600 text-xs mt-0.5">
                      Please check your details and try again.
                    </p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name & Last Name */}
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" name="firstName" placeholder="John" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" name="lastName" placeholder="Doe" required />
                </div>

                {/* Company Email & Role */}
                <div className="space-y-2">
                  <Label htmlFor="email">Company Email</Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="john@company.com"
                    required
                  />
                  <ValidationError prefix="Email" field="email" errors={state.errors} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" name="role" placeholder="Senior Manager" required />
                </div>

                {/* Country & Phone */}
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" name="country" type="country" placeholder="i.e. Spain" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" name="phone" type="tel" placeholder="+1 (555) 000-0000" />
                </div>

                {/* Company Name & Size */}
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input id="companyName" name="companyName" placeholder="Acme Inc." required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companySize">Company Size</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      {companySizes.map((size) => (
                        <SelectItem key={size} value={size.toLowerCase()}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Inquiry Type - Full Width */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="inquiryType">What is your inquiry about?</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select inquiry type" />
                    </SelectTrigger>
                    <SelectContent>
                      {inquiryTypes.map((type) => (
                        <SelectItem key={type} value={type.toLowerCase()}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Additional Information - Full Width */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
                  <Textarea
                    id="additionalInfo"
                    name="additionalInfo"
                    placeholder="Tell us more about your needs..."
                    className="min-h-[100px]"
                  />
                  <ValidationError
                    prefix="additionalInfo"
                    field="additionalInfo"
                    errors={state.errors}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-start mt-6">
                <Button
                  type="submit"
                  className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={state.submitting}
                >
                  Submit Inquiry
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}
