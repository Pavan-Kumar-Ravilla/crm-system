import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../ui/Table';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import {
  Plus,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import classNames from 'classnames';

const ListView = ({
  title,
  data = [],
  columns = [],
  loading = false,
  onRefresh,
  onSearch,
  onFilter,
  onSort,
  onExport,
  onImport,
  onCreate,
  onEdit,
  onDelete,
  onView,
  searchPlaceholder = 'Search...',
  createButtonLabel = 'New',
  showCreateButton = true,
  showSearchBar = true,
  showFilters = true,
  showExport = true,
  showImport = false,
  selectable = true,
  pagination = {},
  onPageChange,
  className
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showFilters, setShowFiltersPanel] = useState(false);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (onSearch) {
        onSearch(searchTerm);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, onSearch]);

  const handleRowClick = (row) => {
    if (onView) {
      onView(row);
    }
  };

  const handleEdit = (row, event) => {
    event?.stopPropagation();
    if (onEdit) {
      onEdit(row);
    }
  };

  const handleDelete = (row, event) => {
    event?.stopPropagation();
    setItemToDelete(row);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (onDelete && itemToDelete) {
      await onDelete(itemToDelete);
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const handleBulkAction = (action) => {
    switch (action) {
      case 'delete':
        if (selectedRows.length > 0) {
          setShowDeleteModal(true);
        }
        break;
      case 'export':
        if (onExport) {
          onExport(selectedRows);
        }
        break;
      default:
        break;
    }
  };

  const enhancedColumns = columns.map(column => ({
    ...column,
    render: column.render || ((value, row) => {
      if (column.key === 'actions') {
        return (
          <div className="flex items-center space-x-2">
            {onView && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onView(row);
                }}
                className="p-1"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleEdit(row, e)}
                className="p-1"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleDelete(row, e)}
                className="p-1 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      }
      return value;
    })
  }));

  if (!enhancedColumns.find(col => col.key === 'actions')) {
    enhancedColumns.push({
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center space-x-2">
          {onView && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onView(row);
              }}
              className="p-1"
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleEdit(row, e)}
              className="p-1"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleDelete(row, e)}
              className="p-1 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )
    });
  }

  return (
    <div className={classNames('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-salesforce-gray-900">{title}</h1>
          {data.length > 0 && (
            <p className="text-sm text-salesforce-gray-500 mt-1">
              {data.length} {data.length === 1 ? 'item' : 'items'}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {showImport && onImport && (
            <Button
              variant="secondary"
              leftIcon={<Upload className="h-4 w-4" />}
              onClick={onImport}
            >
              Import
            </Button>
          )}

          {showExport && onExport && (
            <Button
              variant="secondary"
              leftIcon={<Download className="h-4 w-4" />}
              onClick={() => onExport()}
            >
              Export
            </Button>
          )}

          {onRefresh && (
            <Button
              variant="secondary"
              leftIcon={<RefreshCw className="h-4 w-4" />}
              onClick={onRefresh}
            >
              Refresh
            </Button>
          )}

          {showCreateButton && onCreate && (
            <Button
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={onCreate}
            >
              {createButtonLabel}
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-salesforce-gray-200">
        <div className="p-4 border-b border-salesforce-gray-200">
          <div className="flex items-center justify-between space-x-4">
            {showSearchBar && (
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-salesforce-gray-400" />
                  <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-salesforce-gray-300 rounded-md focus:ring-salesforce-blue-500 focus:border-salesforce-blue-500"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              {showFilters && onFilter && (
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Filter className="h-4 w-4" />}
                  onClick={() => setShowFiltersPanel(!showFilters)}
                >
                  Filters
                </Button>
              )}

              {selectedRows.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-salesforce-gray-600">
                    {selectedRows.length} selected
                  </span>
                  
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleBulkAction('delete')}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <Table
          data={data}
          columns={enhancedColumns}
          loading={loading}
          selectable={selectable}
          selectedRows={selectedRows}
          onRowSelect={setSelectedRows}
          onRowClick={handleRowClick}
          onSort={onSort}
          emptyMessage={`No ${title.toLowerCase()} found`}
        />

        {pagination && pagination.totalPages > 1 && (
          <div className="p-4 border-t border-salesforce-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-salesforce-gray-500">
                Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of{' '}
                {pagination.totalCount} results
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!pagination.hasPrevPage}
                  onClick={() => onPageChange && onPageChange(pagination.currentPage - 1)}
                >
                  Previous
                </Button>
                
                <span className="text-sm text-salesforce-gray-600">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={!pagination.hasNextPage}
                  onClick={() => onPageChange && onPageChange(pagination.currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Delete"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-salesforce-gray-600">
          Are you sure you want to delete{' '}
          {selectedRows.length > 0 
            ? `${selectedRows.length} selected items`
            : 'this item'
          }? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default ListView;