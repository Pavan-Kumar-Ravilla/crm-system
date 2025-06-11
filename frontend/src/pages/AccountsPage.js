import React from 'react';
import * as yup from 'yup';
import DynamicForm from './DynamicForm';

const accountSchema = yup.object().shape({
  name: yup.string().required('Account name is required').min(2, 'Must be at least 2 characters'),
  type: yup.string().nullable(),
  industry: yup.string().nullable(),
  parentAccountId: yup.string().nullable(),
  website: yup.string().url('Invalid website URL').nullable(),
  phone: yup.string().nullable(),
  fax: yup.string().nullable(),
  annualRevenue: yup.number().min(0, 'Annual revenue must be positive').nullable(),
  employees: yup.number().min(0, 'Number of employees must be positive').nullable(),
  ownership: yup.string().nullable(),
  tickerSymbol: yup.string().max(10, 'Ticker symbol cannot exceed 10 characters').nullable(),
  rating: yup.string().nullable(),
  description: yup.string().max(1000, 'Description cannot exceed 1000 characters').nullable(),
  // Billing Address
  billingStreet: yup.string().nullable(),
  billingCity: yup.string().nullable(),
  billingState: yup.string().nullable(),
  billingZipCode: yup.string().nullable(),
  billingCountry: yup.string().nullable(),
  // Shipping Address
  shippingStreet: yup.string().nullable(),
  shippingCity: yup.string().nullable(),
  shippingState: yup.string().nullable(),
  shippingZipCode: yup.string().nullable(),
  shippingCountry: yup.string().nullable(),
  // SLA Information
  slaType: yup.string().nullable(),
  slaExpiryDate: yup.date().nullable(),
});

const AccountForm = ({ 
  defaultValues = {}, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  accounts = [] // For parent account selection
}) => {
  const fields = [
    // Basic Information
    {
      name: 'name',
      type: 'text',
      label: 'Account Name',
      placeholder: 'Enter account/company name',
      required: true
    },
    {
      name: 'type',
      type: 'select',
      label: 'Account Type',
      placeholder: 'Select account type',
      options: [
        { value: 'Customer', label: 'Customer' },
        { value: 'Prospect', label: 'Prospect' },
        { value: 'Partner', label: 'Partner' },
        { value: 'Competitor', label: 'Competitor' },
        { value: 'Other', label: 'Other' }
      ]
    },
    {
      name: 'parentAccountId',
      type: 'select',
      label: 'Parent Account',
      placeholder: 'Select parent account (if applicable)',
      options: accounts
        .filter(account => account.id !== defaultValues.id) // Prevent self-reference
        .map(account => ({
          value: account.id,
          label: account.name
        }))
    },
    
    // Industry and Classification
    {
      name: 'industry',
      type: 'select',
      label: 'Industry',
      placeholder: 'Select industry',
      options: [
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
      ]
    },
    {
      name: 'rating',
      type: 'select',
      label: 'Account Rating',
      placeholder: 'Select account rating',
      options: [
        { value: 'Hot', label: 'Hot' },
        { value: 'Warm', label: 'Warm' },
        { value: 'Cold', label: 'Cold' }
      ]
    },
    
    // Contact Information
    {
      name: 'website',
      type: 'url',
      label: 'Website',
      placeholder: 'Enter website URL (https://example.com)'
    },
    {
      name: 'phone',
      type: 'tel',
      label: 'Main Phone',
      placeholder: 'Enter main phone number'
    },
    {
      name: 'fax',
      type: 'tel',
      label: 'Fax Number',
      placeholder: 'Enter fax number'
    },
    
    // Financial Information
    {
      name: 'annualRevenue',
      type: 'number',
      label: 'Annual Revenue ($)',
      placeholder: 'Enter annual revenue'
    },
    {
      name: 'employees',
      type: 'number',
      label: 'Number of Employees',
      placeholder: 'Enter number of employees'
    },
    
    // Company Details
    {
      name: 'ownership',
      type: 'select',
      label: 'Ownership Type',
      placeholder: 'Select ownership type',
      options: [
        { value: 'Public', label: 'Public' },
        { value: 'Private', label: 'Private' },
        { value: 'Subsidiary', label: 'Subsidiary' },
        { value: 'Government', label: 'Government' },
        { value: 'Non-profit', label: 'Non-profit' },
        { value: 'Other', label: 'Other' }
      ]
    },
    {
      name: 'tickerSymbol',
      type: 'text',
      label: 'Ticker Symbol',
      placeholder: 'Enter stock ticker symbol (for public companies)'
    },
    
    // Billing Address
    {
      name: 'billingStreet',
      type: 'text',
      label: 'Billing Street',
      placeholder: 'Enter billing street address'
    },
    {
      name: 'billingCity',
      type: 'text',
      label: 'Billing City',
      placeholder: 'Enter billing city'
    },
    {
      name: 'billingState',
      type: 'text',
      label: 'Billing State/Province',
      placeholder: 'Enter billing state or province'
    },
    {
      name: 'billingZipCode',
      type: 'text',
      label: 'Billing Zip/Postal Code',
      placeholder: 'Enter billing zip or postal code'
    },
    {
      name: 'billingCountry',
      type: 'text',
      label: 'Billing Country',
      placeholder: 'Enter billing country'
    },
    
    // Shipping Address
    {
      name: 'shippingStreet',
      type: 'text',
      label: 'Shipping Street',
      placeholder: 'Enter shipping street address'
    },
    {
      name: 'shippingCity',
      type: 'text',
      label: 'Shipping City',
      placeholder: 'Enter shipping city'
    },
    {
      name: 'shippingState',
      type: 'text',
      label: 'Shipping State/Province',
      placeholder: 'Enter shipping state or province'
    },
    {
      name: 'shippingZipCode',
      type: 'text',
      label: 'Shipping Zip/Postal Code',
      placeholder: 'Enter shipping zip or postal code'
    },
    {
      name: 'shippingCountry',
      type: 'text',
      label: 'Shipping Country',
      placeholder: 'Enter shipping country'
    },
    
    // SLA Information
    {
      name: 'slaType',
      type: 'select',
      label: 'SLA Type',
      placeholder: 'Select SLA type',
      options: [
        { value: 'Gold', label: 'Gold' },
        { value: 'Silver', label: 'Silver' },
        { value: 'Bronze', label: 'Bronze' },
        { value: 'None', label: 'None' }
      ]
    },
    {
      name: 'slaExpiryDate',
      type: 'date',
      label: 'SLA Expiry Date',
      dependencies: [
        {
          field: 'slaType',
          value: 'None',
          condition: 'not_equals'
        }
      ]
    },
    
    // Description
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      placeholder: 'Enter account description and notes',
      rows: 4
    }
  ];

  return (
    <DynamicForm
      fields={fields}
      schema={accountSchema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      onCancel={onCancel}
      isLoading={isLoading}
      submitLabel={defaultValues.id ? 'Update Account' : 'Create Account'}
      layout="horizontal"
    />
  );
};

export default AccountForm;