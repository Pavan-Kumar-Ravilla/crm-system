// src/components/contacts/ContactView.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { contactsAPI, activitiesAPI, opportunitiesAPI } from '../../services/api';
import ContactForm from './ContactForm';
import Button from '../common/Button';
import { PageSpinner } from '../common/Spinner';
import { ConfirmModal, FormModal } from '../common/Modal';
import { 
  Edit, 
  Trash2, 
  ArrowLeft, 
  RefreshCw, 
  User, 
  Building, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  FileText,
  Activity,
  DollarSign,
  Users,
  Target
} from 'lucide-react';

const ContactView = ({ mode = 'view' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useApp();
  
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [relatedData, setRelatedData] = useState({
    activities: [],
    opportunities: []
  });

  useEffect(() => {
    if (mode !== 'create' && id) {
      loadContact();
      loadRelatedData();
    } else if (mode === 'create') {
      setLoading(false);
    }
  }, [id, mode]);

  const loadContact = async () => {
    try {
      setLoading(true);
      const response = await contactsAPI.getById(id);
      setContact(response.contact);
    } catch (error) {
      console.error('Error loading contact:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load contact details'
      });
      navigate('/contacts');
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedData = async () => {
    try {
      const [activitiesResponse, opportunitiesResponse] = await Promise.all([
        activitiesAPI.getByContact(id, { limit: 5 }).catch(() => ({ activities: [] })),
        opportunitiesAPI.getAll({ contactId: id, limit: 5 }).catch(() => ({ opportunities: [] }))
      ]);

      setRelatedData({
        activities: activitiesResponse.activities || [],
        opportunities: opportunitiesResponse.opportunities || []
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

  const handleSave = (updatedContact) => {
    setContact(updatedContact);
    setShowEditModal(false);
    if (mode === 'create') {
      navigate(`/contacts/${updatedContact.id}`);
    }
  };

  const handleDelete = async () => {
    try {
      await contactsAPI.delete(contact.id);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Contact deleted successfully'
      });
      navigate('/contacts');
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete contact'
      });
    } finally {
      setShowDeleteModal(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  if (loading) {
    return <PageSpinner message="Loading contact..." />;
  }

  if (mode === 'create' || mode === 'edit') {
    return (
      <div className="slds-p-around_medium">
        <ContactForm 
          contact={contact} 
          mode={mode} 
          onSave={handleSave}
          onCancel={() => navigate(contact ? `/contacts/${contact.id}` : '/contacts')}
        />
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="slds-p-around_medium">
        <div className="slds-text-align_center">
          <h2>Contact not found</h2>
          <Button onClick={() => navigate('/contacts')}>Back to Contacts</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="slds-p-around_medium">
      {/* Page Header */}
      <div className="slds-page-header slds-page-header_record-home">
        <div className="slds-page-header__row">
          <div className="slds-page-header__col-title">
            <div className="slds-media">
              <div className="slds-media__figure">
                <Link to="/contacts">
                  <Button variant="neutral" iconOnly icon={<ArrowLeft size={16} />} />
                </Link>
              </div>
              <div className="slds-media__figure slds-m-left_small">
                <span className="slds-avatar slds-avatar_circle slds-avatar_large">
                  <span className="slds-avatar__initials slds-icon-standard-user">
                    {getInitials(contact.firstName, contact.lastName)}
                  </span>
                </span>
              </div>
              <div className="slds-media__body">
                <div className="slds-page-header__name">
                  <div className="slds-page-header__name-title">
                    <h1>
                      <span className="slds-page-header__title slds-truncate">
                        {contact.firstName} {contact.lastName}
                      </span>
                    </h1>
                  </div>
                </div>
                <p className="slds-page-header__name-meta">
                  Contact • {contact.accountId?.name || 'No Account'}
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
                  onClick={loadContact}
                >
                  Refresh
                </Button>
              </div>
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
                    <span className="slds-text-heading_small">Contact Details</span>
                  </h2>
                </div>
              </header>
            </div>
            <div className="slds-card__body slds-card__body_inner">
              <div className="slds-form slds-form_horizontal">
                <div className="slds-grid slds-gutters">
                  <div className="slds-col slds-size_1-of-2">
                    <div className="slds-form-element">
                      <span className="slds-form-element__label">Name</span>
                      <div className="slds-form-element__control">
                        <div className="slds-grid slds-grid_align-center">
                          <User size={16} className="slds-m-right_small" />
                          <span className="slds-form-element__static">
                            {contact.firstName} {contact.lastName}
                          </span>
                        </div>
                      </div>
                    </div>

                    {contact.title && (
                      <div className="slds-form-element slds-m-top_medium">
                        <span className="slds-form-element__label">Title</span>
                        <div className="slds-form-element__control">
                          <span className="slds-form-element__static">{contact.title}</span>
                        </div>
                      </div>
                    )}

                    {contact.department && (
                      <div className="slds-form-element slds-m-top_medium">
                        <span className="slds-form-element__label">Department</span>
                        <div className="slds-form-element__control">
                          <span className="slds-form-element__static">{contact.department}</span>
                        </div>
                      </div>
                    )}

                    {contact.email && (
                      <div className="slds-form-element slds-m-top_medium">
                        <span className="slds-form-element__label">Email</span>
                        <div className="slds-form-element__control">
                          <div className="slds-grid slds-grid_align-center">
                            <Mail size={16} className="slds-m-right_small" />
                            <a href={`mailto:${contact.email}`} className="slds-text-link">
                              {contact.email}
                            </a>
                          </div>
                        </div>
                      </div>
                    )}

                    {contact.phone && (
                      <div className="slds-form-element slds-m-top_medium">
                        <span className="slds-form-element__label">Phone</span>
                        <div className="slds-form-element__control">
                          <div className="slds-grid slds-grid_align-center">
                            <Phone size={16} className="slds-m-right_small" />
                            <a href={`tel:${contact.phone}`} className="slds-text-link">
                              {contact.phone}
                            </a>
                          </div>
                        </div>
                      </div>
                    )}

                    {contact.mobilePhone && (
                      <div className="slds-form-element slds-m-top_medium">
                        <span className="slds-form-element__label">Mobile Phone</span>
                        <div className="slds-form-element__control">
                          <div className="slds-grid slds-grid_align-center">
                            <Phone size={16} className="slds-m-right_small" />
                            <a href={`tel:${contact.mobilePhone}`} className="slds-text-link">
                              {contact.mobilePhone}
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="slds-col slds-size_1-of-2">
                    {contact.accountId && (
                      <div className="slds-form-element">
                        <span className="slds-form-element__label">Account</span>
                        <div className="slds-form-element__control">
                          <div className="slds-grid slds-grid_align-center">
                            <Building size={16} className="slds-m-right_small" />
                            <Link 
                              to={`/accounts/${contact.accountId.id}`}
                              className="slds-text-link"
                            >
                              {contact.accountId.name}
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}

                    {contact.reportsToId && (
                      <div className="slds-form-element slds-m-top_medium">
                        <span className="slds-form-element__label">Reports To</span>
                        <div className="slds-form-element__control">
                          <div className="slds-grid slds-grid_align-center">
                            <Users size={16} className="slds-m-right_small" />
                            <Link 
                              to={`/contacts/${contact.reportsToId.id}`}
                              className="slds-text-link"
                            >
                              {contact.reportsToId.firstName} {contact.reportsToId.lastName}
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}

                    {contact.leadSource && (
                      <div className="slds-form-element slds-m-top_medium">
                        <span className="slds-form-element__label">Lead Source</span>
                        <div className="slds-form-element__control">
                          <span className="slds-form-element__static">{contact.leadSource}</span>
                        </div>
                      </div>
                    )}

                    {contact.birthdate && (
                      <div className="slds-form-element slds-m-top_medium">
                        <span className="slds-form-element__label">Birthdate</span>
                        <div className="slds-form-element__control">
                          <div className="slds-grid slds-grid_align-center">
                            <Calendar size={16} className="slds-m-right_small" />
                            <span className="slds-form-element__static">
                              {formatDate(contact.birthdate)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {contact.ownerId && (
                      <div className="slds-form-element slds-m-top_medium">
                        <span className="slds-form-element__label">Contact Owner</span>
                        <div className="slds-form-element__control">
                          <div className="slds-grid slds-grid_align-center">
                            <User size={16} className="slds-m-right_small" />
                            <span className="slds-form-element__static">
                              {contact.ownerId.firstName} {contact.ownerId.lastName}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Address Information */}
                {(contact.mailingAddress?.street || contact.mailingAddress?.city) && (
                  <div className="slds-m-top_large">
                    <h3 className="slds-text-heading_small slds-m-bottom_medium">Mailing Address</h3>
                    <div className="slds-form-element">
                      <span className="slds-form-element__label">Address</span>
                      <div className="slds-form-element__control">
                        <div className="slds-grid slds-grid_align-center">
                          <MapPin size={16} className="slds-m-right_small" />
                          <span className="slds-form-element__static">
                            {[
                              contact.mailingAddress?.street,
                              contact.mailingAddress?.city,
                              contact.mailingAddress?.state,
                              contact.mailingAddress?.zipCode,
                              contact.mailingAddress?.country
                            ].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {(contact.otherAddress?.street || contact.otherAddress?.city) && (
                  <div className="slds-m-top_large">
                    <h3 className="slds-text-heading_small slds-m-bottom_medium">Other Address</h3>
                    <div className="slds-form-element">
                      <span className="slds-form-element__label">Address</span>
                      <div className="slds-form-element__control">
                        <div className="slds-grid slds-grid_align-center">
                          <MapPin size={16} className="slds-m-right_small" />
                          <span className="slds-form-element__static">
                            {[
                              contact.otherAddress?.street,
                              contact.otherAddress?.city,
                              contact.otherAddress?.state,
                              contact.otherAddress?.zipCode,
                              contact.otherAddress?.country
                            ].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Assistant Information */}
                {(contact.assistantName || contact.assistantPhone) && (
                  <div className="slds-m-top_large">
                    <h3 className="slds-text-heading_small slds-m-bottom_medium">Assistant Information</h3>
                    <div className="slds-grid slds-gutters">
                      {contact.assistantName && (
                        <div className="slds-col slds-size_1-of-2">
                          <div className="slds-form-element">
                            <span className="slds-form-element__label">Assistant Name</span>
                            <div className="slds-form-element__control">
                              <span className="slds-form-element__static">{contact.assistantName}</span>
                            </div>
                          </div>
                        </div>
                      )}
                      {contact.assistantPhone && (
                        <div className="slds-col slds-size_1-of-2">
                          <div className="slds-form-element">
                            <span className="slds-form-element__label">Assistant Phone</span>
                            <div className="slds-form-element__control">
                              <a href={`tel:${contact.assistantPhone}`} className="slds-text-link">
                                {contact.assistantPhone}
                              </a>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Description */}
                {contact.description && (
                  <div className="slds-m-top_large">
                    <h3 className="slds-text-heading_small slds-m-bottom_medium">Description</h3>
                    <div className="slds-form-element">
                      <div className="slds-form-element__control">
                        <span className="slds-form-element__static">{contact.description}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Related Lists */}
          <div className="slds-grid slds-wrap slds-gutters">
            {/* Activities */}
            <div className="slds-col slds-size_1-of-1 slds-large-size_1-of-2">
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
                    <Link to={`/activities/new?contactId=${contact.id}`}>
                      <Button size="small" icon={<Target size={14} />}>
                        New
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
                      {relatedData.activities.slice(0, 5).map((activity, index) => (
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
                                    {activity.type} • {new Date(activity.createdAt).toLocaleDateString()}
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
                    <Link to={`/activities?contactId=${contact.id}`} className="slds-text-link">
                      View All Activities ({relatedData.activities.length})
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Opportunities */}
            <div className="slds-col slds-size_1-of-1 slds-large-size_1-of-2">
              <div className="slds-card">
                <div className="slds-card__header slds-grid">
                  <header className="slds-media slds-media_center slds-has-flexi-truncate">
                    <div className="slds-media__figure">
                      <span className="slds-icon_container slds-icon-standard-opportunity">
                        <DollarSign size={16} />
                      </span>
                    </div>
                    <div className="slds-media__body">
                      <h2 className="slds-card__header-title">
                        <span className="slds-text-heading_small">Opportunities ({relatedData.opportunities.length})</span>
                      </h2>
                    </div>
                  </header>
                  <div className="slds-no-flex">
                    <Link to={`/opportunities/new?contactId=${contact.id}`}>
                      <Button size="small" icon={<Target size={14} />}>
                        New
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="slds-card__body slds-card__body_inner">
                  {relatedData.opportunities.length === 0 ? (
                    <div className="slds-text-align_center slds-p-vertical_medium">
                      <DollarSign size={32} className="slds-icon slds-icon_large slds-text-color_weak" />
                      <p className="slds-text-color_weak">No opportunities yet</p>
                    </div>
                  ) : (
                    <div className="slds-list_vertical slds-has-dividers_top-space">
                      {relatedData.opportunities.slice(0, 5).map((opportunity, index) => (
                        <div key={opportunity.id || index} className="slds-list__item slds-p-vertical_small">
                          <div className="slds-grid slds-grid_align-spread">
                            <div>
                              <Link 
                                to={`/opportunities/${opportunity.id}`}
                                className="slds-text-link"
                              >
                                {opportunity.name}
                              </Link>
                              <div className="slds-text-body_small slds-text-color_weak">
                                {opportunity.stage} • ${opportunity.amount?.toLocaleString() || '0'}
                              </div>
                            </div>
                            <div className="slds-text-color_weak">
                              {opportunity.closeDate && formatDate(opportunity.closeDate)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {relatedData.opportunities.length > 0 && (
                  <div className="slds-card__footer">
                    <Link to={`/opportunities?contactId=${contact.id}`} className="slds-text-link">
                      View All Opportunities ({relatedData.opportunities.length})
                    </Link>
                  </div>
                )}
              </div>
            </div>
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
                    <span>{formatDate(contact.createdAt)}</span>
                  </div>
                </div>
                <div className="slds-list__item slds-p-vertical_small">
                  <div className="slds-grid slds-grid_align-spread">
                    <span className="slds-text-color_weak">Last Modified</span>
                    <span>{formatDate(contact.updatedAt)}</span>
                  </div>
                </div>
                {contact.homePhone && (
                  <div className="slds-list__item slds-p-vertical_small">
                    <div className="slds-grid slds-grid_align-spread">
                      <span className="slds-text-color_weak">Home Phone</span>
                      <a href={`tel:${contact.homePhone}`} className="slds-text-link">
                        {contact.homePhone}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Communication Preferences */}
          {(contact.hasOptedOutOfEmail || contact.hasOptedOutOfFax || contact.doNotCall) && (
            <div className="slds-card">
              <div className="slds-card__header slds-grid">
                <header className="slds-media slds-media_center slds-has-flexi-truncate">
                  <div className="slds-media__body">
                    <h2 className="slds-card__header-title">
                      <span className="slds-text-heading_small">Communication Preferences</span>
                    </h2>
                  </div>
                </header>
              </div>
              <div className="slds-card__body slds-card__body_inner">
                <div className="slds-list_vertical slds-has-dividers_top-space">
                  {contact.hasOptedOutOfEmail && (
                    <div className="slds-list__item slds-p-vertical_small">
                      <span className="slds-badge slds-badge_warning">Email Opt Out</span>
                    </div>
                  )}
                  {contact.hasOptedOutOfFax && (
                    <div className="slds-list__item slds-p-vertical_small">
                      <span className="slds-badge slds-badge_warning">Fax Opt Out</span>
                    </div>
                  )}
                  {contact.doNotCall && (
                    <div className="slds-list__item slds-p-vertical_small">
                      <span className="slds-badge slds-badge_error">Do Not Call</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <FormModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Contact"
        size="large"
      >
        <ContactForm 
          contact={contact} 
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
        title="Delete Contact"
        message={`Are you sure you want to delete ${contact.firstName} ${contact.lastName}? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
};

export default ContactView;