import React from 'react';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import { CogIcon } from 'lucide-react';

const SettingsPage = () => {
  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Configure your CRM system preferences"
      />
      
      <Card className="text-center py-12">
        <CogIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Settings Panel Coming Soon
        </h3>
        <p className="text-gray-500">
          System configuration options will be available in future updates.
        </p>
      </Card>
    </div>
  );
};

export default SettingsPage;