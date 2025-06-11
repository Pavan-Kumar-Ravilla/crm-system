import React, { useState } from 'react';
import { PlusIcon, DownloadIcon, UsersIcon } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import LeadForm from '../components/forms/LeadForm';
import LoadingSpinner from '../components/layout/LoadingSpinner';
import EmptyState from '../components/layout/EmptyState';
import { 
  useLeads, 
  useCreateLead, 
  useUpdateLead, 
  useDeleteLead, 
  useConvertLead 
} from '../hooks/useLeads';

const LeadsPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // API hooks
  const { data: leadsData, isLoading, error } = useLeads(filters);
  const createLeadMutation = useCreateLead();
  const updateLeadMutation = useUpdateLead();
  const deleteLeadMutation = useDeleteLead();
  const convertLeadMutation = useConvertLead();

  const leads = leadsData?.data?.leads || [];
  const pagination = leadsData?.data?.pagination;

  const columns = [
    {
      title: 'Name',
      accessor: 'firstName',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">
            {row.firstName} {row.lastName}
          </div>
          <div className="text-sm text-gray-500">{row.company}</div>
        </div>
      )
    },
    {
      title: 'Email',
      accessor: 'email',
      sortable: true
    },
    {
      title: 'Phone',
      accessor: 'phone',
      sortable: false
    },
    {
      title: 'Status',
      accessor: 'status',
      sortable: true,
      render: (value) => {
        const variants = {
          'New': 'info',
          'Contacted': 'warning',
          'Qualified': 'success',
          'Unqualified': 'danger'
        };
        return <Badge variant={variants[value] || 'default'}>{value}</Badge>;
      }
    },
    {
      title: 'Lead Source',
      accessor: 'leadSource',
      sortable: true
    },
    {
      title: 'Annual Revenue',
      accessor: 'annualRevenue',
      sortable: true,
      type: 'currency'
    },
    {
      title: 'Created',
      accessor: 'createdAt',
      sortable: true,
      type: 'date'
    }
  ];

  const actions = [
    {
      label: 'Edit',
      onClick: (lead) => {
        setEditingLead(lead);
        setIsEditModalOpen(true);
      }
    },
    {
      label: 'Convert',
      onClick: (lead) => {
        convertLeadMutation.mutate({
          id: lead.id,
          conversionData: {
            createContact: true,
            createAccount: true,
            createOpportunity: false
          }
        });
      }
    },
    {
      label: 'Delete',
      onClick: (lead) => {
        if (window.confirm('Are you sure you want to delete this lead?')) {
          deleteLeadMutation.mutate(lead.id);
        }
      },
      danger: true
    }
  ];

  const bulkActions = [
    {
      label: 'Export Selected',
      icon: <DownloadIcon />,
      onClick: (selectedIds) => {
        console.log('Export leads:', selectedIds);
      }
    },
    {
      label: 'Delete Selected',
      variant: 'danger',
      onClick: (selectedIds) => {
        if (window.confirm(`Are you sure you want to delete ${selectedIds.length} leads?`)) {
          // Implement bulk delete
          console.log('Delete leads:', selectedIds);
        }
      }
    }
  ];

  const handleCreateLead = async (data) => {
    try {
      await createLeadMutation.mutateAsync(data);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Error creating lead:', error);
    }
  };

  const handleEditLead = async (data) => {
    try {
      await updateLeadMutation.mutateAsync({ 
        id: editingLead.id, 
        data 
      });
      setIsEditModalOpen(false);
      setEditingLead(null);
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleSortChange = (field, direction) => {
    setFilters(prev => ({ 
      ...prev, 
      sortBy: field, 
      sortOrder: direction,
      page: 1 // Reset to first page
    }));
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ 
      ...prev, 
      ...newFilters,
      page: 1 // Reset to first page
    }));
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          Error loading leads: {error.message}
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="text-primary-600 hover:text-primary-700"
        >
          Try again
        </button>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner size="lg" className="py-12" />;
  }

  return (
    <div>
      <PageHeader
        title="Leads"
        subtitle="Manage and track your sales leads"
        actions={[
          {
            label: 'Import Leads',
            variant: 'outline',
            icon: <DownloadIcon />,
            onClick: () => console.log('Import leads')
          },
          {
            label: 'Add Lead',
            icon: <PlusIcon />,
            onClick: () => setIsCreateModalOpen(true)
          }
        ]}
      />

      {leads.length === 0 && !isLoading ? (
        <EmptyState
          icon={<UsersIcon className="w-12 h-12" />}
          title="No leads yet"
          description="Get started by creating your first lead or importing existing leads."
          action={{
            label: 'Add Lead',
            onClick: () => setIsCreateModalOpen(true),
            icon: <PlusIcon />
          }}
        />
      ) : (
        <DataTable
          data={leads}
          columns={columns}
          loading={isLoading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onSortChange={handleSortChange}
          onFilterChange={handleFilterChange}
          searchable
          filterable
          selectable
          selectedRows={selectedLeads}
          onSelectionChange={setSelectedLeads}
          actions={actions}
          bulkActions={bulkActions}
          emptyMessage="No leads found"
        />
      )}

      {/* Create Lead Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Lead"
        size="lg"
      >
        <LeadForm
          onSubmit={handleCreateLead}
          onCancel={() => setIsCreateModalOpen(false)}
          isLoading={createLeadMutation.isLoading}
        />
      </Modal>

      {/* Edit Lead Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingLead(null);
        }}
        title="Edit Lead"
        size="lg"
      >
        <LeadForm
          defaultValues={editingLead}
          onSubmit={handleEditLead}
          onCancel={() => {
            setIsEditModalOpen(false);
            setEditingLead(null);
          }}
          isLoading={updateLeadMutation.isLoading}
        />
      </Modal>
    </div>
  );
};

export default LeadsPage;