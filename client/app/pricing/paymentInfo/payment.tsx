'use client';
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function PaymentInfo() {
  return (
    <div>
      <Card className="p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Payment Information</h1>
        <div className="mb-4">
          <Label htmlFor="cardNumber" className="block mb-2">
            Card Number
          </Label>
          <Input
            id="cardNumber"
            type="text"
            placeholder="Enter your card number"
            className="w-full"
          />
        </div>
        <div className="mb-4">
          <Label htmlFor="expiryDate" className="block mb-2">
            Expiry Date
          </Label>
          <Input id="expiryDate" type="text" placeholder="MM/YY" className="w-full" />
        </div>
        <div className="mb-4">
          <Label htmlFor="cvv" className="block mb-2">
            CVV
          </Label>
          <Input id="cvv" type="text" placeholder="Enter your CVV" className="w-full" />
        </div>

        <div className="mb-4">
          <Label htmlFor="mpesa" className="block mb-2">
            Mpesa
          </Label>
          <Input id="mpesa" type="text" placeholder="Enter your Mpesa number" className="w-full" />
        </div>
        <div className="mb-4">
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Payment Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mpesa">Mpesa</SelectItem>
              <SelectItem value="card">Card</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>
    </div>
  );
}
