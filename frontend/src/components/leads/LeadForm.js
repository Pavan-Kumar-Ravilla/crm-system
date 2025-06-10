// src/components/leads/LeadForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Input, { Textarea } from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { leadsAPI } from '../../services/api';
import { 
  User, 
  Building, 
  Mail, 
  Phone, 
  Globe, 
  MapPin,
  DollarSign,
  Users,
  Save,
  X
} from 'lucide-react';

const LeadForm = ({ lead, mode = 'create', onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: lead?.firstName || '',
    lastName: lead?.lastName || '',
    company: lead?.company || '',
    email: lead?.email || '',
    phone: lead?.phone || '',
    mobilePhone: lead?.mobilePhone || '',
    title: lead?.title || '',
    website: lead?.website || '',
    industry: lead?.industry || '',
    status: lead?.status || 'New',
    leadSource: lead?.leadSource || 'Website',
    rating: lead?.rating || 'Cold',
    annualRevenue: lead?.annualRevenue || '',
    numberOfEmployees: lead?.numberOfEmployees || '',
    address: {
      street: lead?.address?.street || '',
      city: lead?.address?.city || '',
      state: lead?.address?.state || '',
      zipCode: lead?.address?.zipCode || '',
      country: lead?.address?.country || ''
    },
    description: lead?.description || '',
    notes: lead?.notes || '',
    // Qualification fields
    budget: lead?.budget || '',
    timeline: lead?.timeline || '',
    authority: lead?.authority || ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { addNotification } = useApp();
  const navigate = useNavigate();

  const statusOptions = [
    { value: 'New', label: 'New' },
    { value: 'Contacted', label: 'Contacted' },
    { value: 'Qualified', label: 'Qualified' },
    { value: 'Unqualified', label: 'Unqualified' }
  ];

  const sourceOptions = [
    { value: 'Website', label: 'Website' },
    { value: 'Phone Inquiry', label: 'Phone Inquiry' },
    { value: 'Partner Referral', label: 'Partner Referral' },
    { value: 'Trade Show', label: 'Trade Show' },
    { value: 'Web', label: 'Web' },
    { value: 'Email Campaign', label: 'Email Campaign' },
    { value: 'Social Media', label: 'Social Media' },
    { value: 'Other', label: 'Other' }
  ];

  const ratingOptions = [
    { value: 'Hot', label: 'Hot' },
    { value: 'Warm', label: 'Warm' },
    { value: 'Cold', label: 'Cold' }
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

  const timelineOptions = [
    { value: '', label: 'Select Timeline' },
    { value: 'Immediate', label: 'Immediate' },
    { value: '1-3 months', label: '1-3 months' },
    { value: '3-6 months', label: '3-6 months' },
    { value: '6-12 months', label: '6-12 months' },
    { value: '12+ months', label: '12+ months' }
  ];

  const authorityOptions = [
    { value: '', label: 'Select Authority' },
    { value: 'Decision Maker', label: 'Decision Maker' },
    { value: 'Influencer', label: 'Influencer' },
    { value: 'End User', label: 'End User' },
    { value: 'Other', label: 'Other' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
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

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.company.trim()) {
      newErrors.company = 'Company is required';
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Website validation
    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Please enter a valid website URL (including http:// or https://)';
    }

    // Number validation
    if (formData.annualRevenue && isNaN(formData.annualRevenue)) {
      newErrors.annualRevenue = 'Annual revenue must be a number';
    }
    if (formData.numberOfEmployees && isNaN(formData.numberOfEmployees)) {
      newErrors.numberOfEmployees = 'Number of employees must be a number';
    }
    if (formData.budget && isNaN(formData.budget)) {
      newErrors.budget = 'Budget must be a number';
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
        numberOfEmployees: formData.numberOfEmployees ? parseInt(formData.numberOfEmployees) : undefined,
        budget: formData.budget ? parseFloat(formData.budget) : undefined
      };

      let result;
      if (mode === 'create') {
        result = await leadsAPI.create(submitData);
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Lead created successfully'
        });
      } else {
        result = await leadsAPI.update(lead.id, submitData);
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Lead updated successfully'
        });
      }

      if (onSave) {
        onSave(result.lead);
      } else {
        navigate('/leads');
      }
    } catch (error) {
      console.error('Error saving lead:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message || `Failed to ${mode === 'create' ? 'create' : 'update'} lead`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/leads');
    }
  };

  return (
    <div className="slds-card">
      <div className="slds-card__header slds-grid">
        <header className="slds-media slds-media_center slds-has-flexi-truncate">
          <div className="slds-media__figure">
            <span className="slds-icon_container slds-icon-standard-lead">
              <User size={20} />
            </span>
          </div>
          <div className="slds-media__body">
            <h2 className="slds-card__header-title">
              <span className="slds-text-heading_small">
                {mode === 'create' ? 'New Lead' : 'Edit Lead'}
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
                  <Input
                    label="Company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    error={errors.company}
                    required
                    leftIcon={<Building size={16} />}
                  />
                </div>
                <div className="slds-col slds-size_1-of-2">
                  <Input
                    label="Title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    error={errors.title}
                  />
                </div>
              </div>

              <div className="slds-grid slds-gutters slds-m-top_medium">
                <div className="slds-col slds-size_1-of-3">
                  <Select
                    label="Status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    options={statusOptions}
                    error={errors.status}
                  />
                </div>
                <div className="slds-col slds-size_1-of-3">
                  <Select
                    label="Lead Source"
                    name="leadSource"
                    value={formData.leadSource}
                    onChange={handleInputChange}
                    options={sourceOptions}
                    error={errors.leadSource}
                  />
                </div>
                <div className="slds-col slds-size_1-of-3">
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

          {/* Company Information */}
          <div className="slds-section slds-is-open slds-m-top_large">
            <h3 className="slds-section__title slds-theme_shade">
              <span className="slds-truncate slds-p-horizontal_small" title="Company Information">
                Company Information
              </span>
            </h3>
            <div className="slds-section__content">
              <div className="slds-grid slds-gutters">
                <div className="slds-col slds-size_1-of-3">
                  <Select
                    label="Industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    options={industryOptions}
                    error={errors.industry}
                  />
                </div>
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
                    label="Number of Employees"
                    type="number"
                    name="numberOfEmployees"
                    value={formData.numberOfEmployees}
                    onChange={handleInputChange}
                    error={errors.numberOfEmployees}
                    leftIcon={<Users size={16} />}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="slds-section slds-is-open slds-m-top_large">
            <h3 className="slds-section__title slds-theme_shade">
              <span className="slds-truncate slds-p-horizontal_small" title="Address Information">
                Address Information
              </span>
            </h3>
            <div className="slds-section__content">
              <div className="slds-grid slds-gutters">
                <div className="slds-col slds-size_1-of-1">
                  <Input
                    label="Street"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleInputChange}
                    error={errors['address.street']}
                    leftIcon={<MapPin size={16} />}
                  />
                </div>
              </div>

              <div className="slds-grid slds-gutters slds-m-top_medium">
                <div className="slds-col slds-size_1-of-3">
                  <Input
                    label="City"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleInputChange}
                    error={errors['address.city']}
                  />
                </div>
                <div className="slds-col slds-size_1-of-3">
                  <Input
                    label="State/Province"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleInputChange}
                    error={errors['address.state']}
                  />
                </div>
                <div className="slds-col slds-size_1-of-3">
                  <Input
                    label="Zip/Postal Code"
                    name="address.zipCode"
                    value={formData.address.zipCode}
                    onChange={handleInputChange}
                    error={errors['address.zipCode']}
                  />
                </div>
              </div>

              <div className="slds-grid slds-gutters slds-m-top_medium">
                <div className="slds-col slds-size_1-of-2">
                  <Input
                    label="Country"
                    name="address.country"
                    value={formData.address.country}
                    onChange={handleInputChange}
                    error={errors['address.country']}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Qualification Information */}
          <div className="slds-section slds-is-open slds-m-top_large">
            <h3 className="slds-section__title slds-theme_shade">
              <span className="slds-truncate slds-p-horizontal_small" title="Qualification Information">
                Qualification Information
              </span>
            </h3>
            <div className="slds-section__content">
              <div className="slds-grid slds-gutters">
                <div className="slds-col slds-size_1-of-3">
                  <Input
                    label="Budget"
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    error={errors.budget}
                    leftIcon={<DollarSign size={16} />}
                  />
                </div>
                <div className="slds-col slds-size_1-of-3">
                  <Select
                    label="Timeline"
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleInputChange}
                    options={timelineOptions}
                    error={errors.timeline}
                  />
                </div>
                <div className="slds-col slds-size_1-of-3">
                  <Select
                    label="Authority"
                    name="authority"
                    value={formData.authority}
                    onChange={handleInputChange}
                    options={authorityOptions}
                    error={errors.authority}
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

              <div className="slds-grid slds-gutters slds-m-top_medium">
                <div className="slds-col slds-size_1-of-1">
                  <Textarea
                    label="Notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    error={errors.notes}
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
                {mode === 'create' ? 'Create Lead' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadForm;