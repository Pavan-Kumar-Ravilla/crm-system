import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import Form from '../../components/ui/Form';
import Button from '../../components/ui/Button';
import { leadsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

const LeadForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const { data: leadData, isLoading } = useQuery(
    ['lead', id],
    () => leadsAPI.getById(id),
    {
      enabled: isEdit
    }
  );

  const createMutation = useMutation(leadsAPI.create, {
    onSuccess: (data) => {
      queryClient.invalidateQueries('leads');
      toast.success('Lead created successfully');
      navigate(`/app/sales/leads/${data.data.lead.id}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create lead');
    }
  });

  const updateMutation = useMutation(leadsAPI.update, {
    onSuccess: () => {
      queryClient.invalidateQueries(['lead', id]);
      queryClient.invalidateQueries('leads');
      toast.success('Lead updated successfully');
      navigate(`/app/sales/leads/${id}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update lead');
    }
  });

  const fields = [
    {
      name: 'firstName',
      type: 'text',
      label: 'First Name',
      placeholder: 'Enter first name',
      required: true,
      validation: {
        required: 'First name is required',
        minLength: { value: 2, message: 'First name must be at least 2 characters' }
      }
    },
    {
      name: 'lastName',
      type: 'text',
      label: 'Last Name',
      placeholder: 'Enter last name',
      required: true,
      validation: {
        required: 'Last name is required',
        minLength: { value: 2, message: 'Last name must be at least 2 characters' }
      }
    },
    {
      name: 'company',
      type: 'text',
      label: 'Company',
      placeholder: 'Enter company name',
      required: true,
      validation: {
        required: 'Company is required'
      }
    },
    {
      name: 'title',
      type: 'text',
      label: 'Title',
      placeholder: 'Enter job title'
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      placeholder: 'Enter email address',
      validation: {
        pattern: {
          value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
          message: 'Please enter a valid email address'
        }
      }
    },
    {
      name: 'phone',
      type: 'tel',
      label: 'Phone',
      placeholder: 'Enter phone number'
    },
    {
      name: 'mobilePhone',
      type: 'tel',
      label: 'Mobile Phone',
      placeholder: 'Enter mobile phone number'
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
      ],
      validation: {
        required: 'Status is required'
      }
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
      label: 'Industry',
      placeholder: 'Enter industry'
    },
    {
      name: 'website',
      type: 'url',
      label: 'Website',
      placeholder: 'https://example.com',
      validation: {
        pattern: {
          value: /^https?:\/\/.+/,
          message: 'Please enter a valid website URL'
        }
      }
    },
    {
      name: 'annualRevenue',
      type: 'number',
      label: 'Annual Revenue',
      placeholder: 'Enter annual revenue',
      validation: {
        min: { value: 0, message: 'Annual revenue cannot be negative' }
      }
    },
    {
      name: 'numberOfEmployees',
      type: 'number',
      label: 'Number of Employees',
      placeholder: 'Enter number of employees',
      validation: {
        min: { value: 1, message: 'Number of employees must be at least 1' }
      }
    },
    {
      name: 'street',
      type: 'text',
      label: 'Street',
      placeholder: 'Enter street address'
    },
    {
      name: 'city',
      type: 'text',
      label: 'City',
      placeholder: 'Enter city'
    },
    {
      name: 'state',
      type: 'text',
      label: 'State/Province',
      placeholder: 'Enter state or province'
    },
    {
      name: 'zipCode',
      type: 'text',
      label: 'Zip/Postal Code',
      placeholder: 'Enter zip or postal code'
    },
    {
      name: 'country',
      type: 'text',
      label: 'Country',
      placeholder: 'Enter country'
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      placeholder: 'Enter lead description'
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Notes',
      placeholder: 'Enter additional notes'
    }
  ];

  const handleSubmit = async (data) => {
    if (isEdit) {
      await updateMutation.mutateAsync({ id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleCancel = () => {
    if (isEdit) {
      navigate(`/app/sales/leads/${id}`);
    } else {
      navigate('/app/sales/leads');
    }
  };

  const defaultValues = isEdit ? leadData?.data?.lead : {
    status: 'New',
    leadSource: 'Website',
    rating: 'Cold'
  };

  if (isEdit && isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-salesforce-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        />
        
        <div>
          <h1 className="text-2xl font-bold text-salesforce-gray-900">
            {isEdit ? 'Edit Lead' : 'New Lead'}
          </h1>
          <p className="text-salesforce-gray-600">
            {isEdit ? 'Update lead information' : 'Create a new lead record'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-salesforce-gray-200">
        <div className="px-6 py-4 border-b border-salesforce-gray-200">
          <h2 className="text-lg font-medium text-salesforce-gray-900">Lead Information</h2>
        </div>
        
        <div className="p-6">
          <Form
            fields={fields}
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel={isEdit ? 'Update Lead' : 'Create Lead'}
            loading={createMutation.isLoading || updateMutation.isLoading}
            showCancelButton={true}
            layout="horizontal"
          />
        </div>
      </div>
    </div>
  );
};

export default LeadForm;