import React from 'react';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import { DocumentTextIcon } from 'lucide-react';

const TasksPage = () => {
  return (
    <div>
      <PageHeader
        title="Tasks"
        subtitle="Manage your to-do items and assignments"
      />
      
      <Card className="text-center py-12">
        <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Tasks Coming Soon
        </h3>
        <p className="text-gray-500">
          Task management functionality will be available in the next update.
        </p>
      </Card>
    </div>
  );
};

export default TasksPage;