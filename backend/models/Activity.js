// backend/models/Activity.js
const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [255, 'Subject cannot be more than 255 characters'],
    index: true
  },
  
  // Activity Type
  type: {
    type: String,
    enum: {
      values: ['Call', 'Email', 'Meeting', 'Task', 'Note', 'Demo', 'Proposal', 'Follow-up'],
      message: 'Activity type must be Call, Email, Meeting, Task, Note, Demo, Proposal, or Follow-up'
    },
    required: [true, 'Activity type is required'],
    index: true
  },
  
  // Status and Priority
  status: {
    type: String,
    enum: {
      values: ['Not Started', 'In Progress', 'Completed', 'Waiting on someone else', 'Deferred', 'Cancelled'],
      message: 'Status must be a valid activity status'
    },
    default: 'Not Started',
    index: true
  },
  
  priority: {
    type: String,
    enum: {
      values: ['High', 'Normal', 'Low'],
      message: 'Priority must be High, Normal, or Low'
    },
    default: 'Normal',
    index: true
  },
  
  // Date and Time Information
  dueDate: {
    type: Date,
    index: true
  },
  
  startDate: {
    type: Date
  },
  
  endDate: {
    type: Date
  },
  
  completedDate: {
    type: Date
  },
  
  // Activity Details
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  
  // Related Records
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    index: true
  },
  
  contactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    index: true
  },
  
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    index: true
  },
  
  opportunityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
    index: true
  },
  
  // Meeting Specific Fields
  location: {
    type: String,
    trim: true,
    maxlength: [255, 'Location cannot be more than 255 characters']
  },
  
  isAllDay: {
    type: Boolean,
    default: false
  },
  
  attendees: [{
    contactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contact'
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters']
    },
    responseStatus: {
      type: String,
      enum: ['Pending', 'Accepted', 'Declined', 'Tentative'],
      default: 'Pending'
    }
  }],
  
  // Call Specific Fields
  callDuration: {
    type: Number, // in minutes
    min: [0, 'Call duration cannot be negative']
  },
  
  callResult: {
    type: String,
    enum: ['Connected', 'Left Message', 'No Answer', 'Busy', 'Wrong Number', 'Call Back'],
    trim: true
  },
  
  callDirection: {
    type: String,
    enum: ['Inbound', 'Outbound'],
    default: 'Outbound'
  },
  
  // Email Specific Fields
  emailTo: [{
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter valid email addresses']
  }],
  
  emailCc: [{
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter valid email addresses']
  }],
  
  emailBcc: [{
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter valid email addresses']
  }],
  
  emailSubject: {
    type: String,
    trim: true,
    maxlength: [255, 'Email subject cannot be more than 255 characters']
  },
  
  emailBody: {
    type: String,
    trim: true,
    maxlength: [10000, 'Email body cannot be more than 10000 characters']
  },
  
  // Task Specific Fields
  taskProgress: {
    type: Number,
    min: [0, 'Progress cannot be less than 0'],
    max: [100, 'Progress cannot be more than 100'],
    default: 0
  },
  
  // Recurrence Information
  isRecurring: {
    type: Boolean,
    default: false
  },
  
  recurrencePattern: {
    type: String,
    enum: ['Daily', 'Weekly', 'Monthly', 'Yearly']
  },
  
  recurrenceInterval: {
    type: Number,
    min: [1, 'Recurrence interval must be at least 1'],
    default: 1
  },
  
  recurrenceEndDate: {
    type: Date
  },
  
  recurrenceCount: {
    type: Number,
    min: [1, 'Recurrence count must be at least 1']
  },
  
  parentActivityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity'
  },
  
  // Reminder Information
  hasReminder: {
    type: Boolean,
    default: false
  },
  
  reminderDateTime: {
    type: Date
  },
  
  reminderSent: {
    type: Boolean,
    default: false
  },
  
  // Outcome and Results
  outcome: {
    type: String,
    enum: ['Successful', 'Unsuccessful', 'Partial', 'Rescheduled', 'Cancelled'],
    trim: true
  },
  
  nextSteps: {
    type: String,
    trim: true,
    maxlength: [1000, 'Next steps cannot be more than 1000 characters']
  },
  
  // Follow-up Information
  followUpRequired: {
    type: Boolean,
    default: false
  },
  
  followUpDate: {
    type: Date
  },
  
  followUpActivityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity'
  },
  
  // Completion tracking
  actualDuration: {
    type: Number, // in minutes
    min: [0, 'Actual duration cannot be negative']
  },
  
  isCompleted: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // System fields
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Activity must have an owner'],
    index: true
  },
  
  assignedToId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  // Tags for categorization
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Custom fields (for extensibility)
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes for better query performance
activitySchema.index({ createdAt: -1 });
activitySchema.index({ updatedAt: -1 });
activitySchema.index({ dueDate: 1 });
activitySchema.index({ startDate: 1 });
activitySchema.index({ endDate: 1 });
activitySchema.index({ ownerId: 1, type: 1 });
activitySchema.index({ ownerId: 1, status: 1 });
activitySchema.index({ ownerId: 1, dueDate: 1 });
activitySchema.index({ assignedToId: 1, status: 1 });

