// src/components/activities/ActivityForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { activitiesAPI, leadsAPI, contactsAPI, accountsAPI, opportunitiesAPI, usersAPI } from '../../services/api';
import Input, { Textarea } from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { 
  Activity, 
  Clock, 
  Calendar, 
  User, 
  Building, 
  Target,
  DollarSign,
  Save,
  X,
  MapPin
} from 'lucide-react';

const ActivityForm = ({ activity, mode = 'create', onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    subject: activity?.subject || '',
    type: activity?.type || 'Task',
    status: activity?.status || 'Not Started',
    priority: activity?.priority || 'Normal',
    dueDate: activity?.dueDate ? new Date(activity.dueDate).toISOString().split('T')[0] : '',
    dueTime: activity?.dueDate ? new Date(activity.dueDate).toTimeString().slice(0, 5) : '',
    description: activity?.description || '',
    location: activity?.location || '',
    ownerId: activity?.ownerId?.id || activity?.ownerId || '',
    assignedToId: activity?.assignedToId?.id || activity?.assignedToId || '',
    // Related records
    leadId: activity?.leadId?.id || activity?.leadId || '',
    contactId: activity?.contactId?.id || activity?.contactId || '',
    accountId: activity?.accountId?.id || activity?.accountId || '',
    opportunityId: activity?.opportunityId?.id || activity?.opportunityId || '',
    // Additional fields
    isAllDay: activity?.isAllDay || false,
    isPrivate: activity?.isPrivate || false,
    reminderDateTime: activity?.reminderDateTime ? new Date(activity.reminderDateTime).toISOString().slice(0, 16) : '',
    recurrenceType: activity?.recurrenceType || '',
    recurrenceInterval: activity?.recurrenceInterval || 1,
    recurrenceEndDate: activity?.recurrenceEndDate ? new Date(activity.recurrenceEndDate).toISOString().split('T')[0] : '',
    // Call/Meeting specific
    callType: activity?.callType || '',
    callDuration: activity?.callDuration || '',
    callResult: activity?.callResult || '',
    // Task specific
    taskSubtype: activity?.taskSubtype || '',
    // Meeting specific
    isRecurring: activity?.isRecurring || false
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [users, setUsers] = useState([]);

  const { addNotification } = useApp();
  const navigate = useNavigate();

  const typeOptions = [
    { value: 'Task', label: 'Task' },
    { value: 'Call', label: 'Call' },
    { value: 'Email', label: 'Email' },
    { value: 'Meeting', label: 'Meeting' },
    { value: 'Demo', label: 'Demo' },
    { value: 'Follow-up', label: 'Follow-up' },
    { value: 'Other', label: 'Other' }
  ];

  const statusOptions = [
    { value: 'Not Started', label: 'Not Started' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Waiting on someone else', label: 'Waiting on someone else' },
    { value: 'Deferred', label: 'Deferred' },
    { value: 'Cancelled', label: 'Cancelled' }
  ];

  const priorityOptions = [
    { value: 'High', label: 'High' },
    { value: 'Normal', label: 'Normal' },
    { value: 'Low', label: 'Low' }
  ];

  const callTypeOptions = [
    { value: '', label: 'Select Call Type' },
    { value: 'Inbound', label: 'Inbound' },
    { value: 'Outbound', label: 'Outbound' },
    { value: 'Internal', label: 'Internal' }
  ];

  const callResultOptions = [
    { value: '', label: 'Select Call Result' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Busy', label: 'Busy' },
    { value: 'No Answer', label: 'No Answer' },
    { value: 'Left Message', label: 'Left Message' },
    { value: 'Interested', label: 'Interested' },
    { value: 'Not Interested', label: 'Not Interested' },
    { value: 'Follow-up Required', label: 'Follow-up Required' }
  ];

  const taskSubtypeOptions = [
    { value: '', label: 'Select Task Subtype' },
    { value: 'Send Letter/Quote', label: 'Send Letter/Quote' },
    { value: 'Send Literature', label: 'Send Literature' },
    { value: 'Prepare Proposal', label: 'Prepare Proposal' },
    { value: 'Other', label: 'Other' }
  ];

  const recurrenceOptions = [
    { value: '', label: 'Does not repeat' },
    { value: 'Daily', label: 'Daily' },
    { value: 'Weekly', label: 'Weekly' },
    { value: 'Monthly', label: 'Monthly' },
    { value: 'Yearly', label: 'Yearly' }
  ];

  useEffect(() => {
    loadRelatedData();
  }, []);

  const loadRelatedData = async () => {
    try {
      const [leadsRes, contactsRes, accountsRes, opportunitiesRes, usersRes] = await Promise.all([
        leadsAPI.getAll({ limit: 100 }).catch(() => ({ leads: [] })),
        contactsAPI.getAll({ limit: 100 }).catch(() => ({ contacts: [] })),
        accountsAPI.getAll({ limit: 100 }).catch(() => ({ accounts: [] })),
        opportunitiesAPI.getAll({ limit: 100 }).catch(() => ({ opportunities: [] })),
        usersAPI.getAll({ limit: 100 }).catch(() => ({ users: [] }))
      ]);

      setLeads(leadsRes.leads || []);
      setContacts(contactsRes.contacts || []);
      setAccounts(accountsRes.accounts || []);
      setOpportunities(opportunitiesRes.opportunities || []);
      setUsers(usersRes.users || []);
    } catch (error) {
      console.error('Error loading related data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    if (!formData.type) {
      newErrors.type = 'Type is required';
    }
    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    // Date validation
    if (formData.dueDate) {
      const dueDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dueDate < today && formData.status !== 'Completed') {
        newErrors.dueDate = 'Due date cannot be in the past for non-completed activities';
      }
    }

    // Recurrence validation
    if (formData.recurrenceType && !formData.recurrenceEndDate) {
      newErrors.recurrenceEndDate = 'Recurrence end date is required for recurring activities';
    }

    // Call duration validation
    if (formData.type === 'Call' && formData.callDuration && isNaN(formData.callDuration)) {
      newErrors.callDuration = 'Call duration must be a number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Combine date and time for dueDate
      let dueDateTime = null;
      if (formData.dueDate) {
        if (formData.isAllDay) {
          dueDateTime = new Date(formData.dueDate + 'T00:00:00').toISOString();
        } else if (formData.dueTime) {
          dueDateTime = new Date(formData.dueDate + 'T' + formData.dueTime + ':00').toISOString();
        } else {
          dueDateTime = new Date(formData.dueDate + 'T09:00:00').toISOString();
        }
      }

      const submitData = {
        ...formData,
        dueDate: dueDateTime,
        reminderDateTime: formData.reminderDateTime ? new Date(formData.reminderDateTime).toISOString() : null,
        recurrenceEndDate: formData.recurrenceEndDate ? new Date(formData.recurrenceEndDate).toISOString() : null,
        callDuration: formData.callDuration ? parseInt(formData.callDuration) : null,
        recurrenceInterval: formData.recurrenceInterval ? parseInt(formData.recurrenceInterval) : 1
      };

      // Remove empty related record IDs
      ['leadId', 'contactId', 'accountId', 'opportunityId'].forEach(field => {
        if (!submitData[field]) {
          delete submitData[field];
        }
      });

      let result;
      if (mode === 'create') {
        result = await activitiesAPI.create(submitData);
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Activity created successfully'
        });
      } else {
        result = await activitiesAPI.update(activity.id, submitData);
        addNotification({
          type: 'success',
          title: 'Success',
          message: 'Activity updated successfully'
        });
      }

      if (onSave) {
        onSave(result.activity);
      } else {
        navigate('/activities');
      }
    } catch (error) {
      console.error('Error saving activity:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message || `Failed to ${mode === 'create' ? 'create' : 'update'} activity`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/activities');
    }
  };

  return (
    <div className="slds-card">
      <div className="slds-card__header slds-grid">
        <header className="slds-media slds-media_center slds-has-flexi-truncate">
          <div className="slds-media__figure">
            <span className="slds-icon_container slds-icon-standard-task">
              <Activity size={20} />
            </span>
          </div>
          <div className="slds-media__body">
            <h2 className="slds-card__header-title">
              <span className="slds-text-heading_small">
                {mode === 'create' ? 'New Activity' : 'Edit Activity'}
              </span>
            </h2>
          </div>
        </header>
      </div>
      
      <div className="slds-card__body slds-card__body_inner">
        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="slds-section slds-is-open">
            <h3 className="slds-section__title slds-theme_shade">
              <span className="slds-truncate slds-p-horizontal_small" title="Basic Information">
                Basic Information
              </span>
            </h3>
            <div className="slds-section__content">
              <div className="slds-grid slds-gutters">
                <div className="slds-col slds-size_1-of-2">
                  <Input
                    label="Subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    error={errors.subject}
                    required
                    leftIcon={<Activity size={16} />}
                  />
                </div>
                <div className="slds-col slds-size_1-of-2">
                  <Select
                    label="Type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    options={typeOptions}
                    error={errors.type}
                    required
                  />
                </div>
              </div>

              <div className="slds-grid slds-gutters slds-m-top_medium">
                <div className="slds-col slds-size_1-of-3">
                  <Select
                    label="Status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    options={statusOptions}
                    error={errors.status}
                    required
                  />
                </div>
                <div className="slds-col slds-size_1-of-3">
                  <Select
                    label="Priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    options={priorityOptions}
                    error={errors.priority}
                  />
                </div>
                <div className="slds-col slds-size_1-of-3">
                  <Select
                    label="Assigned To"
                    name="assignedToId"
                    value={formData.assignedToId}
                    onChange={handleInputChange}
                    options={[
                      { value: '', label: 'Select User' },
                      ...users.map(user => ({
                        value: user.id,
                        label: `${user.firstName} ${user.lastName}`
                      }))
                    ]}
                    error={errors.assignedToId}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="slds-section slds-is-open slds-m-top_large">
            <h3 className="slds-section__title slds-theme_shade">
              <span className="slds-truncate slds-p-horizontal_small" title="Date & Time">
                Date & Time
              </span>
            </h3>
            <div className="slds-section__content">
              <div className="slds-form-element slds-m-bottom_medium">
                <div className="slds-form-element__control">
                  <div className="slds-checkbox">
                    <input
                      type="checkbox"
                      id="is-all-day"
                      name="isAllDay"
                      checked={formData.isAllDay}
                      onChange={handleInputChange}
                    />
                    <label className="slds-checkbox__label" htmlFor="is-all-day">
                      <span className="slds-checkbox_faux"></span>
                      <span className="slds-form-element__label">All Day</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="slds-grid slds-gutters">
                <div className="slds-col slds-size_1-of-2">
                  <Input
                    label="Due Date"
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    error={errors.dueDate}
                    leftIcon={<Calendar size={16} />}
                  />
                </div>
                {!formData.isAllDay && (
                  <div className="slds-col slds-size_1-of-2">
                    <Input
                      label="Due Time"
                      type="time"
                      name="dueTime"
                      value={formData.dueTime}
                      onChange={handleInputChange}
                      error={errors.dueTime}
                      leftIcon={<Clock size={16} />}
                    />
                  </div>
                )}
              </div>

              <div className="slds-grid slds-gutters slds-m-top_medium">
                <div className="slds-col slds-size_1-of-2">
                  <Input
                    label="Reminder"
                    type="datetime-local"
                    name="reminderDateTime"
                    value={formData.reminderDateTime}
                    onChange={handleInputChange}
                    error={errors.reminderDateTime}
                  />
                </div>
                <div className="slds-col slds-size_1-of-2">
                  <Input
                    label="Location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    error={errors.location}
                    leftIcon={<MapPin size={16} />}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Related Records */}
          <div className="slds-section slds-is-open slds-m-top_large">
            <h3 className="slds-section__title slds-theme_shade">
              <span className="slds-truncate slds-p-horizontal_small" title="Related Records">
                Related Records
              </span>
            </h3>
            <div className="slds-section__content">
              <div className="slds-grid slds-gutters">
                <div className="slds-col slds-size_1-of-2">
                  <Select
                    label="Lead"
                    name="leadId"
                    value={formData.leadId}
                    onChange={handleInputChange}
                    options={[
                      { value: '', label: 'Select Lead' },
                      ...leads.map(lead => ({
                        value: lead.id,
                        label: `${lead.firstName} ${lead.lastName} - ${lead.company}`
                      }))
                    ]}
                    error={errors.leadId}
                  />
                </div>
                <div className="slds-col slds-size_1-of-2">
                  <Select
                    label="Contact"
                    name="contactId"
                    value={formData.contactId}
                    onChange={handleInputChange}
                    options={[
                      { value: '', label: 'Select Contact' },
                      ...contacts.map(contact => ({
                        value: contact.id,
                        label: `${contact.firstName} ${contact.lastName}`
                      }))
                    ]}
                    error={errors.contactId}
                  />
                </div>
              </div>

              <div className="slds-grid slds-gutters slds-m-top_medium">
                <div className="slds-col slds-size_1-of-2">
                  <Select
                    label="Account"
                    name="accountId"
                    value={formData.accountId}
                    onChange={handleInputChange}
                    options={[
                      { value: '', label: 'Select Account' },
                      ...accounts.map(account => ({
                        value: account.id,
                        label: account.name
                      }))
                    ]}
                    error={errors.accountId}
                  />
                </div>
                <div className="slds-col slds-size_1-of-2">
                  <Select
                    label="Opportunity"
                    name="opportunityId"
                    value={formData.opportunityId}
                    onChange={handleInputChange}
                    options={[
                      { value: '', label: 'Select Opportunity' },
                      ...opportunities.map(opportunity => ({
                        value: opportunity.id,
                        label: opportunity.name
                      }))
                    ]}
                    error={errors.opportunityId}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Type-specific fields */}
          {formData.type === 'Call' && (
            <div className="slds-section slds-is-open slds-m-top_large">
              <h3 className="slds-section__title slds-theme_shade">
                <span className="slds-truncate slds-p-horizontal_small" title="Call Details">
                  Call Details
                </span>
              </h3>
              <div className="slds-section__content">
                <div className="slds-grid slds-gutters">
                  <div className="slds-col slds-size_1-of-3">
                    <Select
                      label="Call Type"
                      name="callType"
                      value={formData.callType}
                      onChange={handleInputChange}
                      options={callTypeOptions}
                      error={errors.callType}
                    />
                  </div>
                  <div className="slds-col slds-size_1-of-3">
                    <Input
                      label="Duration (minutes)"
                      type="number"
                      name="callDuration"
                      value={formData.callDuration}
                      onChange={handleInputChange}
                      error={errors.callDuration}
                      min="0"
                    />
                  </div>
                  <div className="slds-col slds-size_1-of-3">
                    <Select
                      label="Call Result"
                      name="callResult"
                      value={formData.callResult}
                      onChange={handleInputChange}
                      options={callResultOptions}
                      error={errors.callResult}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {formData.type === 'Task' && (
            <div className="slds-section slds-is-open slds-m-top_large">
              <h3 className="slds-section__title slds-theme_shade">
                <span className="slds-truncate slds-p-horizontal_small" title="Task Details">
                  Task Details
                </span>
              </h3>
              <div className="slds-section__content">
                <div className="slds-grid slds-gutters">
                  <div className="slds-col slds-size_1-of-2">
                    <Select
                      label="Task Subtype"
                      name="taskSubtype"
                      value={formData.taskSubtype}
                      onChange={handleInputChange}
                      options={taskSubtypeOptions}
                      error={errors.taskSubtype}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recurrence */}
          <div className="slds-section slds-is-open slds-m-top_large">
            <h3 className="slds-section__title slds-theme_shade">
              <span className="slds-truncate slds-p-horizontal_small" title="Recurrence">
                Recurrence
              </span>
            </h3>
            <div className="slds-section__content">
              <div className="slds-grid slds-gutters">
                <div className="slds-col slds-size_1-of-3">
                  <Select
                    label="Recurrence Type"
                    name="recurrenceType"
                    value={formData.recurrenceType}
                    onChange={handleInputChange}
                    options={recurrenceOptions}
                    error={errors.recurrenceType}
                  />
                </div>
                {formData.recurrenceType && (
                  <>
                    <div className="slds-col slds-size_1-of-3">
                      <Input
                        label="Repeat Every"
                        type="number"
                        name="recurrenceInterval"
                        value={formData.recurrenceInterval}
                        onChange={handleInputChange}
                        error={errors.recurrenceInterval}
                        min="1"
                        helpText={`${formData.recurrenceType.toLowerCase()}(s)`}
                      />
                    </div>
                    <div className="slds-col slds-size_1-of-3">
                      <Input
                        label="End Date"
                        type="date"
                        name="recurrenceEndDate"
                        value={formData.recurrenceEndDate}
                        onChange={handleInputChange}
                        error={errors.recurrenceEndDate}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="slds-section slds-is-open slds-m-top_large">
            <h3 className="slds-section__title slds-theme_shade">
              <span className="slds-truncate slds-p-horizontal_small" title="Additional Information">
                Additional Information
              </span>
            </h3>
            <div className="slds-section__content">
              <div className="slds-grid slds-gutters">
                <div className="slds-col slds-size_1-of-1">
                  <Textarea
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    error={errors.description}
                    rows={4}
                  />
                </div>
              </div>

              {/* Settings */}
              <div className="slds-m-top_medium">
                <h4 className="slds-text-heading_small slds-m-bottom_small">Settings</h4>
                <div className="slds-grid slds-gutters">
                  <div className="slds-col slds-size_1-of-2">
                    <div className="slds-form-element">
                      <div className="slds-form-element__control">
                        <div className="slds-checkbox">
                          <input
                            type="checkbox"
                            id="is-private"
                            name="isPrivate"
                            checked={formData.isPrivate}
                            onChange={handleInputChange}
                          />
                          <label className="slds-checkbox__label" htmlFor="is-private">
                            <span className="slds-checkbox_faux"></span>
                            <span className="slds-form-element__label">Private</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="slds-m-top_large">
            <div className="slds-grid slds-grid_align-end">
              <Button
                type="button"
                variant="neutral"
                onClick={handleCancel}
                disabled={loading}
                icon={<X size={16} />}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="brand"
                loading={loading}
                disabled={loading}
                className="slds-m-left_x-small"
                icon={<Save size={16} />}
              >
                {mode === 'create' ? 'Create Activity' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActivityForm;