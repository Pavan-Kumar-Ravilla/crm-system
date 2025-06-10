// src/components/opportunities/OpportunitiesList.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { opportunitiesAPI, accountsAPI } from '../../services/api';
import Button from '../common/Button';
import { SearchInput } from '../common/Input';
import Select from '../common/Select';
import { PageSpinner, ListSpinner } from '../common/Spinner';
import { ConfirmModal } from '../common/Modal';
import { 
  Plus, 
  Filter, 
  Download, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  RefreshCw,
  DollarSign,
  Building,
  User,
  Calendar,
  TrendingUp
} from 'lucide-react';

const OpportunitiesList = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    stage: '',
    forecastCategory: '',
    accountId: '',
    dateFrom: '',
    dateTo: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 20
  });
  const [sortBy, setSortBy] = useState('closeDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedOpportunities, setSelectedOpportunities] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [opportunityToDelete, setOpportunityToDelete] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [accounts, setAccounts] = useState([]);
  
  const { addNotification } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();

  const stageOptions = [
    { value: '', label: 'All Stages' },
    { value: 'Prospecting', label: 'Prospecting' },
    { value: 'Qualification', label: 'Qualification' },
    { value: 'Needs Analysis', label: 'Needs Analysis' },
    { value: 'Value Proposition', label: 'Value Proposition' },
    { value: 'Id. Decision Makers', label: 'Id. Decision Makers' },
    { value: 'Perception Analysis', label: 'Perception Analysis' },
    { value: 'Proposal/Price Quote', label: 'Proposal/Price Quote' },
    { value: 'Negotiation/Review', label: 'Negotiation/Review' },
    { value: 'Closed Won', label: 'Closed Won' },
    { value: 'Closed Lost', label: 'Closed Lost' }
  ];

  const forecastOptions = [
    { value: '', label: 'All Forecast Categories' },
    { value: 'Pipeline', label: 'Pipeline' },
    { value: 'Best Case', label: 'Best Case' },
    { value: 'Commit', label: 'Commit' },
    { value: 'Omitted', label: 'Omitted' }
  ];

  useEffect(() => {
    loadOpportunities();
    loadAccounts();
  }, [pagination.currentPage, sortBy, sortOrder]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (pagination.currentPage === 1) {
        loadOpportunities();
      } else {
        setPagination(prev => ({ ...prev, currentPage: 1 }));
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, filters]);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: pagination.limit,
        sortBy,
        sortOrder,
        ...(searchQuery && { search: searchQuery }),
        ...filters
      };

      const response = await opportunitiesAPI.getAll(params);
      setOpportunities(response.opportunities || []);
      setPagination(prev => ({
        ...prev,
        totalPages: response.pagination?.totalPages || 1,
        totalCount: response.pagination?.totalCount || 0
      }));
    } catch (error) {
      console.error('Error loading opportunities:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load opportunities. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAccounts = async () => {
    try {
      const response = await accountsAPI.getAll({ limit: 100 });
      setAccounts(response.accounts || []);
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleSelectOpportunity = (opportunityId) => {
    setSelectedOpportunities(prev => {
      if (prev.includes(opportunityId)) {
        return prev.filter(id => id !== opportunityId);
      } else {
        return [...prev, opportunityId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedOpportunities.length === opportunities.length) {
      setSelectedOpportunities([]);
    } else {
      setSelectedOpportunities(opportunities.map(opportunity => opportunity.id));
    }
  };

  const handleDeleteOpportunity = (opportunity) => {
    setOpportunityToDelete(opportunity);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await opportunitiesAPI.delete(opportunityToDelete.id);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Opportunity deleted successfully'
      });
      loadOpportunities();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete opportunity. Please try again.'
      });
    } finally {
      setShowDeleteModal(false);
      setOpportunityToDelete(null);
    }
  };

  const getStageBadgeVariant = (stage) => {
    switch (stage) {
      case 'Prospecting': return 'slds-badge';
      case 'Qualification': return 'slds-badge_warning';
      case 'Needs Analysis': return 'slds-badge_warning';
      case 'Value Proposition': return 'slds-badge_warning';
      case 'Id. Decision Makers': return 'slds-badge_warning';
      case 'Perception Analysis': return 'slds-badge_warning';
      case 'Proposal/Price Quote': return 'slds-badge_inverse';
      case 'Negotiation/Review': return 'slds-badge_inverse';
      case 'Closed Won': return 'slds-badge_success';
      case 'Closed Lost': return 'slds-badge_error';
      default: return 'slds-badge';
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const isOverdue = (closeDate) => {
    return new Date(closeDate) < new Date();
  };

  if (loading && opportunities.length === 0) {
    return <PageSpinner message="Loading opportunities..." />;
  }

  return (
    <div className="slds-p-around_medium">
      {/* Page Header */}
      <div className="slds-page-header">
        <div className="slds-page-header__row">
          <div className="slds-page-header__col-title">
            <div className="slds-media">
              <div className="slds-media__figure">
                <span className="slds-icon_container slds-icon-standard-opportunity">
                  <DollarSign size={24} />
                </span>
              </div>
              <div className="slds-media__body">
                <div className="slds-page-header__name">
                  <div className="slds-page-header__name-title">
                    <h1>
                      <span className="slds-page-header__title slds-truncate">
                        Opportunities
                      </span>
                    </h1>
                  </div>
                </div>
                <p className="slds-page-header__name-meta">
                  {pagination.totalCount} items • Updated just now
                </p>
              </div>
            </div>
          </div>
          <div className="slds-page-header__col-actions">
            <div className="slds-page-header__controls">
              <div className="slds-page-header__control">
                <Button
                  variant="neutral"
                  icon={<RefreshCw size={16} />}
                  onClick={loadOpportunities}
                  disabled={loading}
                >
                  Refresh
                </Button>
              </div>
              <div className="slds-page-header__control">
                <Button
                  variant="brand"
                  icon={<Plus size={16} />}
                  onClick={() => navigate('/opportunities/new')}
                >
                  New Opportunity
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="slds-card slds-m-top_medium">
        <div className="slds-card__body slds-card__body_inner">
          <div className="slds-grid slds-grid_align-spread slds-grid_vertical-align-center">
            <div className="slds-col slds-size_1-of-2">
              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search opportunities..."
                className="slds-size_1-of-1"
              />
            </div>
            <div className="slds-col slds-no-flex">
              <div className="slds-grid">
                <Button
                  variant="neutral"
                  icon={<Filter size={16} />}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  Filters
                </Button>
                <Button
                  variant="neutral"
                  icon={<Download size={16} />}
                  className="slds-m-left_x-small"
                >
                  Export
                </Button>
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="slds-grid slds-gutters slds-m-top_medium">
              <div className="slds-col slds-size_1-of-5">
                <Select
                  label="Stage"
                  value={filters.stage}
                  onChange={(e) => handleFilterChange('stage', e.target.value)}
                  options={stageOptions}
                />
              </div>
              <div className="slds-col slds-size_1-of-5">
                <Select
                  label="Forecast Category"
                  value={filters.forecastCategory}
                  onChange={(e) => handleFilterChange('forecastCategory', e.target.value)}
                  options={forecastOptions}
                />
              </div>
              <div className="slds-col slds-size_1-of-5">
                <Select
                  label="Account"
                  value={filters.accountId}
                  onChange={(e) => handleFilterChange('accountId', e.target.value)}
                  options={[
                    { value: '', label: 'All Accounts' },
                    ...accounts.map(account => ({
                      value: account.id,
                      label: account.name
                    }))
                  ]}
                />
              </div>
              <div className="slds-col slds-size_1-of-5">
                <div className="slds-form-element">
                  <label className="slds-form-element__label" htmlFor="date-from">Close Date From</label>
                  <div className="slds-form-element__control">
                    <input
                      type="date"
                      id="date-from"
                      className="slds-input"
                      value={filters.dateFrom}
                      onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="slds-col slds-size_1-of-5">
                <div className="slds-form-element">
                  <label className="slds-form-element__label" htmlFor="date-to">Close Date To</label>
                  <div className="slds-form-element__control">
                    <input
                      type="date"
                      id="date-to"
                      className="slds-input"
                      value={filters.dateTo}
                      onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="slds-card slds-m-top_medium">
        <div className="slds-card__header slds-grid">
          <header className="slds-media slds-media_center slds-has-flexi-truncate">
            <div className="slds-media__body">
              <h2 className="slds-card__header-title">
                <span className="slds-text-heading_small">
                  {selectedOpportunities.length > 0 ? `${selectedOpportunities.length} items selected` : 'All Opportunities'}
                </span>
              </h2>
            </div>
          </header>
          {selectedOpportunities.length > 0 && (
            <div className="slds-no-flex">
              <Button variant="destructive" size="small">
                Delete Selected
              </Button>
            </div>
          )}
        </div>
        <div className="slds-card__body slds-card__body_inner">
          {loading ? (
            <ListSpinner />
          ) : opportunities.length === 0 ? (
            <div className="slds-text-align_center slds-p-vertical_large">
              <DollarSign size={48} className="slds-icon slds-icon_large slds-text-color_weak" />
              <p className="slds-text-heading_small slds-m-top_small">No opportunities found</p>
              <p className="slds-text-color_weak">
                {searchQuery || Object.values(filters).some(Boolean) 
                  ? 'Try adjusting your search or filters' 
                  : 'Get started by creating your first opportunity'
                }
              </p>
              {!searchQuery && !Object.values(filters).some(Boolean) && (
                <Button
                  variant="brand"
                  icon={<Plus size={16} />}
                  onClick={() => navigate('/opportunities/new')}
                  className="slds-m-top_medium"
                >
                  New Opportunity
                </Button>
              )}
            </div>
          ) : (
            <div className="slds-table_edit_container">
              <table className="slds-table slds-table_cell-buffer slds-table_bordered slds-table_edit slds-table_fixed-layout">
                <thead>
                  <tr className="slds-line-height_reset">
                    <th scope="col" style={{ width: '3.25rem' }}>
                      <div className="slds-th__action slds-th__action_form">
                        <div className="slds-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedOpportunities.length === opportunities.length}
                            onChange={handleSelectAll}
                            id="select-all"
                          />
                          <label className="slds-checkbox__label" htmlFor="select-all">
                            <span className="slds-checkbox_faux"></span>
                            <span className="slds-assistive-text">Select All</span>
                          </label>
                        </div>
                      </div>
                    </th>
                    <th scope="col">
                      <button
                        className="slds-th__action slds-text-link_reset"
                        onClick={() => handleSort('name')}
                      >
                        <span className="slds-assistive-text">Sort by </span>
                        <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                          <span className="slds-truncate" title="Opportunity Name">Opportunity Name</span>
                        </div>
                      </button>
                    </th>
                    <th scope="col">
                      <div className="slds-th__action">
                        <span className="slds-truncate" title="Account">Account</span>
                      </div>
                    </th>
                    <th scope="col">
                      <button
                        className="slds-th__action slds-text-link_reset"
                        onClick={() => handleSort('amount')}
                      >
                        <span className="slds-assistive-text">Sort by </span>
                        <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                          <span className="slds-truncate" title="Amount">Amount</span>
                        </div>
                      </button>
                    </th>
                    <th scope="col">
                      <button
                        className="slds-th__action slds-text-link_reset"
                        onClick={() => handleSort('stage')}
                      >
                        <span className="slds-assistive-text">Sort by </span>
                        <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                          <span className="slds-truncate" title="Stage">Stage</span>
                        </div>
                      </button>
                    </th>
                    <th scope="col">
                      <button
                        className="slds-th__action slds-text-link_reset"
                        onClick={() => handleSort('probability')}
                      >
                        <span className="slds-assistive-text">Sort by </span>
                        <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                          <span className="slds-truncate" title="Probability">Probability</span>
                        </div>
                      </button>
                    </th>
                    <th scope="col">
                      <button
                        className="slds-th__action slds-text-link_reset"
                        onClick={() => handleSort('closeDate')}
                      >
                        <span className="slds-assistive-text">Sort by </span>
                        <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                          <span className="slds-truncate" title="Close Date">Close Date</span>
                        </div>
                      </button>
                    </th>
                    <th scope="col">
                      <div className="slds-th__action">
                        <span className="slds-truncate" title="Owner">Owner</span>
                      </div>
                    </th>
                    <th scope="col" style={{ width: '3.25rem' }}>
                      <div className="slds-th__action">
                        <span className="slds-assistive-text">Actions</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {opportunities.map((opportunity) => (
                    <tr key={opportunity.id} className="slds-hint-parent">
                      <td>
                        <div className="slds-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedOpportunities.includes(opportunity.id)}
                            onChange={() => handleSelectOpportunity(opportunity.id)}
                            id={`select-${opportunity.id}`}
                          />
                          <label className="slds-checkbox__label" htmlFor={`select-${opportunity.id}`}>
                            <span className="slds-checkbox_faux"></span>
                            <span className="slds-assistive-text">Select Opportunity</span>
                          </label>
                        </div>
                      </td>
                      <td>
                        <div className="slds-cell-wrap">
                          <div className="slds-grid slds-grid_align-center">
                            <div className="slds-avatar slds-avatar_circle slds-avatar_small slds-m-right_small">
                              <DollarSign size={16} />
                            </div>
                            <div>
                              <Link 
                                to={`/opportunities/${opportunity.id}`} 
                                className="slds-text-link"
                              >
                                {opportunity.name}
                              </Link>
                              {opportunity.type && (
                                <div className="slds-text-body_small slds-text-color_weak">
                                  {opportunity.type}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="slds-cell-wrap">
                          {opportunity.accountId ? (
                            <div className="slds-grid slds-grid_align-center">
                              <Building size={14} className="slds-m-right_x-small" />
                              <Link 
                                to={`/accounts/${opportunity.accountId.id || opportunity.accountId}`}
                                className="slds-text-link"
                              >
                                {opportunity.accountId.name || opportunity.account || 'Unknown Account'}
                              </Link>
                            </div>
                          ) : (
                            '-'
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="slds-cell-wrap">
                          <div className="slds-grid slds-grid_vertical">
                            <span className="slds-text-body_regular">
                              {formatCurrency(opportunity.amount)}
                            </span>
                            {opportunity.probability && (
                              <span className="slds-text-body_small slds-text-color_weak">
                                Weighted: {formatCurrency(opportunity.amount * opportunity.probability / 100)}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="slds-cell-wrap">
                          <span className={`slds-badge ${getStageBadgeVariant(opportunity.stage)}`}>
                            {opportunity.stage}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="slds-cell-wrap">
                          <div className="slds-grid slds-grid_align-center">
                            <TrendingUp size={12} className="slds-m-right_x-small" />
                            {opportunity.probability}%
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="slds-cell-wrap">
                          <div className="slds-grid slds-grid_align-center">
                            <Calendar size={12} className="slds-m-right_x-small" />
                            <span className={isOverdue(opportunity.closeDate) ? 'slds-text-color_error' : ''}>
                              {formatDate(opportunity.closeDate)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="slds-cell-wrap">
                          {opportunity.ownerId ? (
                            <div className="slds-grid slds-grid_align-center">
                              <User size={12} className="slds-m-right_x-small" />
                              <span className="slds-text-body_small">
                                {opportunity.ownerId.firstName} {opportunity.ownerId.lastName}
                              </span>
                            </div>
                          ) : (
                            '-'
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="slds-dropdown-trigger slds-dropdown-trigger_click">
                          <button className="slds-button slds-button_icon slds-button_icon-border-filled">
                            <MoreVertical size={16} />
                            <span className="slds-assistive-text">Show more</span>
                          </button>
                          <div className="slds-dropdown slds-dropdown_right">
                            <ul className="slds-dropdown__list" role="menu">
                              <li className="slds-dropdown__item" role="presentation">
                                <Link
                                  to={`/opportunities/${opportunity.id}`}
                                  className="slds-dropdown__link"
                                  role="menuitem"
                                >
                                  <span className="slds-truncate">
                                    <Eye size={16} className="slds-m-right_small" />
                                    View
                                  </span>
                                </Link>
                              </li>
                              <li className="slds-dropdown__item" role="presentation">
                                <Link
                                  to={`/opportunities/${opportunity.id}/edit`}
                                  className="slds-dropdown__link"
                                  role="menuitem"
                                >
                                  <span className="slds-truncate">
                                    <Edit size={16} className="slds-m-right_small" />
                                    Edit
                                  </span>
                                </Link>
                              </li>
                              <li className="slds-dropdown__item" role="presentation">
                                <button
                                  className="slds-dropdown__link"
                                  role="menuitem"
                                  onClick={() => handleDeleteOpportunity(opportunity)}
                                >
                                  <span className="slds-truncate">
                                    <Trash2 size={16} className="slds-m-right_small" />
                                    Delete
                                  </span>
                                </button>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="slds-card__footer">
              <div className="slds-grid slds-grid_align-spread slds-grid_vertical-align-center">
                <div className="slds-col">
                  <p className="slds-text-body_small slds-text-color_weak">
                    Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of{' '}
                    {pagination.totalCount} results
                  </p>
                </div>
                <div className="slds-col slds-no-flex">
                  <div className="slds-button-group" role="group">
                    <Button
                      variant="neutral"
                      size="small"
                      disabled={pagination.currentPage === 1}
                      onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="neutral"
                      size="small"
                      disabled={pagination.currentPage === pagination.totalPages}
                      onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Opportunity"
        message={`Are you sure you want to delete ${opportunityToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
};

export default OpportunitiesList;