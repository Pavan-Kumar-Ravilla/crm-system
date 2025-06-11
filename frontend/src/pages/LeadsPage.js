import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { PlusIcon, DownloadIcon, UsersIcon } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import LeadForm from '../components/forms/LeadForm';
import LoadingSpinner from '../components/layout/LoadingSpinner';
import EmptyState from '../components/layout/EmptyState';

// Mock data - replace with actual API calls
const mockLeads = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Smith',
    company: 'Acme Corp',
    email: 'john.smith@acme.com',
    phone: '+1 (555) 123-4567',
    status: 'New',
    leadSource: 'Website',
    createdAt: '2024-01-15T10:30:00Z',
    annualRevenue: 500000
  },
  {
    id: 2,
    firstName: 'Sarah',
    lastName: 'Johnson',
    company: 'TechStart Inc',
    email: 'sarah.j@techstart.com',
    phone: '+1 (555) 987-6543',
    status: 'Qualified',
    leadSource: 'Email Campaign',
    createdAt: '2024-01-14T14:20:00Z',
    annualRevenue: 1200000
  },
  {
    id: 3,
    firstName: 'Mike',
    lastName: 'Davis',
    company: 'Global Solutions',
    email: 'mike.davis@global.com',
    phone: '+1 (555) 456-7890',
    status: 'Contacted',
    leadSource: 'Trade Show',
    createdAt: '2024-01-13T09:15:00Z',
    annualRevenue: 2500000
  }
];

const LeadsPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [selectedLeads, setSelectedLeads] = useState([]);

  // Fetch leads data
  const { data: leads = [], isLoading, refetch } = useQuery(
    'leads',
    () => Promise.resolve(mockLeads),
    { staleTime: 5 * 60 * 1000 }
  );

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
        console.log('Convert lead:', lead);
      }
    },
    {
      label: 'Delete',
      onClick: (lead) => {
        console.log('Delete lead:', lead);
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
        console.log('Delete leads:', selectedIds);
      }
    }
  ];

  const handleCreateLead = async (data) => {
    console.log('Creating lead:', data);
    // Implement API call to create lead
    setIsCreateModalOpen(false);
    refetch();
  };

  const handleEditLead = async (data) => {
    console.log('Editing lead:', data);
    // Implement API call to update lead
    setIsEditModalOpen(false);
    setEditingLead(null);
    refetch();
  };

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

      {leads.length === 0 ? (
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
        />
      </Modal>
    </div>
  );
};

export default LeadsPage;