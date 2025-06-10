// backend/models/Opportunity.js
const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Opportunity name is required'],
    trim: true,
    maxlength: [100, 'Opportunity name cannot be more than 100 characters'],
    index: true
  },
  
  // Account Relationship
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: [true, 'Account is required'],
    index: true
  },
  
  // Contact Relationship
  primaryContactId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    index: true
  },
  
  // Sales Process
  stage: {
    type: String,
    enum: {
      values: [
        'Prospecting', 'Qualification', 'Needs Analysis', 
        'Value Proposition', 'Id. Decision Makers', 'Perception Analysis',
        'Proposal/Price Quote', 'Negotiation/Review', 'Closed Won', 'Closed Lost'
      ],
      message: 'Stage must be a valid sales stage'
    },
    default: 'Prospecting',
    index: true
  },
  
  // Financial Information
  amount: {
    type: Number,
    min: [0, 'Amount cannot be negative'],
    default: 0,
    index: true
  },
  probability: {
    type: Number,
    min: [0, 'Probability cannot be less than 0'],
    max: [100, 'Probability cannot be more than 100'],
    default: 10
  },
  
  // Important Dates - FIXED: Removed duplicate index declaration
  closeDate: {
    type: Date,
    required: [true, 'Close date is required']
  },
  
  // Opportunity Details
  type: {
    type: String,
    enum: {
      values: [
        'Existing Customer - Upgrade', 
        'Existing Customer - Replacement', 
        'Existing Customer - Downgrade', 
        'New Customer'
      ],
      message: 'Type must be a valid opportunity type'
    }
  },
  
  leadSource: {
    type: String,
    enum: ['Website', 'Phone Inquiry', 'Partner Referral', 'Trade Show', 'Web', 'Email Campaign', 'Social Media', 'Other'],
    index: true
  },
  
  // Sales Process Information
  nextStep: {
    type: String,
    trim: true,
    maxlength: [255, 'Next step cannot be more than 255 characters']
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  
  // Competition Analysis
  competitorAnalysis: {
    type: String,
    trim: true,
    maxlength: [1000, 'Competitor analysis cannot be more than 1000 characters']
  },
  
  // Forecasting
  forecastCategory: {
    type: String,
    enum: {
      values: ['Pipeline', 'Best Case', 'Commit', 'Omitted'],
      message: 'Forecast category must be Pipeline, Best Case, Commit, or Omitted'
    },
    default: 'Pipeline',
    index: true
  },
  
  // Campaign Tracking
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign'
  },
  
  // Product Information
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    productName: {
      type: String,
      trim: true
    },
    quantity: {
      type: Number,
      min: [0, 'Quantity cannot be negative'],
      default: 1
    },
    unitPrice: {
      type: Number,
      min: [0, 'Unit price cannot be negative'],
      default: 0
    },
    totalPrice: {
      type: Number,
      min: [0, 'Total price cannot be negative'],
      default: 0
    },
    discount: {
      type: Number,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot be more than 100%'],
      default: 0
    }
  }],
  
  // Decision Makers
  decisionMakers: [{
    contactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contact'
    },
    role: {
      type: String,
      enum: ['Decision Maker', 'Influencer', 'Economic Buyer', 'Technical Buyer', 'End User'],
      required: true
    },
    influence: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium'
    }
  }],
  
  // Sales Team
  salesTeam: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['Primary', 'Support', 'Overlay', 'Manager'],
      default: 'Support'
    },
    splitPercentage: {
      type: Number,
      min: [0, 'Split percentage cannot be negative'],
      max: [100, 'Split percentage cannot be more than 100'],
      default: 0
    }
  }],
  
  // Activity tracking
  lastActivityDate: {
    type: Date,
    index: true
  },
  nextActivityDate: {
    type: Date,
    index: true
  },
  
  // Status flags
  isPrivate: {
    type: Boolean,
    default: false
  },
  isClosed: {
    type: Boolean,
    default: false,
    index: true
  },
  isWon: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // System fields
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Opportunity must have an owner'],
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
  
  // Dates for tracking
  firstContactDate: {
    type: Date
  },
  qualificationDate: {
    type: Date
  },
  proposalDate: {
    type: Date
  },
  negotiationDate: {
    type: Date
  },
  closedDate: {
    type: Date
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

// Indexes for better query performance - Create only ONE index per field
opportunitySchema.index({ createdAt: -1 });
opportunitySchema.index({ updatedAt: -1 });
opportunitySchema.index({ closeDate: 1 }); // Only ONE index for closeDate
opportunitySchema.index({ amount: -1 });
opportunitySchema.index({ ownerId: 1, stage: 1 });
opportunitySchema.index({ accountId: 1, stage: 1 });
opportunitySchema.index({ stage: 1, closeDate: 1 });
opportunitySchema.index({ forecastCategory: 1, closeDate: 1 });

// Compound indexes for common queries
opportunitySchema.index({ 
  ownerId: 1, 
  stage: 1, 
  isActive: 1, 
  closeDate: 1 
});

opportunitySchema.index({
  isClosed: 1,
  isWon: 1,
  closeDate: -1
});

// Text index for search functionality
opportunitySchema.index({
  name: 'text',
  description: 'text',
  nextStep: 'text',
  competitorAnalysis: 'text'
}, {
  weights: {
    name: 10,
    description: 4,
    nextStep: 6,
    competitorAnalysis: 2
  },
  name: 'opportunity_text_index'
});

// Virtual for weighted amount (amount * probability)
opportunitySchema.virtual('weightedAmount').get(function() {
  return Math.round((this.amount * this.probability) / 100);
});

// Virtual for days to close
opportunitySchema.virtual('daysToClose').get(function() {
  if (!this.closeDate) return null;
  const today = new Date();
  const closeDate = new Date(this.closeDate);
  return Math.ceil((closeDate - today) / (1000 * 60 * 60 * 24));
});

// Virtual for sales cycle length
opportunitySchema.virtual('salesCycleLength').get(function() {
  if (!this.closedDate) return null;
  const created = new Date(this.createdAt);
  const closed = new Date(this.closedDate);
  return Math.ceil((closed - created) / (1000 * 60 * 60 * 24));
});

// Virtual for days since last activity
opportunitySchema.virtual('daysSinceLastActivity').get(function() {
  if (!this.lastActivityDate) return null;
  return Math.floor((new Date() - this.lastActivityDate) / (1000 * 60 * 60 * 24));
});

// Virtual for total products value
opportunitySchema.virtual('totalProductsValue').get(function() {
  if (!this.products || this.products.length === 0) return 0;
  return this.products.reduce((total, product) => {
    const discountedPrice = product.totalPrice * (1 - (product.discount / 100));
    return total + discountedPrice;
  }, 0);
});

// Virtual for stage progress percentage
opportunitySchema.virtual('stageProgress').get(function() {
  const stageMap = {
    'Prospecting': 10,
    'Qualification': 20,
    'Needs Analysis': 30,
    'Value Proposition': 40,
    'Id. Decision Makers': 50,
    'Perception Analysis': 60,
    'Proposal/Price Quote': 70,
    'Negotiation/Review': 80,
    'Closed Won': 100,
    'Closed Lost': 0
  };
  return stageMap[this.stage] || 0;
});

// Virtual for is overdue
opportunitySchema.virtual('isOverdue').get(function() {
  if (this.isClosed) return false;
  return new Date() > new Date(this.closeDate);
});

// Pre-save middleware
opportunitySchema.pre('save', function(next) {
  // Update closed flags based on stage
  if (this.isModified('stage')) {
    if (this.stage === 'Closed Won') {
      this.isClosed = true;
      this.isWon = true;
      this.probability = 100;
      this.closedDate = new Date();
    } else if (this.stage === 'Closed Lost') {
      this.isClosed = true;
      this.isWon = false;
      this.probability = 0;
      this.closedDate = new Date();
    } else {
      this.isClosed = false;
      this.isWon = false;
      this.closedDate = undefined;
    }
    
    // Update stage-specific dates
    const now = new Date();
    switch (this.stage) {
      case 'Qualification':
        if (!this.qualificationDate) this.qualificationDate = now;
        break;
      case 'Proposal/Price Quote':
        if (!this.proposalDate) this.proposalDate = now;
        break;
      case 'Negotiation/Review':
        if (!this.negotiationDate) this.negotiationDate = now;
        break;
    }
  }
  
  // Auto-calculate total price for products
  if (this.isModified('products')) {
    this.products.forEach(product => {
      if (product.quantity && product.unitPrice) {
        product.totalPrice = product.quantity * product.unitPrice;
      }
    });
  }
  
  // Update updatedBy field
  if (this.isModified() && !this.isNew) {
    this.updatedBy = this.ownerId; // This should be set by the controller
  }
  
  next();
});

// Static methods

// Find opportunities by owner with pagination and filtering
opportunitySchema.statics.findByOwner = function(ownerId, options = {}) {
  const {
    page = 1,
    limit = 20,
    stage,
    accountId,
    forecastCategory,
    search,
    dateFrom,
    dateTo,
    sortBy = 'closeDate',
    sortOrder = 'asc'
  } = options;

  const skip = (page - 1) * limit;
  const query = { ownerId, isActive: true };
  
  // Add filters
  if (stage) query.stage = stage;
  if (accountId) query.accountId = accountId;
  if (forecastCategory) query.forecastCategory = forecastCategory;
  
  // Date range filter
  if (dateFrom || dateTo) {
    query.closeDate = {};
    if (dateFrom) query.closeDate.$gte = new Date(dateFrom);
    if (dateTo) query.closeDate.$lte = new Date(dateTo);
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
    .populate('accountId', 'name type industry')
    .populate('primaryContactId', 'firstName lastName email title')
    .populate('createdBy', 'firstName lastName email')
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();
};

// Get opportunity statistics
opportunitySchema.statics.getStats = function(ownerId, dateRange = {}) {
  const { startDate, endDate } = dateRange;
  const matchStage = { ownerId: mongoose.Types.ObjectId(ownerId), isActive: true };
  
  if (startDate || endDate) {
    matchStage.closeDate = {};
    if (startDate) matchStage.closeDate.$gte = new Date(startDate);
    if (endDate) matchStage.closeDate.$lte = new Date(endDate);
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalOpportunities: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalWeightedAmount: {
          $sum: { $multiply: ['$amount', { $divide: ['$probability', 100] }] }
        },
        wonOpportunities: {
          $sum: { $cond: [{ $eq: ['$isWon', true] }, 1, 0] }
        },
        wonAmount: {
          $sum: { $cond: [{ $eq: ['$isWon', true] }, '$amount', 0] }
        },
        lostOpportunities: {
          $sum: { $cond: [{ $and: [{ $eq: ['$isClosed', true] }, { $eq: ['$isWon', false] }] }, 1, 0] }
        },
        byStage: {
          $push: {
            stage: '$stage',
            count: 1,
            amount: '$amount'
          }
        },
        byForecastCategory: {
          $push: {
            category: '$forecastCategory',
            count: 1,
            amount: '$amount'
          }
        },
        avgAmount: { $avg: '$amount' },
        avgProbability: { $avg: '$probability' }
      }
    },
    {
      $project: {
        _id: 0,
        totalOpportunities: 1,
        totalAmount: { $round: ['$totalAmount', 2] },
        totalWeightedAmount: { $round: ['$totalWeightedAmount', 2] },
        wonOpportunities: 1,
        wonAmount: { $round: ['$wonAmount', 2] },
        lostOpportunities: 1,
        winRate: {
          $cond: [
            { $eq: [{ $add: ['$wonOpportunities', '$lostOpportunities'] }, 0] },
            0,
            {
              $multiply: [
                { $divide: ['$wonOpportunities', { $add: ['$wonOpportunities', '$lostOpportunities'] }] },
                100
              ]
            }
          ]
        },
        avgAmount: { $round: ['$avgAmount', 2] },
        avgProbability: { $round: ['$avgProbability', 1] },
        byStage: 1,
        byForecastCategory: 1
      }
    }
  ]);
};

