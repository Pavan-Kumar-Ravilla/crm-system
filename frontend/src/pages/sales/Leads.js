import React, { useState } from 'react';
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
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
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
      key: 'name',
      label: 'Name',
      render: (_, row) => (
        <div className="flex items-center">
          <div className="h-8 w-8 bg-salesforce-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
            {(row.firstName?.[0] || '').toUpperCase()}{(row.lastName?.[0] || '').toUpperCase()}
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
      key: 'email',
      label: 'Email',
      render: (value) => value ? (
        <a 
          href={`mailto:${value}`} 
          className="text-salesforce-blue-600 hover:text-salesforce-blue-700"
          onClick={(e) => e.stopPropagation()}
        >
          {value}
        </a>
      ) : <span className="text-salesforce-gray-400">—</span>
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (value) => value ? (
        <a 
          href={`tel:${value}`} 
          className="text-salesforce-blue-600 hover:text-salesforce-blue-700"
          onClick={(e) => e.stopPropagation()}
        >
          {value}
        </a>
      ) : <span className="text-salesforce-gray-400">—</span>
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
      render: (value) => value || <span className="text-salesforce-gray-400">—</span>
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (value) => {
        if (!value) return <span className="text-salesforce-gray-400">—</span>;
        
        return (
          <span className={classNames(
            'px-2 py-1 text-xs font-medium rounded-full',
            {
              'bg-red-100 text-red-800': value === 'Hot',
              'bg-yellow-100 text-yellow-800': value === 'Warm',
              'bg-blue-100 text-blue-800': value === 'Cold',
            }
          )}>
            {value}
          </span>
        );
      }
    },
    {
      key: 'owner',
      label: 'Owner',
      render: (_, row) => {
        const owner = row.owner || row.ownerId;
        if (!owner) return <span className="text-salesforce-gray-400">—</span>;
        
        const name = owner.fullName || `${owner.firstName || ''} ${owner.lastName || ''}`.trim();
        return name || <span className="text-salesforce-gray-400">—</span>;
      }
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value) => value ? format(new Date(value), 'MMM dd, yyyy') : <span className="text-salesforce-gray-400">—</span>
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
    if (window.confirm(`Are you sure you want to delete lead "${lead.firstName} ${lead.lastName}"?`)) {
      await deleteMutation.mutateAsync(lead.id);
    }
  };

  const handleBulkDelete = async (selectedIds) => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected leads?`)) {
      await bulkDeleteMutation.mutateAsync({ leadIds: selectedIds });
    }
  };

  const handleExport = (selectedIds = null) => {
    // Implementation for export functionality
    const exportData = selectedIds 
      ? leads.filter(lead => selectedIds.includes(lead.id))
      : leads;
    
    const csvContent = generateCSV(exportData);
    downloadCSV(csvContent, 'leads-export.csv');
    toast.success(`Exported ${exportData.length} leads`);
  };

  const generateCSV = (data) => {
    const headers = ['First Name', 'Last Name', 'Company', 'Email', 'Phone', 'Status', 'Lead Source', 'Rating', 'Created Date'];
    const rows = data.map(lead => [
      lead.firstName || '',
      lead.lastName || '',
      lead.company || '',
      lead.email || '',
      lead.phone || '',
      lead.status || '',
      lead.leadSource || '',
      lead.rating || '',
      lead.createdAt ? format(new Date(lead.createdAt), 'yyyy-MM-dd') : ''
    ]);
    
    return [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
  };

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleRefresh = () => {
    refetch();
    toast.success('Leads refreshed');
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
      searchPlaceholder="Search leads by name, company, email..."
      createButtonLabel="New Lead"
      pagination={pagination}
      onPageChange={handlePageChange}
      selectable={true}
      showExport={true}
      showImport={false}
    />
  );
};

export default Leads;