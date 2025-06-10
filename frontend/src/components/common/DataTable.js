// src/components/common/DataTable.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button, { IconButton } from './Button';
import { Checkbox } from './Select';
import { SearchInput } from './Input';
import Spinner, { TableSpinner } from './Spinner';
import { 
  ChevronDown, 
  ChevronUp, 
  Edit, 
  Trash2, 
  Eye, 
  MoreHorizontal,
  Filter,
  Download,
  RefreshCw,
  Search
} from 'lucide-react';

/**
 * Advanced DataTable Component with SLDS styling
 * @param {Object} props - Component props
 * @param {Array} props.columns - Column definitions
 * @param {Array} props.data - Table data
 * @param {boolean} props.loading - Loading state
 * @param {Object} props.pagination - Pagination info
 * @param {Function} props.onSort - Sort handler
 * @param {Function} props.onPageChange - Page change handler
 * @param {Function} props.onRowSelect - Row selection handler
 * @param {Function} props.onEdit - Edit handler
 * @param {Function} props.onDelete - Delete handler
 * @param {Function} props.onView - View handler
 * @param {boolean} props.selectable - Whether rows are selectable
 * @param {boolean} props.searchable - Whether table is searchable
 * @param {string} props.title - Table title
 * @param {React.ReactNode} props.actions - Header actions
 */
const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  pagination = {},
  onSort,
  onPageChange,
  onRowSelect,
  onEdit,
  onDelete,
  onView,
  selectable = false,
  searchable = false,
  title,
  actions,
  emptyStateTitle = 'No data available',
  emptyStateMessage = 'There are no records to display',
  className = ''
}) => {
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSort = (field) => {
    let direction = 'asc';
    if (sortField === field && sortDirection === 'asc') {
      direction = 'desc';
    }
    setSortField(field);
    setSortDirection(direction);
    onSort?.(field, direction);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      const allIds = new Set(data.map(row => row.id));
      setSelectedRows(allIds);
      onRowSelect?.(Array.from(allIds));
    } else {
      setSelectedRows(new Set());
      onRowSelect?.([]);
    }
  };

  const handleRowSelect = (id, checked) => {
    const newSelection = new Set(selectedRows);
    if (checked) {
      newSelection.add(id);
    } else {
      newSelection.delete(id);
    }
    setSelectedRows(newSelection);
    onRowSelect?.(Array.from(newSelection));
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    // Debounce search implementation would go here
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const isAllSelected = data.length > 0 && selectedRows.size === data.length;
  const isIndeterminate = selectedRows.size > 0 && selectedRows.size < data.length;

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <ChevronDown size={12} className="slds-icon slds-icon_x-small slds-text-color_weak" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp size={12} className="slds-icon slds-icon_x-small" />
      : <ChevronDown size={12} className="slds-icon slds-icon_x-small" />;
  };

  const renderCellContent = (column, row) => {
    const value = row[column.field];
    
    if (column.render) {
      return column.render(value, row);
    }
    
    if (column.type === 'link' && column.linkTo) {
      const linkPath = typeof column.linkTo === 'function' 
        ? column.linkTo(row) 
        : column.linkTo.replace(':id', row.id);
      return (
        <Link to={linkPath} className="slds-text-link">
          {value}
        </Link>
      );
    }
    
    if (column.type === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value || 0);
    }
    
    if (column.type === 'date') {
      return value ? new Date(value).toLocaleDateString() : '';
    }
    
    if (column.type === 'badge') {
      const badgeClass = column.getBadgeClass ? column.getBadgeClass(value) : 'slds-theme_default';
      return (
        <span className={`slds-badge ${badgeClass}`}>
          {value}
        </span>
      );
    }
    
    return value || '';
  };

  const renderPagination = () => {
    if (!pagination || !pagination.totalPages || pagination.totalPages <= 1) {
      return null;
    }

    const { currentPage, totalPages, totalCount, hasNextPage, hasPrevPage } = pagination;
    const startRecord = ((currentPage - 1) * (pagination.limit || 20)) + 1;
    const endRecord = Math.min(currentPage * (pagination.limit || 20), totalCount);

    return (
      <div className="slds-card__footer">
        <div className="slds-grid slds-grid_align-spread slds-grid_vertical-align-center">
          <div className="slds-col">
            <p className="slds-text-body_small slds-text-color_weak">
              Showing {startRecord}-{endRecord} of {totalCount} records
            </p>
          </div>
          <div className="slds-col">
            <div className="slds-grid slds-grid_align-center">
              <Button
                variant="neutral"
                size="small"
                disabled={!hasPrevPage || loading}
                onClick={() => onPageChange?.(currentPage - 1)}
              >
                Previous
              </Button>
              <div className="slds-p-horizontal_small">
                <span className="slds-text-body_small">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              <Button
                variant="neutral"
                size="small"
                disabled={!hasNextPage || loading}
                onClick={() => onPageChange?.(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderActions = (row) => {
    const hasActions = onView || onEdit || onDelete;
    if (!hasActions) return null;

    return (
      <div className="slds-button-group" role="group">
        {onView && (
          <IconButton
            icon={<Eye size={14} />}
            title="View"
            size="small"
            onClick={() => onView(row)}
          />
        )}
        {onEdit && (
          <IconButton
            icon={<Edit size={14} />}
            title="Edit"
            size="small"
            onClick={() => onEdit(row)}
          />
        )}
        {onDelete && (
          <IconButton
            icon={<Trash2 size={14} />}
            title="Delete"
            size="small"
            variant="destructive"
            onClick={() => onDelete(row)}
          />
        )}
      </div>
    );
  };

  const hasActions = onView || onEdit || onDelete;

  if (loading && data.length === 0) {
    return (
      <div className={`slds-card ${className}`}>
        {(title || actions || searchable) && (
          <div className="slds-card__header slds-grid">
            <header className="slds-media slds-media_center