// Get sales pipeline data
opportunitySchema.statics.getPipelineData = function(ownerId, options = {}) {
  const { forecastCategory } = options;
  const matchStage = { 
    ownerId: mongoose.Types.ObjectId(ownerId), 
    isActive: true,
    isClosed: false
  };
  
  if (forecastCategory) {
    matchStage.forecastCategory = forecastCategory;
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$stage',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalWeightedAmount: {
          $sum: { $multiply: ['$amount', { $divide: ['$probability', 100] }] }
        },
        avgProbability: { $avg: '$probability' },
        opportunities: {
          $push: {
            id: '$_id',
            name: '$name',
            amount: '$amount',
            probability: '$probability',
            closeDate: '$closeDate',
            accountId: '$accountId'
          }
        }
      }
    },
    {
      $project: {
        stage: '$_id',
        count: 1,
        totalAmount: { $round: ['$totalAmount', 2] },
        totalWeightedAmount: { $round: ['$totalWeightedAmount', 2] },
        avgProbability: { $round: ['$avgProbability', 1] },
        opportunities: 1
      }
    },
    { $sort: { stage: 1 } }
  ]);
};

// Get forecast data
opportunitySchema.statics.getForecastData = function(ownerId, options = {}) {
  const { quarter, year } = options;
  const currentYear = year || new Date().getFullYear();
  const currentQuarter = quarter || Math.ceil((new Date().getMonth() + 1) / 3);
  
  // Calculate quarter date range
  const quarterStart = new Date(currentYear, (currentQuarter - 1) * 3, 1);
  const quarterEnd = new Date(currentYear, currentQuarter * 3, 0);
  
  const matchStage = {
    ownerId: mongoose.Types.ObjectId(ownerId),
    isActive: true,
    closeDate: {
      $gte: quarterStart,
      $lte: quarterEnd
    }
  };
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$forecastCategory',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalWeightedAmount: {
          $sum: { $multiply: ['$amount', { $divide: ['$probability', 100] }] }
        }
      }
    },
    {
      $project: {
        category: '$_id',
        count: 1,
        totalAmount: { $round: ['$totalAmount', 2] },
        totalWeightedAmount: { $round: ['$totalWeightedAmount', 2] }
      }
    }
  ]);
};

