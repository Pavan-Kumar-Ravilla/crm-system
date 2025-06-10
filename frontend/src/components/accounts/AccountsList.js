// src/components/accounts/AccountsList.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { accountsAPI } from '../../services/api';
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
  Building,
  Phone,
  Globe,
  MapPin,
  Users,
  DollarSign
} from 'lucide-react';

const AccountsList = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    industry: '',
    rating: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 20
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const { addNotification } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'Customer', label: 'Customer' },
    { value: 'Prospect', label: 'Prospect' },
    { value: 'Partner', label: 'Partner' },
    { value: 'Competitor', label: 'Competitor' },
    { value: 'Other', label: 'Other' }
  ];

  const industryOptions = [
    { value: '', label: 'All Industries' },
    { value: 'Technology', label: 'Technology' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Manufacturing', label: 'Manufacturing' },
    { value: 'Retail', label: 'Retail' },
    { value: 'Education', label: 'Education' },
    { value: 'Government', label: 'Government' },
    { value: 'Non-profit', label: 'Non-profit' },
    { value: 'Real Estate', label: 'Real Estate' },
    { value: 'Transportation', label: 'Transportation' },
    { value: 'Energy', label: 'Energy' },
    { value: 'Other', label: 'Other' }
  ];

  const ratingOptions = [
    { value: '', label: 'All Ratings' },
    { value: 'Hot', label: 'Hot' },
    { value: 'Warm', label: 'Warm' },
    { value: 'Cold', label: 'Cold' }
  ];

  useEffect(() => {
    loadAccounts();
  }, [pagination.currentPage, sortBy, sortOrder]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (pagination.currentPage === 1) {
        loadAccounts();
      } else {
        setPagination(prev => ({ ...prev, currentPage: 1 }));
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, filters]);

  const loadAccounts = async () => {
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

      const response = await accountsAPI.getAll(params);
      setAccounts(response.accounts || []);
      setPagination(prev => ({
        ...prev,
        totalPages: response.pagination?.totalPages || 1,
        totalCount: response.pagination?.totalCount || 0
      }));
    } catch (error) {
      console.error('Error loading accounts:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load accounts. Please try again.'
      });
    } finally {
      setLoading(false);
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

  const handleSelectAccount = (accountId) => {
    setSelectedAccounts(prev => {
      if (prev.includes(accountId)) {
        return prev.filter(id => id !== accountId);
      } else {
        return [...prev, accountId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedAccounts.length === accounts.length) {
      setSelectedAccounts([]);
    } else {
      setSelectedAccounts(accounts.map(account => account.id));
    }
  };

  const handleDeleteAccount = (account) => {
    setAccountToDelete(account);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await accountsAPI.delete(accountToDelete.id);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Account deleted successfully'
      });
      loadAccounts();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete account. Please try again.'
      });
    } finally {
      setShowDeleteModal(false);
      setAccountToDelete(null);
    }
  };

  const getTypeBadgeVariant = (type) => {
    switch (type) {
      case 'Customer': return 'slds-badge_success';
      case 'Prospect': return 'slds-badge';
      case 'Partner': return 'slds-badge_warning';
      case 'Competitor': return 'slds-badge_error';
      default: return 'slds-badge_inverse';
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '';
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

  if (loading && accounts.length === 0) {
    return <PageSpinner message="Loading accounts..." />;
  }

  return (
    <div className="slds-p-around_medium">
      {/* Page Header */}
      <div className="slds-page-header">
        <div className="slds-page-header__row">
          <div className="slds-page-header__col-title">
            <div className="slds-media">
              <div className="slds-media__figure">
                <span className="slds-icon_container slds-icon-standard-account">
                  <Building size={24} />
                </span>
              </div>
              <div className="slds-media__body">
                <div className="slds-page-header__name">
                  <div className="slds-page-header__name-title">
                    <h1>
                      <span className="slds-page-header__title slds-truncate">
                        Accounts
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
                  onClick={loadAccounts}
                  disabled={loading}
                >
                  Refresh
                </Button>
              </div>
              <div className="slds-page-header__control">
                <Button
                  variant="brand"
                  icon={<Plus size={16} />}
                  onClick={() => navigate('/accounts/new')}
                >
                  New Account
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
                placeholder="Search accounts..."
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
              <div className="slds-col slds-size_1-of-3">
                <Select
                  label="Account Type"
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  options={typeOptions}
                />
              </div>
              <div className="slds-col slds-size_1-of-3">
                <Select
                  label="Industry"
                  value={filters.industry}
                  onChange={(e) => handleFilterChange('industry', e.target.value)}
                  options={industryOptions}
                />
              </div>
              <div className="slds-col slds-size_1-of-3">
                <Select
                  label="Rating"
                  value={filters.rating}
                  onChange={(e) => handleFilterChange('rating', e.target.value)}
                  options={ratingOptions}
                />
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
                  {selectedAccounts.length > 0 ? `${selectedAccounts.length} items selected` : 'All Accounts'}
                </span>
              </h2>
            </div>
          </header>
          {selectedAccounts.length > 0 && (
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
          ) : accounts.length === 0 ? (
            <div className="slds-text-align_center slds-p-vertical_large">
              <Building size={48} className="slds-icon slds-icon_large slds-text-color_weak" />
              <p className="slds-text-heading_small slds-m-top_small">No accounts found</p>
              <p className="slds-text-color_weak">
                {searchQuery || Object.values(filters).some(Boolean) 
                  ? 'Try adjusting your search or filters' 
                  : 'Get started by creating your first account'
                }
              </p>
              {!searchQuery && !Object.values(filters).some(Boolean) && (
                <Button
                  variant="brand"
                  icon={<Plus size={16} />}
                  onClick={() => navigate('/accounts/new')}
                  className="slds-m-top_medium"
                >
                  New Account
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
                            checked={selectedAccounts.length === accounts.length}
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
                          <span className="slds-truncate" title="Account Name">Account Name</span>
                        </div>
                      </button>
                    </th>
                    <th scope="col">
                      <button
                        className="slds-th__action slds-text-link_reset"
                        onClick={() => handleSort('type')}
                      >
                        <span className="slds-assistive-text">Sort by </span>
                        <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                          <span className="slds-truncate" title="Type">Type</span>
                        </div>
                      </button>
                    </th>
                    <th scope="col">
                      <div className="slds-th__action">
                        <span className="slds-truncate" title="Industry">Industry</span>
                      </div>
                    </th>
                    <th scope="col">
                      <div className="slds-th__action">
                        <span className="slds-truncate" title="Contact Info">Contact Info</span>
                      </div>
                    </th>
                    <th scope="col">
                      <div className="slds-th__action">
                        <span className="slds-truncate" title="Annual Revenue">Annual Revenue</span>
                      </div>
                    </th>
                    <th scope="col">
                      <div className="slds-th__action">
                        <span className="slds-truncate" title="Employees">Employees</span>
                      </div>
                    </th>
                    <th scope="col">
                      <button
                        className="slds-th__action slds-text-link_reset"
                        onClick={() => handleSort('createdAt')}
                      >
                        <span className="slds-assistive-text">Sort by </span>
                        <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                          <span className="slds-truncate" title="Created Date">Created Date</span>
                        </div>
                      </button>
                    </th>
                    <th scope="col" style={{ width: '3.25rem' }}>
                      <div className="slds-th__action">
                        <span className="slds-assistive-text">Actions</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((account) => (
                    <tr key={account.id} className="slds-hint-parent">
                      <td>
                        <div className="slds-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedAccounts.includes(account.id)}
                            onChange={() => handleSelectAccount(account.id)}
                            id={`select-${account.id}`}
                          />
                          <label className="slds-checkbox__label" htmlFor={`select-${account.id}`}>
                            <span className="slds-checkbox_faux"></span>
                            <span className="slds-assistive-text">Select Account</span>
                          </label>
                        </div>
                      </td>
                      <td>
                        <div className="slds-cell-wrap">
                          <div className="slds-grid slds-grid_align-center">
                            <div className="slds-avatar slds-avatar_circle slds-avatar_small slds-m-right_small">
                              <Building size={16} />
                            </div>
                            <div>
                              <Link 
                                to={`/accounts/${account.id}`} 
                                className="slds-text-link"
                              >
                                {account.name}
                              </Link>
                              {account.website && (
                                <div className="slds-text-body_small slds-text-color_weak">
                                  <Globe size={12} className="slds-m-right_x-small" />
                                  {account.website.replace(/^https?:\/\//, '')}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="slds-cell-wrap">
                          <span className={`slds-badge ${getTypeBadgeVariant(account.type)}`}>
                            {account.type}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="slds-cell-wrap">
                          {account.industry || '-'}
                        </div>
                      </td>
                      <td>
                        <div className="slds-cell-wrap">
                          <div className="slds-grid slds-grid_vertical">
                            {account.phone && (
                              <div className="slds-grid slds-grid_align-center slds-m-bottom_xx-small">
                                <Phone size={12} className="slds-m-right_x-small" />
                                <a href={`tel:${account.phone}`} className="slds-text-link">
                                  {account.phone}
                                </a>
                              </div>
                            )}
                            {account.billingAddress?.city && (
                              <div className="slds-grid slds-grid_align-center">
                                <MapPin size={12} className="slds-m-right_x-small" />
                                <span className="slds-text-color_weak">
                                  {account.billingAddress.city}, {account.billingAddress.state}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="slds-cell-wrap">
                          {account.annualRevenue ? (
                            <div className="slds-grid slds-grid_align-center">
                              <DollarSign size={12} className="slds-m-right_x-small" />
                              {formatCurrency(account.annualRevenue)}
                            </div>
                          ) : (
                            '-'
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="slds-cell-wrap">
                          {account.employees ? (
                            <div className="slds-grid slds-grid_align-center">
                              <Users size={12} className="slds-m-right_x-small" />
                              {account.employees.toLocaleString()}
                            </div>
                          ) : (
                            '-'
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="slds-cell-wrap">
                          {formatDate(account.createdAt)}
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
                                  to={`/accounts/${account.id}`}
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
                                  to={`/accounts/${account.id}/edit`}
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
                                  onClick={() => handleDeleteAccount(account)}
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
        title="Delete Account"
        message={`Are you sure you want to delete ${accountToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
};

export default AccountsList;