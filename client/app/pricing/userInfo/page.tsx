"use client";
import React from "react";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

export default function UserDetails() {
  return (
    <div>
        <Card className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
                User Information
            </h1>
            <div className="mb-4">
                <Label htmlFor="name" className="block mb-2">Name</Label>
                <Input id="name" type="text" placeholder="Enter your name" className="w-full" />
            </div>
            <div className="mb-4">
                <Label htmlFor="email" className="block mb-2">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email" className="w-full" />
            </div>
            <div className="mb-4">
                <Label htmlFor="phone" className="block mb-2">Phone</Label>
                <Input id="phone" type="tel" placeholder="Enter your phone number" className="w-full" />
            </div>
            <div className="mb-4">
                <Label htmlFor="company" className="block mb-2">Company</Label>
                <Input id="company" type="text" placeholder="Enter your company name" className="w-full" />
            </div>
        </Card>
    </div>
  );
}