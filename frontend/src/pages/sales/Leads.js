import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import ListView from '../../components/common/ListView';
import { leadsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import classNames from 'classnames';

const Leads = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  const { data: leadsData, isLoading, refetch } = useQuery(
    ['leads', currentPage, searchTerm, sortConfig],
    () => leadsAPI.getAll({
      page: currentPage,
      limit: 20,
      search: searchTerm,
      sortBy: sortConfig.key,
      sortOrder: sortConfig.direction
    }),
    {
      keepPreviousData: true
    }
  );

  const deleteMutation = useMutation(leadsAPI.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('leads');
      toast.success('Lead deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete lead');
    }
  });

  const bulkDeleteMutation = useMutation(leadsAPI.bulkDelete, {
    onSuccess: () => {
      queryClient.invalidateQueries('leads');
      toast.success('Leads deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete leads');
    }
  });

  const columns = [
    {
      key: 'email',
      label: 'Email',
      render: (value) => value ? (
        <a href={`mailto:${value}`} className="text-salesforce-blue-600 hover:text-salesforce-blue-700">
          {value}
        </a>
      ) : '—'
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (value) => value ? (
        <a href={`tel:${value}`} className="text-salesforce-blue-600 hover:text-salesforce-blue-700">
          {value}
        </a>
      ) : '—'
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span className={classNames(
          'px-2 py-1 text-xs font-medium rounded-full',
          {
            'bg-green-100 text-green-800': value === 'Qualified',
            'bg-yellow-100 text-yellow-800': value === 'Contacted',
            'bg-blue-100 text-blue-800': value === 'New',
            'bg-red-100 text-red-800': value === 'Unqualified',
            'bg-gray-100 text-gray-800': !value
          }
        )}>
          {value || 'Unknown'}
        </span>
      )
    },
    {
      key: 'leadSource',
      label: 'Source',
      render: (value) => value || '—'
    },
    {
      key: 'ownerId',
      label: 'Owner',
      render: (_, row) => row.ownerId?.fullName || row.ownerId?.firstName + ' ' + row.ownerId?.lastName || '—'
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value) => value ? format(new Date(value), 'MMM dd, yyyy') : '—'
    }
  ];

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleSort = (key, direction) => {
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleCreate = () => {
    navigate('/app/sales/leads/new');
  };

  const handleView = (lead) => {
    navigate(`/app/sales/leads/${lead.id}`);
  };

  const handleEdit = (lead) => {
    navigate(`/app/sales/leads/${lead.id}/edit`);
  };

  const handleDelete = async (lead) => {
    await deleteMutation.mutateAsync(lead.id);
  };

  const handleBulkDelete = async (selectedIds) => {
    await bulkDeleteMutation.mutateAsync({ leadIds: selectedIds });
  };

  const handleExport = () => {
    toast.success('Export functionality will be implemented');
  };

  const handleRefresh = () => {
    refetch();
  };

  const leads = leadsData?.data?.leads || [];
  const pagination = leadsData?.data?.pagination || {};

  return (
    <ListView
      title="Leads"
      data={leads}
      columns={columns}
      loading={isLoading}
      onSearch={handleSearch}
      onSort={handleSort}
      onRefresh={handleRefresh}
      onCreate={handleCreate}
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onExport={handleExport}
      searchPlaceholder="Search leads..."
      createButtonLabel="New Lead"
      pagination={pagination}
      onPageChange={handlePageChange}
      selectable={true}
    />
  );
};

export default Leads; 'name',
      label: 'Name',
      render: (_, row) => (
        <div className="flex items-center">
          <div className="h-8 w-8 bg-salesforce-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
            {row.firstName?.[0]}{row.lastName?.[0]}
          </div>
          <div>
            <p className="font-medium text-salesforce-gray-900">
              {row.firstName} {row.lastName}
            </p>
            <p className="text-sm text-salesforce-gray-500">{row.company}</p>
          </div>
        </div>
      )
    },
    {
      key: