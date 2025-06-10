// backend/controllers/opportunityController.js
const Opportunity = require('../models/Opportunity');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

/**
 * Get all opportunities with filtering, pagination, and search
 * @route GET /api/opportunities
 * @access Private
 */
const getOpportunities = asyncHandler(async (req, res, next) => {
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
    sortOrder = 'asc',
    ownerId
  } = req.query;

  // Build query object
  const query = { isActive: true };
  
  // Role-based filtering
  if (req.user.role === 'sales_rep') {
    query.ownerId = req.user._id;
  } else if (req.user.role === 'manager') {
    // Managers can see opportunities from their team
  } else if (req.user.role === 'admin') {
    if (ownerId) query.ownerId = ownerId;
  }
  
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
  
  // Search functionality
  if (search) {
    query.$text = { $search: search };
  }
  
  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  
  // Execute query
  const [opportunities, totalCount] = await Promise.all([
    Opportunity.find(query)
      .populate('ownerId', 'firstName lastName email')
      .populate('accountId', 'name type industry')
      .populate('primaryContactId', 'firstName lastName email title')
      .populate('createdBy', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Opportunity.countDocuments(query)
  ]);
  
  // Calculate pagination info
  const totalPages = Math.ceil(totalCount / parseInt(limit));
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  res.status(200).json({
    status: 'success',
    data: {
      opportunities,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        limit: parseInt(limit),
        hasNextPage,
        hasPrevPage
      }
    }
  });
});

/**
 * Get single opportunity by ID
 * @route GET /api/opportunities/:id
 * @access Private
 */
const getOpportunity = asyncHandler(async (req, res, next) => {
  const opportunity = await Opportunity.findById(req.params.id)
    .populate('ownerId', 'firstName lastName email phone title')
    .populate('accountId', 'name type industry phone website')
    .populate('primaryContactId', 'firstName lastName email phone title')
    .populate('salesTeam.userId', 'firstName lastName email title')
    .populate('decisionMakers.contactId', 'firstName lastName email title')
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email');

  if (!opportunity) {
    return next(new AppError('Opportunity not found', 404, 'OPPORTUNITY_NOT_FOUND'));
  }

  // Check access permissions
  if (req.user.role === 'sales_rep' && opportunity.ownerId.toString() !== req.user._id.toString()) {
    return next(new AppError('Access denied. You can only view your own opportunities.', 403, 'ACCESS_DENIED'));
  }

  res.status(200).json({
    status: 'success',
    data: {
      opportunity
    }
  });
});

/**
 * Create new opportunity
 * @route POST /api/opportunities
 * @access Private
 */
const createOpportunity = asyncHandler(async (req, res, next) => {
  // Set owner and creator
  req.body.ownerId = req.body.ownerId || req.user._id;
  req.body.createdBy = req.user._id;
  
  // Only admins and managers can assign opportunities to other users
  if (req.body.ownerId !== req.user._id.toString() && !['admin', 'manager'].includes(req.user.role)) {
    return next(new AppError('You can only create opportunities for yourself', 403, 'ACCESS_DENIED'));
  }

  const opportunity = await Opportunity.create(req.body);
  
  // Populate the created opportunity
  await opportunity.populate([
    { path: 'ownerId', select: 'firstName lastName email' },
    { path: 'accountId', select: 'name type' },
    { path: 'primaryContactId', select: 'firstName lastName email' },
    { path: 'createdBy', select: 'firstName lastName email' }
  ]);

  res.status(201).json({
    status: 'success',
    message: 'Opportunity created successfully',
    data: {
      opportunity
    }
  });
});

/**
 * Update opportunity
 * @route PUT /api/opportunities/:id
 * @access Private
 */
const updateOpportunity = asyncHandler(async (req, res, next) => {
  const opportunity = await Opportunity.findById(req.params.id);

  if (!opportunity) {
    return next(new AppError('Opportunity not found', 404, 'OPPORTUNITY_NOT_FOUND'));
  }

  // Check access permissions
  if (req.user.role === 'sales_rep' && opportunity.ownerId.toString() !== req.user._id.toString()) {
    return next(new AppError('Access denied. You can only update your own opportunities.', 403, 'ACCESS_DENIED'));
  }

  // Prevent changing owner unless admin/manager
  if (req.body.ownerId && req.body.ownerId !== opportunity.ownerId.toString() && !['admin', 'manager'].includes(req.user.role)) {
    return next(new AppError('You cannot change the opportunity owner', 403, 'ACCESS_DENIED'));
  }

  // Set updatedBy
  req.body.updatedBy = req.user._id;

  const updatedOpportunity = await Opportunity.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).populate([
    { path: 'ownerId', select: 'firstName lastName email' },
    { path: 'accountId', select: 'name type' },
    { path: 'primaryContactId', select: 'firstName lastName email' },
    { path: 'updatedBy', select: 'firstName lastName email' }
  ]);

  res.status(200).json({
    status: 'success',
    message: 'Opportunity updated successfully',
    data: {
      opportunity: updatedOpportunity
    }
  });
});

/**
 * Delete opportunity (soft delete)
 * @route DELETE /api/opportunities/:id
 * @access Private
 */
const deleteOpportunity = asyncHandler(async (req, res, next) => {
  const opportunity = await Opportunity.findById(req.params.id);

  if (!opportunity) {
    return next(new AppError('Opportunity not found', 404, 'OPPORTUNITY_NOT_FOUND'));
  }

  // Check access permissions
  if (req.user.role === 'sales_rep' && opportunity.ownerId.toString() !== req.user._id.toString()) {
    return next(new AppError('Access denied. You can only delete your own opportunities.', 403, 'ACCESS_DENIED'));
  }

  // Soft delete
  await Opportunity.findByIdAndUpdate(req.params.id, {
    isActive: false,
    updatedBy: req.user._id
  });

  res.status(200).json({
    status: 'success',
    message: 'Opportunity deleted successfully'
  });
});

