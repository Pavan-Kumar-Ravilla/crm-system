// src/components/activities/ActivitiesList.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { activitiesAPI } from '../../services/api';
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
  Activity,
  Phone,
  Mail,
  Calendar,
  CheckSquare,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

const ActivitiesList = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    priority: '',
    dueDate: '',
    assignedToId: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 20
  });
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [users, setUsers] = useState([]);
  
  const { addNotification } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'Task', label: 'Task' },
    { value: 'Call', label: 'Call' },
    { value: 'Email', label: 'Email' },
    { value: 'Meeting', label: 'Meeting' },
    { value: 'Demo', label: 'Demo' },
    { value: 'Follow-up', label: 'Follow-up' },
    { value: 'Other', label: 'Other' }
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'Not Started', label: 'Not Started' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Waiting on someone else', label: 'Waiting on someone else' },
    { value: 'Deferred', label: 'Deferred' },
    { value: 'Cancelled', label: 'Cancelled' }
  ];

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'High', label: 'High' },
    { value: 'Normal', label: 'Normal' },
    { value: 'Low', label: 'Low' }
  ];

  const dueDateOptions = [
    { value: '', label: 'Any Time' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'today', label: 'Due Today' },
    { value: 'tomorrow', label: 'Due Tomorrow' },
    { value: 'week', label: 'Due This Week' },
    { value: 'month', label: 'Due This Month' }
  ];

  useEffect(() => {
    loadActivities();
    loadUsers();
  }, [pagination.currentPage, sortBy, sortOrder]);

  useEffect(() => {
    // Apply URL search params for related records
    const accountId = searchParams.get('accountId');
    const contactId = searchParams.get('contactId');
    const leadId = searchParams.get('leadId');
    const opportunityId = searchParams.get('opportunityId');

    if (accountId || contactId || leadId || opportunityId) {
      setFilters(prev => ({
        ...prev,
        ...(accountId && { accountId }),
        ...(contactId && { contactId }),
        ...(leadId && { leadId }),
        ...(opportunityId && { opportunityId })
      }));
    }
  }, [searchParams]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (pagination.currentPage === 1) {
        loadActivities();
      } else {
        setPagination(prev => ({ ...prev, currentPage: 1 }));
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, filters]);

  const loadActivities = async () => {
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

      const response = await activitiesAPI.getAll(params);
      setActivities(response.activities || []);
      setPagination(prev => ({
        ...prev,
        totalPages: response.pagination?.totalPages || 1,
        totalCount: response.pagination?.totalCount || 0
      }));
    } catch (error) {
      console.error('Error loading activities:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load activities. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      // This would normally come from usersAPI
      setUsers([]);
    } catch (error) {
      console.error('Error loading users:', error);
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

  const handleSelectActivity = (activityId) => {
    setSelectedActivities(prev => {
      if (prev.includes(activityId)) {
        return prev.filter(id => id !== activityId);
      } else {
        return [...prev, activityId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedActivities.length === activities.length) {
      setSelectedActivities([]);
    } else {
      setSelectedActivities(activities.map(activity => activity.id));
    }
  };

  const handleDeleteActivity = (activity) => {
    setActivityToDelete(activity);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await activitiesAPI.delete(activityToDelete.id);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Activity deleted successfully'
      });
      loadActivities();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete activity. Please try again.'
      });
    } finally {
      setShowDeleteModal(false);
      setActivityToDelete(null);
    }
  };

  const getActivityIcon = (type) => {
    const iconMap = {
      Task: <CheckSquare size={16} />,
      Call: <Phone size={16} />,
      Email: <Mail size={16} />,
      Meeting: <Calendar size={16} />,
      Demo: <Activity size={16} />,
      'Follow-up': <Activity size={16} />,
      Other: <FileText size={16} />
    };
    return iconMap[type] || <Activity size={16} />;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle size={16} className="slds-text-color_success" />;
      case 'In Progress': return <Clock size={16} className="slds-text-color_warning" />;
      case 'Not Started': return <AlertCircle size={16} className="slds-text-color_default" />;
      case 'Cancelled': return <XCircle size={16} className="slds-text-color_error" />;
      default: return <AlertCircle size={16} className="slds-text-color_weak" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'slds-text-color_error';
      case 'Normal': return 'slds-text-color_default';
      case 'Low': return 'slds-text-color_weak';
      default: return 'slds-text-color_default';
    }
  };

  const formatDateTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleString();
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  };

  const isOverdue = (dueDate, status) => {
    return status !== 'Completed' && new Date(dueDate) < new Date();
  };

  if (loading && activities.length === 0) {
    return <PageSpinner message="Loading activities..." />;
  }

  return (
    <div className="slds-p-around_medium">
      {/* Page Header */}
      <div className="slds-page-header">
        <div className="slds-page-header__row">
          <div className="slds-page-header__col-title">
            <div className="slds-media">
              <div className="slds-media__figure">
                <span className="slds-icon_container slds-icon-standard-task">
                  <Activity size={24} />
                </span>
              </div>
              <div className="slds-media__body">
                <div className="slds-page-header__name">
                  <div className="slds-page-header__name-title">
                    <h1>
                      <span className="slds-page-header__title slds-truncate">
                        Activities
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
                  onClick={loadActivities}
                  disabled={loading}
                >
                  Refresh
                </Button>
              </div>
              <div className="slds-page-header__control">
                <Button
                  variant="brand"
                  icon={<Plus size={16} />}
                  onClick={() => navigate('/activities/new')}
                >
                  New Activity
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
                placeholder="Search activities..."
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
                  label="Type"
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  options={typeOptions}
                />
              </div>
              <div className="slds-col slds-size_1-of-5">
                <Select
                  label="Status"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  options={statusOptions}
                />
              </div>
              <div className="slds-col slds-size_1-of-5">
                <Select
                  label="Priority"
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  options={priorityOptions}
                />
              </div>
              <div className="slds-col slds-size_1-of-5">
                <Select
                  label="Due Date"
                  value={filters.dueDate}
                  onChange={(e) => handleFilterChange('dueDate', e.target.value)}
                  options={dueDateOptions}
                />
              </div>
              <div className="slds-col slds-size_1-of-5">
                <Select
                  label="Assigned To"
                  value={filters.assignedToId}
                  onChange={(e) => handleFilterChange('assignedToId', e.target.value)}
                  options={[
                    { value: '', label: 'All Users' },
                    ...users.map(user => ({
                      value: user.id,
                      label: `${user.firstName} ${user.lastName}`
                    }))
                  ]}
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
                  {selectedActivities.length > 0 ? `${selectedActivities.length} items selected` : 'All Activities'}
                </span>
              </h2>
            </div>
          </header>
          {selectedActivities.length > 0 && (
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
          ) : activities.length === 0 ? (
            <div className="slds-text-align_center slds-p-vertical_large">
              <Activity size={48} className="slds-icon slds-icon_large slds-text-color_weak" />
              <p className="slds-text-heading_small slds-m-top_small">No activities found</p>
              <p className="slds-text-color_weak">
                {searchQuery || Object.values(filters).some(Boolean) 
                  ? 'Try adjusting your search or filters' 
                  : 'Get started by creating your first activity'
                }
              </p>
              {!searchQuery && !Object.values(filters).some(Boolean) && (
                <Button
                  variant="brand"
                  icon={<Plus size={16} />}
                  onClick={() => navigate('/activities/new')}
                  className="slds-m-top_medium"
                >
                  New Activity
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
                            checked={selectedActivities.length === activities.length}
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
                        onClick={() => handleSort('subject')}
                      >
                        <span className="slds-assistive-text">Sort by </span>
                        <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                          <span className="slds-truncate" title="Subject">Subject</span>
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
                      <div className="slds-th__action">
                        <span className="slds-truncate" title="Priority">Priority</span>
                      </div>
                    </th>
                    <th scope="col">
                      <button
                        className="slds-th__action slds-text-link_reset"
                        onClick={() => handleSort('dueDate')}
                      >
                        <span className="slds-assistive-text">Sort by </span>
                        <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                          <span className="slds-truncate" title="Due Date">Due Date</span>
                        </div>
                      </button>
                    </th>
                    <th scope="col">
                      <div className="slds-th__action">
                        <span className="slds-truncate" title="Assigned To">Assigned To</span>
                      </div>
                    </th>
                    <th scope="col">
                      <div className="slds-th__action">
                        <span className="slds-truncate" title="Related To">Related To</span>
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
                  {activities.map((activity) => (
                    <tr key={activity.id} className="slds-hint-parent">
                      <td>
                        <div className="slds-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedActivities.includes(activity.id)}
                            onChange={() => handleSelectActivity(activity.id)}
                            id={`select-${activity.id}`}
                          />
                          <label className="slds-checkbox__label" htmlFor={`select-${activity.id}`}>
                            <span className="slds-checkbox_faux"></span>
                            <span className="slds-assistive-text">Select Activity</span>
                          </label>
                        </div>
                      </td>
                      <td>
                        <div className="slds-cell-wrap">
                          <div className="slds-grid slds-grid_align-center">
                            <div className="slds-avatar slds-avatar_circle slds-avatar_small slds-m-right_small">
                              {getActivityIcon(activity.type)}
                            </div>
                            <div>
                              <Link 
                                to={`/activities/${activity.id}`} 
                                className="slds-text-link"
                              >
                                {activity.subject}
                              </Link>
                              {activity.description && (
                                <div className="slds-text-body_small slds-text-color_weak slds-line-clamp">
                                  {activity.description.substring(0, 50)}...
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="slds-cell-wrap">
                          <div className="slds-grid slds-grid_align-center">
                            {getActivityIcon(activity.type)}
                            <span className="slds-m-left_x-small">{activity.type}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="slds-cell-wrap">
                          <div className="slds-grid slds-grid_align-center">
                            {getStatusIcon(activity.status)}
                            <span className="slds-m-left_x-small">{activity.status}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="slds-cell-wrap">
                          <span className={getPriorityColor(activity.priority)}>
                            {activity.priority}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="slds-cell-wrap">
                          {activity.dueDate && (
                            <span className={isOverdue(activity.dueDate, activity.status) ? 'slds-text-color_error' : ''}>
                              {activity.isAllDay ? formatDate(activity.dueDate) : formatDateTime(activity.dueDate)}
                              {isOverdue(activity.dueDate, activity.status) && (
                                <span className="slds-badge slds-badge_error slds-m-left_x-small">Overdue</span>
                              )}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="slds-cell-wrap">
                          {activity.assignedToId ? (
                            `${activity.assignedToId.firstName || ''} ${activity.assignedToId.lastName || ''}`.trim()
                          ) : (
                            activity.ownerId ? 
                              `${activity.ownerId.firstName || ''} ${activity.ownerId.lastName || ''}`.trim() :
                              '-'
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="slds-cell-wrap">
                          {activity.leadId && (
                            <Link to={`/leads/${activity.leadId.id || activity.leadId}`} className="slds-text-link">
                              {activity.leadId.firstName ? `${activity.leadId.firstName} ${activity.leadId.lastName}` : 'Lead'}
                            </Link>
                          )}
                          {activity.contactId && (
                            <Link to={`/contacts/${activity.contactId.id || activity.contactId}`} className="slds-text-link">
                              {activity.contactId.firstName ? `${activity.contactId.firstName} ${activity.contactId.lastName}` : 'Contact'}
                            </Link>
                          )}
                          {activity.accountId && (
                            <Link to={`/accounts/${activity.accountId.id || activity.accountId}`} className="slds-text-link">
                              {activity.accountId.name || 'Account'}
                            </Link>
                          )}
                          {activity.opportunityId && (
                            <Link to={`/opportunities/${activity.opportunityId.id || activity.opportunityId}`} className="slds-text-link">
                              {activity.opportunityId.name || 'Opportunity'}
                            </Link>
                          )}
                          {!activity.leadId && !activity.contactId && !activity.accountId && !activity.opportunityId && '-'}
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
                                  to={`/activities/${activity.id}`}
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
                                  to={`/activities/${activity.id}/edit`}
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
                                  onClick={() => handleDeleteActivity(activity)}
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
        title="Delete Activity"
        message={`Are you sure you want to delete ${activityToDelete?.subject}? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
};

export default ActivitiesList;