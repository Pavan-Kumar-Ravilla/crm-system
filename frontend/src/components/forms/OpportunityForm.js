import React from 'react';
import * as yup from 'yup';
import DynamicForm from './DynamicForm';

const opportunitySchema = yup.object().shape({
  name: yup.string().required('Opportunity name is required').min(3, 'Must be at least 3 characters'),
  accountId: yup.string().required('Account is required'),
  primaryContactId: yup.string().nullable(),
  amount: yup.number().min(0, 'Amount must be positive').required('Amount is required'),
  stage: yup.string().required('Stage is required'),
  probability: yup.number().min(0, 'Probability must be between 0 and 100').max(100, 'Probability must be between 0 and 100').required('Probability is required'),
  closeDate: yup.date().required('Close date is required').min(new Date(), 'Close date must be in the future'),
  type: yup.string().nullable(),
  leadSource: yup.string().nullable(),
  forecastCategory: yup.string().nullable(),
  nextStep: yup.string().max(255, 'Next step cannot exceed 255 characters').nullable(),
  description: yup.string().max(1000, 'Description cannot exceed 1000 characters').nullable(),
  competitorAnalysis: yup.string().max(1000, 'Competitor analysis cannot exceed 1000 characters').nullable(),
});

const OpportunityForm = ({ 
  defaultValues = {}, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  accounts = [],
  contacts = []
}) => {
  const fields = [
    // Basic Information
    {
      name: 'name',
      type: 'text',
      label: 'Opportunity Name',
      placeholder: 'Enter opportunity name',
      required: true
    },
    {
      name: 'accountId',
      type: 'select',
      label: 'Account',
      placeholder: 'Select an account',
      required: true,
      options: accounts.map(account => ({
        value: account.id,
        label: account.name
      }))
    },
    {
      name: 'primaryContactId',
      type: 'select',
      label: 'Primary Contact',
      placeholder: 'Select primary contact',
      options: contacts.map(contact => ({
        value: contact.id,
        label: `${contact.firstName} ${contact.lastName}`,
        disabled: defaultValues.accountId && contact.accountId !== defaultValues.accountId
      }))
    },
    
    // Financial Information
    {
      name: 'amount',
      type: 'number',
      label: 'Amount ($)',
      placeholder: 'Enter opportunity amount',
      required: true
    },
    {
      name: 'probability',
      type: 'number',
      label: 'Probability (%)',
      placeholder: 'Enter probability percentage (0-100)',
      required: true
    },
    
    // Sales Process
    {
      name: 'stage',
      type: 'select',
      label: 'Sales Stage',
      required: true,
      options: [
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
      ]
    },
    {
      name: 'closeDate',
      type: 'date',
      label: 'Expected Close Date',
      required: true
    },
    
    // Opportunity Details
    {
      name: 'type',
      type: 'select',
      label: 'Opportunity Type',
      placeholder: 'Select opportunity type',
      options: [
        { value: 'Existing Customer - Upgrade', label: 'Existing Customer - Upgrade' },
        { value: 'Existing Customer - Replacement', label: 'Existing Customer - Replacement' },
        { value: 'Existing Customer - Downgrade', label: 'Existing Customer - Downgrade' },
        { value: 'New Customer', label: 'New Customer' }
      ]
    },
    {
      name: 'leadSource',
      type: 'select',
      label: 'Lead Source',
      placeholder: 'Select lead source',
      options: [
        { value: 'Website', label: 'Website' },
        { value: 'Phone Inquiry', label: 'Phone Inquiry' },
        { value: 'Partner Referral', label: 'Partner Referral' },
        { value: 'Trade Show', label: 'Trade Show' },
        { value: 'Web', label: 'Web' },
        { value: 'Email Campaign', label: 'Email Campaign' },
        { value: 'Social Media', label: 'Social Media' },
        { value: 'Other', label: 'Other' }
      ]
    },
    
    // Forecasting
    {
      name: 'forecastCategory',
      type: 'select',
      label: 'Forecast Category',
      placeholder: 'Select forecast category',
      options: [
        { value: 'Pipeline', label: 'Pipeline' },
        { value: 'Best Case', label: 'Best Case' },
        { value: 'Commit', label: 'Commit' },
        { value: 'Omitted', label: 'Omitted' }
      ]
    },
    
    // Process Information
    {
      name: 'nextStep',
      type: 'text',
      label: 'Next Step',
      placeholder: 'Enter next action or step'
    },
    
    // Detailed Information
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      placeholder: 'Enter detailed opportunity description',
      rows: 3
    },
    {
      name: 'competitorAnalysis',
      type: 'textarea',
      label: 'Competitor Analysis',
      placeholder: 'Enter competitor analysis and positioning',
      rows: 3
    }
  ];

  return (
    <DynamicForm
      fields={fields}
      schema={opportunitySchema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      onCancel={onCancel}
      isLoading={isLoading}
      submitLabel={defaultValues.id ? 'Update Opportunity' : 'Create Opportunity'}
      layout="horizontal"
    />
  );
};

export default OpportunityForm;