// src/components/contacts/ContactsList.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { contactsAPI } from '../../services/api';
import Button from '../common/Button';
import { SearchInput } from '../common/Input';
import Select from '../common/Select';
import { PageSpinner, ListSpinner } from '../common/Spinner';
import { ConfirmModal } from '../common/Modal';
import { 
  Plus, 
  Filter, 
  Download, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  RefreshCw,
  Users,
  Phone,
  Mail,
  User,
  Building,
  MapPin
} from 'lucide-react';

const ContactsList = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    accountId: '',
    department: '',
    title: '',
    hasEmail: '',
    hasPhone: '',
    leadSource: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 20
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [accounts, setAccounts] = useState([]);
  
  const { addNotification } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();

  const departmentOptions = [
    { value: '', label: 'All Departments' },
    { value: 'Sales', label: 'Sales' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Engineering', label: 'Engineering' },
    { value: 'Finance', label: 'Finance' },
    { value: 'HR', label: 'Human Resources' },
    { value: 'Operations', label: 'Operations' },
    { value: 'Support', label: 'Support' },
    { value: 'Executive', label: 'Executive' },
    { value: 'Other', label: 'Other' }
  ];

  const sourceOptions = [
    { value: '', label: 'All Sources' },
    { value: 'Website', label: 'Website' },
    { value: 'Phone Inquiry', label: 'Phone Inquiry' },
    { value: 'Partner Referral', label: 'Partner Referral' },
    { value: 'Trade Show', label: 'Trade Show' },
    { value: 'Email Campaign', label: 'Email Campaign' },
    { value: 'Social Media', label: 'Social Media' },
    { value: 'Other', label: 'Other' }
  ];

  const contactOptions = [
    { value: '', label: 'All Contacts' },
    { value: 'true', label: 'Has Email' },
    { value: 'false', label: 'No Email' }
  ];

  const phoneOptions = [
    { value: '', label: 'All Contacts' },
    { value: 'true', label: 'Has Phone' },
    { value: 'false', label: 'No Phone' }
  ];

  useEffect(() => {
    loadContacts();
    loadAccounts();
  }, [pagination.currentPage, sortBy, sortOrder]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (pagination.currentPage === 1) {
        loadContacts();
      } else {
        setPagination(prev => ({ ...prev, currentPage: 1 }));
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery, filters]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: pagination.limit,
        sortBy,
        sortOrder,
        ...(searchQuery && { search: searchQuery }),
        ...filters
      };

      const response = await contactsAPI.getAll(params);
      setContacts(response.contacts || []);
      setPagination(prev => ({
        ...prev,
        totalPages: response.pagination?.totalPages || 1,
        totalCount: response.pagination?.totalCount || 0
      }));
    } catch (error) {
      console.error('Error loading contacts:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load contacts. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAccounts = async () => {
    try {
      const response = await contactsAPI.getAll({ limit: 100 });
      // Extract unique accounts from contacts
      const uniqueAccounts = [];
      const accountMap = new Map();
      
      response.contacts?.forEach(contact => {
        if (contact.accountId && !accountMap.has(contact.accountId.id)) {
          accountMap.set(contact.accountId.id, contact.accountId);
          uniqueAccounts.push(contact.accountId);
        }
      });
      
      setAccounts(uniqueAccounts);
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleSelectContact = (contactId) => {
    setSelectedContacts(prev => {
      if (prev.includes(contactId)) {
        return prev.filter(id => id !== contactId);
      } else {
        return [...prev, contactId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(contact => contact.id));
    }
  };

  const handleDeleteContact = (contact) => {
    setContactToDelete(contact);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await contactsAPI.delete(contactToDelete.id);
      addNotification({
        type: 'success',
        title: 'Success',
        message: 'Contact deleted successfully'
      });
      loadContacts();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete contact. Please try again.'
      });
    } finally {
      setShowDeleteModal(false);
      setContactToDelete(null);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  if (loading && contacts.length === 0) {
    return <PageSpinner message="Loading contacts..." />;
  }

  return (
    <div className="slds-p-around_medium">
      {/* Page Header */}
      <div className="slds-page-header">
        <div className="slds-page-header__row">
          <div className="slds-page-header__col-title">
            <div className="slds-media">
              <div className="slds-media__figure">
                <span className="slds-icon_container slds-icon-standard-contact">
                  <Users size={24} />
                </span>
              </div>
              <div className="slds-media__body">
                <div className="slds-page-header__name">
                  <div className="slds-page-header__name-title">
                    <h1>
                      <span className="slds-page-header__title slds-truncate">
                        Contacts
                      </span>
                    </h1>
                  </div>
                </div>
                <p className="slds-page-header__name-meta">
                  {pagination.totalCount} items • Updated just now
                </p>
              </div>
            </div>
          </div>
          <div className="slds-page-header__col-actions">
            <div className="slds-page-header__controls">
              <div className="slds-page-header__control">
                <Button
                  variant="neutral"
                  icon={<RefreshCw size={16} />}
                  onClick={loadContacts}
                  disabled={loading}
                >
                  Refresh
                </Button>
              </div>
              <div className="slds-page-header__control">
                <Button
                  variant="brand"
                  icon={<Plus size={16} />}
                  onClick={() => navigate('/contacts/new')}
                >
                  New Contact
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="slds-card slds-m-top_medium">
        <div className="slds-card__body slds-card__body_inner">
          <div className="slds-grid slds-grid_align-spread slds-grid_vertical-align-center">
            <div className="slds-col slds-size_1-of-2">
              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search contacts..."
                className="slds-size_1-of-1"
              />
            </div>
            <div className="slds-col slds-no-flex">
              <div className="slds-grid">
                <Button
                  variant="neutral"
                  icon={<Filter size={16} />}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  Filters
                </Button>
                <Button
                  variant="neutral"
                  icon={<Download size={16} />}
                  className="slds-m-left_x-small"
                >
                  Export
                </Button>
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="slds-grid slds-gutters slds-m-top_medium">
              <div className="slds-col slds-size_1-of-6">
                <Select
                  label="Account"
                  value={filters.accountId}
                  onChange={(e) => handleFilterChange('accountId', e.target.value)}
                  options={[
                    { value: '', label: 'All Accounts' },
                    ...accounts.map(account => ({
                      value: account.id,
                      label: account.name
                    }))
                  ]}
                />
              </div>
              <div className="slds-col slds-size_1-of-6">
                <Select
                  label="Department"
                  value={filters.department}
                  onChange={(e) => handleFilterChange('department', e.target.value)}
                  options={departmentOptions}
                />
              </div>
              <div className="slds-col slds-size_1-of-6">
                <Select
                  label="Email Contact"
                  value={filters.hasEmail}
                  onChange={(e) => handleFilterChange('hasEmail', e.target.value)}
                  options={contactOptions}
                />
              </div>
              <div className="slds-col slds-size_1-of-6">
                <Select
                  label="Phone Contact"
                  value={filters.hasPhone}
                  onChange={(e) => handleFilterChange('hasPhone', e.target.value)}
                  options={phoneOptions}
                />
              </div>
              <div className="slds-col slds-size_1-of-6">
                <Select
                  label="Lead Source"
                  value={filters.leadSource}
                  onChange={(e) => handleFilterChange('leadSource', e.target.value)}
                  options={sourceOptions}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="slds-card slds-m-top_medium">
        <div className="slds-card__header slds-grid">
          <header className="slds-media slds-media_center slds-has-flexi-truncate">
            <div className="slds-media__body">
              <h2 className="slds-card__header-title">
                <span className="slds-text-heading_small">
                  {selectedContacts.length > 0 ? `${selectedContacts.length} items selected` : 'All Contacts'}
                </span>
              </h2>
            </div>
          </header>
          {selectedContacts.length > 0 && (
            <div className="slds-no-flex">
              <Button variant="destructive" size="small">
                Delete Selected
              </Button>
            </div>
          )}
        </div>
        <div className="slds-card__body slds-card__body_inner">
          {loading ? (
            <ListSpinner />
          ) : contacts.length === 0 ? (
            <div className="slds-text-align_center slds-p-vertical_large">
              <Users size={48} className="slds-icon slds-icon_large slds-text-color_weak" />
              <p className="slds-text-heading_small slds-m-top_small">No contacts found</p>
              <p className="slds-text-color_weak">
                {searchQuery || Object.values(filters).some(Boolean) 
                  ? 'Try adjusting your search or filters' 
                  : 'Get started by creating your first contact'
                }
              </p>
              {!searchQuery && !Object.values(filters).some(Boolean) && (
                <Button
                  variant="brand"
                  icon={<Plus size={16} />}
                  onClick={() => navigate('/contacts/new')}
                  className="slds-m-top_medium"
                >
                  New Contact
                </Button>
              )}
            </div>
          ) : (
            <div className="slds-table_edit_container">
              <table className="slds-table slds-table_cell-buffer slds-table_bordered slds-table_edit slds-table_fixed-layout">
                <thead>
                  <tr className="slds-line-height_reset">
                    <th scope="col" style={{ width: '3.25rem' }}>
                      <div className="slds-th__action slds-th__action_form">
                        <div className="slds-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedContacts.length === contacts.length}
                            onChange={handleSelectAll}
                            id="select-all"
                          />
                          <label className="slds-checkbox__label" htmlFor="select-all">
                            <span className="slds-checkbox_faux"></span>
                            <span className="slds-assistive-text">Select All</span>
                          </label>
                        </div>
                      </div>
                    </th>
                    <th scope="col">
                      <button
                        className="slds-th__action slds-text-link_reset"
                        onClick={() => handleSort('firstName')}
                      >
                        <span className="slds-assistive-text">Sort by </span>
                        <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                          <span className="slds-truncate" title="Name">Name</span>
                        </div>
                      </button>
                    </th>
                    <th scope="col">
                      <button
                        className="slds-th__action slds-text-link_reset"
                        onClick={() => handleSort('title')}
                      >
                        <span className="slds-assistive-text">Sort by </span>
                        <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                          <span className="slds-truncate" title="Title">Title</span>
                        </div>
                      </button>
                    </th>
                    <th scope="col">
                      <div className="slds-th__action">
                        <span className="slds-truncate" title="Account">Account</span>
                      </div>
                    </th>
                    <th scope="col">
                      <div className="slds-th__action">
                        <span className="slds-truncate" title="Contact Info">Contact Info</span>
                      </div>
                    </th>
                    <th scope="col">
                      <button
                        className="slds-th__action slds-text-link_reset"
                        onClick={() => handleSort('department')}
                      >
                        <span className="slds-assistive-text">Sort by </span>
                        <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                          <span className="slds-truncate" title="Department">Department</span>
                        </div>
                      </button>
                    </th>
                    <th scope="col">
                      <div className="slds-th__action">
                        <span className="slds-truncate" title="Lead Source">Lead Source</span>
                      </div>
                    </th>
                    <th scope="col">
                      <button
                        className="slds-th__action slds-text-link_reset"
                        onClick={() => handleSort('createdAt')}
                      >
                        <span className="slds-assistive-text">Sort by </span>
                        <div className="slds-grid slds-grid_vertical-align-center slds-has-flexi-truncate">
                          <span className="slds-truncate" title="Created Date">Created Date</span>
                        </div>
                      </button>
                    </th>
                    <th scope="col" style={{ width: '3.25rem' }}>
                      <div className="slds-th__action">
                        <span className="slds-assistive-text">Actions</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact) => (
                    <tr key={contact.id} className="slds-hint-parent">
                      <td>
                        <div className="slds-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedContacts.includes(contact.id)}
                            onChange={() => handleSelectContact(contact.id)}
                            id={`select-${contact.id}`}
                          />
                          <label className="slds-checkbox__label" htmlFor={`select-${contact.id}`}>
                            <span className="slds-checkbox_faux"></span>
                            <span className="slds-assistive-text">Select Contact</span>
                          </label>
                        </div>
                      </td>
                      <td>
                        <div className="slds-cell-wrap">
                          <div className="slds-grid slds-grid_align-center">
                            <div className="slds-avatar slds-avatar_circle slds-avatar_small slds-m-right_small">
                              <span className="slds-avatar__initials slds-icon-standard-user">
                                {getInitials(contact.firstName, contact.lastName)}
                              </span>
                            </div>
                            <div>
                              <Link 
                                to={`/contacts/${contact.id}`} 
                                className="slds-text-link"
                              >
                                {contact.firstName} {contact.lastName}
                              </Link>
                              {contact.reportsToId && (
                                <div className="slds-text-body_small slds-text-color_weak">
                                  Reports to: {contact.reportsToId.firstName} {contact.reportsToId.lastName}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="slds-cell-wrap">
                          {contact.title || '-'}
                        </div>
                      </td>
                      <td>
                        <div className="slds-cell-wrap">
                          {contact.accountId ? (
                            <div className="slds-grid slds-grid_align-center">
                              <Building size={14} className="slds-m-right_x-small" />
                              <Link 
                                to={`/accounts/${contact.accountId.id}`}
                                className="slds-text-link"
                              >
                                {contact.accountId.name}
                              </Link>
                            </div>
                          ) : (
                            '-'
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="slds-cell-wrap">
                          <div className="slds-grid slds-grid_vertical">
                            {contact.email && (
                              <div className="slds-grid slds-grid_align-center slds-m-bottom_xx-small">
                                <Mail size={12} className="slds-m-right_x-small" />
                                <a href={`mailto:${contact.email}`} className="slds-text-link">
                                  {contact.email}
                                </a>
                              </div>
                            )}
                            {(contact.phone || contact.mobilePhone) && (
                              <div className="slds-grid slds-grid_align-center">
                                <Phone size={12} className="slds-m-right_x-small" />
                                <a 
                                  href={`tel:${contact.phone || contact.mobilePhone}`} 
                                  className="slds-text-link"
                                >
                                  {contact.phone || contact.mobilePhone}
                                </a>
                              </div>
                            )}
                            {!contact.email && !contact.phone && !contact.mobilePhone && (
                              <span className="slds-text-color_weak">No contact info</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="slds-cell-wrap">
                          {contact.department || '-'}
                        </div>
                      </td>
                      <td>
                        <div className="slds-cell-wrap">
                          {contact.leadSource || '-'}
                        </div>
                      </td>
                      <td>
                        <div className="slds-cell-wrap">
                          {formatDate(contact.createdAt)}
                        </div>
                      </td>
                      <td>
                        <div className="slds-dropdown-trigger slds-dropdown-trigger_click">
                          <button className="slds-button slds-button_icon slds-button_icon-border-filled">
                            <MoreVertical size={16} />
                            <span className="slds-assistive-text">Show more</span>
                          </button>
                          <div className="slds-dropdown slds-dropdown_right">
                            <ul className="slds-dropdown__list" role="menu">
                              <li className="slds-dropdown__item" role="presentation">
                                <Link
                                  to={`/contacts/${contact.id}`}
                                  className="slds-dropdown__link"
                                  role="menuitem"
                                >
                                  <span className="slds-truncate">
                                    <Eye size={16} className="slds-m-right_small" />
                                    View
                                  </span>
                                </Link>
                              </li>
                              <li className="slds-dropdown__item" role="presentation">
                                <Link
                                  to={`/contacts/${contact.id}/edit`}
                                  className="slds-dropdown__link"
                                  role="menuitem"
                                >
                                  <span className="slds-truncate">
                                    <Edit size={16} className="slds-m-right_small" />
                                    Edit
                                  </span>
                                </Link>
                              </li>
                              <li className="slds-dropdown__item" role="presentation">
                                <button
                                  className="slds-dropdown__link"
                                  role="menuitem"
                                  onClick={() => handleDeleteContact(contact)}
                                >
                                  <span className="slds-truncate">
                                    <Trash2 size={16} className="slds-m-right_small" />
                                    Delete
                                  </span>
                                </button>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="slds-card__footer">
              <div className="slds-grid slds-grid_align-spread slds-grid_vertical-align-center">
                <div className="slds-col">
                  <p className="slds-text-body_small slds-text-color_weak">
                    Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of{' '}
                    {pagination.totalCount} results
                  </p>
                </div>
                <div className="slds-col slds-no-flex">
                  <div className="slds-button-group" role="group">
                    <Button
                      variant="neutral"
                      size="small"
                      disabled={pagination.currentPage === 1}
                      onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="neutral"
                      size="small"
                      disabled={pagination.currentPage === pagination.totalPages}
                      onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Contact"
        message={`Are you sure you want to delete ${contactToDelete?.firstName} ${contactToDelete?.lastName}? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
};

export default ContactsList;