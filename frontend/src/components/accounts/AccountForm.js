// src/components/accounts/AccountForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { accountsAPI, usersAPI } from '../../services/api';
import Input, { Textarea } from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { 
  Building, 
  Mail, 
  Phone, 
  Globe, 
  MapPin,
  DollarSign,
  Users,
  Save,
  X,
  User
} from 'lucide-react';

const AccountForm = ({ account, mode = 'create', onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: account?.name || '',
    type: account?.type || 'Prospect',
    industry: account?.industry || '',
    website: account?.website || '',
    phone: account?.phone || '',
    fax: account?.fax || '',
    annualRevenue: account?.annualRevenue || '',
    employees: account?.employees || '',
    ownership: account?.ownership || '',
    tickerSymbol: account?.tickerSymbol || '',
    rating: account?.rating || 'Cold',
    parentAccountId: account?.parentAccountId || '',
    billingAddress: {
      street: account?.billingAddress?.street || '',
      city: account?.billingAddress?.city || '',
      state: account?.billingAddress?.state || '',
      zipCode: account?.billingAddress?.zipCode || '',
      country: account?.billingAddress?.country || ''
    },
    shippingAddress: {
      street: account?.shippingAddress?.street || '',
      city: account?.shippingAddress?.city || '',
      state: account?.shippingAddress?.state || '',
      zipCode: account?.shippingAddress?.zipCode || '',
      country: account?.shippingAddress?.country || ''
    },
    description: account?.description || '',
    ownerId: account?.ownerId?.id || account?.ownerId || ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [copyBilling, setCopyBilling] = useState(false);

  const { addNotification } = useApp();
  const navigate = useNavigate();

  const typeOptions = [
    { value: 'Customer', label: 'Customer' },
    { value: 'Prospect', label: 'Prospect' },
    { value: 'Partner', label: 'Partner' },
    { value: 'Competitor', label: 'Competitor' },
    { value: 'Other', label: 'Other' }
  ];

  const industryOptions = [
    { value: '', label: 'Select Industry' },
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
    { value: 'Agriculture', label: 'Agriculture' },
    { value: 'Entertainment', label: 'Entertainment' },
    { value: 'Hospitality', label: 'Hospitality' },
    { value: 'Construction', label: 'Construction' },
    { value: 'Other', label: 'Other' }
  ];

  const ownershipOptions = [
    { value: '', label: 'Select Ownership' },
    { value: 'Public', label: 'Public' },
    { value: 'Private', label: 'Private' },
    { value: 'Subsidiary', label: 'Subsidiary' },
    { value: 'Government', label: 'Government' },
    { value: 'Non-profit', label: 'Non-profit' },
    { value: 'Other', label: 'Other' }
  ];

  const ratingOptions = [
    { value: 'Hot', label: 'Hot' },
    { value: 'Warm', label: 'Warm' },
    { value: 'Cold', label: 'Cold' }
  ];

  useEffect(() => {
    loadUsers();
    loadAccounts();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await usersAPI.getAll({ limit: 100 });
      setUsers(response.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadAccounts = async () => {
    try {
      const response = await accountsAPI.getAll({ limit: 100 });
      setAccounts(response.accounts || []);
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('billingAddress.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        billingAddress: {
          ...prev.billingAddress,
          [addressField]: value
        }
      }));
    } else if (name.startsWith('shippingAddress.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        shippingAddress: {
          ...prev.shippingAddress,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCopyBillingAddress = (e) => {
    const checked = e.target.checked;
    setCopyBilling(checked);
    
    if (checked) {
      setFormData(prev => ({
        ...prev,
        shippingAddress: { ...prev.billingAddress }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        shippingAddress: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        }
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Account name is required';
    }

    // Website validation
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Please enter a valid website URL (including http:// or https://)';
    }

    // Phone validation
    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Number validation
    if (formData.annualRevenue && isNaN(formData.annualRevenue)) {
      newErrors.annualRevenue = 'Annual revenue must be a number';
    }
    if (formData.employees && isNaN(formData.employees)) {
      newErrors.employees = 'Number of employees must be a number';
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
        annualRevenue: formData.annualRevenue ? parseFloat(formData.annualRevenue) : undefined,
        employees: formData.employees ? parseInt(formData.employees) : undefined
      };

      let result;
      if (mode === 'create') {
        result = await accountsAPI.create(submitData);
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Account created successfully'
        });
      } else {
        result = await accountsAPI.update(account.id, submitData);
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Account updated successfully'
        });
      }

      if (onSave) {
        onSave(result.account);
      } else {
        navigate('/accounts');
      }
    } catch (error) {
      console.error('Error saving account:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message || `Failed to ${mode === 'create' ? 'create' : 'update'} account`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/accounts');
    }
  };

  return (
    <div className="slds-card">
      <div className="slds-card__header slds-grid">
        <header className="slds-media slds-media_center slds-has-flexi-truncate">
          <div className="slds-media__figure">
            <span className="slds-icon_container slds-icon-standard-account">
              <Building size={20} />
            </span>
          </div>
          <div className="slds-media__body">
            <h2 className="slds-card__header-title">
              <span className="slds-text-heading_small">
                {mode === 'create' ? 'New Account' : 'Edit Account'}
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
                    label="Account Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    error={errors.name}
                    required
                    leftIcon={<Building size={16} />}
                  />
                </div>
                <div className="slds-col slds-size_1-of-2">
                  <Select
                    label="Account Type"
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
                    label="Industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    options={industryOptions}
                    error={errors.industry}
                  />
                </div>
                <div className="slds-col slds-size_1-of-2">
                  <Select
                    label="Rating"
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                    options={ratingOptions}
                    error={errors.rating}
                  />
                </div>
              </div>

              <div className="slds-grid slds-gutters slds-m-top_medium">
                <div className="slds-col slds-size_1-of-2">
                  <Select
                    label="Account Owner"
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
                    label="Parent Account"
                    name="parentAccountId"
                    value={formData.parentAccountId}
                    onChange={handleInputChange}
                    options={[
                      { value: '', label: 'None' },
                      ...accounts.filter(acc => acc.id !== account?.id).map(acc => ({
                        value: acc.id,
                        label: acc.name
                      }))
                    ]}
                    error={errors.parentAccountId}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="slds-section slds-is-open slds-m-top_large">
            <h3 className="slds-section__title slds-theme_shade">
              <span className="slds-truncate slds-p-horizontal_small" title="Contact Information">
                Contact Information
              </span>
            </h3>
            <div className="slds-section__content">
              <div className="slds-grid slds-gutters">
                <div className="slds-col slds-size_1-of-2">
                  <Input
                    label="Phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    error={errors.phone}
                    leftIcon={<Phone size={16} />}
                  />
                </div>
                <div className="slds-col slds-size_1-of-2">
                  <Input
                    label="Fax"
                    type="tel"
                    name="fax"
                    value={formData.fax}
                    onChange={handleInputChange}
                    error={errors.fax}
                  />
                </div>
              </div>

              <div className="slds-grid slds-gutters slds-m-top_medium">
                <div className="slds-col slds-size_1-of-1">
                  <Input
                    label="Website"
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    error={errors.website}
                    leftIcon={<Globe size={16} />}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Company Details */}
          <div className="slds-section slds-is-open slds-m-top_large">
            <h3 className="slds-section__title slds-theme_shade">
              <span className="slds-truncate slds-p-horizontal_small" title="Company Details">
                Company Details
              </span>
            </h3>
            <div className="slds-section__content">
              <div className="slds-grid slds-gutters">
                <div className="slds-col slds-size_1-of-3">
                  <Input
                    label="Annual Revenue"
                    type="number"
                    name="annualRevenue"
                    value={formData.annualRevenue}
                    onChange={handleInputChange}
                    error={errors.annualRevenue}
                    leftIcon={<DollarSign size={16} />}
                  />
                </div>
                <div className="slds-col slds-size_1-of-3">
                  <Input
                    label="Employees"
                    type="number"
                    name="employees"
                    value={formData.employees}
                    onChange={handleInputChange}
                    error={errors.employees}
                    leftIcon={<Users size={16} />}
                  />
                </div>
                <div className="slds-col slds-size_1-of-3">
                  <Select
                    label="Ownership"
                    name="ownership"
                    value={formData.ownership}
                    onChange={handleInputChange}
                    options={ownershipOptions}
                    error={errors.ownership}
                  />
                </div>
              </div>

              <div className="slds-grid slds-gutters slds-m-top_medium">
                <div className="slds-col slds-size_1-of-2">
                  <Input
                    label="Ticker Symbol"
                    name="tickerSymbol"
                    value={formData.tickerSymbol}
                    onChange={handleInputChange}
                    error={errors.tickerSymbol}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Billing Address */}
          <div className="slds-section slds-is-open slds-m-top_large">
            <h3 className="slds-section__title slds-theme_shade">
              <span className="slds-truncate slds-p-horizontal_small" title="Billing Address">
                Billing Address
              </span>
            </h3>
            <div className="slds-section__content">
              <div className="slds-grid slds-gutters">
                <div className="slds-col slds-size_1-of-1">
                  <Input
                    label="Street"
                    name="billingAddress.street"
                    value={formData.billingAddress.street}
                    onChange={handleInputChange}
                    error={errors['billingAddress.street']}
                    leftIcon={<MapPin size={16} />}
                  />
                </div>
              </div>

              <div className="slds-grid slds-gutters slds-m-top_medium">
                <div className="slds-col slds-size_1-of-3">
                  <Input
                    label="City"
                    name="billingAddress.city"
                    value={formData.billingAddress.city}
                    onChange={handleInputChange}
                    error={errors['billingAddress.city']}
                  />
                </div>
                <div className="slds-col slds-size_1-of-3">
                  <Input
                    label="State/Province"
                    name="billingAddress.state"
                    value={formData.billingAddress.state}
                    onChange={handleInputChange}
                    error={errors['billingAddress.state']}
                  />
                </div>
                <div className="slds-col slds-size_1-of-3">
                  <Input
                    label="Zip/Postal Code"
                    name="billingAddress.zipCode"
                    value={formData.billingAddress.zipCode}
                    onChange={handleInputChange}
                    error={errors['billingAddress.zipCode']}
                  />
                </div>
              </div>

              <div className="slds-grid slds-gutters slds-m-top_medium">
                <div className="slds-col slds-size_1-of-2">
                  <Input
                    label="Country"
                    name="billingAddress.country"
                    value={formData.billingAddress.country}
                    onChange={handleInputChange}
                    error={errors['billingAddress.country']}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="slds-section slds-is-open slds-m-top_large">
            <h3 className="slds-section__title slds-theme_shade">
              <span className="slds-truncate slds-p-horizontal_small" title="Shipping Address">
                Shipping Address
              </span>
            </h3>
            <div className="slds-section__content">
              <div className="slds-form-element slds-m-bottom_medium">
                <div className="slds-form-element__control">
                  <div className="slds-checkbox">
                    <input
                      type="checkbox"
                      id="copy-billing"
                      checked={copyBilling}
                      onChange={handleCopyBillingAddress}
                    />
                    <label className="slds-checkbox__label" htmlFor="copy-billing">
                      <span className="slds-checkbox_faux"></span>
                      <span className="slds-form-element__label">Copy from Billing Address</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="slds-grid slds-gutters">
                <div className="slds-col slds-size_1-of-1">
                  <Input
                    label="Street"
                    name="shippingAddress.street"
                    value={formData.shippingAddress.street}
                    onChange={handleInputChange}
                    error={errors['shippingAddress.street']}
                    leftIcon={<MapPin size={16} />}
                  />
                </div>
              </div>

              <div className="slds-grid slds-gutters slds-m-top_medium">
                <div className="slds-col slds-size_1-of-3">
                  <Input
                    label="City"
                    name="shippingAddress.city"
                    value={formData.shippingAddress.city}
                    onChange={handleInputChange}
                    error={errors['shippingAddress.city']}
                  />
                </div>
                <div className="slds-col slds-size_1-of-3">
                  <Input
                    label="State/Province"
                    name="shippingAddress.state"
                    value={formData.shippingAddress.state}
                    onChange={handleInputChange}
                    error={errors['shippingAddress.state']}
                  />
                </div>
                <div className="slds-col slds-size_1-of-3">
                  <Input
                    label="Zip/Postal Code"
                    name="shippingAddress.zipCode"
                    value={formData.shippingAddress.zipCode}
                    onChange={handleInputChange}
                    error={errors['shippingAddress.zipCode']}
                  />
                </div>
              </div>

              <div className="slds-grid slds-gutters slds-m-top_medium">
                <div className="slds-col slds-size_1-of-2">
                  <Input
                    label="Country"
                    name="shippingAddress.country"
                    value={formData.shippingAddress.country}
                    onChange={handleInputChange}
                    error={errors['shippingAddress.country']}
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
                {mode === 'create' ? 'Create Account' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountForm;