import React from 'react';
import { DataNotFoundState } from '@/components/DataNotFoundState';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <DataNotFoundState
        title="Page Not Found"
        description="The page or resource you are looking for doesn't exist or has been moved."
        primaryAction={{
          label: 'Return to Dashboard',
          href: '/dashboard'
        }}
        secondaryAction={{
          label: 'Create New Kit',
          href: '/new'
        }}
      />
    </div>
  );
}
