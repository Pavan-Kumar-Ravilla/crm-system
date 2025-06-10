// backend/models/Lead.js
const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot be more than 50 characters'],
    minlength: [2, 'First name must be at least 2 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot be more than 50 characters'],
    minlength: [2, 'Last name must be at least 2 characters']
  },
  company: {
    type: String,
    required: [true, 'Company is required'],
    trim: true,
    maxlength: [100, 'Company name cannot be more than 100 characters'],
    index: true
  },
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
  status: {
    type: String,
    enum: {
      values: ['New', 'Contacted', 'Qualified', 'Unqualified'],
      message: 'Status must be New, Contacted, Qualified, or Unqualified'
    },
    default: 'New',
    index: true
  },
  leadSource: {
    type: String,
    enum: {
      values: ['Website', 'Phone Inquiry', 'Partner Referral', 'Trade Show', 'Web', 'Email Campaign', 'Social Media', 'Other'],
      message: 'Lead source must be a valid option'
    },
    default: 'Website',
    index: true
  },
  rating: {
    type: String,
    enum: ['Hot', 'Warm', 'Cold'],
    default: 'Cold'
  },
  industry: {
    type: String,
    trim: true,
    maxlength: [100, 'Industry cannot be more than 100 characters']
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid website URL']
  },
  annualRevenue: {
    type: Number,
    min: [0, 'Annual revenue cannot be negative']
  },
  numberOfEmployees: {
    type: Number,
    min: [0, 'Number of employees cannot be negative']
  },
  address: {
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
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [2000, 'Notes cannot be more than 2000 characters']
  },
  
  // Conversion tracking
  isConverted: {
    type: Boolean,
    default: false,
    index: true
  },
  convertedDate: {
    type: Date
  },
  convertedContactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact'
  },
  convertedAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account'
  },
  convertedOpportunityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity'
  },
  
  // Assignment and ownership
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Lead must have an owner'],
    index: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  
  // Campaign tracking
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign'
  },
  
  // Qualification fields
  budget: {
    type: Number,
    min: [0, 'Budget cannot be negative']
  },
  timeline: {
    type: String,
    enum: ['Immediate', '1-3 months', '3-6 months', '6-12 months', '12+ months'],
    trim: true
  },
  authority: {
    type: String,
    enum: ['Decision Maker', 'Influencer', 'End User', 'Other'],
    trim: true
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
  lastContactedDate: {
    type: Date
  },
  
  // System fields
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
leadSchema.index({ createdAt: -1 });
leadSchema.index({ updatedAt: -1 });
leadSchema.index({ email: 1, company: 1 }, { sparse: true });
leadSchema.index({ firstName: 1, lastName: 1 });
leadSchema.index({ ownerId: 1, status: 1 });
leadSchema.index({ leadSource: 1, createdAt: -1 });

// Compound index for common queries
leadSchema.index({ 
  ownerId: 1, 
  status: 1, 
  isActive: 1, 
  createdAt: -1 
});

// Text index for search functionality
leadSchema.index({
  firstName: 'text',
  lastName: 'text',
  company: 'text',
  email: 'text',
  title: 'text',
  description: 'text',
  notes: 'text'
}, {
  weights: {
    firstName: 10,
    lastName: 10,
    company: 8,
    email: 6,
    title: 4,
    description: 2,
    notes: 1
  },
  name: 'lead_text_index'
});

// Virtual for full name
leadSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for full address
leadSchema.virtual('fullAddress').get(function() {
  if (!this.address) return '';
  
  const parts = [
    this.address.street,
    this.address.city,
    this.address.state,
    this.address.zipCode,
    this.address.country
  ].filter(Boolean);
  
  return parts.join(', ');
});

// Virtual for age in days
leadSchema.virtual('ageInDays').get(function() {
  return Math.floor((new Date() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for days since last activity
leadSchema.virtual('daysSinceLastActivity').get(function() {
  if (!this.lastActivityDate) return null;
  return Math.floor((new Date() - this.lastActivityDate) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware
leadSchema.pre('save', function(next) {
  // Set conversion date when lead is converted
  if (this.isModified('isConverted') && this.isConverted && !this.convertedDate) {
    this.convertedDate = new Date();
  }
  
  // Update updatedBy field
  if (this.isModified() && !this.isNew) {
    this.updatedBy = this.ownerId; // This should be set by the controller
  }
  
  next();
});

// Static methods

// Find leads by owner with pagination and filtering
leadSchema.statics.findByOwner = function(ownerId, options = {}) {
  const {
    page = 1,
    limit = 20,
    status,
    leadSource,
    isConverted,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = options;

  const skip = (page - 1) * limit;
  const query = { ownerId, isActive: true };
  
  // Add filters
  if (status) query.status = status;
  if (leadSource) query.leadSource = leadSource;
  if (typeof isConverted === 'boolean') query.isConverted = isConverted;
  
  // Add search
  if (search) {
    query.$text = { $search: search };
  }
  
  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  
  return this.find(query)
    .populate('ownerId', 'firstName lastName email')
    .populate('assignedTo', 'firstName lastName email')
    .populate('convertedContactId', 'firstName lastName email')
    .populate('convertedAccountId', 'name')
    .populate('convertedOpportunityId', 'name amount')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();
};

// Get lead statistics
leadSchema.statics.getStats = function(ownerId, dateRange = {}) {
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
        totalLeads: { $sum: 1 },
        convertedLeads: {
          $sum: { $cond: [{ $eq: ['$isConverted', true] }, 1, 0] }
        },
        byStatus: {
          $push: {
            status: '$status',
            count: 1
          }
        },
        bySource: {
          $push: {
            source: '$leadSource',
            count: 1
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalLeads: 1,
        convertedLeads: 1,
        conversionRate: {
          $cond: [
            { $eq: ['$totalLeads', 0] },
            0,
            { $multiply: [{ $divide: ['$convertedLeads', '$totalLeads'] }, 100] }
          ]
        },
        byStatus: 1,
        bySource: 1
      }
    }
  ]);
};

// Convert lead to contact/account/opportunity
leadSchema.methods.convert = async function(conversionData = {}) {
  const { createContact = true, createAccount = true, createOpportunity = false } = conversionData;
  
  if (this.isConverted) {
    throw new Error('Lead is already converted');
  }
  
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    let convertedContactId, convertedAccountId, convertedOpportunityId;
    
    // Create Account if requested
    if (createAccount) {
      const Account = mongoose.model('Account');
      const account = await Account.create([{
        name: this.company,
        type: 'Prospect',
        industry: this.industry,
        website: this.website,
        phone: this.phone,
        annualRevenue: this.annualRevenue,
        employees: this.numberOfEmployees,
        billingAddress: this.address,
        description: this.description,
        ownerId: this.ownerId,
        createdBy: this.ownerId
      }], { session });
      
      convertedAccountId = account[0]._id;
    }
    
    // Create Contact if requested
    if (createContact) {
      const Contact = mongoose.model('Contact');
      const contact = await Contact.create([{
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        phone: this.phone,
        mobilePhone: this.mobilePhone,
        title: this.title,
        accountId: convertedAccountId,
        mailingAddress: this.address,
        description: this.description,
        leadSource: this.leadSource,
        ownerId: this.ownerId,
        createdBy: this.ownerId
      }], { session });
      
      convertedContactId = contact[0]._id;
    }
    
    // Create Opportunity if requested
    if (createOpportunity && conversionData.opportunityData) {
      const Opportunity = mongoose.model('Opportunity');
      const opportunity = await Opportunity.create([{
        ...conversionData.opportunityData,
        accountId: convertedAccountId,
        primaryContactId: convertedContactId,
        leadSource: this.leadSource,
        ownerId: this.ownerId,
        createdBy: this.ownerId
      }], { session });
      
      convertedOpportunityId = opportunity[0]._id;
    }
    
    // Update lead
    this.isConverted = true;
    this.convertedDate = new Date();
    this.convertedContactId = convertedContactId;
    this.convertedAccountId = convertedAccountId;
    this.convertedOpportunityId = convertedOpportunityId;
    this.status = 'Qualified';
    
    await this.save({ session });
    
    await session.commitTransaction();
    
    return {
      contact: convertedContactId,
      account: convertedAccountId,
      opportunity: convertedOpportunityId
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Instance method to update last activity
leadSchema.methods.updateLastActivity = function(activityDate = new Date()) {
  this.lastActivityDate = activityDate;
  this.lastContactedDate = activityDate;
  return this.save();
};

// Instance method to check if lead is hot (based on recent activity)
leadSchema.methods.isHot = function() {
  if (!this.lastActivityDate) return false;
  const daysSinceActivity = this.daysSinceLastActivity;
  return daysSinceActivity !== null && daysSinceActivity <= 7;
};

module.exports = mongoose.model('Lead', leadSchema);