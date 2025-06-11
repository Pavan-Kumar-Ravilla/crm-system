import React from 'react';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import { BarChart3Icon } from 'lucide-react';

const ReportsPage = () => {
  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Analyze your sales performance and metrics"
      />
      
      <Card className="text-center py-12">
        <BarChart3Icon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Advanced Reports Coming Soon
        </h3>
        <p className="text-gray-500">
          Detailed analytics and reporting features are in development.
        </p>
      </Card>
    </div>
  );
};

export default ReportsPage;
