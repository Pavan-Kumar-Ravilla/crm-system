// src/components/dashboard/RecentActivity.js
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  Mail, 
  Calendar, 
  CheckSquare, 
  FileText, 
  Activity,
  User,
  Building,
  Target,
  DollarSign
} from 'lucide-react';

const RecentActivity = ({ activities = [] }) => {
  const getActivityIcon = (type) => {
    const iconMap = {
      Call: <Phone size={16} />,
      Email: <Mail size={16} />,
      Meeting: <Calendar size={16} />,
      Task: <CheckSquare size={16} />,
      Note: <FileText size={16} />,
      Demo: <Activity size={16} />,
      Proposal: <FileText size={16} />,
      'Follow-up': <Activity size={16} />
    };
    return iconMap[type] || <Activity size={16} />;
  };

  const getRelatedRecordIcon = (activity) => {
    if (activity.leadId) return <Target size={14} />;
    if (activity.opportunityId) return <DollarSign size={14} />;
    if (activity.accountId) return <Building size={14} />;
    if (activity.contactId) return <User size={14} />;
    return null;
  };

  const getRelatedRecordLink = (activity) => {
    if (activity.leadId) return `/leads/${activity.leadId}`;
    if (activity.opportunityId) return `/opportunities/${activity.opportunityId}`;
    if (activity.accountId) return `/accounts/${activity.accountId}`;
    if (activity.contactId) return `/contacts/${activity.contactId}`;
    return null;
  };

  const getRelatedRecordName = (activity) => {
    if (activity.leadId) return activity.leadId.firstName ? `${activity.leadId.firstName} ${activity.leadId.lastName}` : 'Lead';
    if (activity.opportunityId) return activity.opportunityId.name || 'Opportunity';
    if (activity.accountId) return activity.accountId.name || 'Account';
    if (activity.contactId) return activity.contactId.firstName ? `${activity.contactId.firstName} ${activity.contactId.lastName}` : 'Contact';
    return null;
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInHours = Math.floor((now - activityDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - activityDate) / (1000 * 60));
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'slds-text-color_error';
      case 'Normal':
        return 'slds-text-color_default';
      case 'Low':
        return 'slds-text-color_weak';
      default:
        return 'slds-text-color_default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'slds-text-color_success';
      case 'In Progress':
        return 'slds-text-color_warning';
      case 'Not Started':
        return 'slds-text-color_default';
      case 'Cancelled':
        return 'slds-text-color_error';
      default:
        return 'slds-text-color_default';
    }
  };

  if (activities.length === 0) {
    return (
      <div className="slds-text-align_center slds-p-vertical_large">
        <Activity size={48} className="slds-icon slds-icon_large slds-text-color_weak" />
        <p className="slds-text-heading_small slds-m-top_small">No recent activities</p>
        <p className="slds-text-color_weak">Your recent activities will appear here</p>
      </div>
    );
  }

  return (
    <div className="slds-list_vertical slds-has-dividers_top-space">
      {activities.map((activity, index) => {
        const relatedRecordLink = getRelatedRecordLink(activity);
        const relatedRecordName = getRelatedRecordName(activity);
        const relatedRecordIcon = getRelatedRecordIcon(activity);

        return (
          <div key={activity.id || index} className="slds-list__item slds-p-vertical_small">
            <div className="slds-media">
              <div className="slds-media__figure">
                <span className="slds-avatar slds-avatar_circle slds-avatar_small">
                  <div className="slds-icon_container" style={{ backgroundColor: '#f3f2f2', borderRadius: '50%', padding: '0.25rem' }}>
                    {getActivityIcon(activity.type)}
                  </div>
                </span>
              </div>
              <div className="slds-media__body">
                <div className="slds-grid slds-grid_align-spread">
                  <div className="slds-col">
                    <p className="slds-text-body_regular slds-text-color_default">
                      <Link 
                        to={`/activities/${activity.id}`} 
                        className="slds-text-link"
                      >
                        {activity.subject}
                      </Link>
                    </p>
                    <div className="slds-grid slds-grid_align-center slds-m-top_x-small">
                      <span className={`slds-text-body_small ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                      <span className="slds-text-body_small slds-text-color_weak slds-m-left_small">
                        {activity.type}
                      </span>
                      {activity.priority && (
                        <span className={`slds-text-body_small slds-m-left_small ${getPriorityColor(activity.priority)}`}>
                          • {activity.priority} Priority
                        </span>
                      )}
                    </div>
                    {relatedRecordName && (
                      <div className="slds-grid slds-grid_align-center slds-m-top_x-small">
                        <span className="slds-text-body_small slds-text-color_weak">
                          Related to:
                        </span>
                        {relatedRecordLink ? (
                          <Link 
                            to={relatedRecordLink} 
                            className="slds-text-link slds-text-body_small slds-m-left_x-small"
                          >
                            <span className="slds-grid slds-grid_align-center">
                              {relatedRecordIcon && (
                                <span className="slds-m-right_x-small">
                                  {relatedRecordIcon}
                                </span>
                              )}
                              {relatedRecordName}
                            </span>
                          </Link>
                        ) : (
                          <span className="slds-text-body_small slds-text-color_default slds-m-left_x-small">
                            <span className="slds-grid slds-grid_align-center">
                              {relatedRecordIcon && (
                                <span className="slds-m-right_x-small">
                                  {relatedRecordIcon}
                                </span>
                              )}
                              {relatedRecordName}
                            </span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="slds-col slds-no-flex">
                    <span className="slds-text-body_small slds-text-color_weak">
                      {formatTimeAgo(activity.createdAt || activity.updatedAt)}
                    </span>
                  </div>
                </div>
                {activity.description && (
                  <div className="slds-m-top_x-small">
                    <p className="slds-text-body_small slds-text-color_weak slds-line-clamp">
                      {activity.description.length > 100 
                        ? `${activity.description.substring(0, 100)}...` 
                        : activity.description
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RecentActivity;