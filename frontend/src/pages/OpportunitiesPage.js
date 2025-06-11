import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { PlusIcon, DownloadIcon, TrendingUpIcon } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import OpportunityForm from '../components/forms/OpportunityForm';
import LoadingSpinner from '../components/layout/LoadingSpinner';
import EmptyState from '../components/layout/EmptyState';

const mockOpportunities = [
  {
    id: 1,
    name: 'Enterprise Software License',
    accountName: 'TechCorp Inc',
    accountId: 1,
    contactName: 'Emily Brown',
    contactId: 1,
    amount: 250000,
    stage: 'Proposal/Price Quote',
    probability: 75,
    closeDate: '2024-03-15',
    type: 'New Customer',
    leadSource: 'Website'
  },
  {
    id: 2,
    name: 'Consulting Services Package',
    accountName: 'Innovate Solutions',
    accountId: 2,
    contactName: 'Robert Wilson',
    contactId: 2,
    amount: 150000,
    stage: 'Negotiation/Review',
    probability: 85,
    closeDate: '2024-02-28',
    type: 'Existing Customer - Upgrade',
    leadSource: 'Referral'
  },
  {
    id: 3,
    name: 'Manufacturing System Upgrade',
    accountName: 'FuturePro Systems',
    accountId: 3,
    contactName: 'Lisa Anderson',
    contactId: 3,
    amount: 500000,
    stage: 'Qualification',
    probability: 40,
    closeDate: '2024-04-30',
    type: 'Existing Customer - Replacement',
    leadSource: 'Trade Show'
  }
];

const mockAccounts = [
  { id: 1, name: 'TechCorp Inc' },
  { id: 2, name: 'Innovate Solutions' },
  { id: 3, name: 'FuturePro Systems' }
];

const mockContacts = [
  { id: 1, firstName: 'Emily', lastName: 'Brown', accountId: 1 },
  { id: 2, firstName: 'Robert', lastName: 'Wilson', accountId: 2 },
  { id: 3, firstName: 'Lisa', lastName: 'Anderson', accountId: 3 }
];

const OpportunitiesPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState(null);
  const [selectedOpportunities, setSelectedOpportunities] = useState([]);

  const { data: opportunities = [], isLoading, refetch } = useQuery(
    'opportunities',
    () => Promise.resolve(mockOpportunities),
    { staleTime: 5 * 60 * 1000 }
  );

  const { data: accounts = [] } = useQuery(
    'accounts',
    () => Promise.resolve(mockAccounts),
    { staleTime: 5 * 60 * 1000 }
  );

  const { data: contacts = [] } = useQuery(
    'contacts',
    () => Promise.resolve(mockContacts),
    { staleTime: 5 * 60 * 1000 }
  );

  const columns = [
    {
      title: 'Opportunity',
      accessor: 'name',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.accountName}</div>
        </div>
      )
    },
    {
      title: 'Amount',
      accessor: 'amount',
      sortable: true,
      type: 'currency'
    },
    {
      title: 'Stage',
      accessor: 'stage',
      sortable: true,
      render: (value) => {
        const stageVariants = {
          'Prospecting': 'info',
          'Qualification': 'warning',
          'Needs Analysis': 'warning',
          'Value Proposition': 'primary',
          'Id. Decision Makers': 'primary',
          'Perception Analysis': 'primary',
          'Proposal/Price Quote': 'warning',
          'Negotiation/Review': 'success',
          'Closed Won': 'success',
          'Closed Lost': 'danger'
        };
        return <Badge variant={stageVariants[value] || 'default'}>{value}</Badge>;
      }
    },
    {
      title: 'Probability',
      accessor: 'probability',
      sortable: true,
      render: (value) => `${value}%`
    },
    {
      title: 'Close Date',
      accessor: 'closeDate',
      sortable: true,
      type: 'date'
    },
    {
      title: 'Type',
      accessor: 'type',
      sortable: true
    }
  ];

  const actions = [
    {
      label: 'View Details',
      onClick: (opportunity) => {
        console.log('View opportunity:', opportunity);
      }
    },
    {
      label: 'Edit',
      onClick: (opportunity) => {
        setEditingOpportunity(opportunity);
        setIsEditModalOpen(true);
      }
    },
    {
      label: 'Close Won',
      onClick: (opportunity) => {
        console.log('Close won:', opportunity);
      }
    },
    {
      label: 'Close Lost',
      onClick: (opportunity) => {
        console.log('Close lost:', opportunity);
      }
    },
    {
      label: 'Delete',
      onClick: (opportunity) => {
        console.log('Delete opportunity:', opportunity);
      },
      danger: true
    }
  ];

  const bulkActions = [
    {
      label: 'Export Selected',
      icon: <DownloadIcon />,
      onClick: (selectedIds) => {
        console.log('Export opportunities:', selectedIds);
      }
    }
  ];

  const handleCreateOpportunity = async (data) => {
    console.log('Creating opportunity:', data);
    setIsCreateModalOpen(false);
    refetch();
  };

  const handleEditOpportunity = async (data) => {
    console.log('Editing opportunity:', data);
    setIsEditModalOpen(false);
    setEditingOpportunity(null);
    refetch();
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" className="py-12" />;
  }

  return (
    <div>
      <PageHeader
        title="Opportunities"
        subtitle="Track and manage your sales pipeline"
        actions={[
          {
            label: 'Pipeline Report',
            variant: 'outline',
            icon: <TrendingUpIcon />,
            onClick: () => console.log('Pipeline report')
          },
          {
            label: 'Add Opportunity',
            icon: <PlusIcon />,
            onClick: () => setIsCreateModalOpen(true)
          }
        ]}
      />

      {opportunities.length === 0 ? (
        <EmptyState
          icon={<TrendingUpIcon className="w-12 h-12" />}
          title="No opportunities yet"
          description="Start tracking your sales pipeline by creating your first opportunity."
          action={{
            label: 'Add Opportunity',
            onClick: () => setIsCreateModalOpen(true),
            icon: <PlusIcon />
          }}
        />
      ) : (
        <DataTable
          data={opportunities}
          columns={columns}
          loading={isLoading}
          searchable
          filterable
          selectable
          selectedRows={selectedOpportunities}
          onSelectionChange={setSelectedOpportunities}
          actions={actions}
          bulkActions={bulkActions}
          emptyMessage="No opportunities found"
        />
      )}

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Opportunity"
        size="lg"
      >
        <OpportunityForm
          accounts={accounts}
          contacts={contacts}
          onSubmit={handleCreateOpportunity}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingOpportunity(null);
        }}
        title="Edit Opportunity"
        size="lg"
      >
        <OpportunityForm
          defaultValues={editingOpportunity}
          accounts={accounts}
          contacts={contacts}
          onSubmit={handleEditOpportunity}
          onCancel={() => {
            setIsEditModalOpen(false);
            setEditingOpportunity(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default OpportunitiesPage;