// backend/models/Contact.js
const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot be more than 50 characters'],
    minlength: [2, 'First name must be at least 2 characters'],
    index: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot be more than 50 characters'],
    minlength: [2, 'Last name must be at least 2 characters'],
    index: true
  },
  
  // Contact Information
  email: {
    type: String,
    trim: true,
    lowercase: true,
    sparse: true, // Allow multiple documents with null email
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    index: true
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  mobilePhone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid mobile phone number']
  },
  homePhone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid home phone number']
  },
  fax: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid fax number']
  },
  
  // Professional Information
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters'],
    index: true
  },
  department: {
    type: String,
    trim: true,
    maxlength: [100, 'Department cannot be more than 100 characters'],
    index: true
  },
  
  // Account Relationship
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    index: true
  },
  
  // Reporting Structure
  reportsToId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact'
  },
  
  // Address Information
  mailingAddress: {
    street: {
      type: String,
      trim: true,
      maxlength: [255, 'Street address cannot be more than 255 characters']
    },
    city: {
      type: String,
      trim: true,
      maxlength: [100, 'City cannot be more than 100 characters']
    },
    state: {
      type: String,
      trim: true,
      maxlength: [100, 'State cannot be more than 100 characters']
    },
    zipCode: {
      type: String,
      trim: true,
      maxlength: [20, 'Zip code cannot be more than 20 characters']
    },
    country: {
      type: String,
      trim: true,
      maxlength: [100, 'Country cannot be more than 100 characters']
    }
  },
  
  otherAddress: {
    street: {
      type: String,
      trim: true,
      maxlength: [255, 'Street address cannot be more than 255 characters']
    },
    city: {
      type: String,
      trim: true,
      maxlength: [100, 'City cannot be more than 100 characters']
    },
    state: {
      type: String,
      trim: true,
      maxlength: [100, 'State cannot be more than 100 characters']
    },
    zipCode: {
      type: String,
      trim: true,
      maxlength: [20, 'Zip code cannot be more than 20 characters']
    },
    country: {
      type: String,
      trim: true,
      maxlength: [100, 'Country cannot be more than 100 characters']
    }
  },
  
  // Additional Information
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  
  // Lead Source (if converted from lead)
  leadSource: {
    type: String,
    enum: ['Website', 'Phone Inquiry', 'Partner Referral', 'Trade Show', 'Web', 'Email Campaign', 'Social Media', 'Other']
  },
  
  // Personal Information
  birthdate: {
    type: Date
  },
  assistantName: {
    type: String,
    trim: true,
    maxlength: [100, 'Assistant name cannot be more than 100 characters']
  },
  assistantPhone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid assistant phone number']
  },
  
  // Social Media
  linkedInProfile: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid LinkedIn URL']
  },
  twitterHandle: {
    type: String,
    trim: true,
    maxlength: [50, 'Twitter handle cannot be more than 50 characters']
  },
  
  // Email and Communication Preferences
  emailOptOut: {
    type: Boolean,
    default: false
  },
  doNotCall: {
    type: Boolean,
    default: false
  },
  hasOptedOutOfEmail: {
    type: Boolean,
    default: false
  },
  hasOptedOutOfFax: {
    type: Boolean,
    default: false
  },
  
  // Activity tracking
  lastActivityDate: {
    type: Date,
    index: true
  },
  nextActivityDate: {
    type: Date,
    index: true
  },
  lastEmailDate: {
    type: Date
  },
  lastCallDate: {
    type: Date
  },
  
  // System fields
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Contact must have an owner'],
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
contactSchema.index({ createdAt: -1 });
contactSchema.index({ updatedAt: -1 });
contactSchema.index({ firstName: 1, lastName: 1 });
contactSchema.index({ email: 1, accountId: 1 }, { sparse: true });
contactSchema.index({ ownerId: 1, isActive: 1 });
contactSchema.index({ accountId: 1, isActive: 1 });
contactSchema.index({ title: 1, department: 1 });
contactSchema.index({ lastActivityDate: -1 });

