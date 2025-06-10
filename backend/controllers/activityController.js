// backend/controllers/activityController.js
const Activity = require('../models/Activity');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

/**
 * Get all activities with filtering, pagination, and search
 * @route GET /api/activities
 * @access Private
 */
const getActivities = asyncHandler(async (req, res, next) => {
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
    sortOrder = 'asc',
    ownerId
  } = req.query;

  // Build query object
  const query = { isActive: true };
  
  // Role-based filtering
  if (req.user.role === 'sales_rep') {
    query.$or = [
      { ownerId: req.user._id },
      { assignedToId: req.user._id }
    ];
  } else if (req.user.role === 'manager') {
    // Managers can see activities from their team
  } else if (req.user.role === 'admin') {
    if (ownerId) {
      query.$or = [
        { ownerId },
        { assignedToId: ownerId }
      ];
    }
  }
  
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
  const [activities, totalCount] = await Promise.all([
    Activity.find(query)
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
      .lean(),
    Activity.countDocuments(query)
  ]);
  
  // Calculate pagination info
  const totalPages = Math.ceil(totalCount / parseInt(limit));
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  res.status(200).json({
    status: 'success',
    data: {
      activities,
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
 * Get single activity by ID
 * @route GET /api/activities/:id
 * @access Private
 */
const getActivity = asyncHandler(async (req, res, next) => {
  const activity = await Activity.findById(req.params.id)
    .populate('ownerId', 'firstName lastName email phone title')
    .populate('assignedToId', 'firstName lastName email phone title')
    .populate('leadId', 'firstName lastName company email phone')
    .populate('contactId', 'firstName lastName email phone title')
    .populate('accountId', 'name type industry phone website')
    .populate('opportunityId', 'name amount stage closeDate')
    .populate('attendees.contactId', 'firstName lastName email')
    .populate('attendees.userId', 'firstName lastName email')
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email');

  if (!activity) {
    return next(new AppError('Activity not found', 404, 'ACTIVITY_NOT_FOUND'));
  }

  // Check access permissions
  const hasAccess = req.user.role === 'admin' || 
                   req.user.role === 'manager' ||
                   activity.ownerId.toString() === req.user._id.toString() ||
                   (activity.assignedToId && activity.assignedToId.toString() === req.user._id.toString());

  if (!hasAccess) {
    return next(new AppError('Access denied. You can only view your own activities.', 403, 'ACCESS_DENIED'));
  }

  res.status(200).json({
    status: 'success',
    data: {
      activity
    }
  });
});

/**
 * Create new activity
 * @route POST /api/activities
 * @access Private
 */
const createActivity = asyncHandler(async (req, res, next) => {
  // Set owner and creator
  req.body.ownerId = req.body.ownerId || req.user._id;
  req.body.createdBy = req.user._id;
  
  // Only admins and managers can assign activities to other users
  if (req.body.ownerId !== req.user._id.toString() && !['admin', 'manager'].includes(req.user.role)) {
    return next(new AppError('You can only create activities for yourself', 403, 'ACCESS_DENIED'));
  }

  const activity = await Activity.create(req.body);
  
  // Populate the created activity
  await activity.populate([
    { path: 'ownerId', select: 'firstName lastName email' },
    { path: 'assignedToId', select: 'firstName lastName email' },
    { path: 'leadId', select: 'firstName lastName company' },
    { path: 'contactId', select: 'firstName lastName email' },
    { path: 'accountId', select: 'name type' },
    { path: 'opportunityId', select: 'name amount' },
    { path: 'createdBy', select: 'firstName lastName email' }
  ]);

  res.status(201).json({
    status: 'success',
    message: 'Activity created successfully',
    data: {
      activity
    }
  });
});

/**
 * Update activity
 * @route PUT /api/activities/:id
 * @access Private
 */
const updateActivity = asyncHandler(async (req, res, next) => {
  const activity = await Activity.findById(req.params.id);

  if (!activity) {
    return next(new AppError('Activity not found', 404, 'ACTIVITY_NOT_FOUND'));
  }

  // Check access permissions
  const hasAccess = req.user.role === 'admin' || 
                   req.user.role === 'manager' ||
                   activity.ownerId.toString() === req.user._id.toString() ||
                   (activity.assignedToId && activity.assignedToId.toString() === req.user._id.toString());

  if (!hasAccess) {
    return next(new AppError('Access denied. You can only update your own activities.', 403, 'ACCESS_DENIED'));
  }

  // Set updatedBy
  req.body.updatedBy = req.user._id;

  const updatedActivity = await Activity.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).populate([
    { path: 'ownerId', select: 'firstName lastName email' },
    { path: 'assignedToId', select: 'firstName lastName email' },
    { path: 'leadId', select: 'firstName lastName company' },
    { path: 'contactId', select: 'firstName lastName email' },
    { path: 'accountId', select: 'name type' },
    { path: 'opportunityId', select: 'name amount' },
    { path: 'updatedBy', select: 'firstName lastName email' }
  ]);

  res.status(200).json({
    status: 'success',
    message: 'Activity updated successfully',
    data: {
      activity: updatedActivity
    }
  });
});

/**
 * Delete activity (soft delete)
 * @route DELETE /api/activities/:id
 * @access Private
 */
const deleteActivity = asyncHandler(async (req, res, next) => {
  const activity = await Activity.findById(req.params.id);

  if (!activity) {
    return next(new AppError('Activity not found', 404, 'ACTIVITY_NOT_FOUND'));
  }

  // Check access permissions
  const hasAccess = req.user.role === 'admin' || 
                   req.user.role === 'manager' ||
                   activity.ownerId.toString() === req.user._id.toString();

  if (!hasAccess) {
    return next(new AppError('Access denied. You can only delete your own activities.', 403, 'ACCESS_DENIED'));
  }

  // Soft delete
  await Activity.findByIdAndUpdate(req.params.id, {
    isActive: false,
    updatedBy: req.user._id
  });

  res.status(200).json({
    status: 'success',
    message: 'Activity deleted successfully'
  });
});

/**
 * Get activity statistics
 * @route GET /api/activities/stats
 * @access Private
 */
const getActivityStats = asyncHandler(async (req, res, next) => {
  const { dateFrom, dateTo, ownerId } = req.query;
  
  // Determine which activities to include based on user role
  let targetOwnerId = req.user._id;
  if (req.user.role === 'admin' && ownerId) {
    targetOwnerId = ownerId;
  } else if (req.user.role === 'manager') {
    targetOwnerId = ownerId || req.user._id;
  }

  const dateRange = {};
  if (dateFrom) dateRange.startDate = dateFrom;
  if (dateTo) dateRange.endDate = dateTo;

  const stats = await Activity.getStats(targetOwnerId, dateRange);

  res.status(200).json({
    status: 'success',
    data: {
      stats: stats[0] || {
        totalActivities: 0,
        completedActivities: 0,
        overdueActivities: 0,
        completionRate: 0,
        avgCallDuration: 0,
        byType: [],
        byStatus: [],
        byPriority: []
      }
    }
  });
});

/**
 * Get upcoming activities
 * @route GET /api/activities/upcoming
 * @access Private
 */
const getUpcomingActivities = asyncHandler(async (req, res, next) => {
  const { days = 7 } = req.query;
  
  let targetOwnerId = req.user._id;
  if (req.user.role === 'admin' || req.user.role === 'manager') {
    targetOwnerId = req.query.ownerId || req.user._id;
  }

  const activities = await Activity.getUpcoming(targetOwnerId, parseInt(days));

  res.status(200).json({
    status: 'success',
    data: {
      activities
    }
  });
});

/**
 * Get overdue activities
 * @route GET /api/activities/overdue
 * @access Private
 */
const getOverdueActivities = asyncHandler(async (req, res, next) => {
  let targetOwnerId = req.user._id;
  if (req.user.role === 'admin' || req.user.role === 'manager') {
    targetOwnerId = req.query.ownerId || req.user._id;
  }

  const activities = await Activity.getOverdue(targetOwnerId);

  res.status(200).json({
    status: 'success',
    data: {
      activities
    }
  });
});

/**
 * Mark activity as completed
 * @route PUT /api/activities/:id/complete
 * @access Private
 */
const completeActivity = asyncHandler(async (req, res, next) => {
  const { outcome, nextSteps } = req.body;
  
  const activity = await Activity.findById(req.params.id);

  if (!activity) {
    return next(new AppError('Activity not found', 404, 'ACTIVITY_NOT_FOUND'));
  }

  // Check access permissions
  const hasAccess = req.user.role === 'admin' || 
                   req.user.role === 'manager' ||
                   activity.ownerId.toString() === req.user._id.toString() ||
                   (activity.assignedToId && activity.assignedToId.toString() === req.user._id.toString());

  if (!hasAccess) {
    return next(new AppError('Access denied. You can only complete your own activities.', 403, 'ACCESS_DENIED'));
  }

  await activity.markCompleted(outcome, nextSteps);

  res.status(200).json({
    status: 'success',
    message: 'Activity marked as completed',
    data: {
      activity
    }
  });
});

/**
 * Get recent activities
 * @route GET /api/activities/recent
 * @access Private
 */
const getRecentActivities = asyncHandler(async (req, res, next) => {
  const { limit = 10 } = req.query;
  
  const query = { isActive: true };
  
  // Role-based filtering
  if (req.user.role === 'sales_rep') {
    query.$or = [
      { ownerId: req.user._id },
      { assignedToId: req.user._id }
    ];
  }
  
  const activities = await Activity.find(query)
    .populate('ownerId', 'firstName lastName email')
    .populate('leadId', 'firstName lastName company')
    .populate('contactId', 'firstName lastName email')
    .populate('accountId', 'name type')
    .populate('opportunityId', 'name amount')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .lean();

  res.status(200).json({
    status: 'success',
    data: {
      activities
    }
  });
});

module.exports = {
  getActivities,
  getActivity,
  createActivity,
  updateActivity,
  deleteActivity,
  getActivityStats,
  getUpcomingActivities,
  getOverdueActivities,
  completeActivity,
  getRecentActivities
};