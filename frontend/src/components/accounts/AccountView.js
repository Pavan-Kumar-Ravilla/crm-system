// src/components/accounts/AccountView.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { accountsAPI, contactsAPI, opportunitiesAPI } from '../../services/api';
import AccountForm from './AccountForm';
import Button from '../common/Button';
import { PageSpinner } from '../common/Spinner';
import { ConfirmModal, FormModal } from '../common/Modal';
import { 
  Edit, 
  Trash2, 
  ArrowLeft, 
  RefreshCw, 
  Building, 
  Phone, 
  Globe, 
  MapPin,
  Calendar,
  DollarSign,
  Users,
  FileText,
  Star,
  User,
  Target,
  Mail
} from 'lucide-react';

const AccountView = ({ mode = 'view' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useApp();
  
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [relatedData, setRelatedData] = useState({
    contacts: [],
    opportunities: [],
    activities: []
  });

  useEffect(() => {
    if (mode !== 'create' && id) {
      loadAccount();
      loadRelatedData();
    } else if (mode === 'create') {
      setLoading(false);
    }
  }, [id, mode]);

  const loadAccount = async () => {
    try {
      setLoading(true);
      const response = await accountsAPI.getById(id);
      setAccount(response.account);
    } catch (error) {
      console.error('Error loading account:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load account details'
      });
      navigate('/accounts');
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedData = async () => {
    try {
      const [contactsResponse, opportunitiesResponse] = await Promise.all([
        contactsAPI.getAll({ accountId: id, limit: 5 }).catch(() => ({ contacts: [] })),
        opportunitiesAPI.getAll({ accountId: id, limit: 5 }).catch(() => ({ opportunities: [] }))
      ]);

      setRelatedData({
        contacts: contactsResponse.contacts || [],
        opportunities: opportunitiesResponse.opportunities || [],
        activities: []
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

  const handleSave = (updatedAccount) => {
    setAccount(updatedAccount);
    setShowEditModal(false);
    if (mode === 'create') {
      navigate(`/accounts/${updatedAccount.id}`);
    }
  };

  const handleDelete = async () => {
    try {
      await accountsAPI.delete(account.id);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Account deleted successfully'
      });
      navigate('/accounts');
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete account'
      });
    } finally {
      setShowDeleteModal(false);
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
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return <PageSpinner message="Loading account..." />;
  }

  if (mode === 'create' || mode === 'edit') {
    return (
      <div className="slds-p-around_medium">
        <AccountForm 
          account={account} 
          mode={mode} 
          onSave={handleSave}
          onCancel={() => navigate(account ? `/accounts/${account.id}` : '/accounts')}
        />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="slds-p-around_medium">
        <div className="slds-text-align_center">
          <h2>Account not found</h2>
          <Button onClick={() => navigate('/accounts')}>Back to Accounts</Button>
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
                <Link to="/accounts">
                  <Button variant="neutral" iconOnly icon={<ArrowLeft size={16} />} />
                </Link>
              </div>
              <div className="slds-media__figure slds-m-left_small">
                <span className="slds-icon_container slds-icon-standard-account">
                  <Building size={24} />
                </span>
              </div>
              <div className="slds-media__body">
                <div className="slds-page-header__name">
                  <div className="slds-page-header__name-title">
                    <h1>
                      <span className="slds-page-header__title slds-truncate">
                        {account.name}
                      </span>
                    </h1>
                  </div>
                </div>
                <p className="slds-page-header__name-meta">
                  Account • {account.industry || 'Unknown Industry'}
                  <span className={`slds-badge ${getTypeBadgeVariant(account.type)} slds-m-left_small`}>
                    {account.type}
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
                  onClick={loadAccount}
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
                    <span className="slds-text-heading_small">Account Details</span>
                  </h2>
                </div>
              </header>
            </div>
            <div className="slds-card__body slds-card__body_inner">
              <div className="slds-form slds-form_horizontal">
                <div className="slds-grid slds-gutters">
                  <div className="slds-col slds-size_1-of-2">
                    <div className="slds-form-element">
                      <span className="slds-form-element__label">Account Name</span>
                      <div className="slds-form-element__control">
                        <div className="slds-grid slds-grid_align-center">
                          <Building size={16} className="slds-m-right_small" />
                          <span className="slds-form-element__static">{account.name}</span>
                        </div>
                      </div>
                    </div>

                    {account.phone && (
                      <div className="slds-form-element slds-m-top_medium">
                        <span className="slds-form-element__label">Phone</span>
                        <div className="slds-form-element__control">
                          <div className="slds-grid slds-grid_align-center">
                            <Phone size={16} className="slds-m-right_small" />
                            <a href={`tel:${account.phone}`} className="slds-text-link">
                              {account.phone}
                            </a>
                          </div>
                        </div>
                      </div>
                    )}

                    {account.website && (
                      <div className="slds-form-element slds-m-top_medium">
                        <span className="slds-form-element__label">Website</span>
                        <div className="slds-form-element__control">
                          <div className="slds-grid slds-grid_align-center">
                            <Globe size={16} className="slds-m-right_small" />
                            <a href={account.website} target="_blank" rel="noopener noreferrer" className="slds-text-link">
                              {account.website}
                            </a>
                          </div>
                        </div>
                      </div>
                    )}

                    {account.industry && (
                      <div className="slds-form-element slds-m-top_medium">
                        <span className="slds-form-element__label">Industry</span>
                        <div className="slds-form-element__control">
                          <span className="slds-form-element__static">{account.industry}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="slds-col slds-size_1-of-2">
                    <div className="slds-form-element">
                      <span className="slds-form-element__label">Type</span>
                      <div className="slds-form-element__control">
                        <span className={`slds-badge ${getTypeBadgeVariant(account.type)}`}>
                          {account.type}
                        </span>
                      </div>
                    </div>

                    <div className="slds-form-element slds-m-top_medium">
                      <span className="slds-form-element__label">Rating</span>
                      <div className="slds-form-element__control">
                        <div className="slds-grid slds-grid_align-center">
                          <Star size={16} className={`slds-m-right_small ${getRatingColor(account.rating)}`} />
                          <span className={getRatingColor(account.rating)}>{account.rating}</span>
                        </div>
                      </div>
                    </div>

                    {account.ownerId && (
                      <div className="slds-form-element slds-m-top_medium">
                        <span className="slds-form-element__label">Account Owner</span>
                        <div className="slds-form-element__control">
                          <div className="slds-grid slds-grid_align-center">
                            <User size={16} className="slds-m-right_small" />
                            <span className="slds-form-element__static">
                              {account.ownerId.firstName} {account.ownerId.lastName}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {account.parentAccountId && (
                      <div className="slds-form-element slds-m-top_medium">
                        <span className="slds-form-element__label">Parent Account</span>
                        <div className="slds-form-element__control">
                          <Link 
                            to={`/accounts/${account.parentAccountId.id}`}
                            className="slds-text-link"
                          >
                            {account.parentAccountId.name}
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Address Information */}
                {(account.billingAddress?.street || account.billingAddress?.city) && (
                  <div className="slds-m-top_large">
                    <h3 className="slds-text-heading_small slds-m-bottom_medium">Billing Address</h3>
                    <div className="slds-form-element">
                      <span className="slds-form-element__label">Address</span>
                      <div className="slds-form-element__control">
                        <div className="slds-grid slds-grid_align-center">
                          <MapPin size={16} className="slds-m-right_small" />
                          <span className="slds-form-element__static">
                            {[
                              account.billingAddress?.street,
                              account.billingAddress?.city,
                              account.billingAddress?.state,
                              account.billingAddress?.zipCode,
                              account.billingAddress?.country
                            ].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Company Information */}
                {(account.annualRevenue || account.employees) && (
                  <div className="slds-m-top_large">
                    <h3 className="slds-text-heading_small slds-m-bottom_medium">Company Information</h3>
                    <div className="slds-grid slds-gutters">
                      {account.annualRevenue && (
                        <div className="slds-col slds-size_1-of-2">
                          <div className="slds-form-element">
                            <span className="slds-form-element__label">Annual Revenue</span>
                            <div className="slds-form-element__control">
                              <div className="slds-grid slds-grid_align-center">
                                <DollarSign size={16} className="slds-m-right_small" />
                                <span className="slds-form-element__static">
                                  {formatCurrency(account.annualRevenue)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {account.employees && (
                        <div className="slds-col slds-size_1-of-2">
                          <div className="slds-form-element">
                            <span className="slds-form-element__label">Employees</span>
                            <div className="slds-form-element__control">
                              <div className="slds-grid slds-grid_align-center">
                                <Users size={16} className="slds-m-right_small" />
                                <span className="slds-form-element__static">
                                  {account.employees.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Description */}
                {account.description && (
                  <div className="slds-m-top_large">
                    <h3 className="slds-text-heading_small slds-m-bottom_medium">Description</h3>
                    <div className="slds-form-element">
                      <div className="slds-form-element__control">
                        <span className="slds-form-element__static">{account.description}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Related Lists */}
          <div className="slds-grid slds-wrap slds-gutters">
            {/* Contacts */}
            <div className="slds-col slds-size_1-of-1 slds-large-size_1-of-2">
              <div className="slds-card">
                <div className="slds-card__header slds-grid">
                  <header className="slds-media slds-media_center slds-has-flexi-truncate">
                    <div className="slds-media__figure">
                      <span className="slds-icon_container slds-icon-standard-contact">
                        <User size={16} />
                      </span>
                    </div>
                    <div className="slds-media__body">
                      <h2 className="slds-card__header-title">
                        <span className="slds-text-heading_small">Contacts ({relatedData.contacts.length})</span>
                      </h2>
                    </div>
                  </header>
                  <div className="slds-no-flex">
                    <Link to={`/contacts/new?accountId=${account.id}`}>
                      <Button size="small" icon={<Target size={14} />}>
                        New
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="slds-card__body slds-card__body_inner">
                  {relatedData.contacts.length === 0 ? (
                    <div className="slds-text-align_center slds-p-vertical_medium">
                      <User size={32} className="slds-icon slds-icon_large slds-text-color_weak" />
                      <p className="slds-text-color_weak">No contacts yet</p>
                    </div>
                  ) : (
                    <div className="slds-list_vertical slds-has-dividers_top-space">
                      {relatedData.contacts.slice(0, 5).map((contact, index) => (
                        <div key={contact.id || index} className="slds-list__item slds-p-vertical_small">
                          <div className="slds-media">
                            <div className="slds-media__figure">
                              <span className="slds-avatar slds-avatar_circle slds-avatar_small">
                                <User size={16} />
                              </span>
                            </div>
                            <div className="slds-media__body">
                              <div className="slds-grid slds-grid_align-spread">
                                <div>
                                  <Link 
                                    to={`/contacts/${contact.id}`}
                                    className="slds-text-link"
                                  >
                                    {contact.firstName} {contact.lastName}
                                  </Link>
                                  {contact.title && (
                                    <div className="slds-text-body_small slds-text-color_weak">
                                      {contact.title}
                                    </div>
                                  )}
                                </div>
                                {contact.email && (
                                  <div className="slds-text-color_weak">
                                    <Mail size={14} />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {relatedData.contacts.length > 0 && (
                  <div className="slds-card__footer">
                    <Link to={`/contacts?accountId=${account.id}`} className="slds-text-link">
                      View All Contacts ({relatedData.contacts.length})
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
                    <Link to={`/opportunities/new?accountId=${account.id}`}>
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
                                {opportunity.stage} • {formatCurrency(opportunity.amount)}
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
                    <Link to={`/opportunities?accountId=${account.id}`} className="slds-text-link">
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
                    <span>{formatDate(account.createdAt)}</span>
                  </div>
                </div>
                <div className="slds-list__item slds-p-vertical_small">
                  <div className="slds-grid slds-grid_align-spread">
                    <span className="slds-text-color_weak">Last Modified</span>
                    <span>{formatDate(account.updatedAt)}</span>
                  </div>
                </div>
                {account.ownership && (
                  <div className="slds-list__item slds-p-vertical_small">
                    <div className="slds-grid slds-grid_align-spread">
                      <span className="slds-text-color_weak">Ownership</span>
                      <span>{account.ownership}</span>
                    </div>
                  </div>
                )}
                {account.tickerSymbol && (
                  <div className="slds-list__item slds-p-vertical_small">
                    <div className="slds-grid slds-grid_align-spread">
                      <span className="slds-text-color_weak">Ticker Symbol</span>
                      <span>{account.tickerSymbol}</span>
                    </div>
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
        title="Edit Account"
        size="large"
      >
        <AccountForm 
          account={account} 
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
        title="Delete Account"
        message={`Are you sure you want to delete ${account.name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
};

export default AccountView;