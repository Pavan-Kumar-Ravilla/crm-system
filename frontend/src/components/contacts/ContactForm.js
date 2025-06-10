// src/components/contacts/ContactForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { contactsAPI, accountsAPI, usersAPI } from '../../services/api';
import Input, { Textarea } from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { 
  User, 
  Building, 
  Mail, 
  Phone, 
  MapPin,
  Save,
  X,
  Users
} from 'lucide-react';

const ContactForm = ({ contact, mode = 'create', onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: contact?.firstName || '',
    lastName: contact?.lastName || '',
    accountId: contact?.accountId?.id || contact?.accountId || '',
    reportsToId: contact?.reportsToId?.id || contact?.reportsToId || '',
    title: contact?.title || '',
    department: contact?.department || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    mobilePhone: contact?.mobilePhone || '',
    homePhone: contact?.homePhone || '',
    assistantName: contact?.assistantName || '',
    assistantPhone: contact?.assistantPhone || '',
    leadSource: contact?.leadSource || 'Website',
    mailingAddress: {
      street: contact?.mailingAddress?.street || '',
      city: contact?.mailingAddress?.city || '',
      state: contact?.mailingAddress?.state || '',
      zipCode: contact?.mailingAddress?.zipCode || '',
      country: contact?.mailingAddress?.country || ''
    },
    otherAddress: {
      street: contact?.otherAddress?.street || '',
      city: contact?.otherAddress?.city || '',
      state: contact?.otherAddress?.state || '',
      zipCode: contact?.otherAddress?.zipCode || '',
      country: contact?.otherAddress?.country || ''
    },
    birthdate: contact?.birthdate ? new Date(contact.birthdate).toISOString().split('T')[0] : '',
    description: contact?.description || '',
    ownerId: contact?.ownerId?.id || contact?.ownerId || '',
    hasOptedOutOfEmail: contact?.hasOptedOutOfEmail || false,
    hasOptedOutOfFax: contact?.hasOptedOutOfFax || false,
    doNotCall: contact?.doNotCall || false
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [users, setUsers] = useState([]);
  const [copyMailing, setCopyMailing] = useState(false);

  const { addNotification } = useApp();
  const navigate = useNavigate();

  const sourceOptions = [
    { value: 'Website', label: 'Website' },
    { value: 'Phone Inquiry', label: 'Phone Inquiry' },
    { value: 'Partner Referral', label: 'Partner Referral' },
    { value: 'Trade Show', label: 'Trade Show' },
    { value: 'Email Campaign', label: 'Email Campaign' },
    { value: 'Social Media', label: 'Social Media' },
    { value: 'Advertisement', label: 'Advertisement' },
    { value: 'Employee Referral', label: 'Employee Referral' },
    { value: 'Word of mouth', label: 'Word of mouth' },
    { value: 'Other', label: 'Other' }
  ];

  const departmentOptions = [
    { value: '', label: 'Select Department' },
    { value: 'Sales', label: 'Sales' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Engineering', label: 'Engineering' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Human Resources', label: 'Human Resources' },
    { value: 'Operations', label: 'Operations' },
    { value: 'Support', label: 'Support' },
    { value: 'Executive', label: 'Executive' },
    { value: 'IT', label: 'IT' },
    { value: 'Legal', label: 'Legal' },
    { value: 'Other', label: 'Other' }
  ];

  useEffect(() => {
    loadAccounts();
    loadContacts();
    loadUsers();
  }, []);

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
    
    if (name.startsWith('mailingAddress.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        mailingAddress: {
          ...prev.mailingAddress,
          [addressField]: value
        }
      }));
    } else if (name.startsWith('otherAddress.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        otherAddress: {
          ...prev.otherAddress,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
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

  const handleCopyMailingAddress = (e) => {
    const checked = e.target.checked;
    setCopyMailing(checked);
    
    if (checked) {
      setFormData(prev => ({
        ...prev,
        otherAddress: { ...prev.mailingAddress }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        otherAddress: {
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
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    const phoneFields = ['phone', 'mobilePhone', 'homePhone', 'assistantPhone'];
    phoneFields.forEach(field => {
      if (formData[field] && !/^[\+]?[1-9][\d]{0,15}$/.test(formData[field])) {
        newErrors[field] = 'Please enter a valid phone number';
      }
    });

    // Birthdate validation
    if (formData.birthdate && new Date(formData.birthdate) > new Date()) {
      newErrors.birthdate = 'Birthdate cannot be in the future';
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
      // Convert birthdate to proper format
      const submitData = {
        ...formData,
        birthdate: formData.birthdate ? new Date(formData.birthdate).toISOString() : null
      };

      let result;
      if (mode === 'create') {
        result = await contactsAPI.create(submitData);
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Contact created successfully'
        });
      } else {
        result = await contactsAPI.update(contact.id, submitData);
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Contact updated successfully'
        });
      }

      if (onSave) {
        onSave(result.contact);
      } else {
        navigate('/contacts');
      }
    } catch (error) {
      console.error('Error saving contact:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message || `Failed to ${mode === 'create' ? 'create' : 'update'} contact`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/contacts');
    }
  };

  return (
    <div className="slds-card">
      <div className="slds-card__header slds-grid">
        <header className="slds-media slds-media_center slds-has-flexi-truncate">
          <div className="slds-media__figure">
            <span className="slds-icon_container slds-icon-standard-contact">
              <User size={20} />
            </span>
          </div>
          <div className="slds-media__body">
            <h2 className="slds-card__header-title">
              <span className="slds-text-heading_small">
                {mode === 'create' ? 'New Contact' : 'Edit Contact'}
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
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    error={errors.firstName}
                    required
                    leftIcon={<User size={16} />}
                  />
                </div>
                <div className="slds-col slds-size_1-of-2">
                  <Input
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    error={errors.lastName}
                    required
                  />
                </div>
              </div>

              <div className="slds-grid slds-gutters slds-m-top_medium">
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
                <div className="slds-col slds-size_1-of-2">
                  <Select
                    label="Reports To"
                    name="reportsToId"
                    value={formData.reportsToId}
                    options={[
                      { value: '', label: 'None' },
                      ...contacts.filter(c => c.id !== contact?.id).map(c => ({
                        value: c.id,
                        label: `${c.firstName} ${c.lastName}`
                      }))
                    ]}
                    error={errors.reportsToId}
                  />
                </div>
              </div>

              <div className="slds-grid slds-gutters slds-m-top_medium">
                <div className="slds-col slds-size_1-of-2">
                  <Input
                    label="Title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    error={errors.title}
                  />
                </div>
                <div className="slds-col slds-size_1-of-2">
                  <Select
                    label="Department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    options={departmentOptions}
                    error={errors.department}
                  />
                </div>
              </div>

              <div className="slds-grid slds-gutters slds-m-top_medium">
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
                <div className="slds-col slds-size_1-of-2">
                  <Select
                    label="Contact Owner"
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
              </div>

              <div className="slds-grid slds-gutters slds-m-top_medium">
                <div className="slds-col slds-size_1-of-2">
                  <Input
                    label="Birthdate"
                    type="date"
                    name="birthdate"
                    value={formData.birthdate}
                    onChange={handleInputChange}
                    error={errors.birthdate}
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
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    error={errors.email}
                    leftIcon={<Mail size={16} />}
                  />
                </div>
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
              </div>

              <div className="slds-grid slds-gutters slds-m-top_medium">
                <div className="slds-col slds-size_1-of-2">
                  <Input
                    label="Mobile Phone"
                    type="tel"
                    name="mobilePhone"
                    value={formData.mobilePhone}
                    onChange={handleInputChange}
                    error={errors.mobilePhone}
                    leftIcon={<Phone size={16} />}
                  />
                </div>
                <div className="slds-col slds-size_1-of-2">
                  <Input
                    label="Home Phone"
                    type="tel"
                    name="homePhone"
                    value={formData.homePhone}
                    onChange={handleInputChange}
                    error={errors.homePhone}
                    leftIcon={<Phone size={16} />}
                  />
                </div>
              </div>

              <div className="slds-grid slds-gutters slds-m-top_medium">
                <div className="slds-col slds-size_1-of-2">
                  <Input
                    label="Assistant"
                    name="assistantName"
                    value={formData.assistantName}
                    onChange={handleInputChange}
                    error={errors.assistantName}
                    leftIcon={<Users size={16} />}
                  />
                </div>
                <div className="slds-col slds-size_1-of-2">
                  <Input
                    label="Assistant Phone"
                    type="tel"
                    name="assistantPhone"
                    value={formData.assistantPhone}
                    onChange={handleInputChange}
                    error={errors.assistantPhone}
                    leftIcon={<Phone size={16} />}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mailing Address */}
          <div className="slds-section slds-is-open slds-m-top_large">
            <h3 className="slds-section__title slds-theme_shade">
              <span className="slds-truncate slds-p-horizontal_small" title="Mailing Address">
                Mailing Address
              </span>
            </h3>
            <div className="slds-section__content">
              <div className="slds-grid slds-gutters">
                <div className="slds-col slds-size_1-of-1">
                  <Input
                    label="Street"
                    name="mailingAddress.street"
                    value={formData.mailingAddress.street}
                    onChange={handleInputChange}
                    error={errors['mailingAddress.street']}
                    leftIcon={<MapPin size={16} />}
                  />
                </div>
              </div>

              <div className="slds-grid slds-gutters slds-m-top_medium">
                <div className="slds-col slds-size_1-of-3">
                  <Input
                    label="City"
                    name="mailingAddress.city"
                    value={formData.mailingAddress.city}
                    onChange={handleInputChange}
                    error={errors['mailingAddress.city']}
                  />
                </div>
                <div className="slds-col slds-size_1-of-3">
                  <Input
                    label="State/Province"
                    name="mailingAddress.state"
                    value={formData.mailingAddress.state}
                    onChange={handleInputChange}
                    error={errors['mailingAddress.state']}
                  />
                </div>
                <div className="slds-col slds-size_1-of-3">
                  <Input
                    label="Zip/Postal Code"
                    name="mailingAddress.zipCode"
                    value={formData.mailingAddress.zipCode}
                    onChange={handleInputChange}
                    error={errors['mailingAddress.zipCode']}
                  />
                </div>
              </div>

              <div className="slds-grid slds-gutters slds-m-top_medium">
                <div className="slds-col slds-size_1-of-2">
                  <Input
                    label="Country"
                    name="mailingAddress.country"
                    value={formData.mailingAddress.country}
                    onChange={handleInputChange}
                    error={errors['mailingAddress.country']}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Other Address */}
          <div className="slds-section slds-is-open slds-m-top_large">
            <h3 className="slds-section__title slds-theme_shade">
              <span className="slds-truncate slds-p-horizontal_small" title="Other Address">
                Other Address
              </span>
            </h3>
            <div className="slds-section__content">
              <div className="slds-form-element slds-m-bottom_medium">
                <div className="slds-form-element__control">
                  <div className="slds-checkbox">
                    <input
                      type="checkbox"
                      id="copy-mailing"
                      checked={copyMailing}
                      onChange={handleCopyMailingAddress}
                    />
                    <label className="slds-checkbox__label" htmlFor="copy-mailing">
                      <span className="slds-checkbox_faux"></span>
                      <span className="slds-form-element__label">Copy from Mailing Address</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="slds-grid slds-gutters">
                <div className="slds-col slds-size_1-of-1">
                  <Input
                    label="Street"
                    name="otherAddress.street"
                    value={formData.otherAddress.street}
                    onChange={handleInputChange}
                    error={errors['otherAddress.street']}
                    leftIcon={<MapPin size={16} />}
                  />
                </div>
              </div>

              <div className="slds-grid slds-gutters slds-m-top_medium">
                <div className="slds-col slds-size_1-of-3">
                  <Input
                    label="City"
                    name="otherAddress.city"
                    value={formData.otherAddress.city}
                    onChange={handleInputChange}
                    error={errors['otherAddress.city']}
                  />
                </div>
                <div className="slds-col slds-size_1-of-3">
                  <Input
                    label="State/Province"
                    name="otherAddress.state"
                    value={formData.otherAddress.state}
                    onChange={handleInputChange}
                    error={errors['otherAddress.state']}
                  />
                </div>
                <div className="slds-col slds-size_1-of-3">
                  <Input
                    label="Zip/Postal Code"
                    name="otherAddress.zipCode"
                    value={formData.otherAddress.zipCode}
                    onChange={handleInputChange}
                    error={errors['otherAddress.zipCode']}
                  />
                </div>
              </div>

              <div className="slds-grid slds-gutters slds-m-top_medium">
                <div className="slds-col slds-size_1-of-2">
                  <Input
                    label="Country"
                    name="otherAddress.country"
                    value={formData.otherAddress.country}
                    onChange={handleInputChange}
                    error={errors['otherAddress.country']}
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

              {/* Privacy Settings */}
              <div className="slds-m-top_medium">
                <h4 className="slds-text-heading_small slds-m-bottom_small">Privacy Settings</h4>
                <div className="slds-grid slds-gutters">
                  <div className="slds-col slds-size_1-of-3">
                    <div className="slds-form-element">
                      <div className="slds-form-element__control">
                        <div className="slds-checkbox">
                          <input
                            type="checkbox"
                            id="email-opt-out"
                            name="hasOptedOutOfEmail"
                            checked={formData.hasOptedOutOfEmail}
                            onChange={handleInputChange}
                          />
                          <label className="slds-checkbox__label" htmlFor="email-opt-out">
                            <span className="slds-checkbox_faux"></span>
                            <span className="slds-form-element__label">Email Opt Out</span>
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
                            id="fax-opt-out"
                            name="hasOptedOutOfFax"
                            checked={formData.hasOptedOutOfFax}
                            onChange={handleInputChange}
                          />
                          <label className="slds-checkbox__label" htmlFor="fax-opt-out">
                            <span className="slds-checkbox_faux"></span>
                            <span className="slds-form-element__label">Fax Opt Out</span>
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
                            id="do-not-call"
                            name="doNotCall"
                            checked={formData.doNotCall}
                            onChange={handleInputChange}
                          />
                          <label className="slds-checkbox__label" htmlFor="do-not-call">
                            <span className="slds-checkbox_faux"></span>
                            <span className="slds-form-element__label">Do Not Call</span>
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
                {mode === 'create' ? 'Create Contact' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;