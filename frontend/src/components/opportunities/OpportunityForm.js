// src/components/opportunities/OpportunityForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { opportunitiesAPI, accountsAPI, contactsAPI, usersAPI } from '../../services/api';
import Input, { Textarea } from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { 
  DollarSign, 
  Building, 
  User, 
  Calendar, 
  Target,
  TrendingUp,
  Save,
  X,
  Percent
} from 'lucide-react';

const OpportunityForm = ({ opportunity, mode = 'create', onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: opportunity?.name || '',
    accountId: opportunity?.accountId?.id || opportunity?.accountId || '',
    primaryContactId: opportunity?.primaryContactId?.id || opportunity?.primaryContactId || '',
    type: opportunity?.type || 'New Customer',
    stage: opportunity?.stage || 'Prospecting',
    amount: opportunity?.amount || '',
    probability: opportunity?.probability || 10,
    expectedRevenue: opportunity?.expectedRevenue || '',
    closeDate: opportunity?.closeDate ? new Date(opportunity.closeDate).toISOString().split('T')[0] : '',
    nextStep: opportunity?.nextStep || '',
    leadSource: opportunity?.leadSource || 'Website',
    forecastCategory: opportunity?.forecastCategory || 'Pipeline',
    campaignId: opportunity?.campaignId || '',
    description: opportunity?.description || '',
    ownerId: opportunity?.ownerId?.id || opportunity?.ownerId || '',
    isPrivate: opportunity?.isPrivate || false,
    hasOpenActivity: opportunity?.hasOpenActivity || false,
    isWon: opportunity?.isWon || false
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [users, setUsers] = useState([]);

  const { addNotification } = useApp();
  const navigate = useNavigate();

  const typeOptions = [
    { value: 'Existing Customer - Upgrade', label: 'Existing Customer - Upgrade' },
    { value: 'Existing Customer - Replacement', label: 'Existing Customer - Replacement' },
    { value: 'Existing Customer - Downgrade', label: 'Existing Customer - Downgrade' },
    { value: 'New Customer', label: 'New Customer' }
  ];

  const stageOptions = [
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

  const sourceOptions = [
    { value: 'Advertisement', label: 'Advertisement' },
    { value: 'Cold Call', label: 'Cold Call' },
    { value: 'Employee Referral', label: 'Employee Referral' },
    { value: 'External Referral', label: 'External Referral' },
    { value: 'Online Store', label: 'Online Store' },
    { value: 'Partner', label: 'Partner' },
    { value: 'Phone Inquiry', label: 'Phone Inquiry' },
    { value: 'Public Relations', label: 'Public Relations' },
    { value: 'Seminar - Internal', label: 'Seminar - Internal' },
    { value: 'Seminar - Partner', label: 'Seminar - Partner' },
    { value: 'Trade Show', label: 'Trade Show' },
    { value: 'Web', label: 'Web' },
    { value: 'Website', label: 'Website' },
    { value: 'Word of mouth', label: 'Word of mouth' },
    { value: 'Other', label: 'Other' }
  ];

  const forecastOptions = [
    { value: 'Pipeline', label: 'Pipeline' },
    { value: 'Best Case', label: 'Best Case' },
    { value: 'Commit', label: 'Commit' },
    { value: 'Omitted', label: 'Omitted' }
  ];

  // Stage to probability mapping
  const stageProbabilityMap = {
    'Prospecting': 10,
    'Qualification': 20,
    'Needs Analysis': 25,
    'Value Proposition': 40,
    'Id. Decision Makers': 60,
    'Perception Analysis': 70,
    'Proposal/Price Quote': 75,
    'Negotiation/Review': 90,
    'Closed Won': 100,
    'Closed Lost': 0
  };

  useEffect(() => {
    loadAccounts();
    loadContacts();
    loadUsers();
  }, []);

  useEffect(() => {
    // Update probability when stage changes
    if (formData.stage && stageProbabilityMap[formData.stage] !== undefined) {
      setFormData(prev => ({
        ...prev,
        probability: stageProbabilityMap[formData.stage]
      }));
    }
  }, [formData.stage]);

  useEffect(() => {
    // Calculate expected revenue
    if (formData.amount && formData.probability) {
      const expectedRevenue = (parseFloat(formData.amount) * parseFloat(formData.probability)) / 100;
      setFormData(prev => ({
        ...prev,
        expectedRevenue: expectedRevenue.toFixed(2)
      }));
    }
  }, [formData.amount, formData.probability]);

  useEffect(() => {
    // Set isWon based on stage
    setFormData(prev => ({
      ...prev,
      isWon: prev.stage === 'Closed Won'
    }));
  }, [formData.stage]);

  const loadAccounts = async () => {
    try {
      const response = await accountsAPI.getAll({ limit: 100 });
      setAccounts(response.accounts || []);
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const loadContacts = async () => {
    try {
      const response = await contactsAPI.getAll({ limit: 100 });
      setContacts(response.contacts || []);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await usersAPI.getAll({ limit: 100 });
      setUsers(response.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Opportunity name is required';
    }
    if (!formData.stage) {
      newErrors.stage = 'Stage is required';
    }
    if (!formData.closeDate) {
      newErrors.closeDate = 'Close date is required';
    }

    // Amount validation
    if (formData.amount && (isNaN(formData.amount) || parseFloat(formData.amount) < 0)) {
      newErrors.amount = 'Amount must be a valid positive number';
    }

    // Probability validation
    if (formData.probability < 0 || formData.probability > 100) {
      newErrors.probability = 'Probability must be between 0 and 100';
    }

    // Date validation
    if (formData.closeDate) {
      const closeDate = new Date(formData.closeDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (closeDate < today) {
        newErrors.closeDate = 'Close date cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Convert string numbers to actual numbers
      const submitData = {
        ...formData,
        amount: formData.amount ? parseFloat(formData.amount) : null,
        probability: parseFloat(formData.probability),
        expectedRevenue: formData.expectedRevenue ? parseFloat(formData.expectedRevenue) : null,
        closeDate: new Date(formData.closeDate).toISOString()
      };

      let result;
      if (mode === 'create') {
        result = await opportunitiesAPI.create(submitData);
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Opportunity created successfully'
        });
      } else {
        result = await opportunitiesAPI.update(opportunity.id, submitData);
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Opportunity updated successfully'
        });
      }

      if (onSave) {
        onSave(result.opportunity);
      } else {
        navigate('/opportunities');
      }
    } catch (error) {
      console.error('Error saving opportunity:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message || `Failed to ${mode === 'create' ? 'create' : 'update'} opportunity`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/opportunities');
    }
  };

  // Filter contacts by selected account
  const filteredContacts = formData.accountId 
    ? contacts.filter(contact => contact.accountId?.id === formData.accountId || contact.accountId === formData.accountId)
    : contacts;

  return (
    <div className="slds-card">
      <div className="slds-card__header slds-grid">
        <header className="slds-media slds-media_center slds-has-flexi-truncate">
          <div className="slds-media__figure">
            <span className="slds-icon_container slds-icon-standard-opportunity">
              <DollarSign size={20} />
            </span>
          </div>
          <div className="slds-media__body">
            <h2 className="slds-card__header-title">
              <span className="slds-text-heading_small">
                {mode === 'create' ? 'New Opportunity' : 'Edit Opportunity'}
              </span>
            </h2>
          </div>
        </header>
      </div>
      
      <div className="slds-card__body slds-card__body_inner">
        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="slds-section slds-is-open">
            <h3 className="slds-section__title slds-theme_shade">
              <span className="slds-truncate slds-p-horizontal_small" title="Basic Information">
                Basic Information
              </span>
            </h3>
            <div className="slds-section__content">
              <div className="slds-grid slds-gutters">
                <div className="slds-col slds-size_1-of-2">
                  <Input
                    label="Opportunity Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    error={errors.name}
                    required
                    leftIcon={<Target size={16} />}
                  />
                </div>
                <div className="slds-col slds-size_1-of-2">
                  <Select
                    label="Account"
                    name="accountId"
                    value={formData.accountId}
                    onChange={handleInputChange}
                    options={[
                      { value: '', label: 'Select Account' },
                      ...accounts.map(account => ({
                        value: account.id,
                        label: account.name
                      }))
                    ]}
                    error={errors.accountId}
                  />
                </div>
              </div>

              <div className="slds-grid slds-gutters slds-m-top_medium">
                <div className="slds-col slds-size_1-of-2">
                  <Select
                    label="Primary Contact"
                    name="primaryContactId"
                    value={formData.primaryContactId}
                    onChange={handleInputChange}
                    options={[
                      { value: '', label: 'Select Contact' },
                      ...filteredContacts.map(contact => ({
                        value: contact.id,
                        label: `${contact.firstName} ${contact.lastName}`
                      }))
                    ]}
                    error={errors.primaryContactId}
                  />
                </div>
                <div className="slds-col slds-size_1-of-2">
                  <Select
                    label="Type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    options={typeOptions}
                    error={errors.type}
                  />
                </div>
              </div>

              <div className="slds-grid slds-gutters slds-m-top_medium">
                <div className="slds-col slds-size_1-of-2">
                  <Select
                    label="Opportunity Owner"
                    name="ownerId"
                    value={formData.ownerId}
                    onChange={handleInputChange}
                    options={[
                      { value: '', label: 'Select Owner' },
                      ...users.map(user => ({
                        value: user.id,
                        label: `${user.firstName} ${user.lastName}`
                      }))
                    ]}
                    error={errors.ownerId}
                  />
                </div>
                <div className="slds-col slds-size_1-of-2">
                  <Select
                    label="Lead Source"
                    name="leadSource"
                    value={formData.leadSource}
                    onChange={handleInputChange}
                    options={sourceOptions}
                    error={errors.leadSource}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sales Information */}
          <div className="slds-section slds-is-open slds-m-top_large">
            <h3 className="slds-section__title slds-theme_shade">
              <span className="slds-truncate slds-p-horizontal_small" title="Sales Information">
                Sales Information
              </span>
            </h3>
            <div className="slds-section__content">
              <div className="slds-grid slds-gutters">
                <div className="slds-col slds-size_1-of-3">
                  <Input
                    label="Amount"
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    error={errors.amount}
                    leftIcon={<DollarSign size={16} />}
                    step="0.01"
                    min="0"
                  />
                </div>
                <div className="slds-col slds-size_1-of-3">
                  <Input
                    label="Probability (%)"
                    type="number"
                    name="probability"
                    value={formData.probability}
                    onChange={handleInputChange}
                    error={errors.probability}
                    leftIcon={<Percent size={16} />}
                    min="0"
                    max="100"
                  />
                </div>
                <div className="slds-col slds-size_1-of-3">
                  <Input
                    label="Expected Revenue"
                    type="number"
                    name="expectedRevenue"
                    value={formData.expectedRevenue}
                    onChange={handleInputChange}
                    error={errors.expectedRevenue}
                    leftIcon={<TrendingUp size={16} />}
                    step="0.01"
                    readOnly
                    helpText="Calculated automatically"
                  />
                </div>
              </div>

              <div className="slds-grid slds-gutters slds-m-top_medium">
                <div className="slds-col slds-size_1-of-2">
                  <Select
                    label="Stage"
                    name="stage"
                    value={formData.stage}
                    onChange={handleInputChange}
                    options={stageOptions}
                    error={errors.stage}
                    required
                  />
                </div>
                <div className="slds-col slds-size_1-of-2">
                  <Select
                    label="Forecast Category"
                    name="forecastCategory"
                    value={formData.forecastCategory}
                    onChange={handleInputChange}
                    options={forecastOptions}
                    error={errors.forecastCategory}
                  />
                </div>
              </div>

              <div className="slds-grid slds-gutters slds-m-top_medium">
                <div className="slds-col slds-size_1-of-2">
                  <Input
                    label="Close Date"
                    type="date"
                    name="closeDate"
                    value={formData.closeDate}
                    onChange={handleInputChange}
                    error={errors.closeDate}
                    required
                    leftIcon={<Calendar size={16} />}
                  />
                </div>
                <div className="slds-col slds-size_1-of-2">
                  <Input
                    label="Next Step"
                    name="nextStep"
                    value={formData.nextStep}
                    onChange={handleInputChange}
                    error={errors.nextStep}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="slds-section slds-is-open slds-m-top_large">
            <h3 className="slds-section__title slds-theme_shade">
              <span className="slds-truncate slds-p-horizontal_small" title="Additional Information">
                Additional Information
              </span>
            </h3>
            <div className="slds-section__content">
              <div className="slds-grid slds-gutters">
                <div className="slds-col slds-size_1-of-1">
                  <Textarea
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    error={errors.description}
                    rows={4}
                  />
                </div>
              </div>

              {/* Settings */}
              <div className="slds-m-top_medium">
                <h4 className="slds-text-heading_small slds-m-bottom_small">Settings</h4>
                <div className="slds-grid slds-gutters">
                  <div className="slds-col slds-size_1-of-3">
                    <div className="slds-form-element">
                      <div className="slds-form-element__control">
                        <div className="slds-checkbox">
                          <input
                            type="checkbox"
                            id="is-private"
                            name="isPrivate"
                            checked={formData.isPrivate}
                            onChange={handleInputChange}
                          />
                          <label className="slds-checkbox__label" htmlFor="is-private">
                            <span className="slds-checkbox_faux"></span>
                            <span className="slds-form-element__label">Private</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="slds-col slds-size_1-of-3">
                    <div className="slds-form-element">
                      <div className="slds-form-element__control">
                        <div className="slds-checkbox">
                          <input
                            type="checkbox"
                            id="has-open-activity"
                            name="hasOpenActivity"
                            checked={formData.hasOpenActivity}
                            onChange={handleInputChange}
                          />
                          <label className="slds-checkbox__label" htmlFor="has-open-activity">
                            <span className="slds-checkbox_faux"></span>
                            <span className="slds-form-element__label">Has Open Activity</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="slds-m-top_large">
            <div className="slds-grid slds-grid_align-end">
              <Button
                type="button"
                variant="neutral"
                onClick={handleCancel}
                disabled={loading}
                icon={<X size={16} />}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="brand"
                loading={loading}
                disabled={loading}
                className="slds-m-left_x-small"
                icon={<Save size={16} />}
              >
                {mode === 'create' ? 'Create Opportunity' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OpportunityForm;