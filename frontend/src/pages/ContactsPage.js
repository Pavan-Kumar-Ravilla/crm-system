import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { PlusIcon, DownloadIcon, UsersIcon } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import ContactForm from '../components/forms/ContactForm';
import LoadingSpinner from '../components/layout/LoadingSpinner';
import EmptyState from '../components/layout/EmptyState';

const mockContacts = [
  {
    id: 1,
    firstName: 'Emily',
    lastName: 'Brown',
    email: 'emily.brown@techcorp.com',
    phone: '+1 (555) 234-5678',
    title: 'Marketing Director',
    department: 'Marketing',
    accountName: 'TechCorp Inc',
    accountId: 1
  },
  {
    id: 2,
    firstName: 'Robert',
    lastName: 'Wilson',
    email: 'robert.wilson@innovate.com',
    phone: '+1 (555) 345-6789',
    title: 'VP of Sales',
    department: 'Sales',
    accountName: 'Innovate Solutions',
    accountId: 2
  }
];

const mockAccounts = [
  { id: 1, name: 'TechCorp Inc' },
  { id: 2, name: 'Innovate Solutions' },
  { id: 3, name: 'FuturePro Systems' }
];

const ContactsPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [selectedContacts, setSelectedContacts] = useState([]);

  const { data: contacts = [], isLoading, refetch } = useQuery(
    'contacts',
    () => Promise.resolve(mockContacts),
    { staleTime: 5 * 60 * 1000 }
  );

  const { data: accounts = [] } = useQuery(
    'accounts',
    () => Promise.resolve(mockAccounts),
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
          <div className="text-sm text-gray-500">{row.title}</div>
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
      title: 'Account',
      accessor: 'accountName',
      sortable: true
    },
    {
      title: 'Department',
      accessor: 'department',
      sortable: true
    }
  ];

  const actions = [
    {
      label: 'Edit',
      onClick: (contact) => {
        setEditingContact(contact);
        setIsEditModalOpen(true);
      }
    },
    {
      label: 'Delete',
      onClick: (contact) => {
        console.log('Delete contact:', contact);
      },
      danger: true
    }
  ];

  const handleCreateContact = async (data) => {
    console.log('Creating contact:', data);
    setIsCreateModalOpen(false);
    refetch();
  };

  const handleEditContact = async (data) => {
    console.log('Editing contact:', data);
    setIsEditModalOpen(false);
    setEditingContact(null);
    refetch();
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" className="py-12" />;
  }

  return (
    <div>
      <PageHeader
        title="Contacts"
        subtitle="Manage your business contacts and relationships"
        actions={[
          {
            label: 'Import Contacts',
            variant: 'outline',
            icon: <DownloadIcon />,
            onClick: () => console.log('Import contacts')
          },
          {
            label: 'Add Contact',
            icon: <PlusIcon />,
            onClick: () => setIsCreateModalOpen(true)
          }
        ]}
      />

      {contacts.length === 0 ? (
        <EmptyState
          icon={<UsersIcon className="w-12 h-12" />}
          title="No contacts yet"
          description="Start building your network by adding your first contact."
          action={{
            label: 'Add Contact',
            onClick: () => setIsCreateModalOpen(true),
            icon: <PlusIcon />
          }}
        />
      ) : (
        <DataTable
          data={contacts}
          columns={columns}
          loading={isLoading}
          searchable
          filterable
          selectable
          selectedRows={selectedContacts}
          onSelectionChange={setSelectedContacts}
          actions={actions}
          emptyMessage="No contacts found"
        />
      )}

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Contact"
        size="lg"
      >
        <ContactForm
          accounts={accounts}
          onSubmit={handleCreateContact}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingContact(null);
        }}
        title="Edit Contact"
        size="lg"
      >
        <ContactForm
          defaultValues={editingContact}
          accounts={accounts}
          onSubmit={handleEditContact}
          onCancel={() => {
            setIsEditModalOpen(false);
            setEditingContact(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default ContactsPage;
