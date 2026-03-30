'use client';
import React from 'react';
import { Card } from '@/components/ui/card';

export default function Review() {
  return (
    <div>
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">Review Your Information</h2>
        <div className="border rounded p-4 space-y-2">
          <h3 className="font-medium">User Information</h3>
          <hr />
          <p>Name: John Doe</p>
          <p>Email: john.doe@example.com</p>
          <p>Phone: +1234567890</p>
          <p>Company: Example Inc.</p>
        </div>
        <div className="border rounded p-4 space-y-2">
          <h3 className="font-medium">Address Information</h3>
          <hr />
          <p>Street: 123 Main St</p>
          <p>City: Anytown</p>
          <p>State: CA</p>
          <p>Zip: 12345</p>
        </div>
        <div className="border rounded p-4 space-y-2">
          <h3 className="font-medium">Payment Information</h3>
          <hr />
          <p>Card Number: **** **** **** 1234</p>
          <p>Expiry Date: 12/25</p>
          <p>CVV: ***</p>
        </div>
      </Card>
    </div>
  );
}
