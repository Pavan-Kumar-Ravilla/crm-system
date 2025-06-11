import React from 'react';
import * as yup from 'yup';
import DynamicForm from './DynamicForm';

const leadSchema = yup.object().shape({
  firstName: yup.string().required('First name is required').min(2, 'Must be at least 2 characters'),
  lastName: yup.string().required('Last name is required').min(2, 'Must be at least 2 characters'),
  company: yup.string().required('Company is required'),
  email: yup.string().email('Invalid email').nullable(),
  phone: yup.string().nullable(),
  status: yup.string().required('Status is required'),
  leadSource: yup.string().required('Lead source is required'),
  title: yup.string().nullable(),
  website: yup.string().url('Invalid URL').nullable(),
  industry: yup.string().nullable(),
  annualRevenue: yup.number().min(0, 'Must be positive').nullable(),
  numberOfEmployees: yup.number().min(0, 'Must be positive').nullable(),
  description: yup.string().nullable(),
});

const LeadForm = ({ defaultValues = {}, onSubmit, onCancel, isLoading = false }) => {
  const fields = [
    {
      name: 'firstName',
      type: 'text',
      label: 'First Name',
      placeholder: 'Enter first name',
      required: true
    },
    {
      name: 'lastName',
      type: 'text',
      label: 'Last Name',
      placeholder: 'Enter last name',
      required: true
    },
    {
      name: 'company',
      type: 'text',
      label: 'Company',
      placeholder: 'Enter company name',
      required: true
    },
    {
      name: 'title',
      type: 'text',
      label: 'Job Title',
      placeholder: 'Enter job title'
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      placeholder: 'Enter email address'
    },
    {
      name: 'phone',
      type: 'tel',
      label: 'Phone',
      placeholder: 'Enter phone number'
    },
    {
      name: 'website',
      type: 'url',
      label: 'Website',
      placeholder: 'Enter website URL'
    },
    {
      name: 'industry',
      type: 'text',
      label: 'Industry',
      placeholder: 'Enter industry'
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      required: true,
      options: [
        { value: 'New', label: 'New' },
        { value: 'Contacted', label: 'Contacted' },
        { value: 'Qualified', label: 'Qualified' },
        { value: 'Unqualified', label: 'Unqualified' }
      ]
    },
    {
      name: 'leadSource',
      type: 'select',
      label: 'Lead Source',
      required: true,
      options: [
        { value: 'Website', label: 'Website' },
        { value: 'Phone Inquiry', label: 'Phone Inquiry' },
        { value: 'Partner Referral', label: 'Partner Referral' },
        { value: 'Trade Show', label: 'Trade Show' },
        { value: 'Email Campaign', label: 'Email Campaign' },
        { value: 'Social Media', label: 'Social Media' },
        { value: 'Other', label: 'Other' }
      ]
    },
    {
      name: 'annualRevenue',
      type: 'number',
      label: 'Annual Revenue',
      placeholder: 'Enter annual revenue'
    },
    {
      name: 'numberOfEmployees',
      type: 'number',
      label: 'Number of Employees',
      placeholder: 'Enter number of employees'
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      placeholder: 'Enter lead description',
      rows: 3
    }
  ];

  return (
    <DynamicForm
      fields={fields}
      schema={leadSchema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      onCancel={onCancel}
      isLoading={isLoading}
      submitLabel={defaultValues.id ? 'Update Lead' : 'Create Lead'}
      layout="horizontal"
    />
  );
};

export default LeadForm;