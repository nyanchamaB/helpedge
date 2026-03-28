"use client";
import { useNavigation } from '@/contexts/NavigationContext';
import { useCategory } from '@/hooks/service-request-category/useCategories';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Edit,
  CheckCircle,
  XCircle,
  Users,
  Clock,
  Hash,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';
import { CategoryIcon } from '@/components/service-request-category/CategoryIcon';
import { Spinner } from '@/components/ui/spinner';
import { useRouter } from 'next/navigation';
export default function CategoryDetailPage() {
  const { activePage, pageParams, navigateTo } = useNavigation();
  const id = pageParams?.id ?? activePage.split('/').pop() ?? '';
  const router = useRouter();
  const { data: categoryResponse, isLoading } = useCategory(id);
  const category = categoryResponse?.data;

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Category not found</h2>
          <p className="text-gray-500 mt-2">
            The category you&rsquo;re looking for doesn&rsquo;t exist.
          </p>
          <Button className="mt-4" onClick={() => router.push(pageParams?.from ?? '/service-categories')}>Back to Categories</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" className="gap-2" onClick={() => router.push(pageParams?.from ?? '/service-categories')}>
          <ArrowLeft className="h-4 w-4" />
          Back to Categories
        </Button>

        <Button variant="outline" className="gap-2" onClick={() => router.push(`/service-categories/${id}/edit`)}>
          <Edit className="h-4 w-4" />
          Edit Category
        </Button>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <div
            className="flex items-center justify-center w-12 h-12 rounded-lg"
            style={{ backgroundColor: `${category.color}20` }}
          >
            <CategoryIcon icon={category.icon} color={category.color} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{category.name}</h1>
            <div className="flex items-center space-x-3 mt-2">
              <Badge variant={category.isActive ? "default" : "secondary"}>
                <div className="flex items-center space-x-1">
                  {category.isActive ? (
                    <>
                      <CheckCircle className="h-3 w-3" />
                      <span>Active</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3" />
                      <span>Inactive</span>
                    </>
                  )}
                </div>
              </Badge>
              <Badge variant="outline">{category.requestType}</Badge>
              {category.requiresApproval && (
                <Badge variant="destructive">Requires Approval</Badge>
              )}
            </div>
          </div>
        </div>
        <p className="text-gray-600 mt-4">{category.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fulfillment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Estimated Time</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">
                      {category.estimatedFulfillmentDays} days
                    </span>
                  </div>
                </div>
                
                {category.defaultWorkflowId && (
                  <div>
                    <p className="text-sm text-gray-500">Workflow ID</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Hash className="h-4 w-4 text-gray-400" />
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {category.defaultWorkflowId}
                      </code>
                    </div>
                  </div>
                )}
              </div>

              {category.fulfillmentRoles && category.fulfillmentRoles.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Fulfillment Roles</p>
                  <div className="flex flex-wrap gap-2">
                    {category.fulfillmentRoles.map((role, index) => (
                      <Badge key={index} variant="outline">
                        <Users className="h-3 w-3 mr-1" />
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Required Fields */}
          {category.requiredFields && category.requiredFields.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Required Fields ({category.requiredFields.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {category.requiredFields
                    .sort((a, b) => a.order - b.order)
                    .map((field, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <span className="font-medium">{field.label}</span>
                            <Badge variant="outline" className="text-xs">
                              {field.type}
                            </Badge>
                            {field.isRequired && (
                              <Badge variant="destructive" className="text-xs">
                                Required
                              </Badge>
                            )}
                          </div>
                          <code className="text-sm text-gray-500">{field.name}</code>
                        </div>

                        {field.helpText && (
                          <p className="text-sm text-gray-500 mt-2">{field.helpText}</p>
                        )}

                        {field.options && field.options.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm text-gray-500 mb-1">Options:</p>
                            <div className="flex flex-wrap gap-2">
                              {field.options.map((option, optIndex) => (
                                <Badge key={optIndex} variant="secondary">
                                  {option}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Keywords */}
          {category.keywords && category.keywords.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Keywords</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {category.keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle>Timestamps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {category.createdAt && (
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>
                      {(() => {
                        try {
                          return format(new Date(category.createdAt), 'PPpp');
                        } catch {
                          return 'N/A';
                        }
                      })()}
                    </span>
                  </div>
                </div>
              )}

              {category.createdAt && category.updatedAt && <Separator />}

              {category.updatedAt && (
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>
                      {(() => {
                        try {
                          return format(new Date(category.updatedAt), 'PPpp');
                        } catch {
                          return 'N/A';
                        }
                      })()}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
