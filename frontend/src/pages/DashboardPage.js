import React from 'react';
import { useQuery } from 'react-query';
import { 
  TrendingUpIcon, 
  UsersIcon, 
  BuildingOfficeIcon, 
  CurrencyDollarIcon,
  PlusIcon
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '@/context/AuthContext';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/layout/LoadingSpinner';

// Mock data - replace with actual API calls
const mockStats = {
  totalLeads: 1245,
  totalContacts: 892,
  totalAccounts: 156,
  totalRevenue: 2450000,
  leadsThisMonth: 125,
  dealsWon: 45,
  conversionRate: 12.5
};

const mockRevenueData = [
  { month: 'Jan', revenue: 180000, leads: 95, deals: 12 },
  { month: 'Feb', revenue: 220000, leads: 110, deals: 15 },
  { month: 'Mar', revenue: 190000, leads: 85, deals: 11 },
  { month: 'Apr', revenue: 280000, leads: 130, deals: 18 },
  { month: 'May', revenue: 310000, leads: 145, deals: 22 },
  { month: 'Jun', revenue: 290000, leads: 125, deals: 20 }
];

const mockPipelineData = [
  { stage: 'Prospecting', count: 45, value: 450000 },
  { stage: 'Qualification', count: 32, value: 380000 },
  { stage: 'Proposal', count: 18, value: 290000 },
  { stage: 'Negotiation', count: 12, value: 180000 },
  { stage: 'Closed Won', count: 8, value: 120000 }
];

const mockLeadSources = [
  { name: 'Website', value: 35, color: '#3B82F6' },
  { name: 'Email Campaign', value: 25, color: '#10B981' },
  { name: 'Social Media', value: 20, color: '#F59E0B' },
  { name: 'Referral', value: 15, color: '#EF4444' },
  { name: 'Other', value: 5, color: '#6B7280' }
];

const mockRecentActivities = [
  {
    id: 1,
    type: 'lead_created',
    description: 'New lead created: John Smith from Acme Corp',
    timestamp: '2 hours ago',
    user: 'Sarah Johnson'
  },
  {
    id: 2,
    type: 'deal_won',
    description: 'Deal closed: $50,000 with TechStart Inc',
    timestamp: '4 hours ago',
    user: 'Mike Davis'
  },
  {
    id: 3,
    type: 'meeting_scheduled',
    description: 'Meeting scheduled with Global Solutions',
    timestamp: '6 hours ago',
    user: 'Emily Brown'
  },
  {
    id: 4,
    type: 'contact_updated',
    description: 'Contact information updated for Jane Doe',
    timestamp: '8 hours ago',
    user: 'Tom Wilson'
  }
];

const StatCard = ({ title, value, icon: Icon, change, changeType }) => (
  <Card className="p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {change && (
          <p className={`text-sm ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
            {changeType === 'positive' ? '+' : ''}{change}% from last month
          </p>
        )}
      </div>
      <div className="p-3 bg-primary-50 rounded-lg">
        <Icon className="h-6 w-6 text-primary-600" />
      </div>
    </div>
  </Card>
);

const DashboardPage = () => {
  const { user } = useAuth();

  // In a real app, you would fetch data using React Query
  const { data: stats, isLoading } = useQuery(
    'dashboard-stats',
    () => Promise.resolve(mockStats),
    { staleTime: 5 * 60 * 1000 }
  );

  if (isLoading) {
    return <LoadingSpinner size="lg" className="py-12" />;
  }

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.firstName}!`}
        subtitle="Here's what's happening with your CRM today"
        actions={[
          {
            label: 'Add Lead',
            icon: <PlusIcon />,
            onClick: () => console.log('Add lead'),
            variant: 'primary'
          }
        ]}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Leads"
          value={stats.totalLeads.toLocaleString()}
          icon={UsersIcon}
          change={8.2}
          changeType="positive"
        />
        <StatCard
          title="Total Contacts"
          value={stats.totalContacts.toLocaleString()}
          icon={BuildingOfficeIcon}
          change={3.1}
          changeType="positive"
        />
        <StatCard
          title="Total Accounts"
          value={stats.totalAccounts.toLocaleString()}
          icon={CurrencyDollarIcon}
          change={-1.2}
          changeType="negative"
        />
        <StatCard
          title="Revenue"
          value={`$${(stats.totalRevenue / 1000000).toFixed(1)}M`}
          icon={TrendingUpIcon}
          change={12.5}
          changeType="positive"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <Card title="Revenue Trend" className="p-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3B82F6" 
                  strokeWidth={2} 
                  dot={{ fill: '#3B82F6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Pipeline Chart */}
        <Card title="Sales Pipeline" className="p-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockPipelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" />
                <YAxis />
                <Tooltip formatter={(value) => [value.toLocaleString(), 'Count']} />
                <Bar dataKey="count" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Sources */}
        <Card title="Lead Sources" className="p-6">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockLeadSources}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name} ${value}%`}
                >
                  {mockLeadSources.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Activities */}
        <Card title="Recent Activities" className="p-6 lg:col-span-2">
          <div className="space-y-4">
            {mockRecentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">
                    {activity.timestamp} • {activity.user}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Button variant="ghost" size="sm" fullWidth>
              View all activities
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;