// Compound index for common queries
contactSchema.index({ 
  ownerId: 1, 
  accountId: 1, 
  isActive: 1, 
  createdAt: -1 
});

// Text index for search functionality
contactSchema.index({
  firstName: 'text',
  lastName: 'text',
  email: 'text',
  title: 'text',
  department: 'text',
  description: 'text'
}, {
  weights: {
    firstName: 10,
    lastName: 10,
    email: 8,
    title: 6,
    department: 4,
    description: 2
  },
  name: 'contact_text_index'
});

// Virtual for full name
contactSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for full mailing address
contactSchema.virtual('fullMailingAddress').get(function() {
  if (!this.mailingAddress) return '';
  
  const parts = [
    this.mailingAddress.street,
    this.mailingAddress.city,
    this.mailingAddress.state,
    this.mailingAddress.zipCode,
    this.mailingAddress.country
  ].filter(Boolean);
  
  return parts.join(', ');
});

// Virtual for full other address
contactSchema.virtual('fullOtherAddress').get(function() {
  if (!this.otherAddress) return '';
  
  const parts = [
    this.otherAddress.street,
    this.otherAddress.city,
    this.otherAddress.state,
    this.otherAddress.zipCode,
    this.otherAddress.country
  ].filter(Boolean);
  
  return parts.join(', ');
});

// Virtual for primary phone
contactSchema.virtual('primaryPhone').get(function() {
  return this.mobilePhone || this.phone || this.homePhone;
});

