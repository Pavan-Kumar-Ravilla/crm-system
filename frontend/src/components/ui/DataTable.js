// src/components/ui/DataTable.js
import React, { useState, useMemo } from 'react';
import { 
  ChevronUpIcon, 
  ChevronDownIcon, 
  SearchIcon,
  FilterIcon,
  MoreVerticalIcon,
  CheckIcon
} from 'lucide-react';
import Button from './Button';
import Input from './Input';
import Badge from './Badge';
import { Menu, Transition } from '@headlessui/react';

const DataTable = ({
  data = [],
  columns = [],
  loading = false,
  pagination = null,
  onPageChange,
  onSortChange,
  onFilterChange,
  searchable = true,
  filterable = true,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  actions = [],
  bulkActions = [],
  emptyMessage = 'No data available',
  className = ''
}) => {
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [selectedItems, setSelectedItems] = useState(selectedRows);

  // Handle sorting
  const handleSort = (field) => {
    const direction = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(direction);
    onSortChange?.(field, direction);
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
    onFilterChange?.({ search: value, ...filters });
  };

  // Handle filters
  const handleFilter = (filterKey, filterValue) => {
    const newFilters = { ...filters, [filterKey]: filterValue };
    setFilters(newFilters);
    onFilterChange?.({ search: searchTerm, ...newFilters });
  };

  // Handle row selection
  const handleRowSelection = (id, checked) => {
    let newSelection;
    if (checked) {
      newSelection = [...selectedItems, id];
    } else {
      newSelection = selectedItems.filter(item => item !== id);
    }
    setSelectedItems(newSelection);
    onSelectionChange?.(newSelection);
  };

  // Handle select all
  const handleSelectAll = (checked) => {
    const newSelection = checked ? data.map(item => item.id) : [];
    setSelectedItems(newSelection);
    onSelectionChange?.(newSelection);
  };

  // Filter and sort data locally if no server-side handling
  const processedData = useMemo(() => {
    let filtered = data;

    // Apply search filter
    if (searchTerm && !onFilterChange) {
      filtered = filtered.filter(item =>
        columns.some(col => {
          const value = col.accessor ? item[col.accessor] : '';
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Apply column filters
    if (Object.keys(filters).length > 0 && !onFilterChange) {
      filtered = filtered.filter(item =>
        Object.entries(filters).every(([key, value]) => {
          if (!value) return true;
          const itemValue = String(item[key] || '').toLowerCase();
          return itemValue.includes(String(value).toLowerCase());
        })
      );
    }

    // Apply sorting
    if (sortField && !onSortChange) {
      filtered.sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, filters, sortField, sortDirection, columns, onFilterChange, onSortChange]);

  // Render cell content
  const renderCell = (item, column) => {
    if (column.render) {
      return column.render(item[column.accessor], item);
    }
    
    const value = column.accessor ? item[column.accessor] : '';
    
    if (column.type === 'badge') {
      return <Badge variant={column.variant}>{value}</Badge>;
    }
    
    if (column.type === 'date') {
      return new Date(value).toLocaleDateString();
    }
    
    if (column.type === 'currency') {
      return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD' 
      }).format(value);
    }
    
    return value;
  };

  // Render table actions
  const renderActions = (item) => {
    if (!actions.length) return null;

    return (
      <Menu as="div" className="relative inline-block text-left">
        <Menu.Button className="p-2 hover:bg-gray-100 rounded-lg">
          <MoreVerticalIcon className="w-4 h-4 text-gray-500" />
        </Menu.Button>
        
        <Transition
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 z-10 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              {actions.map((action, index) => (
                <Menu.Item key={index}>
                  {({ active }) => (
                    <button
                      onClick={() => action.onClick(item)}
                      className={`
                        ${active ? 'bg-gray-100' : ''}
                        ${action.danger ? 'text-red-600' : 'text-gray-700'}
                        group flex items-center px-4 py-2 text-sm w-full text-left
                      `}
                    >
                      {action.icon && (
                        <action.icon className="mr-3 h-4 w-4" />
                      )}
                      {action.label}
                    </button>
                  )}
                </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    );
  };

  const isAllSelected = selectedItems.length === data.length && data.length > 0;
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < data.length;

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Table Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Search */}
          {searchable && (
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                icon={<SearchIcon />}
              />
            </div>
          )}

          {/* Bulk Actions */}
          {bulkActions.length > 0 && selectedItems.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {selectedItems.length} selected
              </span>
              {bulkActions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'secondary'}
                  size="sm"
                  onClick={() => action.onClick(selectedItems)}
                  icon={action.icon}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}

          {/* Filters */}
          {filterable && (
            <Button
              variant="outline"
              size="sm"
              icon={<FilterIcon />}
            >
              Filters
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {selectable && (
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={input => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                </th>
              )}
              
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  onClick={column.sortable ? () => handleSort(column.accessor) : undefined}
                >
                  <div className="flex items-center gap-2">
                    {column.title}
                    {column.sortable && (
                      <div className="flex flex-col">
                        <ChevronUpIcon className={`w-3 h-3 ${
                          sortField === column.accessor && sortDirection === 'asc' 
                            ? 'text-primary-600' 
                            : 'text-gray-400'
                        }`} />
                        <ChevronDownIcon className={`w-3 h-3 -mt-1 ${
                          sortField === column.accessor && sortDirection === 'desc' 
                            ? 'text-primary-600' 
                            : 'text-gray-400'
                        }`} />
                      </div>
                    )}
                  </div>
                </th>
              ))}
              
              {actions.length > 0 && (
                <th className="w-16 px-4 py-3"></th>
              )}
            </tr>
          </thead>
          
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)} className="px-4 py-8 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                    <span className="ml-2 text-gray-600">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : processedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)} className="px-4 py-8 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              processedData.map((item, index) => (
                <tr key={item.id || index} className="hover:bg-gray-50">
                  {selectable && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={(e) => handleRowSelection(item.id, e.target.checked)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                    </td>
                  )}
                  
                  {columns.map((column, columnIndex) => (
                    <td key={columnIndex} className="px-4 py-3 text-sm text-gray-900">
                      {renderCell(item, column)}
                    </td>
                  ))}
                  
                  {actions.length > 0 && (
                    <td className="px-4 py-3">
                      {renderActions(item)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="px-4 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of{' '}
              {pagination.totalCount} results
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPrevPage}
                onClick={() => onPageChange?.(pagination.currentPage - 1)}
              >
                Previous
              </Button>
              
              <span className="text-sm text-gray-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNextPage}
                onClick={() => onPageChange?.(pagination.currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;