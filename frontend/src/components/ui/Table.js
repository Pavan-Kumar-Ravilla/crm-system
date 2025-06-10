import React, { useState } from 'react';
import classNames from 'classnames';
import { ChevronUp, ChevronDown, MoreHorizontal } from 'lucide-react';
import Button from './Button';

const Table = ({
  data = [],
  columns = [],
  sortable = true,
  selectable = false,
  onSort,
  onRowClick,
  onRowSelect,
  selectedRows = [],
  className,
  emptyMessage = 'No data available',
  loading = false,
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    if (!sortable) return;

    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    setSortConfig({ key, direction });
    
    if (onSort) {
      onSort(key, direction);
    }
  };

  const handleSelectAll = (checked) => {
    if (onRowSelect) {
      if (checked) {
        onRowSelect(data.map(row => row.id));
      } else {
        onRowSelect([]);
      }
    }
  };

  const handleRowSelect = (rowId, checked) => {
    if (onRowSelect) {
      if (checked) {
        onRowSelect([...selectedRows, rowId]);
      } else {
        onRowSelect(selectedRows.filter(id => id !== rowId));
      }
    }
  };

  const isAllSelected = data.length > 0 && selectedRows.length === data.length;
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < data.length;

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-salesforce-gray-200">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-salesforce-blue-600 mx-auto"></div>
          <p className="mt-2 text-salesforce-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={classNames('bg-white rounded-lg border border-salesforce-gray-200 overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-salesforce-gray-200">
          <thead className="bg-salesforce-gray-50">
            <tr>
              {selectable && (
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={input => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-salesforce-gray-300 text-salesforce-blue-600 focus:ring-salesforce-blue-500"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={classNames(
                    'px-6 py-3 text-left text-xs font-medium text-salesforce-gray-500 uppercase tracking-wider',
                    {
                      'cursor-pointer hover:bg-salesforce-gray-100': sortable && column.sortable !== false,
                    }
                  )}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {sortable && column.sortable !== false && (
                      <span className="flex flex-col">
                        <ChevronUp
                          className={classNames('w-3 h-3', {
                            'text-salesforce-blue-600': sortConfig.key === column.key && sortConfig.direction === 'asc',
                            'text-salesforce-gray-400': sortConfig.key !== column.key || sortConfig.direction !== 'asc',
                          })}
                        />
                        <ChevronDown
                          className={classNames('w-3 h-3 -mt-1', {
                            'text-salesforce-blue-600': sortConfig.key === column.key && sortConfig.direction === 'desc',
                            'text-salesforce-gray-400': sortConfig.key !== column.key || sortConfig.direction !== 'desc',
                          })}
                        />
                      </span>
                    )}
                  </div>
                </th>
              ))}
              <th className="px-6 py-3 text-right text-xs font-medium text-salesforce-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-salesforce-gray-200">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0) + 1}
                  className="px-6 py-8 text-center text-salesforce-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={row.id || index}
                  className={classNames(
                    'hover:bg-salesforce-gray-50 transition-colors duration-150',
                    {
                      'cursor-pointer': onRowClick,
                      'bg-salesforce-blue-50': selectedRows.includes(row.id),
                    }
                  )}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {selectable && (
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(row.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleRowSelect(row.id, e.target.checked);
                        }}
                        className="rounded border-salesforce-gray-300 text-salesforce-blue-600 focus:ring-salesforce-blue-500"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-salesforce-gray-900">
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;