// Instance method to update last activity
opportunitySchema.methods.updateLastActivity = function(activityDate = new Date()) {
  this.lastActivityDate = activityDate;
  return this.save();
};

// Instance method to add product
opportunitySchema.methods.addProduct = function(productData) {
  this.products.push(productData);
  return this.save();
};

// Instance method to add decision maker
opportunitySchema.methods.addDecisionMaker = function(contactId, role, influence = 'Medium') {
  this.decisionMakers.push({
    contactId,
    role,
    influence
  });
  return this.save();
};

// Instance method to add sales team member
opportunitySchema.methods.addSalesTeamMember = function(userId, role, splitPercentage = 0) {
  this.salesTeam.push({
    userId,
    role,
    splitPercentage
  });
  return this.save();
};

// Instance method to advance stage
opportunitySchema.methods.advanceStage = function() {
  const stages = [
    'Prospecting', 'Qualification', 'Needs Analysis', 
    'Value Proposition', 'Id. Decision Makers', 'Perception Analysis',
    'Proposal/Price Quote', 'Negotiation/Review', 'Closed Won'
  ];
  
  const currentIndex = stages.indexOf(this.stage);
  if (currentIndex >= 0 && currentIndex < stages.length - 1) {
    this.stage = stages[currentIndex + 1];
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Instance method to check if opportunity is stale
opportunitySchema.methods.isStale = function(staleDays = 30) {
  if (!this.lastActivityDate) return true;
  const daysSinceActivity = this.daysSinceLastActivity;
  return daysSinceActivity !== null && daysSinceActivity > staleDays;
};

module.exports = mongoose.model('Opportunity', opportunitySchema);