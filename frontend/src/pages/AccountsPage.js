import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { PlusIcon, BuildingIcon } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import AccountForm from '../components/forms/AccountForm';
import LoadingSpinner from '../components/layout/LoadingSpinner';
import EmptyState from '../components/layout/EmptyState';

const mockAccounts = [
  {
    id: 1,
    name: 'TechCorp Inc',
    type: 'Customer',
    industry: 'Technology',
    website: 'https://techcorp.com',
    phone: '+1 (555) 123-4567',
    annualRevenue: 5000000,
    employees: 150
  },
  {
    id: 2,
    name: 'Innovate Solutions',
    type: 'Prospect',
    industry: 'Healthcare',
    website: 'https://innovatesolutions.com',
    phone: '+1 (555) 987-6543',
    annualRevenue: 2500000,
    employees: 75
  }
];

const AccountsPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [selectedAccounts, setSelectedAccounts] = useState([]);

  const { data: accounts = [], isLoading, refetch } = useQuery(
    'accounts',
    () => Promise.resolve(mockAccounts),
    { staleTime: 5 * 60 * 1000 }
  );

  const columns = [
    {
      title: 'Account Name',
      accessor: 'name',
      sortable: true
    },
    {
      title: 'Type',
      accessor: 'type',
      sortable: true,
      render: (value) => <Badge variant="info">{value}</Badge>
    },
    {
      title: 'Industry',
      accessor: 'industry',
      sortable: true
    },
    {
      title: 'Revenue',
      accessor: 'annualRevenue',
      sortable: true,
      type: 'currency'
    },
    {
      title: 'Employees',
      accessor: 'employees',
      sortable: true
    }
  ];

  const actions = [
    {
      label: 'Edit',
      onClick: (account) => {
        setEditingAccount(account);
        setIsEditModalOpen(true);
      }
    },
    {
      label: 'Delete',
      onClick: (account) => {
        console.log('Delete account:', account);
      },
      danger: true
    }
  ];

  const handleCreateAccount = async (data) => {
    console.log('Creating account:', data);
    setIsCreateModalOpen(false);
    refetch();
  };

  const handleEditAccount = async (data) => {
    console.log('Editing account:', data);
    setIsEditModalOpen(false);
    setEditingAccount(null);
    refetch();
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" className="py-12" />;
  }

  return (
    <div>
      <PageHeader
        title="Accounts"
        subtitle="Manage your customer accounts and companies"
        actions={[
          {
            label: 'Add Account',
            icon: <PlusIcon />,
            onClick: () => setIsCreateModalOpen(true)
          }
        ]}
      />

      {accounts.length === 0 ? (
        <EmptyState
          icon={<BuildingIcon className="w-12 h-12" />}
          title="No accounts yet"
          description="Start by adding your first customer account."
          action={{
            label: 'Add Account',
            onClick: () => setIsCreateModalOpen(true),
            icon: <PlusIcon />
          }}
        />
      ) : (
        <DataTable
          data={accounts}
          columns={columns}
          loading={isLoading}
          searchable
          filterable
          selectable
          selectedRows={selectedAccounts}
          onSelectionChange={setSelectedAccounts}
          actions={actions}
          emptyMessage="No accounts found"
        />
      )}

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Account"
        size="lg"
      >
        <AccountForm
          accounts={accounts}
          onSubmit={handleCreateAccount}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingAccount(null);
        }}
        title="Edit Account"
        size="lg"
      >
        <AccountForm
          defaultValues={editingAccount}
          accounts={accounts}
          onSubmit={handleEditAccount}
          onCancel={() => {
            setIsEditModalOpen(false);
            setEditingAccount(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default AccountsPage;