// Compound indexes for common queries
activitySchema.index({ 
  ownerId: 1, 
  type: 1, 
  status: 1, 
  dueDate: 1 
});

activitySchema.index({
  leadId: 1,
  isActive: 1,
  createdAt: -1
});

activitySchema.index({
  contactId: 1,
  isActive: 1,
  createdAt: -1
});

activitySchema.index({
  accountId: 1,
  isActive: 1,
  createdAt: -1
});

activitySchema.index({
  opportunityId: 1,
  isActive: 1,
  createdAt: -1
});

// Text index for search functionality
activitySchema.index({
  subject: 'text',
  description: 'text',
  nextSteps: 'text',
  emailSubject: 'text',
  emailBody: 'text'
}, {
  weights: {
    subject: 10,
    emailSubject: 8,
    description: 4,
    nextSteps: 6,
    emailBody: 2
  },
  name: 'activity_text_index'
});

// Virtual for duration in hours
activitySchema.virtual('durationInHours').get(function() {
  if (!this.startDate || !this.endDate) return null;
  const diffMs = new Date(this.endDate) - new Date(this.startDate);
  return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100; // Round to 2 decimal places
});

// Virtual for is overdue
activitySchema.virtual('isOverdue').get(function() {
  if (this.isCompleted || !this.dueDate) return false;
  return new Date() > new Date(this.dueDate);
});

// Virtual for days until due
activitySchema.virtual('daysUntilDue').get(function() {
  if (!this.dueDate) return null;
  const today = new Date();
  const dueDate = new Date(this.dueDate);
  return Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
});

// Virtual for primary related record
activitySchema.virtual('primaryRelation').get(function() {
  if (this.leadId) return { type: 'Lead', id: this.leadId };
  if (this.opportunityId) return { type: 'Opportunity', id: this.opportunityId };
  if (this.accountId) return { type: 'Account', id: this.accountId };
  if (this.contactId) return { type: 'Contact', id: this.contactId };
  return null;
});

// Virtual for completion percentage (for tasks)
activitySchema.virtual('completionPercentage').get(function() {
  if (this.type !== 'Task') return null;
  if (this.isCompleted) return 100;
  return this.taskProgress || 0;
});

// Pre-save middleware
activitySchema.pre('save', function(next) {
  // Set completion fields when status changes to completed
  if (this.isModified('status')) {
    if (this.status === 'Completed' && !this.isCompleted) {
      this.isCompleted = true;
      this.completedDate = new Date();
      if (this.type === 'Task') {
        this.taskProgress = 100;
      }
    } else if (this.status !== 'Completed' && this.isCompleted) {
      this.isCompleted = false;
      this.completedDate = undefined;
      if (this.type === 'Task' && this.taskProgress === 100) {
        this.taskProgress = 0;
      }
    }
  }
  
  // Set isCompleted based on taskProgress for tasks
  if (this.type === 'Task' && this.isModified('taskProgress')) {
    if (this.taskProgress === 100 && !this.isCompleted) {
      this.isCompleted = true;
      this.status = 'Completed';
      this.completedDate = new Date();
    } else if (this.taskProgress < 100 && this.isCompleted) {
      this.isCompleted = false;
      this.status = 'In Progress';
      this.completedDate = undefined;
    }
  }
  
  // Ensure end date is after start date
  if (this.startDate && this.endDate && this.startDate >= this.endDate) {
    return next(new Error('End date must be after start date'));
  }
  
  // Set email subject from activity subject if not provided
  if (this.type === 'Email' && !this.emailSubject && this.subject) {
    this.emailSubject = this.subject;
  }
  
  // Update updatedBy field
  if (this.isModified() && !this.isNew) {
    this.updatedBy = this.ownerId; // This should be set by the controller
  }
  
  next();
});

