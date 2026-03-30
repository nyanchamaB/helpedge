'use client';
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

export default function AddressDetails() {
  return (
    <div>
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Address Information</h2>

        <div className="mb-4">
          <Label htmlFor="street" className="block mb-2">
            Street
          </Label>
          <Input
            id="street"
            type="text"
            placeholder="Enter your street address"
            className="w-full"
          />
        </div>

        <div className="mb-4">
          <Label htmlFor="city" className="block mb-2">
            City
          </Label>
          <Input id="city" type="text" placeholder="Enter your city" className="w-full" />
        </div>

        <div className="mb-4">
          <Label htmlFor="state" className="block mb-2">
            State
          </Label>
          <Input id="state" type="text" placeholder="Enter your state" className="w-full" />
        </div>

        <div className="mb-4">
          <Label htmlFor="zip" className="block mb-2">
            Zip Code
          </Label>
          <Input id="zip" type="text" placeholder="Enter your zip code" className="w-full" />
        </div>
      </Card>
    </div>
  );
}
