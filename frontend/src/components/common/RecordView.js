import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Form from '../ui/Form';
import {
  Edit,
  Trash2,
  Copy,
  Share,
  MoreHorizontal,
  ArrowLeft,
  Clock,
  User,
  Calendar
} from 'lucide-react';
import classNames from 'classnames';
import { format } from 'date-fns';

const RecordView = ({
  title,
  data = {},
  fields = [],
  sections = [],
  loading = false,
  onEdit,
  onDelete,
  onClone,
  onShare,
  onSave,
  isEditing = false,
  onCancelEdit,
  backUrl,
  className,
  showEditButton = true,
  showDeleteButton = true,
  showCloneButton = false,
  showShareButton = false,
  relatedLists = []
}) => {
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingData, setEditingData] = useState(data);

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (onDelete) {
      await onDelete(data);
      setShowDeleteModal(false);
      if (backUrl) {
        navigate(backUrl);
      }
    }
  };

  const handleSave = async (formData) => {
    if (onSave) {
      await onSave(formData);
    }
  };

  const renderFieldValue = (field, value) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-salesforce-gray-400">—</span>;
    }

    switch (field.type) {
      case 'email':
        return (
          <a
            href={`mailto:${value}`}
            className="text-salesforce-blue-600 hover:text-salesforce-blue-700"
          >
            {value}
          </a>
        );
      
      case 'phone':
        return (
          <a
            href={`tel:${value}`}
            className="text-salesforce-blue-600 hover:text-salesforce-blue-700"
          >
            {value}
          </a>
        );
      
      case 'url':
        return (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-salesforce-blue-600 hover:text-salesforce-blue-700"
          >
            {value}
          </a>
        );
      
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value);
      
      case 'percentage':
        return `${value}%`;
      
      case 'date':
        return format(new Date(value), 'MMM dd, yyyy');
      
      case 'datetime':
        return format(new Date(value), 'MMM dd, yyyy hh:mm a');
      
      case 'boolean':
        return (
          <span className={classNames(
            'px-2 py-1 text-xs font-medium rounded-full',
            value 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          )}>
            {value ? 'Yes' : 'No'}
          </span>
        );
      
      case 'select':
        const option = field.options?.find(opt => opt.value === value);
        return option ? option.label : value;
      
      case 'textarea':
        return (
          <div className="whitespace-pre-wrap">
            {value}
          </div>
        );
      
      default:
        return value;
    }
  };

  const renderSection = (section) => (
    <div key={section.title} className="bg-white rounded-lg border border-salesforce-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-salesforce-gray-200 bg-salesforce-gray-50">
        <h3 className="text-lg font-medium text-salesforce-gray-900">
          {section.title}
        </h3>
        {section.description && (
          <p className="text-sm text-salesforce-gray-600 mt-1">
            {section.description}
          </p>
        )}
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {section.fields.map((fieldKey) => {
            const field = fields.find(f => f.name === fieldKey);
            if (!field) return null;
            
            return (
              <div key={field.name}>
                <label className="block text-sm font-medium text-salesforce-gray-700 mb-1">
                  {field.label}
                </label>
                <div className="text-sm text-salesforce-gray-900">
                  {renderFieldValue(field, data[field.name])}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderRelatedList = (relatedList) => (
    <div key={relatedList.title} className="bg-white rounded-lg border border-salesforce-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-salesforce-gray-200 bg-salesforce-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-salesforce-gray-900">
              {relatedList.title}
            </h3>
            {relatedList.count !== undefined && (
              <p className="text-sm text-salesforce-gray-600 mt-1">
                {relatedList.count} {relatedList.count === 1 ? 'item' : 'items'}
              </p>
            )}
          </div>
          
          {relatedList.onAdd && (
            <Button
              size="sm"
              onClick={relatedList.onAdd}
            >
              Add {relatedList.title.slice(0, -1)}
            </Button>
          )}
        </div>
      </div>
      
      <div className="p-6">
        {relatedList.data && relatedList.data.length > 0 ? (
          <div className="space-y-3">
            {relatedList.data.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-salesforce-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-salesforce-gray-900">
                    {item.name || item.title || item.subject}
                  </p>
                  {item.description && (
                    <p className="text-sm text-salesforce-gray-600">
                      {item.description}
                    </p>
                  )}
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            {relatedList.data.length > 5 && (
              <div className="text-center pt-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => relatedList.onViewAll && relatedList.onViewAll()}
                >
                  View All ({relatedList.data.length})
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-salesforce-gray-500">
              No {relatedList.title.toLowerCase()} found
            </p>
            {relatedList.onAdd && (
              <Button
                variant="secondary"
                size="sm"
                className="mt-2"
                onClick={relatedList.onAdd}
              >
                Add First {relatedList.title.slice(0, -1)}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-salesforce-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={classNames('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {backUrl && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(backUrl)}
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            />
          )}
          
          <div>
            <h1 className="text-2xl font-bold text-salesforce-gray-900">
              {title || data.name || data.title || 'Record'}
            </h1>
            
            <div className="flex items-center space-x-4 mt-2 text-sm text-salesforce-gray-500">
              {data.createdBy && (
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>Created by {data.createdBy}</span>
                </div>
              )}
              
              {data.createdAt && (
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(data.createdAt), 'MMM dd, yyyy')}</span>
                </div>
              )}
              
              {data.lastModifiedAt && (
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>Modified {format(new Date(data.lastModifiedAt), 'MMM dd, yyyy')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {!isEditing && (
          <div className="flex items-center space-x-3">
            {showShareButton && onShare && (
              <Button
                variant="secondary"
                leftIcon={<Share className="h-4 w-4" />}
                onClick={() => onShare(data)}
              >
                Share
              </Button>
            )}

            {showCloneButton && onClone && (
              <Button
                variant="secondary"
                leftIcon={<Copy className="h-4 w-4" />}
                onClick={() => onClone(data)}
              >
                Clone
              </Button>
            )}

            {showDeleteButton && onDelete && (
              <Button
                variant="danger"
                leftIcon={<Trash2 className="h-4 w-4" />}
                onClick={handleDelete}
              >
                Delete
              </Button>
            )}

            {showEditButton && onEdit && (
              <Button
                leftIcon={<Edit className="h-4 w-4" />}
                onClick={handleEdit}
              >
                Edit
              </Button>
            )}
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="bg-white rounded-lg border border-salesforce-gray-200 p-6">
          <Form
            fields={fields}
            defaultValues={data}
            onSubmit={handleSave}
            onCancel={onCancelEdit}
            submitLabel="Save"
            showCancelButton={true}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {sections.length > 0 ? (
            sections.map(renderSection)
          ) : (
            <div className="bg-white rounded-lg border border-salesforce-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {fields.map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-salesforce-gray-700 mb-1">
                      {field.label}
                    </label>
                    <div className="text-sm text-salesforce-gray-900">
                      {renderFieldValue(field, data[field.name])}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {relatedLists.map(renderRelatedList)}
        </div>
      )}

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
          Are you sure you want to delete this record? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default RecordView;