// Post-save middleware to update related records' last activity date
activitySchema.post('save', async function(doc) {
  try {
    const updatePromises = [];
    
    if (doc.leadId) {
      const Lead = mongoose.model('Lead');
      updatePromises.push(
        Lead.findByIdAndUpdate(doc.leadId, { lastActivityDate: doc.createdAt })
      );
    }
    
    if (doc.contactId) {
      const Contact = mongoose.model('Contact');
      updatePromises.push(
        Contact.findByIdAndUpdate(doc.contactId, { lastActivityDate: doc.createdAt })
      );
    }
    
    if (doc.accountId) {
      const Account = mongoose.model('Account');
      updatePromises.push(
        Account.findByIdAndUpdate(doc.accountId, { lastActivityDate: doc.createdAt })
      );
    }
    
    if (doc.opportunityId) {
      const Opportunity = mongoose.model('Opportunity');
      updatePromises.push(
        Opportunity.findByIdAndUpdate(doc.opportunityId, { lastActivityDate: doc.createdAt })
      );
    }
    
    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error updating related records last activity date:', error);
  }
});

// Static methods

// Find activities by owner with pagination and filtering
activitySchema.statics.findByOwner = function(ownerId, options = {}) {
  const {
    page = 1,
    limit = 20,
    type,
    status,
    priority,
    search,
    dateFrom,
    dateTo,
    relatedTo,
    relatedId,
    sortBy = 'dueDate',
    sortOrder = 'asc'
  } = options;

  const skip = (page - 1) * limit;
  const query = { 
    $or: [
      { ownerId },
      { assignedToId: ownerId }
    ],
    isActive: true 
  };
  
  // Add filters
  if (type) query.type = type;
  if (status) query.status = status;
  if (priority) query.priority = priority;
  
  // Related record filter
  if (relatedTo && relatedId) {
    query[`${relatedTo}Id`] = relatedId;
  }
  
  // Date range filter
  if (dateFrom || dateTo) {
    query.dueDate = {};
    if (dateFrom) query.dueDate.$gte = new Date(dateFrom);
    if (dateTo) query.dueDate.$lte = new Date(dateTo);
  }
  
  // Add search
  if (search) {
    query.$text = { $search: search };
  }
  
  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  
  return this.find(query)
    .populate('ownerId', 'firstName lastName email')
    .populate('assignedToId', 'firstName lastName email')
    .populate('leadId', 'firstName lastName company')
    .populate('contactId', 'firstName lastName email title')
    .populate('accountId', 'name type')
    .populate('opportunityId', 'name amount stage')
    .populate('createdBy', 'firstName lastName email')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();
};

// Get activity statistics
activitySchema.statics.getStats = function(ownerId, dateRange = {}) {
  const { startDate, endDate } = dateRange;
  const matchStage = { 
    $or: [
      { ownerId: mongoose.Types.ObjectId(ownerId) },
      { assignedToId: mongoose.Types.ObjectId(ownerId) }
    ],
    isActive: true 
  };
  
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalActivities: { $sum: 1 },
        completedActivities: {
          $sum: { $cond: [{ $eq: ['$isCompleted', true] }, 1, 0] }
        },
        overdueActivities: {
          $sum: { 
            $cond: [
              { 
                $and: [
                  { $eq: ['$isCompleted', false] },
                  { $lt: ['$dueDate', new Date()] },
                  { $ne: ['$dueDate', null] }
                ]
              }, 
              1, 
              0
            ] 
          }
        },
        byType: {
          $push: {
            type: '$type',
            count: 1
          }
        },
        byStatus: {
          $push: {
            status: '$status',
            count: 1
          }
        },
        byPriority: {
          $push: {
            priority: '$priority',
            count: 1
          }
        },
        avgCallDuration: { 
          $avg: { 
            $cond: [
              { $eq: ['$type', 'Call'] },
              '$callDuration',
              null
            ]
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalActivities: 1,
        completedActivities: 1,
        overdueActivities: 1,
        completionRate: {
          $cond: [
            { $eq: ['$totalActivities', 0] },
            0,
            { $multiply: [{ $divide: ['$completedActivities', '$totalActivities'] }, 100] }
          ]
        },
        avgCallDuration: { $round: ['$avgCallDuration', 1] },
        byType: 1,
        byStatus: 1,
        byPriority: 1
      }
    }
  ]);
};

// Get upcoming activities
activitySchema.statics.getUpcoming = function(ownerId, days = 7) {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);
  
  return this.find({
    $or: [
      { ownerId },
      { assignedToId: ownerId }
    ],
    isActive: true,
    isCompleted: false,
    dueDate: {
      $gte: startDate,
      $lte: endDate
    }
  })
  .populate('leadId', 'firstName lastName company')
  .populate('contactId', 'firstName lastName email')
  .populate('accountId', 'name')
  .populate('opportunityId', 'name amount')
  .sort({ dueDate: 1 })
  .lean();
};

// Get overdue activities
activitySchema.statics.getOverdue = function(ownerId) {
  return this.find({
    $or: [
      { ownerId },
      { assignedToId: ownerId }
    ],
    isActive: true,
    isCompleted: false,
    dueDate: {
      $lt: new Date()
    }
  })
  .populate('leadId', 'firstName lastName company')
  .populate('contactId', 'firstName lastName email')
  .populate('accountId', 'name')
  .populate('opportunityId', 'name amount')
  .sort({ dueDate: 1 })
  .lean();
};

// Instance method to mark as completed
activitySchema.methods.markCompleted = function(outcome, nextSteps) {
  this.status = 'Completed';
  this.isCompleted = true;
  this.completedDate = new Date();
  if (outcome) this.outcome = outcome;
  if (nextSteps) this.nextSteps = nextSteps;
  if (this.type === 'Task') this.taskProgress = 100;
  
  return this.save();
};

// Instance method to create follow-up activity
activitySchema.methods.createFollowUp = async function(followUpData) {
  const followUpActivity = new this.constructor({
    ...followUpData,
    parentActivityId: this._id,
    ownerId: this.ownerId,
    createdBy: this.ownerId,
    leadId: this.leadId,
    contactId: this.contactId,
    accountId: this.accountId,
    opportunityId: this.opportunityId
  });
  
  await followUpActivity.save();
  
  // Update current activity
  this.followUpRequired = false;
  this.followUpActivityId = followUpActivity._id;
  await this.save();
  
  return followUpActivity;
};

// Instance method to add attendee
activitySchema.methods.addAttendee = function(attendeeData) {
  this.attendees.push(attendeeData);
  return this.save();
};

// Instance method to update attendee response
activitySchema.methods.updateAttendeeResponse = function(attendeeId, responseStatus) {
  const attendee = this.attendees.id(attendeeId);
  if (attendee) {
    attendee.responseStatus = responseStatus;
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to clone activity
activitySchema.methods.clone = function(modifications = {}) {
  const clonedData = this.toObject();
  delete clonedData._id;
  delete clonedData.id;
  delete clonedData.createdAt;
  delete clonedData.updatedAt;
  delete clonedData.isCompleted;
  delete clonedData.completedDate;
  delete clonedData.status;
  
  // Apply modifications
  Object.assign(clonedData, modifications);
  
  // Reset status for cloned activity
  clonedData.status = 'Not Started';
  
  return new this.constructor(clonedData);
};

module.exports = mongoose.model('Activity', activitySchema);