// backend/controllers/leadController.js
const Lead = require('../models/Lead');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

/**
 * Get all leads with filtering, pagination, and search
 * @route GET /api/leads
 * @access Private
 */
const getLeads = asyncHandler(async (req, res, next) => {
  const {
    page = 1,
    limit = 20,
    status,
    leadSource,
    isConverted,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    ownerId,
    assignedTo,
    dateFrom,
    dateTo
  } = req.query;

  // Build query object
  const query = { isActive: true };
  
  // Role-based filtering
  if (req.user.role === 'sales_rep') {
    // Sales reps can only see their own leads
    query.ownerId = req.user._id;
  } else if (req.user.role === 'manager') {
    // Managers can see leads from their team (implement team logic here)
    // For now, allow all leads
  } else if (req.user.role === 'admin') {
    // Admins can see all leads
    if (ownerId) query.ownerId = ownerId;
  }
  
  // Add filters
  if (status) query.status = status;
  if (leadSource) query.leadSource = leadSource;
  if (typeof isConverted === 'string') {
    query.isConverted = isConverted === 'true';
  }
  if (assignedTo) query.assignedTo = assignedTo;
  
  // Date range filter
  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) query.createdAt.$lte = new Date(dateTo);
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
  const [leads, totalCount] = await Promise.all([
    Lead.find(query)
      .populate('ownerId', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .populate('convertedContactId', 'firstName lastName email')
      .populate('convertedAccountId', 'name')
      .populate('convertedOpportunityId', 'name amount stage')
      .populate('createdBy', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Lead.countDocuments(query)
  ]);
  
  // Calculate pagination info
  const totalPages = Math.ceil(totalCount / parseInt(limit));
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  res.status(200).json({
    status: 'success',
    data: {
      leads,
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
 * Get single lead by ID
 * @route GET /api/leads/:id
 * @access Private
 */
const getLead = asyncHandler(async (req, res, next) => {
  const lead = await Lead.findById(req.params.id)
    .populate('ownerId', 'firstName lastName email phone title')
    .populate('assignedTo', 'firstName lastName email phone title')
    .populate('convertedContactId', 'firstName lastName email phone title')
    .populate('convertedAccountId', 'name industry type phone website')
    .populate('convertedOpportunityId', 'name amount stage closeDate')
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email');

  if (!lead) {
    return next(new AppError('Lead not found', 404, 'LEAD_NOT_FOUND'));
  }

  // Check access permissions
  if (req.user.role === 'sales_rep' && lead.ownerId.toString() !== req.user._id.toString()) {
    return next(new AppError('Access denied. You can only view your own leads.', 403, 'ACCESS_DENIED'));
  }

  res.status(200).json({
    status: 'success',
    data: {
      lead
    }
  });
});

/**
 * Create new lead
 * @route POST /api/leads
 * @access Private
 */
const createLead = asyncHandler(async (req, res, next) => {
  // Set owner and creator
  req.body.ownerId = req.body.ownerId || req.user._id;
  req.body.createdBy = req.user._id;
  
  // Only admins and managers can assign leads to other users
  if (req.body.ownerId !== req.user._id.toString() && !['admin', 'manager'].includes(req.user.role)) {
    return next(new AppError('You can only create leads for yourself', 403, 'ACCESS_DENIED'));
  }
  
  // Check for duplicate email within the same company
  if (req.body.email) {
    const existingLead = await Lead.findOne({
      email: req.body.email.toLowerCase(),
      company: req.body.company,
      isActive: true
    });
    
    if (existingLead) {
      return next(new AppError('A lead with this email already exists for this company', 400, 'DUPLICATE_LEAD'));
    }
  }

  const lead = await Lead.create(req.body);
  
  // Populate the created lead
  await lead.populate([
    { path: 'ownerId', select: 'firstName lastName email' },
    { path: 'createdBy', select: 'firstName lastName email' }
  ]);

  res.status(201).json({
    status: 'success',
    message: 'Lead created successfully',
    data: {
      lead
    }
  });
});

/**
 * Update lead
 * @route PUT /api/leads/:id
 * @access Private
 */
const updateLead = asyncHandler(async (req, res, next) => {
  const lead = await Lead.findById(req.params.id);

  if (!lead) {
    return next(new AppError('Lead not found', 404, 'LEAD_NOT_FOUND'));
  }

  // Check access permissions
  if (req.user.role === 'sales_rep' && lead.ownerId.toString() !== req.user._id.toString()) {
    return next(new AppError('Access denied. You can only update your own leads.', 403, 'ACCESS_DENIED'));
  }

  // Prevent changing owner unless admin/manager
  if (req.body.ownerId && req.body.ownerId !== lead.ownerId.toString() && !['admin', 'manager'].includes(req.user.role)) {
    return next(new AppError('You cannot change the lead owner', 403, 'ACCESS_DENIED'));
  }

  // Set updatedBy
  req.body.updatedBy = req.user._id;

  // Check for duplicate email if email is being changed
  if (req.body.email && req.body.email !== lead.email) {
    const existingLead = await Lead.findOne({
      email: req.body.email.toLowerCase(),
      company: req.body.company || lead.company,
      isActive: true,
      _id: { $ne: req.params.id }
    });
    
    if (existingLead) {
      return next(new AppError('A lead with this email already exists for this company', 400, 'DUPLICATE_LEAD'));
    }
  }

  const updatedLead = await Lead.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).populate([
    { path: 'ownerId', select: 'firstName lastName email' },
    { path: 'assignedTo', select: 'firstName lastName email' },
    { path: 'updatedBy', select: 'firstName lastName email' }
  ]);

  res.status(200).json({
    status: 'success',
    message: 'Lead updated successfully',
    data: {
      lead: updatedLead
    }
  });
});

/**
 * Delete lead (soft delete)
 * @route DELETE /api/leads/:id
 * @access Private
 */
const deleteLead = asyncHandler(async (req, res, next) => {
  const lead = await Lead.findById(req.params.id);

  if (!lead) {
    return next(new AppError('Lead not found', 404, 'LEAD_NOT_FOUND'));
  }

  // Check access permissions
  if (req.user.role === 'sales_rep' && lead.ownerId.toString() !== req.user._id.toString()) {
    return next(new AppError('Access denied. You can only delete your own leads.', 403, 'ACCESS_DENIED'));
  }

  // Soft delete
  await Lead.findByIdAndUpdate(req.params.id, {
    isActive: false,
    updatedBy: req.user._id
  });

  res.status(200).json({
    status: 'success',
    message: 'Lead deleted successfully'
  });
});

/**
 * Convert lead to contact/account/opportunity
 * @route POST /api/leads/:id/convert
 * @access Private
 */
const convertLead = asyncHandler(async (req, res, next) => {
  const lead = await Lead.findById(req.params.id);

  if (!lead) {
    return next(new AppError('Lead not found', 404, 'LEAD_NOT_FOUND'));
  }

  // Check access permissions
  if (req.user.role === 'sales_rep' && lead.ownerId.toString() !== req.user._id.toString()) {
    return next(new AppError('Access denied. You can only convert your own leads.', 403, 'ACCESS_DENIED'));
  }

  if (lead.isConverted) {
    return next(new AppError('Lead is already converted', 400, 'LEAD_ALREADY_CONVERTED'));
  }

  const {
    createContact = true,
    createAccount = true,
    createOpportunity = false,
    opportunityData = {}
  } = req.body;

  try {
    const conversionResult = await lead.convert({
      createContact,
      createAccount,
      createOpportunity,
      opportunityData: {
        ...opportunityData,
        ownerId: lead.ownerId,
        createdBy: req.user._id
      }
    });

    // Populate the updated lead
    await lead.populate([
      { path: 'convertedContactId', select: 'firstName lastName email' },
      { path: 'convertedAccountId', select: 'name' },
      { path: 'convertedOpportunityId', select: 'name amount stage' }
    ]);

    res.status(200).json({
      status: 'success',
      message: 'Lead converted successfully',
      data: {
        lead,
        converted: conversionResult
      }
    });
  } catch (error) {
    return next(new AppError(error.message, 400, 'CONVERSION_FAILED'));
  }
});

/**
 * Get lead statistics
 * @route GET /api/leads/stats
 * @access Private
 */
const getLeadStats = asyncHandler(async (req, res, next) => {
  const { dateFrom, dateTo, ownerId } = req.query;
  
  // Determine which leads to include based on user role
  let targetOwnerId = req.user._id;
  if (req.user.role === 'admin' && ownerId) {
    targetOwnerId = ownerId;
  } else if (req.user.role === 'manager') {
    // For managers, could implement team logic here
    targetOwnerId = ownerId || req.user._id;
  }

  const dateRange = {};
  if (dateFrom) dateRange.startDate = dateFrom;
  if (dateTo) dateRange.endDate = dateTo;

  const stats = await Lead.getStats(targetOwnerId, dateRange);

  res.status(200).json({
    status: 'success',
    data: {
      stats: stats[0] || {
        totalLeads: 0,
        convertedLeads: 0,
        conversionRate: 0,
        byStatus: [],
        bySource: []
      }
    }
  });
});

/**
 * Bulk update leads
 * @route PUT /api/leads/bulk-update
 * @access Private (Admin/Manager only)
 */
const bulkUpdateLeads = asyncHandler(async (req, res, next) => {
  if (!['admin', 'manager'].includes(req.user.role)) {
    return next(new AppError('Access denied. Bulk operations require admin or manager role.', 403, 'ACCESS_DENIED'));
  }

  const { leadIds, updates } = req.body;

  if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
    return next(new AppError('Please provide an array of lead IDs', 400, 'INVALID_INPUT'));
  }

  if (!updates || Object.keys(updates).length === 0) {
    return next(new AppError('Please provide fields to update', 400, 'INVALID_INPUT'));
  }

  // Add updatedBy to updates
  updates.updatedBy = req.user._id;

  const result = await Lead.updateMany(
    { _id: { $in: leadIds }, isActive: true },
    updates,
    { runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    message: `${result.modifiedCount} leads updated successfully`,
    data: {
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    }
  });
});

/**
 * Bulk delete leads
 * @route DELETE /api/leads/bulk-delete
 * @access Private (Admin/Manager only)
 */
const bulkDeleteLeads = asyncHandler(async (req, res, next) => {
  if (!['admin', 'manager'].includes(req.user.role)) {
    return next(new AppError('Access denied. Bulk operations require admin or manager role.', 403, 'ACCESS_DENIED'));
  }

  const { leadIds } = req.body;

  if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
    return next(new AppError('Please provide an array of lead IDs', 400, 'INVALID_INPUT'));
  }

  const result = await Lead.updateMany(
    { _id: { $in: leadIds }, isActive: true },
    { 
      isActive: false,
      updatedBy: req.user._id
    }
  );

  res.status(200).json({
    status: 'success',
    message: `${result.modifiedCount} leads deleted successfully`,
    data: {
      deletedCount: result.modifiedCount
    }
  });
});

/**
 * Get recent leads
 * @route GET /api/leads/recent
 * @access Private
 */
const getRecentLeads = asyncHandler(async (req, res, next) => {
  const { limit = 10 } = req.query;
  
  const query = { isActive: true };
  
  // Role-based filtering
  if (req.user.role === 'sales_rep') {
    query.ownerId = req.user._id;
  }
  
  const leads = await Lead.find(query)
    .populate('ownerId', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .lean();

  res.status(200).json({
    status: 'success',
    data: {
      leads
    }
  });
});

/**
 * Assign lead to another user
 * @route POST /api/leads/:id/assign
 * @access Private (Manager/Admin only)
 */
const assignLead = asyncHandler(async (req, res, next) => {
  if (!['admin', 'manager'].includes(req.user.role)) {
    return next(new AppError('Access denied. Only managers and admins can assign leads.', 403, 'ACCESS_DENIED'));
  }

  const { assignedTo } = req.body;

  if (!assignedTo) {
    return next(new AppError('Please provide user ID to assign lead to', 400, 'MISSING_ASSIGNED_TO'));
  }

  const lead = await Lead.findById(req.params.id);

  if (!lead) {
    return next(new AppError('Lead not found', 404, 'LEAD_NOT_FOUND'));
  }

  lead.assignedTo = assignedTo;
  lead.updatedBy = req.user._id;
  await lead.save();

  await lead.populate('assignedTo', 'firstName lastName email');

  res.status(200).json({
    status: 'success',
    message: 'Lead assigned successfully',
    data: {
      lead
    }
  });
});

/**
 * Add note to lead
 * @route POST /api/leads/:id/notes
 * @access Private
 */
const addLeadNote = asyncHandler(async (req, res, next) => {
  const { note } = req.body;

  if (!note) {
    return next(new AppError('Please provide a note', 400, 'MISSING_NOTE'));
  }

  const lead = await Lead.findById(req.params.id);

  if (!lead) {
    return next(new AppError('Lead not found', 404, 'LEAD_NOT_FOUND'));
  }

  // Check access permissions
  if (req.user.role === 'sales_rep' && lead.ownerId.toString() !== req.user._id.toString()) {
    return next(new AppError('Access denied. You can only add notes to your own leads.', 403, 'ACCESS_DENIED'));
  }

  // Add note to existing notes
  const currentNotes = lead.notes || '';
  const timestamp = new Date().toISOString();
  const newNote = `[${timestamp}] ${req.user.fullName || req.user.firstName + ' ' + req.user.lastName}: ${note}`;
  
  lead.notes = currentNotes ? `${currentNotes}\n\n${newNote}` : newNote;
  lead.updatedBy = req.user._id;
  await lead.save();

  res.status(200).json({
    status: 'success',
    message: 'Note added successfully',
    data: {
      lead
    }
  });
});

/**
 * Get lead activity history
 * @route GET /api/leads/:id/activities
 * @access Private
 */
const getLeadActivities = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;

  const lead = await Lead.findById(req.params.id);

  if (!lead) {
    return next(new AppError('Lead not found', 404, 'LEAD_NOT_FOUND'));
  }

  // Check access permissions
  if (req.user.role === 'sales_rep' && lead.ownerId.toString() !== req.user._id.toString()) {
    return next(new AppError('Access denied. You can only view activities for your own leads.', 403, 'ACCESS_DENIED'));
  }

  // For now, return a placeholder response
  // In a real implementation, you would query an activities collection
  const activities = [];

  res.status(200).json({
    status: 'success',
    data: {
      activities,
      pagination: {
        currentPage: parseInt(page),
        totalPages: 1,
        totalCount: 0,
        limit: parseInt(limit)
      }
    }
  });
});

/**
 * Schedule follow-up for lead
 * @route POST /api/leads/:id/follow-up
 * @access Private
 */
const scheduleLeadFollowUp = asyncHandler(async (req, res, next) => {
  const { followUpDate, notes } = req.body;

  if (!followUpDate) {
    return next(new AppError('Please provide a follow-up date', 400, 'MISSING_FOLLOWUP_DATE'));
  }

  const lead = await Lead.findById(req.params.id);

  if (!lead) {
    return next(new AppError('Lead not found', 404, 'LEAD_NOT_FOUND'));
  }

  // Check access permissions
  if (req.user.role === 'sales_rep' && lead.ownerId.toString() !== req.user._id.toString()) {
    return next(new AppError('Access denied. You can only schedule follow-ups for your own leads.', 403, 'ACCESS_DENIED'));
  }

  lead.nextActivityDate = new Date(followUpDate);
  if (notes) {
    const timestamp = new Date().toISOString();
    const followUpNote = `[${timestamp}] Follow-up scheduled by ${req.user.fullName || req.user.firstName + ' ' + req.user.lastName}: ${notes}`;
    lead.notes = lead.notes ? `${lead.notes}\n\n${followUpNote}` : followUpNote;
  }
  lead.updatedBy = req.user._id;
  await lead.save();

  res.status(200).json({
    status: 'success',
    message: 'Follow-up scheduled successfully',
    data: {
      lead
    }
  });
});

module.exports = {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  convertLead,
  getLeadStats,
  bulkUpdateLeads,
  bulkDeleteLeads,
  getRecentLeads,
  assignLead,
  addLeadNote,
  getLeadActivities,
  scheduleLeadFollowUp
};