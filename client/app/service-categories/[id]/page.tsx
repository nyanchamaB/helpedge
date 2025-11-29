"use client";
//fetch service request categories by id

import { getServiceRequestCategoryById } from "@/lib/api/service-request-category";

export default async function ServiceRequestPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const data = await getServiceRequestCategoryById(id);
  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.description}</p>
    </div>
  );
}