/**
 * Get opportunity statistics
 * @route GET /api/opportunities/stats
 * @access Private
 */
const getOpportunityStats = asyncHandler(async (req, res, next) => {
  const { dateFrom, dateTo, ownerId } = req.query;
  
  // Determine which opportunities to include based on user role
  let targetOwnerId = req.user._id;
  if (req.user.role === 'admin' && ownerId) {
    targetOwnerId = ownerId;
  } else if (req.user.role === 'manager') {
    targetOwnerId = ownerId || req.user._id;
  }

  const dateRange = {};
  if (dateFrom) dateRange.startDate = dateFrom;
  if (dateTo) dateRange.endDate = dateTo;

  const stats = await Opportunity.getStats(targetOwnerId, dateRange);

  res.status(200).json({
    status: 'success',
    data: {
      stats: stats[0] || {
        totalOpportunities: 0,
        totalAmount: 0,
        totalWeightedAmount: 0,
        wonOpportunities: 0,
        wonAmount: 0,
        lostOpportunities: 0,
        winRate: 0,
        avgAmount: 0,
        avgProbability: 0,
        byStage: [],
        byForecastCategory: []
      }
    }
  });
});

/**
 * Get sales pipeline data
 * @route GET /api/opportunities/pipeline
 * @access Private
 */
const getPipelineData = asyncHandler(async (req, res, next) => {
  const { forecastCategory } = req.query;
  
  let targetOwnerId = req.user._id;
  if (req.user.role === 'admin' || req.user.role === 'manager') {
    targetOwnerId = req.query.ownerId || req.user._id;
  }

  const pipelineData = await Opportunity.getPipelineData(targetOwnerId, { forecastCategory });

  res.status(200).json({
    status: 'success',
    data: {
      pipeline: pipelineData
    }
  });
});

/**
 * Get forecast data
 * @route GET /api/opportunities/forecast
 * @access Private
 */
const getForecastData = asyncHandler(async (req, res, next) => {
  const { quarter, year } = req.query;
  
  let targetOwnerId = req.user._id;
  if (req.user.role === 'admin' || req.user.role === 'manager') {
    targetOwnerId = req.query.ownerId || req.user._id;
  }

  const forecastData = await Opportunity.getForecastData(targetOwnerId, { quarter, year });

  res.status(200).json({
    status: 'success',
    data: {
      forecast: forecastData
    }
  });
});

/**
 * Get recent opportunities
 * @route GET /api/opportunities/recent
 * @access Private
 */
const getRecentOpportunities = asyncHandler(async (req, res, next) => {
  const { limit = 10 } = req.query;
  
  const query = { isActive: true };
  
  // Role-based filtering
  if (req.user.role === 'sales_rep') {
    query.ownerId = req.user._id;
  }
  
  const opportunities = await Opportunity.find(query)
    .populate('ownerId', 'firstName lastName email')
    .populate('accountId', 'name type')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .lean();

  res.status(200).json({
    status: 'success',
    data: {
      opportunities
    }
  });
});

/**
 * Bulk update opportunities
 * @route PUT /api/opportunities/bulk-update
 * @access Private (Admin/Manager only)
 */
const bulkUpdateOpportunities = asyncHandler(async (req, res, next) => {
  if (!['admin', 'manager'].includes(req.user.role)) {
    return next(new AppError('Access denied. Bulk operations require admin or manager role.', 403, 'ACCESS_DENIED'));
  }

  const { opportunityIds, updates } = req.body;

  if (!opportunityIds || !Array.isArray(opportunityIds) || opportunityIds.length === 0) {
    return next(new AppError('Please provide an array of opportunity IDs', 400, 'INVALID_INPUT'));
  }

  if (!updates || Object.keys(updates).length === 0) {
    return next(new AppError('Please provide fields to update', 400, 'INVALID_INPUT'));
  }

  // Add updatedBy to updates
  updates.updatedBy = req.user._id;

  const result = await Opportunity.updateMany(
    { _id: { $in: opportunityIds }, isActive: true },
    updates,
    { runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    message: `${result.modifiedCount} opportunities updated successfully`,
    data: {
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    }
  });
});

/**
 * Bulk delete opportunities
 * @route DELETE /api/opportunities/bulk-delete
 * @access Private (Admin/Manager only)
 */
const bulkDeleteOpportunities = asyncHandler(async (req, res, next) => {
  if (!['admin', 'manager'].includes(req.user.role)) {
    return next(new AppError('Access denied. Bulk operations require admin or manager role.', 403, 'ACCESS_DENIED'));
  }

  const { opportunityIds } = req.body;

  if (!opportunityIds || !Array.isArray(opportunityIds) || opportunityIds.length === 0) {
    return next(new AppError('Please provide an array of opportunity IDs', 400, 'INVALID_INPUT'));
  }

  const result = await Opportunity.updateMany(
    { _id: { $in: opportunityIds }, isActive: true },
    { 
      isActive: false,
      updatedBy: req.user._id
    }
  );

  res.status(200).json({
    status: 'success',
    message: `${result.modifiedCount} opportunities deleted successfully`,
    data: {
      deletedCount: result.modifiedCount
    }
  });
});

module.exports = {
  getOpportunities,
  getOpportunity,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  getOpportunityStats,
  getPipelineData,
  getForecastData,
  getRecentOpportunities,
  bulkUpdateOpportunities,
  bulkDeleteOpportunities
};