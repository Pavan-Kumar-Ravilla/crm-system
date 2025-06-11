import React from 'react';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { CalendarIcon, PhoneIcon, MailIcon, UserIcon } from 'lucide-react';

const mockActivities = [
  {
    id: 1,
    type: 'call',
    subject: 'Follow-up call with TechCorp',
    description: 'Discussed project requirements and timeline',
    contactName: 'Emily Brown',
    accountName: 'TechCorp Inc',
    dueDate: '2024-01-20T10:00:00Z',
    status: 'Completed'
  },
  {
    id: 2,
    type: 'email',
    subject: 'Proposal sent to Innovate Solutions',
    description: 'Sent detailed proposal with pricing options',
    contactName: 'Robert Wilson',
    accountName: 'Innovate Solutions',
    dueDate: '2024-01-19T14:30:00Z',
    status: 'Completed'
  },
  {
    id: 3,
    type: 'meeting',
    subject: 'Demo scheduled with FuturePro',
    description: 'Product demonstration and Q&A session',
    contactName: 'Lisa Anderson',
    accountName: 'FuturePro Systems',
    dueDate: '2024-01-22T15:00:00Z',
    status: 'Scheduled'
  }
];

const getActivityIcon = (type) => {
  const icons = {
    call: PhoneIcon,
    email: MailIcon,
    meeting: CalendarIcon,
    task: UserIcon
  };
  const Icon = icons[type] || UserIcon;
  return <Icon className="w-5 h-5" />;
};

const ActivitiesPage = () => {
  return (
    <div>
      <PageHeader
        title="Activities"
        subtitle="Track all your customer interactions and tasks"
      />

      <div className="space-y-4">
        {mockActivities.map((activity) => (
          <Card key={activity.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-primary-50 rounded-lg">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {activity.subject}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {activity.description}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span>{activity.contactName}</span>
                    <span>•</span>
                    <span>{activity.accountName}</span>
                    <span>•</span>
                    <span>{new Date(activity.dueDate).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <Badge variant={activity.status === 'Completed' ? 'success' : 'warning'}>
                {activity.status}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ActivitiesPage;
