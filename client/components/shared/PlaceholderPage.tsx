'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Construction, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PlaceholderPageProps {
  title: string;
  description: string;
  features?: string[];
  comingSoon?: boolean;
}

export function PlaceholderPage({
  title,
  description,
  features = [],
  comingSoon = true,
}: PlaceholderPageProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            {comingSoon && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                Coming Soon
              </Badge>
            )}
          </div>
          <p className="text-gray-600 mt-2">{description}</p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Main content placeholder */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Construction className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <CardTitle>Page Under Development</CardTitle>
              <CardDescription>
                This feature is currently being developed and will be available soon.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        {features.length > 0 && (
          <CardContent>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Planned Features:</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="min-w-[1.5rem] h-6 flex items-center justify-center">
                      <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Demo content cards to show scrolling */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Sample Card {i}</CardTitle>
              <CardDescription>
                This is a placeholder card to demonstrate the scrolling functionality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Content for this section will be populated once the feature is implemented. This
                card is here to show how the layout handles multiple items.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
