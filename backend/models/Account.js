// backend/models/Account.js
const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Account name is required'],
    trim: true,
    maxlength: [100, 'Account name cannot be more than 100 characters'],
    index: true
  },
  type: {
    type: String,
    enum: {
      values: ['Customer', 'Prospect', 'Partner', 'Competitor', 'Other'],
      message: 'Account type must be Customer, Prospect, Partner, Competitor, or Other'
    },
    default: 'Prospect',
    index: true
  },
  industry: {
    type: String,
    enum: {
      values: [
        'Technology', 'Healthcare', 'Finance', 'Manufacturing', 
        'Retail', 'Education', 'Government', 'Non-profit', 
        'Real Estate', 'Transportation', 'Energy', 'Agriculture',
        'Entertainment', 'Hospitality', 'Construction', 'Other'
      ],
      message: 'Industry must be a valid option'
    },
    index: true
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid website URL']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  fax: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid fax number']
  },
  
  // Financial Information
  annualRevenue: {
    type: Number,
    min: [0, 'Annual revenue cannot be negative']
  },
  employees: {
    type: Number,
    min: [0, 'Number of employees cannot be negative']
  },
  
  // Company Details
  ownership: {
    type: String,
    enum: ['Public', 'Private', 'Subsidiary', 'Government', 'Non-profit', 'Other']
  },
  tickerSymbol: {
    type: String,
    trim: true,
    uppercase: true,
    maxlength: [10, 'Ticker symbol cannot be more than 10 characters']
  },
  rating: {
    type: String,
    enum: ['Hot', 'Warm', 'Cold'],
    default: 'Cold'
  },
  
  // Parent-Child Relationships
  parentAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account'
  },
  
  // Address Information
  billingAddress: {
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
  
  shippingAddress: {
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
  
  // SLA Information
  slaType: {
    type: String,
    enum: ['Gold', 'Silver', 'Bronze', 'None'],
    default: 'None'
  },
  slaExpiryDate: {
    type: Date
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
  
  // System fields
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Account must have an owner'],
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
accountSchema.index({ createdAt: -1 });
accountSchema.index({ updatedAt: -1 });
accountSchema.index({ name: 1, type: 1 });
accountSchema.index({ ownerId: 1, type: 1 });
accountSchema.index({ industry: 1, type: 1 });
accountSchema.index({ annualRevenue: -1 });
accountSchema.index({ employees: -1 });

// Compound index for common queries
accountSchema.index({ 
  ownerId: 1, 
  type: 1, 
  isActive: 1, 
  createdAt: -1 
});

// Text index for search functionality
accountSchema.index({
  name: 'text',
  description: 'text',
  'billingAddress.city': 'text',
  'billingAddress.state': 'text',
  'billingAddress.country': 'text'
}, {
  weights: {
    name: 10,
    description: 2,
    'billingAddress.city': 1,
    'billingAddress.state': 1,
    'billingAddress.country': 1
  },
  name: 'account_text_index'
});

// Virtual for full billing address
accountSchema.virtual('fullBillingAddress').get(function() {
  if (!this.billingAddress) return '';
  
  const parts = [
    this.billingAddress.street,
    this.billingAddress.city,
    this.billingAddress.state,
    this.billingAddress.zipCode,
    this.billingAddress.country
  ].filter(Boolean);
  
  return parts.join(', ');
});

// Virtual for full shipping address
accountSchema.virtual('fullShippingAddress').get(function() {
  if (!this.shippingAddress) return '';
  
  const parts = [
    this.shippingAddress.street,
    this.shippingAddress.city,
    this.shippingAddress.state,
    this.shippingAddress.zipCode,
    this.shippingAddress.country
  ].filter(Boolean);
  
  return parts.join(', ');
});

// Virtual for child accounts count
accountSchema.virtual('childAccountsCount', {
  ref: 'Account',
  localField: '_id',
  foreignField: 'parentAccountId',
  count: true
});

// Virtual for contacts count
accountSchema.virtual('contactsCount', {
  ref: 'Contact',
  localField: '_id',
  foreignField: 'accountId',
  count: true
});

// Virtual for opportunities count
accountSchema.virtual('opportunitiesCount', {
  ref: 'Opportunity',
  localField: '_id',
  foreignField: 'accountId',
  count: true
});

// Virtual for total opportunity amount
accountSchema.virtual('totalOpportunityAmount').get(function() {
  // This would need to be populated separately in queries
  return this._totalOpportunityAmount || 0;
});

// Virtual for days since last activity
accountSchema.virtual('daysSinceLastActivity').get(function() {
  if (!this.lastActivityDate) return null;
  return Math.floor((new Date() - this.lastActivityDate) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware
accountSchema.pre('save', function(next) {
  // Update updatedBy field
  if (this.isModified() && !this.isNew) {
    this.updatedBy = this.ownerId; // This should be set by the controller
  }
  
  // Ensure shipping address defaults to billing address if not provided
  if (this.isModified('billingAddress') && (!this.shippingAddress || 
      Object.keys(this.shippingAddress.toObject()).every(key => !this.shippingAddress[key]))) {
    this.shippingAddress = this.billingAddress;
  }
  
  next();
});

// Static methods

// Find accounts by owner with pagination and filtering
accountSchema.statics.findByOwner = function(ownerId, options = {}) {
  const {
    page = 1,
    limit = 20,
    type,
    industry,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = options;

  const skip = (page - 1) * limit;
  const query = { ownerId, isActive: true };
  
  // Add filters
  if (type) query.type = type;
  if (industry) query.industry = industry;
  
  // Add search
  if (search) {
    query.$text = { $search: search };
  }
  
  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  
  return this.find(query)
    .populate('ownerId', 'firstName lastName email')
    .populate('parentAccountId', 'name type')
    .populate('createdBy', 'firstName lastName email')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();
};

// Get account statistics
accountSchema.statics.getStats = function(ownerId, dateRange = {}) {
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
        totalAccounts: { $sum: 1 },
        totalRevenue: { $sum: '$annualRevenue' },
        totalEmployees: { $sum: '$employees' },
        byType: {
          $push: {
            type: '$type',
            count: 1
          }
        },
        byIndustry: {
          $push: {
            industry: '$industry',
            count: 1
          }
        },
        avgRevenue: { $avg: '$annualRevenue' },
        avgEmployees: { $avg: '$employees' }
      }
    },
    {
      $project: {
        _id: 0,
        totalAccounts: 1,
        totalRevenue: 1,
        totalEmployees: 1,
        avgRevenue: { $round: ['$avgRevenue', 2] },
        avgEmployees: { $round: ['$avgEmployees', 0] },
        byType: 1,
        byIndustry: 1
      }
    }
  ]);
};

// Get accounts with related data summary
accountSchema.statics.getAccountSummary = function(accountId) {
  return this.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(accountId), isActive: true } },
    {
      $lookup: {
        from: 'contacts',
        localField: '_id',
        foreignField: 'accountId',
        as: 'contacts',
        pipeline: [{ $match: { isActive: true } }]
      }
    },
    {
      $lookup: {
        from: 'opportunities',
        localField: '_id',
        foreignField: 'accountId',
        as: 'opportunities',
        pipeline: [{ $match: { isActive: true } }]
      }
    },
    {
      $lookup: {
        from: 'activities',
        localField: '_id',
        foreignField: 'accountId',
        as: 'activities',
        pipeline: [
          { $match: { isActive: true } },
          { $sort: { createdAt: -1 } },
          { $limit: 10 }
        ]
      }
    },
    {
      $addFields: {
        contactsCount: { $size: '$contacts' },
        opportunitiesCount: { $size: '$opportunities' },
        activitiesCount: { $size: '$activities' },
        totalOpportunityAmount: {
          $sum: '$opportunities.amount'
        },
        wonOpportunitiesCount: {
          $size: {
            $filter: {
              input: '$opportunities',
              cond: { $eq: ['$$this.stage', 'Closed Won'] }
            }
          }
        },
        wonOpportunityAmount: {
          $sum: {
            $map: {
              input: {
                $filter: {
                  input: '$opportunities',
                  cond: { $eq: ['$$this.stage', 'Closed Won'] }
                }
              },
              in: '$$this.amount'
            }
          }
        }
      }
    }
  ]);
};

// Instance method to update last activity
accountSchema.methods.updateLastActivity = function(activityDate = new Date()) {
  this.lastActivityDate = activityDate;
  return this.save();
};

// Instance method to get child accounts
accountSchema.methods.getChildAccounts = function() {
  return this.constructor.find({
    parentAccountId: this._id,
    isActive: true
  }).populate('ownerId', 'firstName lastName email');
};

// Instance method to get account hierarchy
accountSchema.methods.getAccountHierarchy = async function() {
  const childAccounts = await this.getChildAccounts();
  const result = {
    account: this,
    children: []
  };
  
  for (const child of childAccounts) {
    const childHierarchy = await child.getAccountHierarchy();
    result.children.push(childHierarchy);
  }
  
  return result;
};

// Instance method to check if account is hot (based on recent activity)
accountSchema.methods.isHot = function() {
  if (!this.lastActivityDate) return false;
  const daysSinceActivity = this.daysSinceLastActivity;
  return daysSinceActivity !== null && daysSinceActivity <= 7;
};

module.exports = mongoose.model('Account', accountSchema);