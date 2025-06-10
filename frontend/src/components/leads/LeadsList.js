// src/components/leads/LeadsList.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { leadsAPI } from '../../services/api';
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
  Target,
  Phone,
  Mail,
  User,
  Building
} from 'lucide-react';

const LeadsList = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    leadSource: '',
    rating: '',
    isConverted: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 20
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const { addNotification } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'New', label: 'New' },
    { value: 'Contacted', label: 'Contacted' },
    { value: 'Qualified', label: 'Qualified' },
    { value: 'Unqualified', label: 'Unqualified' }
  ];

  const sourceOptions = [
    { value: '', label: 'All Sources' },
    { value: 'Website', label: 'Website' },
    { value: 'Phone Inquiry', label: 'Phone Inquiry' },
    { value: 'Partner Referral', label: 'Partner Referral' },
    { value: 'Trade Show', label: 'Trade Show' },
    { value: 'Email Campaign', label: 'Email Campaign' },
    { value: 'Social Media', label: 'Social Media' },
    { value: 'Other', label: 'Other' }
  ];

  const ratingOptions = [
    { value: '', label: 'All Ratings' },
    { value: 'Hot', label: 'Hot' },
    { value: 'Warm', label: 'Warm' },
    { value: 'Cold', label: 'Cold' }
  ];

  const convertedOptions = [
    { value: '', label: 'All Leads' },
    { value: 'false', label: 'Not Converted' },
    { value: 'true', label: 'Converted' }
  ];

  useEffect(() => {
    loadLeads();
  }, [pagination.currentPage, sortBy, sortOrder]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (pagination.currentPage === 1) {
        loadLeads();
      } else {
        setPagination(prev => ({ ...prev, currentPage: 1 }));
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, filters]);

  const loadLeads = async () => {
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

      const response = await leadsAPI.getAll(params);
      setLeads(response.leads || []);
      setPagination(prev => ({
        ...prev,
        totalPages: response.pagination?.totalPages || 1,
        totalCount: response.pagination?.totalCount || 0
      }));
    } catch (error) {
      console.error('Error loading leads:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load leads. Please try again.'
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

  const handleSelectLead = (leadId) => {
    setSelectedLeads(prev => {
      if (prev.includes(leadId)) {
        return prev.filter(id => id !== leadId);
      } else {
        return [...prev, leadId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map(lead => lead.id));
    }
  };

  const handleDeleteLead = (lead) => {
    setLeadToDelete(lead);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await leadsAPI.delete(leadToDelete.id);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Lead deleted successfully'
      });
      loadLeads();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete lead. Please try again.'
      });
    } finally {
      setShowDeleteModal(false);
      setLeadToDelete(null);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'New': return 'slds-badge_inverse';
      case 'Contacted': return 'slds-badge';
      case 'Qualified': return 'slds-badge_success';
      case 'Unqualified': return 'slds-badge_error';
      default: return 'slds-badge';
    }
  };

  const getRatingColor = (rating) => {
    switch (rating) {
      case 'Hot': return 'slds-text-color_error';
      case 'Warm': return 'slds-text-color_warning';
      case 'Cold': return 'slds-text-color_default';
      default: return 'slds-text-color_weak';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  if (loading && leads.length === 0) {
    return <PageSpinner message="Loading leads..." />;
  }

  return (
    <div className="slds-p-around_medium">
      {/* Page Header */}
      <div className="slds-page-header">
        <div className="slds-page-header__row">
          <div className="slds-page-header__col-title">
            <div className="slds-media">
              <div className="slds-media__figure">
                <span className="slds-icon_container slds-icon-standard-lead">
                  <Target size={24} />
                </span>
              </div>
              <div className="slds-media__body">
                <div className="slds-page-header__name">
                  <div className="slds-page-header__name-title">
                    <h1>
                      <span className="slds-page-header__title slds-truncate">
                        Leads
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
                  onClick={loadLeads}
                  disabled={loading}
                >
                  Refresh
                </Button>
              </div>
              <div className="slds-page-header__control">
                <Button
                  variant="brand"
                  icon={<Plus size={16} />}
                  onClick={() => navigate('/leads/new')}
                >
                  New Lead
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
                placeholder="Search leads..."
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
              <div className="slds-col slds-size_1-of-4">
                <Select
                  label="Status"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  options={statusOptions}
                />
              </div>
              <div className="slds-col slds-size_1-of-4">
                <Select
                  label="Lead Source"
                  value={filters.leadSource}
                  onChange={(e) => handleFilterChange('leadSource', e.target.value)}
                  options={sourceOptions}
                />
              </div>
              <div className="slds-col slds-size_1-of-4">
                <Select
                  label="Rating"
                  value={filters.rating}
                  onChange={(e) => handleFilterChange('rating', e.target.value)}
                  options={ratingOptions}
                />
              </div>
              <div className="slds-col slds-size_1-of-4">
                <Select
                  label="Conversion Status"
                  value={filters.isConverted}
                  onChange={(e) => handleFilterChange('isConverted', e.target.value)}
                  options={convertedOptions}
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
                  {selectedLeads.length > 0 ? `${selectedLeads.length} items selected` : 'All Leads'}
                </span>
              </h2>
            </div>
          </header>
          {selectedLeads.length > 0 && (
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
          ) : leads.length === 0 ? (
            <div className="slds-text-align_center slds-p-vertical_large">
              <Target size={48} className="slds-icon slds-icon_large slds-text-color_weak" />
              <p className="slds-text-heading_small slds-m-top_small">No leads found</p>
              <p className="slds-text-color_weak">
                {searchQuery || Object.values(filters).some(Boolean) 
                  ? 'Try adjusting your search or filters' 
                  : 'Get started by creating your first lead'
                }
              </p>
              {!searchQuery && !Object.values(filters).some(Boolean) && (
                <Button
                  variant="brand"
                  icon={<Plus size={16} />}
                  onClick={() => navigate('/leads/new')}
                  className="slds-m-top_medium"
                >
                  New Lead
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
                            checked={selectedLeads.length === leads.length}
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
                        onClick={() => handleSort('firstName')}
                      >
                        <span className="slds-assistive-text">Sort by </span>
                        <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                          <span className="slds-truncate" title="Name">Name</span>
                        </div>
                      </button>
                    </th>
                    <th scope="col">
                      <button
                        className="slds-th__action slds-text-link_reset"
                        onClick={() => handleSort('company')}
                      >
                        <span className="slds-assistive-text">Sort by </span>
                        <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                          <span className="slds-truncate" title="Company">Company</span>
                        </div>
                      </button>
                    </th>
                    <th scope="col">
                      <div className="slds-th__action">
                        <span className="slds-truncate" title="Contact Info">Contact Info</span>
                      </div>
                    </th>
                    <th scope="col">
                      <button
                        className="slds-th__action slds-text-link_reset"
                        onClick={() => handleSort('status')}
                      >
                        <span className="slds-assistive-text">Sort by </span>
                        <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                          <span className="slds-truncate" title="Status">Status</span>
                        </div>
                      </button>
                    </th>
                    <th scope="col">
                      <button
                        className="slds-th__action slds-text-link_reset"
                        onClick={() => handleSort('leadSource')}
                      >
                        <span className="slds-assistive-text">Sort by </span>
                        <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                          <span className="slds-truncate" title="Lead Source">Lead Source</span>
                        </div>
                      </button>
                    </th>
                    <th scope="col">
                      <div className="slds-th__action">
                        <span className="slds-truncate" title="Rating">Rating</span>
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
                  {leads.map((lead) => (
                    <tr key={lead.id} className="slds-hint-parent">
                      <td>
                        <div className="slds-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedLeads.includes(lead.id)}
                            onChange={() => handleSelectLead(lead.id)}
                            id={`select-${lead.id}`}
                          />
                          <label className="slds-checkbox__label" htmlFor={`select-${lead.id}`}>
                            <span className="slds-checkbox_faux"></span>
                            <span className="slds-assistive-text">Select Lead</span>
                          </label>
                        </div>
                      </td>
                      <td>
                        <div className="slds-cell-wrap">
                          <div className="slds-grid slds-grid_align-center">
                            <div className="slds-avatar slds-avatar_circle slds-avatar_small slds-m-right_small">
                              <User size={16} />
                            </div>
                            <div>
                              <Link 
                                to={`/leads/${lead.id}`} 
                                className="slds-text-link"
                              >
                                {lead.firstName} {lead.lastName}
                              </Link>
                              {lead.title && (
                                <div className="slds-text-body_small slds-text-color_weak">
                                  {lead.title}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="slds-cell-wrap">
                          <div className="slds-grid slds-grid_align-center">
                            <Building size={14} className="slds-m-right_x-small" />
                            {lead.company}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="slds-cell-wrap">
                          <div className="slds-grid slds-grid_vertical">
                            {lead.email && (
                              <div className="slds-grid slds-grid_align-center slds-m-bottom_xx-small">
                                <Mail size={12} className="slds-m-right_x-small" />
                                <a href={`mailto:${lead.email}`} className="slds-text-link">
                                  {lead.email}
                                </a>
                              </div>
                            )}
                            {lead.phone && (
                              <div className="slds-grid slds-grid_align-center">
                                <Phone size={12} className="slds-m-right_x-small" />
                                <a href={`tel:${lead.phone}`} className="slds-text-link">
                                  {lead.phone}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="slds-cell-wrap">
                          <span className={`slds-badge ${getStatusBadgeVariant(lead.status)}`}>
                            {lead.status}
                          </span>
                          {lead.isConverted && (
                            <span className="slds-badge slds-badge_success slds-m-left_x-small">
                              Converted
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="slds-cell-wrap">
                          {lead.leadSource}
                        </div>
                      </td>
                      <td>
                        <div className="slds-cell-wrap">
                          <span className={getRatingColor(lead.rating)}>
                            {lead.rating}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="slds-cell-wrap">
                          {formatDate(lead.createdAt)}
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
                                  to={`/leads/${lead.id}`}
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
                                  to={`/leads/${lead.id}/edit`}
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
                                  onClick={() => handleDeleteLead(lead)}
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
        title="Delete Lead"
        message={`Are you sure you want to delete ${leadToDelete?.firstName} ${leadToDelete?.lastName}? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
};

export default LeadsList;