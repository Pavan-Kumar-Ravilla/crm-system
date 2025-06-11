import React from 'react';
import { 
  TrendingUpIcon, 
  UsersIcon, 
  BuildingIcon, 
  DollarSignIcon,
  PlusIcon
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/layout/LoadingSpinner';
import { useLeadStats } from '../hooks/useLeads';
import { useContactStats } from '../hooks/useContacts';
import { useAccountStats } from '../hooks/useAccounts';
import { useOpportunityStats } from '../hooks/useOpportunities';

const StatCard = ({ title, value, icon: Icon, change, changeType, isLoading }) => (
  <Card className="p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        {isLoading ? (
          <div className="h-8 w-20 bg-gray-200 animate-pulse rounded mt-1"></div>
        ) : (
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        )}
        {change && !isLoading && (
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

  // Fetch dashboard data
  const { data: leadStats, isLoading: loadingLeads } = useLeadStats();
  const { data: contactStats, isLoading: loadingContacts } = useContactStats();
  const { data: accountStats, isLoading: loadingAccounts } = useAccountStats();
  const { data: opportunityStats, isLoading: loadingOpportunities } = useOpportunityStats();

  const isLoading = loadingLeads || loadingContacts || loadingAccounts || loadingOpportunities;

  // Mock data for charts (replace with real data from API)
  const mockRevenueData = [
    { month: 'Jan', revenue: 180000 },
    { month: 'Feb', revenue: 220000 },
    { month: 'Mar', revenue: 190000 },
    { month: 'Apr', revenue: 280000 },
    { month: 'May', revenue: 310000 },
    { month: 'Jun', revenue: 290000 }
  ];

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
          value={leadStats?.data?.stats?.totalLeads?.toLocaleString() || '0'}
          icon={UsersIcon}
          change={8.2}
          changeType="positive"
          isLoading={loadingLeads}
        />
        <StatCard
          title="Total Contacts"
          value={contactStats?.data?.stats?.totalContacts?.toLocaleString() || '0'}
          icon={BuildingIcon}
          change={3.1}
          changeType="positive"
          isLoading={loadingContacts}
        />
        <StatCard
          title="Total Accounts"
          value={accountStats?.data?.stats?.totalAccounts?.toLocaleString() || '0'}
          icon={DollarSignIcon}
          change={-1.2}
          changeType="negative"
          isLoading={loadingAccounts}
        />
        <StatCard
          title="Revenue"
          value={`$${((opportunityStats?.data?.stats?.totalAmount || 0) / 1000000).toFixed(1)}M`}
          icon={TrendingUpIcon}
          change={12.5}
          changeType="positive"
          isLoading={loadingOpportunities}
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

        {/* Quick Stats */}
        <Card title="Quick Overview" className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Conversion Rate</span>
              <span className="font-semibold">
                {leadStats?.data?.stats?.conversionRate || 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Win Rate</span>
              <span className="font-semibold">
                {opportunityStats?.data?.stats?.winRate || 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Deal Size</span>
              <span className="font-semibold">
                ${(opportunityStats?.data?.stats?.avgAmount || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Opportunities</span>
              <span className="font-semibold">
                {opportunityStats?.data?.stats?.totalOpportunities || 0}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Sources */}
        <Card title="Lead Sources Distribution" className="p-6">
          {loadingLeads ? (
            <div className="h-32 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-3">
              {leadStats?.data?.stats?.bySource?.map((source, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-600">{source.source}</span>
                  <span className="font-semibold">{source.count}</span>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-4">No data available</p>
              )}
            </div>
          )}
        </Card>

        {/* Opportunity Stages */}
        <Card title="Opportunity Pipeline" className="p-6">
          {loadingOpportunities ? (
            <div className="h-32 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-3">
              {opportunityStats?.data?.stats?.byStage?.map((stage, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-600">{stage.stage}</span>
                  <span className="font-semibold">{stage.count}</span>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-4">No data available</p>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;