// Virtual for age (if birthdate is provided)
contactSchema.virtual('age').get(function() {
  if (!this.birthdate) return null;
  const today = new Date();
  const birthDate = new Date(this.birthdate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Virtual for days since last activity
contactSchema.virtual('daysSinceLastActivity').get(function() {
  if (!this.lastActivityDate) return null;
  return Math.floor((new Date() - this.lastActivityDate) / (1000 * 60 * 60 * 24));
});

// Virtual for direct reports count
contactSchema.virtual('directReportsCount', {
  ref: 'Contact',
  localField: '_id',
  foreignField: 'reportsToId',
  count: true
});

// Virtual for opportunities count (as primary contact)
contactSchema.virtual('opportunitiesCount', {
  ref: 'Opportunity',
  localField: '_id',
  foreignField: 'primaryContactId',
  count: true
});

// Pre-save middleware
contactSchema.pre('save', function(next) {
  // Update updatedBy field
  if (this.isModified() && !this.isNew) {
    this.updatedBy = this.ownerId; // This should be set by the controller
  }
  
  // Ensure email is unique within the same account (if provided)
  if (this.isModified('email') && this.email && this.accountId) {
    // This validation will be handled at the controller level
  }
  
  next();
});

// Static methods

// Find contacts by owner with pagination and filtering
contactSchema.statics.findByOwner = function(ownerId, options = {}) {
  const {
    page = 1,
    limit = 20,
    accountId,
    department,
    title,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = options;

  const skip = (page - 1) * limit;
  const query = { ownerId, isActive: true };
  
  // Add filters
  if (accountId) query.accountId = accountId;
  if (department) query.department = department;
  if (title) query.title = new RegExp(title, 'i');
  
  // Add search
  if (search) {
    query.$text = { $search: search };
  }
  
  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  
  return this.find(query)
    .populate('ownerId', 'firstName lastName email')
    .populate('accountId', 'name type industry')
    .populate('reportsToId', 'firstName lastName email title')
    .populate('createdBy', 'firstName lastName email')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();
};

// Get contact statistics
contactSchema.statics.getStats = function(ownerId, dateRange = {}) {
  const { startDate, endDate } = dateRange;
  const matchStage = { ownerId: mongoose.Types.ObjectId(ownerId), isActive: true };
  
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
        totalContacts: { $sum: 1 },
        contactsWithEmail: {
          $sum: { $cond: [{ $ne: ['$email', null] }, 1, 0] }
        },
        contactsWithPhone: {
          $sum: { $cond: [{ $ne: ['$phone', null] }, 1, 0] }
        },
        byDepartment: {
          $push: {
            department: '$department',
            count: 1
          }
        },
        byTitle: {
          $push: {
            title: '$title',
            count: 1
          }
        },
        byAccount: {
          $push: {
            account: '$accountId',
            count: 1
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalContacts: 1,
        contactsWithEmail: 1,
        contactsWithPhone: 1,
        emailContactRate: {
          $cond: [
            { $eq: ['$totalContacts', 0] },
            0,
            { $multiply: [{ $divide: ['$contactsWithEmail', '$totalContacts'] }, 100] }
          ]
        },
        phoneContactRate: {
          $cond: [
            { $eq: ['$totalContacts', 0] },
            0,
            { $multiply: [{ $divide: ['$contactsWithPhone', '$totalContacts'] }, 100] }
          ]
        },
        byDepartment: 1,
        byTitle: 1,
        byAccount: 1
      }
    }
  ]);
};

// Find contacts by account
contactSchema.statics.findByAccount = function(accountId, options = {}) {
  const { limit = 50, includeInactive = false } = options;
  const query = { accountId, isActive: includeInactive ? { $in: [true, false] } : true };
  
  return this.find(query)
    .populate('reportsToId', 'firstName lastName email title')
    .sort({ title: -1, lastName: 1, firstName: 1 })
    .limit(parseInt(limit))
    .lean();
};

// Get contact hierarchy for an account
contactSchema.statics.getAccountHierarchy = async function(accountId) {
  const contacts = await this.find({ accountId, isActive: true })
    .populate('reportsToId', 'firstName lastName email title')
    .lean();
  
  // Build hierarchy tree
  const contactMap = new Map();
  const rootContacts = [];
  
  // First pass: create map and identify roots
  contacts.forEach(contact => {
    contactMap.set(contact._id.toString(), { ...contact, subordinates: [] });
    if (!contact.reportsToId) {
      rootContacts.push(contact._id.toString());
    }
  });
  
  // Second pass: build tree structure
  contacts.forEach(contact => {
    if (contact.reportsToId) {
      const manager = contactMap.get(contact.reportsToId._id.toString());
      if (manager) {
        manager.subordinates.push(contactMap.get(contact._id.toString()));
      }
    }
  });
  
  return rootContacts.map(id => contactMap.get(id));
};

// Instance method to update last activity
contactSchema.methods.updateLastActivity = function(activityDate = new Date(), activityType = 'general') {
  this.lastActivityDate = activityDate;
  
  // Update specific activity dates
  if (activityType === 'email') {
    this.lastEmailDate = activityDate;
  } else if (activityType === 'call') {
    this.lastCallDate = activityDate;
  }
  
  return this.save();
};

// Instance method to get direct reports
contactSchema.methods.getDirectReports = function() {
  return this.constructor.find({
    reportsToId: this._id,
    isActive: true
  }).populate('accountId', 'name').sort({ lastName: 1, firstName: 1 });
};

// Instance method to get organizational hierarchy
contactSchema.methods.getOrgHierarchy = async function() {
  const directReports = await this.getDirectReports();
  const result = {
    contact: this,
    subordinates: []
  };
  
  for (const report of directReports) {
    const reportHierarchy = await report.getOrgHierarchy();
    result.subordinates.push(reportHierarchy);
  }
  
  return result;
};

// Instance method to check if contact is hot (based on recent activity)
contactSchema.methods.isHot = function() {
  if (!this.lastActivityDate) return false;
  const daysSinceActivity = this.daysSinceLastActivity;
  return daysSinceActivity !== null && daysSinceActivity <= 7;
};

// Instance method to check if contact can be contacted
contactSchema.methods.canContact = function(method = 'email') {
  switch (method.toLowerCase()) {
    case 'email':
      return !this.emailOptOut && !this.hasOptedOutOfEmail && this.email;
    case 'phone':
    case 'call':
      return !this.doNotCall && this.primaryPhone;
    case 'fax':
      return !this.hasOptedOutOfFax && this.fax;
    default:
      return true;
  }
};

module.exports = mongoose.model('Contact', contactSchema);