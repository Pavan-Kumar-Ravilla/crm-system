import React from 'react';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import { PhoneIcon } from 'lucide-react';

const CallsPage = () => {
  return (
    <div>
      <PageHeader
        title="Calls"
        subtitle="Track and manage your phone communications"
      />
      
      <Card className="text-center py-12">
        <PhoneIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Call Tracking Coming Soon
        </h3>
        <p className="text-gray-500">
          Call logging and tracking features will be available soon.
        </p>
      </Card>
    </div>
  );
};

export default CallsPage;