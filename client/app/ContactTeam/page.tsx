"use client";
import NavHeader from "@/app/onboarding/navsection";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import React from "react";

const companySizes = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "501-1000 employees",
  "1000+ employees",
];

const inquiryTypes = [
  "Schedule a demo",
  "Partnership opportunity",
  "Product information",
  "Technical support",
  "Pricing inquiry",
  "Other",
];

export default function ContactTeamPage() {
  return (
    <>
    <NavHeader />
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 p-6">
      <div className="max-w-4xl mx-auto pt-12">
        <h1 className="text-4xl font-bold mb-6 text-center text-gray-900">Contact Our Sales Team</h1>
        <p className="text-center text-gray-600 mb-8">
          We're happy to answer questions and get you acquainted with HelpEdge.
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
          For technical issues and product questions, please visit our{" "}
          <a href="/help" className="text-blue-600 hover:underline">Help Center</a>.
        </p>

        <Card className="p-8 shadow-xl bg-white/95 backdrop-blur-sm rounded-xl hover:shadow-2xl transition-shadow duration-300">
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name & Last Name */}
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="John" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Doe" required />
              </div>

              {/* Company Email & Role */}
              <div className="space-y-2">
                <Label htmlFor="email">Company Email</Label>
                <Input id="email" type="email" placeholder="john@company.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" placeholder="Senior Manager" required />
              </div>

              {/* Country & Phone */}
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="ca">Canada</SelectItem>
                    {/* Add more countries as needed */}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
              </div>

              {/* Company Name & Size */}
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input id="companyName" placeholder="Acme Inc." required />
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
                  placeholder="Tell us more about your needs..."
                  className="min-h-[100px]"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-start mt-6">
              <Button 
                type="submit" 
                className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white"
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