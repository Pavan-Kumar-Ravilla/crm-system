// src/components/activities/ActivityView.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { activitiesAPI } from '../../services/api';
import ActivityForm from './ActivityForm';
import Button from '../common/Button';
import { PageSpinner } from '../common/Spinner';
import { ConfirmModal, FormModal } from '../common/Modal';
import { 
  Edit, 
  Trash2, 
  ArrowLeft, 
  RefreshCw, 
  Activity, 
  Clock, 
  Calendar, 
  User, 
  Building, 
  Target,
  DollarSign,
  FileText,
  CheckCircle,
  XCircle,
  MapPin,
  Phone,
  Mail,
  Users,
  AlertCircle
} from 'lucide-react';

const ActivityView = ({ mode = 'view' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useApp();
  
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completionData, setCompletionData] = useState({
    outcome: '',
    nextSteps: ''
  });

  useEffect(() => {
    if (mode !== 'create' && id) {
      loadActivity();
    } else if (mode === 'create') {
      setLoading(false);
    }
  }, [id, mode]);

  const loadActivity = async () => {
    try {
      setLoading(true);
      const response = await activitiesAPI.getById(id);
      setActivity(response.activity);
    } catch (error) {
      console.error('Error loading activity:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load activity details'
      });
      navigate('/activities');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (mode === 'view') {
      setShowEditModal(true);
    }
  };

  const handleSave = (updatedActivity) => {
    setActivity(updatedActivity);
    setShowEditModal(false);
    if (mode === 'create') {
      navigate(`/activities/${updatedActivity.id}`);
    }
  };

  const handleDelete = async () => {
    try {
      await activitiesAPI.delete(activity.id);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Activity deleted successfully'
      });
      navigate('/activities');
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete activity'
      });
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleMarkCompleted = async () => {
    try {
      const response = await activitiesAPI.markCompleted(
        activity.id, 
        completionData.outcome, 
        completionData.nextSteps
      );
      setActivity(response.activity);
      setShowCompleteModal(false);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Activity marked as completed'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to mark activity as completed'
      });
    }
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

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Call': return <Phone size={16} />;
      case 'Email': return <Mail size={16} />;
      case 'Meeting': return <Users size={16} />;
      case 'Task': return <CheckCircle size={16} />;
      default: return <Activity size={16} />;
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

  if (loading) {
    return <PageSpinner message="Loading activity..." />;
  }

  if (mode === 'create' || mode === 'edit') {
    return (
      <div className="slds-p-around_medium">
        <ActivityForm 
          activity={activity} 
          mode={mode} 
          onSave={handleSave}
          onCancel={() => navigate(activity ? `/activities/${activity.id}` : '/activities')}
        />
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="slds-p-around_medium">
        <div className="slds-text-align_center">
          <h2>Activity not found</h2>
          <Button onClick={() => navigate('/activities')}>Back to Activities</Button>
        </div>
      </div>
    );
  }

  const canComplete = activity.status !== 'Completed' && activity.status !== 'Cancelled';

  return (
    <div className="slds-p-around_medium">
      {/* Page Header */}
      <div className="slds-page-header slds-page-header_record-home">
        <div className="slds-page-header__row">
          <div className="slds-page-header__col-title">
            <div className="slds-media">
              <div className="slds-media__figure">
                <Link to="/activities">
                  <Button variant="neutral" iconOnly icon={<ArrowLeft size={16} />} />
                </Link>
              </div>
              <div className="slds-media__figure slds-m-left_small">
                <span className="slds-icon_container slds-icon-standard-task">
                  {getTypeIcon(activity.type)}
                </span>
              </div>
              <div className="slds-media__body">
                <div className="slds-page-header__name">
                  <div className="slds-page-header__name-title">
                    <h1>
                      <span className="slds-page-header__title slds-truncate">
                        {activity.subject}
                      </span>
                    </h1>
                  </div>
                </div>
                <p className="slds-page-header__name-meta">
                  {activity.type} • {activity.status}
                  {isOverdue(activity.dueDate, activity.status) && (
                    <span className="slds-badge slds-badge_error slds-m-left_small">Overdue</span>
                  )}
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
                  onClick={loadActivity}
                >
                  Refresh
                </Button>
              </div>
              {canComplete && (
                <div className="slds-page-header__control">
                  <Button
                    variant="success"
                    onClick={() => setShowCompleteModal(true)}
                  >
                    Mark Complete
                  </Button>
                </div>
              )}
              <div className="slds-page-header__control">
                <Button
                  variant="neutral"
                  icon={<Edit size={16} />}
                  onClick={handleEdit}
                >
                  Edit
                </Button>
              </div>
              <div className="slds-page-header__control">
                <Button
                  variant="destructive"
                  icon={<Trash2 size={16} />}
                  onClick={() => setShowDeleteModal(true)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="slds-grid slds-wrap slds-gutters slds-m-top_large">
        {/* Left Column */}
        <div className="slds-col slds-size_1-of-1 slds-large-size_2-of-3">
          {/* Details Card */}
          <div className="slds-card slds-m-bottom_medium">
            <div className="slds-card__header slds-grid">
              <header className="slds-media slds-media_center slds-has-flexi-truncate">
                <div className="slds-media__figure">
                  <span className="slds-icon_container slds-icon-utility-info">
                    <FileText size={16} />
                  </span>
                </div>
                <div className="slds-media__body">
                  <h2 className="slds-card__header-title">
                    <span className="slds-text-heading_small">Activity Details</span>
                  </h2>
                </div>
              </header>
            </div>
            <div className="slds-card__body slds-card__body_inner">
              <div className="slds-form slds-form_horizontal">
                <div className="slds-grid slds-gutters">
                  <div className="slds-col slds-size_1-of-2">
                    <div className="slds-form-element">
                      <span className="slds-form-element__label">Subject</span>
                      <div className="slds-form-element__control">
                        <div className="slds-grid slds-grid_align-center">
                          {getTypeIcon(activity.type)}
                          <span className="slds-form-element__static slds-m-left_small">
                            {activity.subject}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="slds-form-element slds-m-top_medium">
                      <span className="slds-form-element__label">Type</span>
                      <div className="slds-form-element__control">
                        <span className="slds-form-element__static">{activity.type}</span>
                      </div>
                    </div>

                    <div className="slds-form-element slds-m-top_medium">
                      <span className="slds-form-element__label">Status</span>
                      <div className="slds-form-element__control">
                        <div className="slds-grid slds-grid_align-center">
                          {getStatusIcon(activity.status)}
                          <span className="slds-form-element__static slds-m-left_small">
                            {activity.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="slds-form-element slds-m-top_medium">
                      <span className="slds-form-element__label">Priority</span>
                      <div className="slds-form-element__control">
                        <span className={`slds-form-element__static ${getPriorityColor(activity.priority)}`}>
                          {activity.priority}
                        </span>
                      </div>
                    </div>

                    {activity.location && (
                      <div className="slds-form-element slds-m-top_medium">
                        <span className="slds-form-element__label">Location</span>
                        <div className="slds-form-element__control">
                          <div className="slds-grid slds-grid_align-center">
                            <MapPin size={16} className="slds-m-right_small" />
                            <span className="slds-form-element__static">{activity.location}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="slds-col slds-size_1-of-2">
                    {activity.dueDate && (
                      <div className="slds-form-element">
                        <span className="slds-form-element__label">Due Date</span>
                        <div className="slds-form-element__control">
                          <div className="slds-grid slds-grid_align-center">
                            <Calendar size={16} className="slds-m-right_small" />
                            <span className={`slds-form-element__static ${isOverdue(activity.dueDate, activity.status) ? 'slds-text-color_error' : ''}`}>
                              {activity.isAllDay ? formatDate(activity.dueDate) : formatDateTime(activity.dueDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {activity.assignedToId && (
                      <div className="slds-form-element slds-m-top_medium">
                        <span className="slds-form-element__label">Assigned To</span>
                        <div className="slds-form-element__control">
                          <div className="slds-grid slds-grid_align-center">
                            <User size={16} className="slds-m-right_small" />
                            <span className="slds-form-element__static">
                              {activity.assignedToId.firstName} {activity.assignedToId.lastName}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {activity.ownerId && (
                      <div className="slds-form-element slds-m-top_medium">
                        <span className="slds-form-element__label">Created By</span>
                        <div className="slds-form-element__control">
                          <div className="slds-grid slds-grid_align-center">
                            <User size={16} className="slds-m-right_small" />
                            <span className="slds-form-element__static">
                              {activity.ownerId.firstName} {activity.ownerId.lastName}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {activity.reminderDateTime && (
                      <div className="slds-form-element slds-m-top_medium">
                        <span className="slds-form-element__label">Reminder</span>
                        <div className="slds-form-element__control">
                          <div className="slds-grid slds-grid_align-center">
                            <Clock size={16} className="slds-m-right_small" />
                            <span className="slds-form-element__static">
                              {formatDateTime(activity.reminderDateTime)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Call-specific details */}
                {activity.type === 'Call' && (activity.callType || activity.callDuration || activity.callResult) && (
                  <div className="slds-m-top_large">
                    <h3 className="slds-text-heading_small slds-m-bottom_medium">Call Details</h3>
                    <div className="slds-grid slds-gutters">
                      {activity.callType && (
                        <div className="slds-col slds-size_1-of-3">
                          <div className="slds-form-element">
                            <span className="slds-form-element__label">Call Type</span>
                            <div className="slds-form-element__control">
                              <span className="slds-form-element__static">{activity.callType}</span>
                            </div>
                          </div>
                        </div>
                      )}
                      {activity.callDuration && (
                        <div className="slds-col slds-size_1-of-3">
                          <div className="slds-form-element">
                            <span className="slds-form-element__label">Duration</span>
                            <div className="slds-form-element__control">
                              <span className="slds-form-element__static">{activity.callDuration} minutes</span>
                            </div>
                          </div>
                        </div>
                      )}
                      {activity.callResult && (
                        <div className="slds-col slds-size_1-of-3">
                          <div className="slds-form-element">
                            <span className="slds-form-element__label">Result</span>
                            <div className="slds-form-element__control">
                              <span className="slds-form-element__static">{activity.callResult}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Task-specific details */}
                {activity.type === 'Task' && activity.taskSubtype && (
                  <div className="slds-m-top_large">
                    <h3 className="slds-text-heading_small slds-m-bottom_medium">Task Details</h3>
                    <div className="slds-form-element">
                      <span className="slds-form-element__label">Subtype</span>
                      <div className="slds-form-element__control">
                        <span className="slds-form-element__static">{activity.taskSubtype}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recurrence details */}
                {activity.recurrenceType && (
                  <div className="slds-m-top_large">
                    <h3 className="slds-text-heading_small slds-m-bottom_medium">Recurrence</h3>
                    <div className="slds-grid slds-gutters">
                      <div className="slds-col slds-size_1-of-3">
                        <div className="slds-form-element">
                          <span className="slds-form-element__label">Type</span>
                          <div className="slds-form-element__control">
                            <span className="slds-form-element__static">{activity.recurrenceType}</span>
                          </div>
                        </div>
                      </div>
                      {activity.recurrenceInterval && (
                        <div className="slds-col slds-size_1-of-3">
                          <div className="slds-form-element">
                            <span className="slds-form-element__label">Interval</span>
                            <div className="slds-form-element__control">
                              <span className="slds-form-element__static">
                                Every {activity.recurrenceInterval} {activity.recurrenceType.toLowerCase()}(s)
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      {activity.recurrenceEndDate && (
                        <div className="slds-col slds-size_1-of-3">
                          <div className="slds-form-element">
                            <span className="slds-form-element__label">End Date</span>
                            <div className="slds-form-element__control">
                              <span className="slds-form-element__static">
                                {formatDate(activity.recurrenceEndDate)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Description */}
                {activity.description && (
                  <div className="slds-m-top_large">
                    <h3 className="slds-text-heading_small slds-m-bottom_medium">Description</h3>
                    <div className="slds-form-element">
                      <div className="slds-form-element__control">
                        <span className="slds-form-element__static">{activity.description}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="slds-col slds-size_1-of-1 slds-large-size_1-of-3">
          {/* Related Records Card */}
          <div className="slds-card slds-m-bottom_medium">
            <div className="slds-card__header slds-grid">
              <header className="slds-media slds-media_center slds-has-flexi-truncate">
                <div className="slds-media__body">
                  <h2 className="slds-card__header-title">
                    <span className="slds-text-heading_small">Related Records</span>
                  </h2>
                </div>
              </header>
            </div>
            <div className="slds-card__body slds-card__body_inner">
              <div className="slds-list_vertical slds-has-dividers_top-space">
                {activity.leadId && (
                  <div className="slds-list__item slds-p-vertical_small">
                    <div className="slds-grid slds-grid_align-spread">
                      <span className="slds-text-color_weak">Lead</span>
                      <Link 
                        to={`/leads/${activity.leadId.id}`}
                        className="slds-text-link"
                      >
                        {activity.leadId.firstName} {activity.leadId.lastName}
                      </Link>
                    </div>
                  </div>
                )}
                {activity.contactId && (
                  <div className="slds-list__item slds-p-vertical_small">
                    <div className="slds-grid slds-grid_align-spread">
                      <span className="slds-text-color_weak">Contact</span>
                      <Link 
                        to={`/contacts/${activity.contactId.id}`}
                        className="slds-text-link"
                      >
                        {activity.contactId.firstName} {activity.contactId.lastName}
                      </Link>
                    </div>
                  </div>
                )}
                {activity.accountId && (
                  <div className="slds-list__item slds-p-vertical_small">
                    <div className="slds-grid slds-grid_align-spread">
                      <span className="slds-text-color_weak">Account</span>
                      <Link 
                        to={`/accounts/${activity.accountId.id}`}
                        className="slds-text-link"
                      >
                        {activity.accountId.name}
                      </Link>
                    </div>
                  </div>
                )}
                {activity.opportunityId && (
                  <div className="slds-list__item slds-p-vertical_small">
                    <div className="slds-grid slds-grid_align-spread">
                      <span className="slds-text-color_weak">Opportunity</span>
                      <Link 
                        to={`/opportunities/${activity.opportunityId.id}`}
                        className="slds-text-link"
                      >
                        {activity.opportunityId.name}
                      </Link>
                    </div>
                  </div>
                )}
                {!activity.leadId && !activity.contactId && !activity.accountId && !activity.opportunityId && (
                  <div className="slds-list__item slds-p-vertical_small">
                    <span className="slds-text-color_weak">No related records</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Key Information Card */}
          <div className="slds-card">
            <div className="slds-card__header slds-grid">
              <header className="slds-media slds-media_center slds-has-flexi-truncate">
                <div className="slds-media__body">
                  <h2 className="slds-card__header-title">
                    <span className="slds-text-heading_small">Key Information</span>
                  </h2>
                </div>
              </header>
            </div>
            <div className="slds-card__body slds-card__body_inner">
              <div className="slds-list_vertical slds-has-dividers_top-space">
                <div className="slds-list__item slds-p-vertical_small">
                  <div className="slds-grid slds-grid_align-spread">
                    <span className="slds-text-color_weak">Created</span>
                    <span>{formatDateTime(activity.createdAt)}</span>
                  </div>
                </div>
                <div className="slds-list__item slds-p-vertical_small">
                  <div className="slds-grid slds-grid_align-spread">
                    <span className="slds-text-color_weak">Last Modified</span>
                    <span>{formatDateTime(activity.updatedAt)}</span>
                  </div>
                </div>
                {activity.isAllDay && (
                  <div className="slds-list__item slds-p-vertical_small">
                    <span className="slds-badge slds-badge_success">All Day</span>
                  </div>
                )}
                {activity.isPrivate && (
                  <div className="slds-list__item slds-p-vertical_small">
                    <span className="slds-badge slds-badge_warning">Private</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <FormModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Activity"
        size="large"
      >
        <ActivityForm 
          activity={activity} 
          mode="edit" 
          onSave={handleSave}
          onCancel={() => setShowEditModal(false)}
        />
      </FormModal>

      {/* Complete Activity Modal */}
      <FormModal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        onSubmit={handleMarkCompleted}
        title="Mark Activity as Complete"
        submitText="Mark Complete"
      >
        <div className="slds-form slds-form_stacked">
          <div className="slds-form-element">
            <label className="slds-form-element__label" htmlFor="outcome">
              Outcome
            </label>
            <div className="slds-form-element__control">
              <input
                type="text"
                id="outcome"
                className="slds-input"
                value={completionData.outcome}
                onChange={(e) => setCompletionData(prev => ({ ...prev, outcome: e.target.value }))}
                placeholder="Describe the outcome..."
              />
            </div>
          </div>
          <div className="slds-form-element slds-m-top_medium">
            <label className="slds-form-element__label" htmlFor="next-steps">
              Next Steps
            </label>
            <div className="slds-form-element__control">
              <textarea
                id="next-steps"
                className="slds-textarea"
                rows="3"
                value={completionData.nextSteps}
                onChange={(e) => setCompletionData(prev => ({ ...prev, nextSteps: e.target.value }))}
                placeholder="What are the next steps?"
              />
            </div>
          </div>
        </div>
      </FormModal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Activity"
        message={`Are you sure you want to delete ${activity.subject}? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
};

export default ActivityView;