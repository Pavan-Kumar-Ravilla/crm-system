import React from 'react';
import * as yup from 'yup';
import DynamicForm from './DynamicForm';

const contactSchema = yup.object().shape({
  firstName: yup.string().required('First name is required').min(2, 'Must be at least 2 characters'),
  lastName: yup.string().required('Last name is required').min(2, 'Must be at least 2 characters'),
  email: yup.string().email('Invalid email format').nullable(),
  phone: yup.string().nullable(),
  mobilePhone: yup.string().nullable(),
  homePhone: yup.string().nullable(),
  title: yup.string().nullable(),
  department: yup.string().nullable(),
  accountId: yup.string().nullable(),
  reportsToId: yup.string().nullable(),
  leadSource: yup.string().nullable(),
  description: yup.string().max(1000, 'Description cannot exceed 1000 characters').nullable(),
  // Address fields
  mailingStreet: yup.string().nullable(),
  mailingCity: yup.string().nullable(),
  mailingState: yup.string().nullable(),
  mailingPostalCode: yup.string().nullable(),
  mailingCountry: yup.string().nullable(),
  // Communication preferences
  emailOptOut: yup.boolean(),
  doNotCall: yup.boolean(),
  // Personal information
  birthdate: yup.date().nullable(),
  assistantName: yup.string().nullable(),
  assistantPhone: yup.string().nullable(),
  // Social media
  linkedInProfile: yup.string().url('Invalid LinkedIn URL').nullable(),
  twitterHandle: yup.string().nullable(),
});

const ContactForm = ({ 
  defaultValues = {}, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  accounts = [],
  contacts = []
}) => {
  const fields = [
    // Basic Information Section
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
      name: 'title',
      type: 'text',
      label: 'Job Title',
      placeholder: 'Enter job title'
    },
    {
      name: 'department',
      type: 'text',
      label: 'Department',
      placeholder: 'Enter department'
    },
    
    // Contact Information Section
    {
      name: 'email',
      type: 'email',
      label: 'Email Address',
      placeholder: 'Enter email address'
    },
    {
      name: 'phone',
      type: 'tel',
      label: 'Business Phone',
      placeholder: 'Enter business phone number'
    },
    {
      name: 'mobilePhone',
      type: 'tel',
      label: 'Mobile Phone',
      placeholder: 'Enter mobile phone number'
    },
    {
      name: 'homePhone',
      type: 'tel',
      label: 'Home Phone',
      placeholder: 'Enter home phone number'
    },
    
    // Account and Relationships
    {
      name: 'accountId',
      type: 'select',
      label: 'Account',
      placeholder: 'Select an account',
      options: accounts.map(account => ({
        value: account.id,
        label: account.name
      }))
    },
    {
      name: 'reportsToId',
      type: 'select',
      label: 'Reports To',
      placeholder: 'Select manager',
      options: contacts.map(contact => ({
        value: contact.id,
        label: `${contact.firstName} ${contact.lastName}`
      }))
    },
    
    // Lead Source
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
    
    // Mailing Address Section
    {
      name: 'mailingStreet',
      type: 'text',
      label: 'Mailing Street',
      placeholder: 'Enter street address'
    },
    {
      name: 'mailingCity',
      type: 'text',
      label: 'Mailing City',
      placeholder: 'Enter city'
    },
    {
      name: 'mailingState',
      type: 'text',
      label: 'Mailing State/Province',
      placeholder: 'Enter state or province'
    },
    {
      name: 'mailingPostalCode',
      type: 'text',
      label: 'Mailing Postal Code',
      placeholder: 'Enter postal code'
    },
    {
      name: 'mailingCountry',
      type: 'text',
      label: 'Mailing Country',
      placeholder: 'Enter country'
    },
    
    // Personal Information
    {
      name: 'birthdate',
      type: 'date',
      label: 'Birth Date'
    },
    {
      name: 'assistantName',
      type: 'text',
      label: 'Assistant Name',
      placeholder: 'Enter assistant name'
    },
    {
      name: 'assistantPhone',
      type: 'tel',
      label: 'Assistant Phone',
      placeholder: 'Enter assistant phone number'
    },
    
    // Social Media
    {
      name: 'linkedInProfile',
      type: 'url',
      label: 'LinkedIn Profile',
      placeholder: 'Enter LinkedIn URL'
    },
    {
      name: 'twitterHandle',
      type: 'text',
      label: 'Twitter Handle',
      placeholder: 'Enter Twitter handle (without @)'
    },
    
    // Communication Preferences
    {
      name: 'emailOptOut',
      type: 'checkbox',
      label: 'Email Opt Out'
    },
    {
      name: 'doNotCall',
      type: 'checkbox',
      label: 'Do Not Call'
    },
    
    // Description
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      placeholder: 'Enter additional notes or description',
      rows: 3
    }
  ];

  return (
    <DynamicForm
      fields={fields}
      schema={contactSchema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      onCancel={onCancel}
      isLoading={isLoading}
      submitLabel={defaultValues.id ? 'Update Contact' : 'Create Contact'}
      layout="horizontal"
    />
  );
};

export default ContactForm;