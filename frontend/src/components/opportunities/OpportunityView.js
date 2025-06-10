// src/components/opportunities/OpportunityView.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { opportunitiesAPI, activitiesAPI } from '../../services/api';
import OpportunityForm from './OpportunityForm';
import Button from '../common/Button';
import { PageSpinner } from '../common/Spinner';
import { ConfirmModal, FormModal } from '../common/Modal';
import { 
  Edit, 
  Trash2, 
  ArrowLeft, 
  RefreshCw, 
  DollarSign, 
  Building, 
  User, 
  Calendar,
  FileText,
  Activity,
  Target,
  TrendingUp,
  Percent,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

const OpportunityView = ({ mode = 'view' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useApp();
  
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [relatedData, setRelatedData] = useState({
    activities: []
  });

  useEffect(() => {
    if (mode !== 'create' && id) {
      loadOpportunity();
      loadRelatedData();
    } else if (mode === 'create') {
      setLoading(false);
    }
  }, [id, mode]);

  const loadOpportunity = async () => {
    try {
      setLoading(true);
      const response = await opportunitiesAPI.getById(id);
      setOpportunity(response.opportunity);
    } catch (error) {
      console.error('Error loading opportunity:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load opportunity details'
      });
      navigate('/opportunities');
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedData = async () => {
    try {
      const activitiesResponse = await activitiesAPI.getByOpportunity(id, { limit: 10 }).catch(() => ({ activities: [] }));
      setRelatedData({
        activities: activitiesResponse.activities || []
      });
    } catch (error) {
      console.error('Error loading related data:', error);
    }
  };

  const handleEdit = () => {
    if (mode === 'view') {
      setShowEditModal(true);
    }
  };

  const handleSave = (updatedOpportunity) => {
    setOpportunity(updatedOpportunity);
    setShowEditModal(false);
    if (mode === 'create') {
      navigate(`/opportunities/${updatedOpportunity.id}`);
    }
  };

  const handleDelete = async () => {
    try {
      await opportunitiesAPI.delete(opportunity.id);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Opportunity deleted successfully'
      });
      navigate('/opportunities');
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete opportunity'
      });
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleAdvanceStage = async () => {
    try {
      const response = await opportunitiesAPI.advanceStage(opportunity.id);
      setOpportunity(response.opportunity);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Opportunity stage advanced successfully'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to advance opportunity stage'
      });
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
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  };

  const isOverdue = (closeDate) => {
    return new Date(closeDate) < new Date();
  };

  const getProgressColor = (probability) => {
    if (probability >= 75) return '#2e844a'; // Green
    if (probability >= 50) return '#ffb75d'; // Yellow
    if (probability >= 25) return '#ff8a3c'; // Orange
    return '#c23934'; // Red
  };

  if (loading) {
    return <PageSpinner message="Loading opportunity..." />;
  }

  if (mode === 'create' || mode === 'edit') {
    return (
      <div className="slds-p-around_medium">
        <OpportunityForm 
          opportunity={opportunity} 
          mode={mode} 
          onSave={handleSave}
          onCancel={() => navigate(opportunity ? `/opportunities/${opportunity.id}` : '/opportunities')}
        />
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="slds-p-around_medium">
        <div className="slds-text-align_center">
          <h2>Opportunity not found</h2>
          <Button onClick={() => navigate('/opportunities')}>Back to Opportunities</Button>
        </div>
      </div>
    );
  }

  const canAdvanceStage = opportunity.stage !== 'Closed Won' && opportunity.stage !== 'Closed Lost';

  return (
    <div className="slds-p-around_medium">
      {/* Page Header */}
      <div className="slds-page-header slds-page-header_record-home">
        <div className="slds-page-header__row">
          <div className="slds-page-header__col-title">
            <div className="slds-media">
              <div className="slds-media__figure">
                <Link to="/opportunities">
                  <Button variant="neutral" iconOnly icon={<ArrowLeft size={16} />} />
                </Link>
              </div>
              <div className="slds-media__figure slds-m-left_small">
                <span className="slds-icon_container slds-icon-standard-opportunity">
                  <DollarSign size={24} />
                </span>
              </div>
              <div className="slds-media__body">
                <div className="slds-page-header__name">
                  <div className="slds-page-header__name-title">
                    <h1>
                      <span className="slds-page-header__title slds-truncate">
                        {opportunity.name}
                      </span>
                    </h1>
                  </div>
                </div>
                <p className="slds-page-header__name-meta">
                  Opportunity • {opportunity.accountId?.name || 'No Account'}
                  <span className={`slds-badge ${getStageBadgeVariant(opportunity.stage)} slds-m-left_small`}>
                    {opportunity.stage}
                  </span>
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
                  onClick={loadOpportunity}
                >
                  Refresh
                </Button>
              </div>
              {canAdvanceStage && (
                <div className="slds-page-header__control">
                  <Button
                    variant="success"
                    onClick={handleAdvanceStage}
                  >
                    Advance Stage
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
          {/* Key Metrics Card */}
          <div className="slds-card slds-m-bottom_medium">
            <div className="slds-card__header slds-grid">
              <header className="slds-media slds-media_center slds-has-flexi-truncate">
                <div className="slds-media__figure">
                  <span className="slds-icon_container slds-icon-utility-chart">
                    <TrendingUp size={16} />
                  </span>
                </div>
                <div className="slds-media__body">
                  <h2 className="slds-card__header-title">
                    <span className="slds-text-heading_small">Key Metrics</span>
                  </h2>
                </div>
              </header>
            </div>
            <div className="slds-card__body slds-card__body_inner">
              <div className="slds-grid slds-gutters">
                <div className="slds-col slds-size_1-of-3">
                  <div className="slds-text-align_center slds-p-around_medium">
                    <div className="slds-text-heading_large slds-text-color_default">
                      {formatCurrency(opportunity.amount)}
                    </div>
                    <div className="slds-text-body_small slds-text-color_weak">Amount</div>
                  </div>
                </div>
                <div className="slds-col slds-size_1-of-3">
                  <div className="slds-text-align_center slds-p-around_medium">
                    <div className="slds-text-heading_large slds-text-color_default">
                      {opportunity.probability}%
                    </div>
                    <div className="slds-text-body_small slds-text-color_weak">Probability</div>
                    <div className="slds-progress-bar slds-m-top_x-small">
                      <span 
                        className="slds-progress-bar__value" 
                        style={{ 
                          width: `${opportunity.probability}%`,
                          backgroundColor: getProgressColor(opportunity.probability)
                        }}
                      >
                        <span className="slds-assistive-text">Progress: {opportunity.probability}%</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="slds-col slds-size_1-of-3">
                  <div className="slds-text-align_center slds-p-around_medium">
                    <div className="slds-text-heading_large slds-text-color_default">
                      {formatCurrency(opportunity.expectedRevenue || (opportunity.amount * opportunity.probability / 100))}
                    </div>
                    <div className="slds-text-body_small slds-text-color_weak">Expected Revenue</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

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
                    <span className="slds-text-heading_small">Opportunity Details</span>
                  </h2>
                </div>
              </header>
            </div>
            <div className="slds-card__body slds-card__body_inner">
              <div className="slds-form slds-form_horizontal">
                <div className="slds-grid slds-gutters">
                  <div className="slds-col slds-size_1-of-2">
                    <div className="slds-form-element">
                      <span className="slds-form-element__label">Opportunity Name</span>
                      <div className="slds-form-element__control">
                        <div className="slds-grid slds-grid_align-center">
                          <Target size={16} className="slds-m-right_small" />
                          <span className="slds-form-element__static">{opportunity.name}</span>
                        </div>
                      </div>
                    </div>

                    {opportunity.accountId && (
                      <div className="slds-form-element slds-m-top_medium">
                        <span className="slds-form-element__label">Account</span>
                        <div className="slds-form-element__control">
                          <div className="slds-grid slds-grid_align-center">
                            <Building size={16} className="slds-m-right_small" />
                            <Link 
                              to={`/accounts/${opportunity.accountId.id}`}
                              className="slds-text-link"
                            >
                              {opportunity.accountId.name}
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}

                    {opportunity.primaryContactId && (
                      <div className="slds-form-element slds-m-top_medium">
                        <span className="slds-form-element__label">Primary Contact</span>
                        <div className="slds-form-element__control">
                          <div className="slds-grid slds-grid_align-center">
                            <User size={16} className="slds-m-right_small" />
                            <Link 
                              to={`/contacts/${opportunity.primaryContactId.id}`}
                              className="slds-text-link"
                            >
                              {opportunity.primaryContactId.firstName} {opportunity.primaryContactId.lastName}
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}

                    {opportunity.type && (
                      <div className="slds-form-element slds-m-top_medium">
                        <span className="slds-form-element__label">Type</span>
                        <div className="slds-form-element__control">
                          <span className="slds-form-element__static">{opportunity.type}</span>
                        </div>
                      </div>
                    )}

                    {opportunity.leadSource && (
                      <div className="slds-form-element slds-m-top_medium">
                        <span className="slds-form-element__label">Lead Source</span>
                        <div className="slds-form-element__control">
                          <span className="slds-form-element__static">{opportunity.leadSource}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="slds-col slds-size_1-of-2">
                    <div className="slds-form-element">
                      <span className="slds-form-element__label">Stage</span>
                      <div className="slds-form-element__control">
                        <span className={`slds-badge ${getStageBadgeVariant(opportunity.stage)}`}>
                          {opportunity.stage}
                        </span>
                      </div>
                    </div>

                    <div className="slds-form-element slds-m-top_medium">
                      <span className="slds-form-element__label">Close Date</span>
                      <div className="slds-form-element__control">
                        <div className="slds-grid slds-grid_align-center">
                          <Calendar size={16} className="slds-m-right_small" />
                          <span className={`slds-form-element__static ${isOverdue(opportunity.closeDate) ? 'slds-text-color_error' : ''}`}>
                            {formatDate(opportunity.closeDate)}
                            {isOverdue(opportunity.closeDate) && (
                              <span className="slds-badge slds-badge_error slds-m-left_small">Overdue</span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {opportunity.forecastCategory && (
                      <div className="slds-form-element slds-m-top_medium">
                        <span className="slds-form-element__label">Forecast Category</span>
                        <div className="slds-form-element__control">
                          <span className="slds-form-element__static">{opportunity.forecastCategory}</span>
                        </div>
                      </div>
                    )}

                    {opportunity.nextStep && (
                      <div className="slds-form-element slds-m-top_medium">
                        <span className="slds-form-element__label">Next Step</span>
                        <div className="slds-form-element__control">
                          <span className="slds-form-element__static">{opportunity.nextStep}</span>
                        </div>
                      </div>
                    )}

                    {opportunity.ownerId && (
                      <div className="slds-form-element slds-m-top_medium">
                        <span className="slds-form-element__label">Opportunity Owner</span>
                        <div className="slds-form-element__control">
                          <div className="slds-grid slds-grid_align-center">
                            <User size={16} className="slds-m-right_small" />
                            <span className="slds-form-element__static">
                              {opportunity.ownerId.firstName} {opportunity.ownerId.lastName}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                {opportunity.description && (
                  <div className="slds-m-top_large">
                    <h3 className="slds-text-heading_small slds-m-bottom_medium">Description</h3>
                    <div className="slds-form-element">
                      <div className="slds-form-element__control">
                        <span className="slds-form-element__static">{opportunity.description}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Activities */}
          <div className="slds-card">
            <div className="slds-card__header slds-grid">
              <header className="slds-media slds-media_center slds-has-flexi-truncate">
                <div className="slds-media__figure">
                  <span className="slds-icon_container slds-icon-standard-task">
                    <Activity size={16} />
                  </span>
                </div>
                <div className="slds-media__body">
                  <h2 className="slds-card__header-title">
                    <span className="slds-text-heading_small">Activities ({relatedData.activities.length})</span>
                  </h2>
                </div>
              </header>
              <div className="slds-no-flex">
                <Link to={`/activities/new?opportunityId=${opportunity.id}`}>
                  <Button size="small" icon={<Target size={14} />}>
                    New Activity
                  </Button>
                </Link>
              </div>
            </div>
            <div className="slds-card__body slds-card__body_inner">
              {relatedData.activities.length === 0 ? (
                <div className="slds-text-align_center slds-p-vertical_medium">
                  <Activity size={32} className="slds-icon slds-icon_large slds-text-color_weak" />
                  <p className="slds-text-color_weak">No activities yet</p>
                </div>
              ) : (
                <div className="slds-list_vertical slds-has-dividers_top-space">
                  {relatedData.activities.map((activity, index) => (
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
                              <Link 
                                to={`/activities/${activity.id}`}
                                className="slds-text-link"
                              >
                                {activity.subject}
                              </Link>
                              <div className="slds-text-body_small slds-text-color_weak">
                                {activity.type} • {formatDate(activity.dueDate || activity.createdAt)}
                              </div>
                            </div>
                            <div className="slds-text-color_weak">
                              <span className={`slds-badge ${activity.status === 'Completed' ? 'slds-theme_success' : 'slds-theme_default'}`}>
                                {activity.status}
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
            {relatedData.activities.length > 0 && (
              <div className="slds-card__footer">
                <Link to={`/activities?opportunityId=${opportunity.id}`} className="slds-text-link">
                  View All Activities ({relatedData.activities.length})
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="slds-col slds-size_1-of-1 slds-large-size_1-of-3">
          {/* Key Information Card */}
          <div className="slds-card slds-m-bottom_medium">
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
                    <span>{formatDate(opportunity.createdAt)}</span>
                  </div>
                </div>
                <div className="slds-list__item slds-p-vertical_small">
                  <div className="slds-grid slds-grid_align-spread">
                    <span className="slds-text-color_weak">Last Modified</span>
                    <span>{formatDate(opportunity.updatedAt)}</span>
                  </div>
                </div>
                <div className="slds-list__item slds-p-vertical_small">
                  <div className="slds-grid slds-grid_align-spread">
                    <span className="slds-text-color_weak">Days to Close</span>
                    <span>
                      {Math.ceil((new Date(opportunity.closeDate) - new Date()) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </div>
                </div>
                {opportunity.isPrivate && (
                  <div className="slds-list__item slds-p-vertical_small">
                    <span className="slds-badge slds-badge_warning">Private</span>
                  </div>
                )}
                {opportunity.hasOpenActivity && (
                  <div className="slds-list__item slds-p-vertical_small">
                    <span className="slds-badge slds-badge_success">Has Open Activity</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stage Progress */}
          <div className="slds-card">
            <div className="slds-card__header slds-grid">
              <header className="slds-media slds-media_center slds-has-flexi-truncate">
                <div className="slds-media__body">
                  <h2 className="slds-card__header-title">
                    <span className="slds-text-heading_small">Stage Progress</span>
                  </h2>
                </div>
              </header>
            </div>
            <div className="slds-card__body slds-card__body_inner">
              <div className="slds-path">
                <div className="slds-grid slds-path__track">
                  <div className="slds-grid slds-path__scroller-container">
                    <div className="slds-path__scroller" role="application">
                      <div className="slds-path__scroller_inner">
                        <ul className="slds-path__nav" role="listbox">
                          {[
                            'Prospecting',
                            'Qualification', 
                            'Needs Analysis',
                            'Proposal/Price Quote',
                            'Negotiation/Review',
                            opportunity.stage === 'Closed Won' ? 'Closed Won' : 'Closed Lost'
                          ].map((stage, index) => {
                            const isCurrent = stage === opportunity.stage;
                            const isCompleted = [
                              'Prospecting',
                              'Qualification', 
                              'Needs Analysis',
                              'Proposal/Price Quote',
                              'Negotiation/Review'
                            ].indexOf(opportunity.stage) > index;
                            
                            return (
                              <li key={stage} className={`slds-path__item ${
                                isCurrent ? 'slds-is-current slds-is-active' : 
                                isCompleted ? 'slds-is-complete' : 'slds-is-incomplete'
                              }`} role="option">
                                <span className="slds-path__link">
                                  <span className="slds-path__stage">
                                    <span className="slds-path__title">{stage}</span>
                                  </span>
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <FormModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Opportunity"
        size="large"
      >
        <OpportunityForm 
          opportunity={opportunity} 
          mode="edit" 
          onSave={handleSave}
          onCancel={() => setShowEditModal(false)}
        />
      </FormModal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Opportunity"
        message={`Are you sure you want to delete ${opportunity.name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
};

export default OpportunityView;