import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import RecordView from '../../components/common/RecordView';
import { leadsAPI } from '../../services/api';
import toast from 'react-hot-toast';

const LeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: leadData, isLoading } = useQuery(
    ['lead', id],
    () => leadsAPI.getById(id),
    {
      enabled: !!id
    }
  );

  const updateMutation = useMutation(leadsAPI.update, {
    onSuccess: () => {
      queryClient.invalidateQueries(['lead', id]);
      queryClient.invalidateQueries('leads');
      setIsEditing(false);
      toast.success('Lead updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update lead');
    }
  });

  const deleteMutation = useMutation(leadsAPI.delete, {
    onSuccess: () => {
      toast.success('Lead deleted successfully');
      navigate('/app/sales/leads');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete lead');
    }
  });

  const convertMutation = useMutation(leadsAPI.convert, {
    onSuccess: (data) => {
      toast.success('Lead converted successfully');
      if (data.data?.converted?.contact) {
        navigate(`/app/sales/contacts/${data.data.converted.contact}`);
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to convert lead');
    }
  });

  const fields = [
    {
      name: 'firstName',
      type: 'text',
      label: 'First Name',
      required: true,
      validation: { required: 'First name is required' }
    },
    {
      name: 'lastName',
      type: 'text',
      label: 'Last Name',
      required: true,
      validation: { required: 'Last name is required' }
    },
    {
      name: 'company',
      type: 'text',
      label: 'Company',
      required: true,
      validation: { required: 'Company is required' }
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email'
    },
    {
      name: 'phone',
      type: 'tel',
      label: 'Phone'
    },
    {
      name: 'mobilePhone',
      type: 'tel',
      label: 'Mobile Phone'
    },
    {
      name: 'title',
      type: 'text',
      label: 'Title'
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
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
    {
      name: 'rating',
      type: 'select',
      label: 'Rating',
      options: [
        { value: 'Hot', label: 'Hot' },
        { value: 'Warm', label: 'Warm' },
        { value: 'Cold', label: 'Cold' }
      ]
    },
    {
      name: 'industry',
      type: 'text',
      label: 'Industry'
    },
    {
      name: 'website',
      type: 'url',
      label: 'Website'
    },
    {
      name: 'annualRevenue',
      type: 'currency',
      label: 'Annual Revenue'
    },
    {
      name: 'numberOfEmployees',
      type: 'number',
      label: 'Number of Employees'
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description'
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Notes'
    }
  ];

  const sections = [
    {
      title: 'Lead Information',
      fields: ['firstName', 'lastName', 'company', 'title', 'email', 'phone', 'mobilePhone']
    },
    {
      title: 'Lead Details',
      fields: ['status', 'leadSource', 'rating', 'industry', 'website']
    },
    {
      title: 'Company Information',
      fields: ['annualRevenue', 'numberOfEmployees']
    },
    {
      title: 'Address Information',
      fields: ['street', 'city', 'state', 'zipCode', 'country']
    },
    {
      title: 'Additional Information',
      fields: ['description', 'notes']
    }
  ];

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSave = async (formData) => {
    await updateMutation.mutateAsync({ id, data: formData });
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(id);
  };

  const handleConvert = async () => {
    await convertMutation.mutateAsync({
      id,
      data: {
        createContact: true,
        createAccount: true,
        createOpportunity: false
      }
    });
  };

  const lead = leadData?.data?.lead || {};

  const additionalActions = [
    {
      label: 'Convert Lead',
      onClick: handleConvert,
      disabled: lead.isConverted,
      variant: 'primary'
    }
  ];

  return (
    <RecordView
      title={`${lead.firstName} ${lead.lastName}`}
      data={lead}
      fields={fields}
      sections={sections}
      loading={isLoading}
      isEditing={isEditing}
      onEdit={handleEdit}
      onCancelEdit={handleCancelEdit}
      onSave={handleSave}
      onDelete={handleDelete}
      backUrl="/app/sales/leads"
      showCloneButton={true}
      additionalActions={additionalActions}
    />
  );
};

export default LeadDetail;