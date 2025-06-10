// src/components/dashboard/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import StatsCard from './StatsCard';
import RecentActivity from './RecentActivity';
import SalesChart from './SalesChart';
import PipelineChart from './PipelineChart';
import { leadsAPI, contactsAPI, accountsAPI, opportunitiesAPI, activitiesAPI } from '../../services/api';
import { PageSpinner } from '../common/Spinner';
import Button from '../common/Button';
import { 
  TrendingUp, 
  Users, 
  Building, 
  Target, 
  DollarSign, 
  Activity,
  Plus,
  ArrowRight,
  Calendar,
  Clock
} from 'lucide-react';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalLeads: 0,
      totalContacts: 0,
      totalAccounts: 0,
      totalOpportunities: 0,
      totalRevenue: 0,
      conversionRate: 0
    },
    recentActivities: [],
    upcomingActivities: [],
    topOpportunities: [],
    salesData: [],
    pipelineData: []
  });
  const [dateRange, setDateRange] = useState('30'); // days
  
  const { user } = useAuth();
  const { addNotification } = useApp();

  useEffect(() => {
    loadDashboardData();
  }, [dateRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));
      
      const params = {
        dateFrom: startDate.toISOString().split('T')[0],
        dateTo: endDate.toISOString().split('T')[0]
      };

      // Load all dashboard data in parallel
      const [
        leadsStats,
        contactsStats, 
        accountsStats,
        opportunitiesStats,
        recentActivities,
        upcomingActivities
      ] = await Promise.all([
        leadsAPI.getStats(params).catch(() => ({ totalLeads: 0, conversionRate: 0 })),
        contactsAPI.getStats(params).catch(() => ({ totalContacts: 0 })),
        accountsAPI.getStats(params).catch(() => ({ totalAccounts: 0 })),
        opportunitiesAPI.getStats(params).catch(() => ({ totalOpportunities: 0, totalRevenue: 0 })),
        activitiesAPI.getRecent({ limit: 10 }).catch(() => []),
        activitiesAPI.getUpcoming({ days: 7 }).catch(() => [])
      ]);

      // Get top opportunities
      const topOpportunities = await opportunitiesAPI.getAll({ 
        limit: 5, 
        sortBy: 'amount', 
        sortOrder: 'desc',
        stage: 'Negotiation,Proposal/Price Quote'
      }).catch(() => ({ opportunities: [] }));

      // Mock chart data (in real app, this would come from API)
      const salesData = generateSalesChartData();
      const pipelineData = generatePipelineChartData();

      setDashboardData({
        stats: {
          totalLeads: leadsStats.totalLeads || 0,
          totalContacts: contactsStats.totalContacts || 0,
          totalAccounts: accountsStats.totalAccounts || 0,
          totalOpportunities: opportunitiesStats.totalOpportunities || 0,
          totalRevenue: opportunitiesStats.totalRevenue || 0,
          conversionRate: leadsStats.conversionRate || 0
        },
        recentActivities: recentActivities || [],
        upcomingActivities: upcomingActivities || [],
        topOpportunities: topOpportunities.opportunities || [],
        salesData,
        pipelineData
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      addNotification({
        type: 'error',
        title: 'Error Loading Dashboard',
        message: 'Failed to load dashboard data. Please refresh the page.'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSalesChartData = () => {
    // Mock data for the last 12 months
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        leads: Math.floor(Math.random() * 50) + 20,
        opportunities: Math.floor(Math.random() * 30) + 10,
        revenue: Math.floor(Math.random() * 100000) + 50000
      });
    }
    return months;
  };

  const generatePipelineChartData = () => {
    return [
      { stage: 'Prospecting', count: 15, amount: 450000 },
      { stage: 'Qualification', count: 12, amount: 380000 },
      { stage: 'Needs Analysis', count: 8, amount: 290000 },
      { stage: 'Proposal', count: 6, amount: 220000 },
      { stage: 'Negotiation', count: 4, amount: 180000 },
      { stage: 'Closed Won', count: 3, amount: 120000 }
    ];
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return <PageSpinner message="Loading dashboard..." />;
  }

  return (
    <div className="slds-p-around_medium">
      {/* Header */}
      <div className="slds-page-header slds-page-header_record-home">
        <div className="slds-page-header__row">
          <div className="slds-page-header__col-title">
            <div className="slds-media">
              <div className="slds-media__figure">
                <span className="slds-icon_container slds-icon-standard-home">
                  <TrendingUp size={24} />
                </span>
              </div>
              <div className="slds-media__body">
                <div className="slds-page-header__name">
                  <div className="slds-page-header__name-title">
                    <h1>
                      <span className="slds-page-header__title slds-truncate">
                        {getGreeting()}, {user?.firstName || 'User'}!
                      </span>
                    </h1>
                  </div>
                </div>
                <p className="slds-page-header__name-meta">Here's your CRM overview</p>
              </div>
            </div>
          </div>
          <div className="slds-page-header__col-actions">
            <div className="slds-page-header__controls">
              <div className="slds-page-header__control">
                <select 
                  className="slds-select"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last year</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="slds-grid slds-wrap slds-gutters slds-m-top_large">
        <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-2 slds-large-size_1-of-4">
          <StatsCard
            title="Total Leads"
            value={dashboardData.stats.totalLeads}
            icon={<Target size={20} />}
            trend={+12}
            linkTo="/leads"
            color="blue"
          />
        </div>
        <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-2 slds-large-size_1-of-4">
          <StatsCard
            title="Total Contacts"
            value={dashboardData.stats.totalContacts}
            icon={<Users size={20} />}
            trend={+8}
            linkTo="/contacts"
            color="green"
          />
        </div>
        <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-2 slds-large-size_1-of-4">
          <StatsCard
            title="Total Accounts"
            value={dashboardData.stats.totalAccounts}
            icon={<Building size={20} />}
            trend={+5}
            linkTo="/accounts"
            color="purple"
          />
        </div>
        <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-2 slds-large-size_1-of-4">
          <StatsCard
            title="Revenue"
            value={formatCurrency(dashboardData.stats.totalRevenue)}
            icon={<DollarSign size={20} />}
            trend={+15}
            linkTo="/opportunities"
            color="orange"
          />
        </div>
      </div>

      {/* Charts Section */}
      <div className="slds-grid slds-wrap slds-gutters slds-m-top_large">
        <div className="slds-col slds-size_1-of-1 slds-large-size_2-of-3">
          <SalesChart data={dashboardData.salesData} />
        </div>
        <div className="slds-col slds-size_1-of-1 slds-large-size_1-of-3">
          <PipelineChart data={dashboardData.pipelineData} />
        </div>
      </div>

      {/* Content Grid */}
      <div className="slds-grid slds-wrap slds-gutters slds-m-top_large">
        {/* Recent Activities */}
        <div className="slds-col slds-size_1-of-1 slds-large-size_1-of-2">
          <div className="slds-card">
            <div className="slds-card__header slds-grid">
              <header className="slds-media slds-media_center slds-has-flexi-truncate">
                <div className="slds-media__figure">
                  <span className="slds-icon_container slds-icon-standard-task">
                    <Activity size={20} />
                  </span>
                </div>
                <div className="slds-media__body">
                  <h2 className="slds-card__header-title">
                    <span className="slds-text-heading_small">Recent Activities</span>
                  </h2>
                </div>
              </header>
              <div className="slds-no-flex">
                <Link to="/activities" className="slds-button slds-button_neutral">
                  View All
                  <ArrowRight size={16} className="slds-button__icon slds-button__icon_right" />
                </Link>
              </div>
            </div>
            <div className="slds-card__body slds-card__body_inner">
              <RecentActivity activities={dashboardData.recentActivities} />
            </div>
          </div>
        </div>

        {/* Upcoming Activities */}
        <div className="slds-col slds-size_1-of-1 slds-large-size_1-of-2">
          <div className="slds-card">
            <div className="slds-card__header slds-grid">
              <header className="slds-media slds-media_center slds-has-flexi-truncate">
                <div className="slds-media__figure">
                  <span className="slds-icon_container slds-icon-standard-event">
                    <Clock size={20} />
                  </span>
                </div>
                <div className="slds-media__body">
                  <h2 className="slds-card__header-title">
                    <span className="slds-text-heading_small">Upcoming Activities</span>
                  </h2>
                </div>
              </header>
              <div className="slds-no-flex">
                <Button
                  variant="brand"
                  icon={<Plus size={16} />}
                  onClick={() => window.location.href = '/activities/new'}
                >
                  New Activity
                </Button>
              </div>
            </div>
            <div className="slds-card__body slds-card__body_inner">
              {dashboardData.upcomingActivities.length === 0 ? (
                <div className="slds-text-align_center slds-p-vertical_large">
                  <Calendar size={48} className="slds-icon slds-icon_large slds-text-color_weak" />
                  <p className="slds-text-heading_small slds-m-top_small">No upcoming activities</p>
                  <p className="slds-text-color_weak">Schedule your next task or meeting</p>
                </div>
              ) : (
                <div className="slds-list_vertical slds-has-dividers_top-space">
                  {dashboardData.upcomingActivities.slice(0, 5).map((activity, index) => (
                    <div key={activity.id || index} className="slds-list__item slds-p-vertical_small">
                      <div className="slds-media">
                        <div className="slds-media__figure">
                          <span className="slds-avatar slds-avatar_circle slds-avatar_small">
                            <Activity size={16} />
                          </span>
                        </div>
                        <div className="slds-media__body">
                          <div className="slds-grid slds-grid_align-spread">
                            <div>
                              <p className="slds-text-body_regular slds-text-color_default">
                                {activity.subject}
                              </p>
                              <p className="slds-text-body_small slds-text-color_weak">
                                {activity.type} • {new Date(activity.dueDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="slds-text-color_weak">
                              <span className={`slds-badge ${activity.priority === 'High' ? 'slds-theme_error' : activity.priority === 'Normal' ? 'slds-theme_warning' : 'slds-theme_success'}`}>
                                {activity.priority}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Top Opportunities */}
      <div className="slds-m-top_large">
        <div className="slds-card">
          <div className="slds-card__header slds-grid">
            <header className="slds-media slds-media_center slds-has-flexi-truncate">
              <div className="slds-media__figure">
                <span className="slds-icon_container slds-icon-standard-opportunity">
                  <DollarSign size={20} />
                </span>
              </div>
              <div className="slds-media__body">
                <h2 className="slds-card__header-title">
                  <span className="slds-text-heading_small">Top Opportunities</span>
                </h2>
              </div>
            </header>
            <div className="slds-no-flex">
              <Link to="/opportunities" className="slds-button slds-button_neutral">
                View All
                <ArrowRight size={16} className="slds-button__icon slds-button__icon_right" />
              </Link>
            </div>
          </div>
          <div className="slds-card__body slds-card__body_inner">
            {dashboardData.topOpportunities.length === 0 ? (
              <div className="slds-text-align_center slds-p-vertical_large">
                <DollarSign size={48} className="slds-icon slds-icon_large slds-text-color_weak" />
                <p className="slds-text-heading_small slds-m-top_small">No opportunities yet</p>
                <p className="slds-text-color_weak">Create your first opportunity to get started</p>
              </div>
            ) : (
              <div className="slds-table_edit_container">
                <table className="slds-table slds-table_cell-buffer slds-table_bordered">
                  <thead>
                    <tr className="slds-line-height_reset">
                      <th scope="col">
                        <div className="slds-text-title_caps">Opportunity</div>
                      </th>
                      <th scope="col">
                        <div className="slds-text-title_caps">Account</div>
                      </th>
                      <th scope="col">
                        <div className="slds-text-title_caps">Amount</div>
                      </th>
                      <th scope="col">
                        <div className="slds-text-title_caps">Stage</div>
                      </th>
                      <th scope="col">
                        <div className="slds-text-title_caps">Close Date</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.topOpportunities.map((opportunity, index) => (
                      <tr key={opportunity.id || index}>
                        <td>
                          <div className="slds-cell-wrap">
                            <Link to={`/opportunities/${opportunity.id}`} className="slds-text-link">
                              {opportunity.name}
                            </Link>
                          </div>
                        </td>
                        <td>
                          <div className="slds-cell-wrap">
                            {opportunity.accountId?.name || opportunity.account || 'N/A'}
                          </div>
                        </td>
                        <td>
                          <div className="slds-cell-wrap">
                            {formatCurrency(opportunity.amount || 0)}
                          </div>
                        </td>
                        <td>
                          <div className="slds-cell-wrap">
                            <span className={`slds-badge ${opportunity.stage === 'Closed Won' ? 'slds-theme_success' : 'slds-theme_default'}`}>
                              {opportunity.stage}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="slds-cell-wrap">
                            {opportunity.closeDate ? new Date(opportunity.closeDate).toLocaleDateString() : 'N/A'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;