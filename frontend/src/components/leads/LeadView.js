// src/components/leads/LeadView.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { leadsAPI } from '../../services/api';
import LeadForm from './LeadForm';
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
  Globe, 
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Target,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star
} from 'lucide-react';

const LeadView = ({ mode = 'view' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useApp();
  
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    if (mode !== 'create' && id) {
      loadLead();
    } else if (mode === 'create') {
      setLoading(false);
    }
  }, [id, mode]);

  const loadLead = async () => {
    try {
      setLoading(true);
      const response = await leadsAPI.getById(id);
      setLead(response.lead);
    } catch (error) {
      console.error('Error loading lead:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load lead details'
      });
      navigate('/leads');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (mode === 'view') {
      setShowEditModal(true);
    }
  };

  const handleSave = (updatedLead) => {
    setLead(updatedLead);
    setShowEditModal(false);
    if (mode === 'create') {
      navigate(`/leads/${updatedLead.id}`);
    }
  };

  const handleDelete = async () => {
    try {
      await leadsAPI.delete(lead.id);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Lead deleted successfully'
      });
      navigate('/leads');
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete lead'
      });
    } finally {
      setShowDeleteModal(false);
    }
  };

  const handleConvert = async (conversionData) => {
    try {
      setConverting(true);
      const response = await leadsAPI.convert(lead.id, conversionData);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Lead converted successfully'
      });
      setLead(response.lead);
      setShowConvertModal(false);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to convert lead'
      });
    } finally {
      setConverting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'New': return <AlertCircle size={16} className="slds-text-color_default" />;
      case 'Contacted': return <Mail size={16} className="slds-text-color_warning" />;
      case 'Qualified': return <CheckCircle size={16} className="slds-text-color_success" />;
      case 'Unqualified': return <XCircle size={16} className="slds-text-color_error" />;
      default: return <AlertCircle size={16} className="slds-text-color_weak" />;
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

  const formatCurrency = (amount) => {
    if (!amount) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return <PageSpinner message="Loading lead..." />;
  }

  if (mode === 'create' || mode === 'edit') {
    return (
      <div className="slds-p-around_medium">
        <LeadForm 
          lead={lead} 
          mode={mode} 
          onSave={handleSave}
          onCancel={() => navigate(lead ? `/leads/${lead.id}` : '/leads')}
        />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="slds-p-around_medium">
        <div className="slds-text-align_center">
          <h2>Lead not found</h2>
          <Button onClick={() => navigate('/leads')}>Back to Leads</Button>
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
                <Link to="/leads">
                  <Button variant="neutral" iconOnly icon={<ArrowLeft size={16} />} />
                </Link>
              </div>
              <div className="slds-media__figure slds-m-left_small">
                <span className="slds-icon_container slds-icon-standard-lead">
                  <Target size={24} />
                </span>
              </div>
              <div className="slds-media__body">
                <div className="slds-page-header__name">
                  <div className="slds-page-header__name-title">
                    <h1>
                      <span className="slds-page-header__title slds-truncate">
                        {lead.firstName} {lead.lastName}
                      </span>
                    </h1>
                  </div>
                </div>
                <p className="slds-page-header__name-meta">
                  Lead • {lead.company}
                  {lead.isConverted && (
                    <span className="slds-badge slds-badge_success slds-m-left_small">
                      Converted
                    </span>
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
                  onClick={loadLead}
                >
                  Refresh
                </Button>
              </div>
              {!lead.isConverted && (
                <div className="slds-page-header__control">
                  <Button
                    variant="success"
                    onClick={() => setShowConvertModal(true)}
                  >
                    Convert
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
                    <span className="slds-text-heading_small">Lead Details</span>
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
                            {lead.firstName} {lead.lastName}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="slds-form-element slds-m-top_medium">
                      <span className="slds-form-element__label">Company</span>
                      <div className="slds-form-element__control">
                        <div className="slds-grid slds-grid_align-center">
                          <Building size={16} className="slds-m-right_small" />
                          <span className="slds-form-element__static">{lead.company}</span>
                        </div>
                      </div>
                    </div>

                    {lead.title && (
                      <div className="slds-form-element slds-m-top_medium">
                        <span className="slds-form-element__label">Title</span>
                        <div className="slds-form-element__control">
                          <span className="slds-form-element__static">{lead.title}</span>
                        </div>
                      </div>
                    )}

                    {lead.email && (
                      <div className="slds-form-element slds-m-top_medium">
                        <span className="slds-form-element__label">Email</span>
                        <div className="slds-form-element__control">
                          <div className="slds-grid slds-grid_align-center">
                            <Mail size={16} className="slds-m-right_small" />
                            <a href={`mailto:${lead.email}`} className="slds-text-link">
                              {lead.email}
                            </a>
                          </div>
                        </div>
                      </div>
                    )}

                    {lead.phone && (
                      <div className="slds-form-element slds-m-top_medium">
                        <span className="slds-form-element__label">Phone</span>
                        <div className="slds-form-element__control">
                          <div className="slds-grid slds-grid_align-center">
                            <Phone size={16} className="slds-m-right_small" />
                            <a href={`tel:${lead.phone}`} className="slds-text-link">
                              {lead.phone}
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="slds-col slds-size_1-of-2">
                    <div className="slds-form-element">
                      <span className="slds-form-element__label">Status</span>
                      <div className="slds-form-element__control">
                        <div className="slds-grid slds-grid_align-center">
                          {getStatusIcon(lead.status)}
                          <span className="slds-m-left_small">{lead.status}</span>
                        </div>
                      </div>
                    </div>

                    <div className="slds-form-element slds-m-top_medium">
                      <span className="slds-form-element__label">Lead Source</span>
                      <div className="slds-form-element__control">
                        <span className="slds-form-element__static">{lead.leadSource}</span>
                      </div>
                    </div>

                    <div className="slds-form-element slds-m-top_medium">
                      <span className="slds-form-element__label">Rating</span>
                      <div className="slds-form-element__control">
                        <div className="slds-grid slds-grid_align-center">
                          <Star size={16} className={`slds-m-right_small ${getRatingColor(lead.rating)}`} />
                          <span className={getRatingColor(lead.rating)}>{lead.rating}</span>
                        </div>
                      </div>
                    </div>

                    {lead.industry && (
                      <div className="slds-form-element slds-m-top_medium">
                        <span className="slds-form-element__label">Industry</span>
                        <div className="slds-form-element__control">
                          <span className="slds-form-element__static">{lead.industry}</span>
                        </div>
                      </div>
                    )}

                    {lead.website && (
                      <div className="slds-form-element slds-m-top_medium">
                        <span className="slds-form-element__label">Website</span>
                        <div className="slds-form-element__control">
                          <div className="slds-grid slds-grid_align-center">
                            <Globe size={16} className="slds-m-right_small" />
                            <a href={lead.website} target="_blank" rel="noopener noreferrer" className="slds-text-link">
                              {lead.website}
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Address Information */}
                {(lead.address?.street || lead.address?.city) && (
                  <div className="slds-m-top_large">
                    <h3 className="slds-text-heading_small slds-m-bottom_medium">Address</h3>
                    <div className="slds-form-element">
                      <span className="slds-form-element__label">Address</span>
                      <div className="slds-form-element__control">
                        <div className="slds-grid slds-grid_align-center">
                          <MapPin size={16} className="slds-m-right_small" />
                          <span className="slds-form-element__static">
                            {[
                              lead.address?.street,
                              lead.address?.city,
                              lead.address?.state,
                              lead.address?.zipCode,
                              lead.address?.country
                            ].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Company Information */}
                {(lead.annualRevenue || lead.numberOfEmployees) && (
                  <div className="slds-m-top_large">
                    <h3 className="slds-text-heading_small slds-m-bottom_medium">Company Information</h3>
                    <div className="slds-grid slds-gutters">
                      {lead.annualRevenue && (
                        <div className="slds-col slds-size_1-of-2">
                          <div className="slds-form-element">
                            <span className="slds-form-element__label">Annual Revenue</span>
                            <div className="slds-form-element__control">
                              <div className="slds-grid slds-grid_align-center">
                                <DollarSign size={16} className="slds-m-right_small" />
                                <span className="slds-form-element__static">
                                  {formatCurrency(lead.annualRevenue)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {lead.numberOfEmployees && (
                        <div className="slds-col slds-size_1-of-2">
                          <div className="slds-form-element">
                            <span className="slds-form-element__label">Employees</span>
                            <div className="slds-form-element__control">
                              <div className="slds-grid slds-grid_align-center">
                                <Users size={16} className="slds-m-right_small" />
                                <span className="slds-form-element__static">
                                  {lead.numberOfEmployees.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Description and Notes */}
                {(lead.description || lead.notes) && (
                  <div className="slds-m-top_large">
                    <h3 className="slds-text-heading_small slds-m-bottom_medium">Additional Information</h3>
                    {lead.description && (
                      <div className="slds-form-element slds-m-bottom_medium">
                        <span className="slds-form-element__label">Description</span>
                        <div className="slds-form-element__control">
                          <span className="slds-form-element__static">{lead.description}</span>
                        </div>
                      </div>
                    )}
                    {lead.notes && (
                      <div className="slds-form-element">
                        <span className="slds-form-element__label">Notes</span>
                        <div className="slds-form-element__control">
                          <span className="slds-form-element__static">{lead.notes}</span>
                        </div>
                      </div>
                    )}
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
                    <span>{formatDate(lead.createdAt)}</span>
                  </div>
                </div>
                <div className="slds-list__item slds-p-vertical_small">
                  <div className="slds-grid slds-grid_align-spread">
                    <span className="slds-text-color_weak">Last Modified</span>
                    <span>{formatDate(lead.updatedAt)}</span>
                  </div>
                </div>
                {lead.ownerId && (
                  <div className="slds-list__item slds-p-vertical_small">
                    <div className="slds-grid slds-grid_align-spread">
                      <span className="slds-text-color_weak">Lead Owner</span>
                      <span>
                        {lead.ownerId.firstName} {lead.ownerId.lastName}
                      </span>
                    </div>
                  </div>
                )}
                {lead.convertedDate && (
                  <div className="slds-list__item slds-p-vertical_small">
                    <div className="slds-grid slds-grid_align-spread">
                      <span className="slds-text-color_weak">Converted</span>
                      <span>{formatDate(lead.convertedDate)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Qualification Information */}
          {(lead.budget || lead.timeline || lead.authority) && (
            <div className="slds-card slds-m-bottom_medium">
              <div className="slds-card__header slds-grid">
                <header className="slds-media slds-media_center slds-has-flexi-truncate">
                  <div className="slds-media__body">
                    <h2 className="slds-card__header-title">
                      <span className="slds-text-heading_small">Qualification</span>
                    </h2>
                  </div>
                </header>
              </div>
              <div className="slds-card__body slds-card__body_inner">
                <div className="slds-list_vertical slds-has-dividers_top-space">
                  {lead.budget && (
                    <div className="slds-list__item slds-p-vertical_small">
                      <div className="slds-grid slds-grid_align-spread">
                        <span className="slds-text-color_weak">Budget</span>
                        <span>{formatCurrency(lead.budget)}</span>
                      </div>
                    </div>
                  )}
                  {lead.timeline && (
                    <div className="slds-list__item slds-p-vertical_small">
                      <div className="slds-grid slds-grid_align-spread">
                        <span className="slds-text-color_weak">Timeline</span>
                        <span>{lead.timeline}</span>
                      </div>
                    </div>
                  )}
                  {lead.authority && (
                    <div className="slds-list__item slds-p-vertical_small">
                      <div className="slds-grid slds-grid_align-spread">
                        <span className="slds-text-color_weak">Authority</span>
                        <span>{lead.authority}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Converted Records */}
          {lead.isConverted && (
            <div className="slds-card">
              <div className="slds-card__header slds-grid">
                <header className="slds-media slds-media_center slds-has-flexi-truncate">
                  <div className="slds-media__body">
                    <h2 className="slds-card__header-title">
                      <span className="slds-text-heading_small">Converted Records</span>
                    </h2>
                  </div>
                </header>
              </div>
              <div className="slds-card__body slds-card__body_inner">
                <div className="slds-list_vertical slds-has-dividers_top-space">
                  {lead.convertedAccountId && (
                    <div className="slds-list__item slds-p-vertical_small">
                      <div className="slds-grid slds-grid_align-spread">
                        <span className="slds-text-color_weak">Account</span>
                        <Link 
                          to={`/accounts/${lead.convertedAccountId.id || lead.convertedAccountId}`}
                          className="slds-text-link"
                        >
                          {lead.convertedAccountId.name || 'View Account'}
                        </Link>
                      </div>
                    </div>
                  )}
                  {lead.convertedContactId && (
                    <div className="slds-list__item slds-p-vertical_small">
                      <div className="slds-grid slds-grid_align-spread">
                        <span className="slds-text-color_weak">Contact</span>
                        <Link 
                          to={`/contacts/${lead.convertedContactId.id || lead.convertedContactId}`}
                          className="slds-text-link"
                        >
                          {lead.convertedContactId.firstName 
                            ? `${lead.convertedContactId.firstName} ${lead.convertedContactId.lastName}`
                            : 'View Contact'
                          }
                        </Link>
                      </div>
                    </div>
                  )}
                  {lead.convertedOpportunityId && (
                    <div className="slds-list__item slds-p-vertical_small">
                      <div className="slds-grid slds-grid_align-spread">
                        <span className="slds-text-color_weak">Opportunity</span>
                        <Link 
                          to={`/opportunities/${lead.convertedOpportunityId.id || lead.convertedOpportunityId}`}
                          className="slds-text-link"
                        >
                          {lead.convertedOpportunityId.name || 'View Opportunity'}
                        </Link>
                      </div>
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
        title="Edit Lead"
        size="large"
      >
        <LeadForm 
          lead={lead} 
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
        title="Delete Lead"
        message={`Are you sure you want to delete ${lead.firstName} ${lead.lastName}? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
      />

      {/* Convert Lead Modal */}
      <FormModal
        isOpen={showConvertModal}
        onClose={() => setShowConvertModal(false)}
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          handleConvert({
            createContact: formData.get('createContact') === 'on',
            createAccount: formData.get('createAccount') === 'on',
            createOpportunity: formData.get('createOpportunity') === 'on',
            opportunityData: formData.get('createOpportunity') === 'on' ? {
              name: formData.get('opportunityName'),
              amount: parseFloat(formData.get('opportunityAmount')) || 0,
              stage: 'Prospecting',
              closeDate: formData.get('closeDate')
            } : {}
          });
        }}
        title="Convert Lead"
        submitText="Convert"
        loading={converting}
      >
        <div className="slds-form slds-form_stacked">
          <div className="slds-form-element">
            <div className="slds-form-element__control">
              <div className="slds-checkbox">
                <input type="checkbox" id="createAccount" name="createAccount" defaultChecked />
                <label className="slds-checkbox__label" htmlFor="createAccount">
                  <span className="slds-checkbox_faux"></span>
                  <span className="slds-form-element__label">Create Account</span>
                </label>
              </div>
            </div>
          </div>

          <div className="slds-form-element slds-m-top_medium">
            <div className="slds-form-element__control">
              <div className="slds-checkbox">
                <input type="checkbox" id="createContact" name="createContact" defaultChecked />
                <label className="slds-checkbox__label" htmlFor="createContact">
                  <span className="slds-checkbox_faux"></span>
                  <span className="slds-form-element__label">Create Contact</span>
                </label>
              </div>
            </div>
          </div>

          <div className="slds-form-element slds-m-top_medium">
            <div className="slds-form-element__control">
              <div className="slds-checkbox">
                <input type="checkbox" id="createOpportunity" name="createOpportunity" />
                <label className="slds-checkbox__label" htmlFor="createOpportunity">
                  <span className="slds-checkbox_faux"></span>
                  <span className="slds-form-element__label">Create Opportunity</span>
                </label>
              </div>
            </div>
          </div>

          <div id="opportunityFields" className="slds-m-top_medium" style={{ display: 'none' }}>
            <div className="slds-form-element">
              <label className="slds-form-element__label" htmlFor="opportunityName">
                Opportunity Name
              </label>
              <div className="slds-form-element__control">
                <input 
                  type="text" 
                  id="opportunityName" 
                  name="opportunityName"
                  className="slds-input" 
                  defaultValue={`${lead.company} - ${lead.firstName} ${lead.lastName}`}
                />
              </div>
            </div>

            <div className="slds-grid slds-gutters slds-m-top_medium">
              <div className="slds-col slds-size_1-of-2">
                <div className="slds-form-element">
                  <label className="slds-form-element__label" htmlFor="opportunityAmount">
                    Amount
                  </label>
                  <div className="slds-form-element__control">
                    <input 
                      type="number" 
                      id="opportunityAmount" 
                      name="opportunityAmount"
                      className="slds-input" 
                      defaultValue={lead.budget || ''}
                    />
                  </div>
                </div>
              </div>
              <div className="slds-col slds-size_1-of-2">
                <div className="slds-form-element">
                  <label className="slds-form-element__label" htmlFor="closeDate">
                    Close Date
                  </label>
                  <div className="slds-form-element__control">
                    <input 
                      type="date" 
                      id="closeDate" 
                      name="closeDate"
                      className="slds-input" 
                      defaultValue={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <script>
          {`
            document.getElementById('createOpportunity').addEventListener('change', function() {
              const fields = document.getElementById('opportunityFields');
              fields.style.display = this.checked ? 'block' : 'none';
            });
          `}
        </script>
      </FormModal>
    </div>
  );
};

export default LeadView;