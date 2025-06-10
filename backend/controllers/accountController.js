// backend/controllers/accountController.js
const Account = require('../models/Account');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

/**
 * Get all accounts with filtering, pagination, and search
 * @route GET /api/accounts
 * @access Private
 */
const getAccounts = asyncHandler(async (req, res, next) => {
  const {
    page = 1,
    limit = 20,
    type,
    industry,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    ownerId,
    dateFrom,
    dateTo
  } = req.query;

  // Build query object
  const query = { isActive: true };
  
  // Role-based filtering
  if (req.user.role === 'sales_rep') {
    query.ownerId = req.user._id;
  } else if (req.user.role === 'manager') {
    // Managers can see accounts from their team (implement team logic here)
  } else if (req.user.role === 'admin') {
    if (ownerId) query.ownerId = ownerId;
  }
  
  // Add filters
  if (type) query.type = type;
  if (industry) query.industry = industry;
  
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
  const [accounts, totalCount] = await Promise.all([
    Account.find(query)
      .populate('ownerId', 'firstName lastName email')
      .populate('parentAccountId', 'name type')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Account.countDocuments(query)
  ]);
  
  // Calculate pagination info
  const totalPages = Math.ceil(totalCount / parseInt(limit));
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  res.status(200).json({
    status: 'success',
    data: {
      accounts,
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
 * Get single account by ID
 * @route GET /api/accounts/:id
 * @access Private
 */
const getAccount = asyncHandler(async (req, res, next) => {
  const account = await Account.findById(req.params.id)
    .populate('ownerId', 'firstName lastName email phone title')
    .populate('parentAccountId', 'name type industry')
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email');

  if (!account) {
    return next(new AppError('Account not found', 404, 'ACCOUNT_NOT_FOUND'));
  }

  // Check access permissions
  if (req.user.role === 'sales_rep' && account.ownerId.toString() !== req.user._id.toString()) {
    return next(new AppError('Access denied. You can only view your own accounts.', 403, 'ACCESS_DENIED'));
  }

  res.status(200).json({
    status: 'success',
    data: {
      account
    }
  });
});

/**
 * Create new account
 * @route POST /api/accounts
 * @access Private
 */
const createAccount = asyncHandler(async (req, res, next) => {
  // Set owner and creator
  req.body.ownerId = req.body.ownerId || req.user._id;
  req.body.createdBy = req.user._id;
  
  // Only admins and managers can assign accounts to other users
  if (req.body.ownerId !== req.user._id.toString() && !['admin', 'manager'].includes(req.user.role)) {
    return next(new AppError('You can only create accounts for yourself', 403, 'ACCESS_DENIED'));
  }
  
  // Check for duplicate account name (case-insensitive)
  const existingAccount = await Account.findOne({
    name: { $regex: new RegExp(`^${req.body.name}$`, 'i') },
    isActive: true
  });
  
  if (existingAccount) {
    return next(new AppError('An account with this name already exists', 400, 'DUPLICATE_ACCOUNT'));
  }

  const account = await Account.create(req.body);
  
  // Populate the created account
  await account.populate([
    { path: 'ownerId', select: 'firstName lastName email' },
    { path: 'createdBy', select: 'firstName lastName email' }
  ]);

  res.status(201).json({
    status: 'success',
    message: 'Account created successfully',
    data: {
      account
    }
  });
});

/**
 * Update account
 * @route PUT /api/accounts/:id
 * @access Private
 */
const updateAccount = asyncHandler(async (req, res, next) => {
  const account = await Account.findById(req.params.id);

  if (!account) {
    return next(new AppError('Account not found', 404, 'ACCOUNT_NOT_FOUND'));
  }

  // Check access permissions
  if (req.user.role === 'sales_rep' && account.ownerId.toString() !== req.user._id.toString()) {
    return next(new AppError('Access denied. You can only update your own accounts.', 403, 'ACCESS_DENIED'));
  }

  // Prevent changing owner unless admin/manager
  if (req.body.ownerId && req.body.ownerId !== account.ownerId.toString() && !['admin', 'manager'].includes(req.user.role)) {
    return next(new AppError('You cannot change the account owner', 403, 'ACCESS_DENIED'));
  }

  // Set updatedBy
  req.body.updatedBy = req.user._id;

  // Check for duplicate name if name is being changed
  if (req.body.name && req.body.name !== account.name) {
    const existingAccount = await Account.findOne({
      name: { $regex: new RegExp(`^${req.body.name}$`, 'i') },
      isActive: true,
      _id: { $ne: req.params.id }
    });
    
    if (existingAccount) {
      return next(new AppError('An account with this name already exists', 400, 'DUPLICATE_ACCOUNT'));
    }
  }

  const updatedAccount = await Account.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).populate([
    { path: 'ownerId', select: 'firstName lastName email' },
    { path: 'parentAccountId', select: 'name type' },
    { path: 'updatedBy', select: 'firstName lastName email' }
  ]);

  res.status(200).json({
    status: 'success',
    message: 'Account updated successfully',
    data: {
      account: updatedAccount
    }
  });
});

/**
 * Delete account (soft delete)
 * @route DELETE /api/accounts/:id
 * @access Private
 */
const deleteAccount = asyncHandler(async (req, res, next) => {
  const account = await Account.findById(req.params.id);

  if (!account) {
    return next(new AppError('Account not found', 404, 'ACCOUNT_NOT_FOUND'));
  }

  // Check access permissions
  if (req.user.role === 'sales_rep' && account.ownerId.toString() !== req.user._id.toString()) {
    return next(new AppError('Access denied. You can only delete your own accounts.', 403, 'ACCESS_DENIED'));
  }

  // Check if account has related records
  const Contact = require('../models/Contact');
  const Opportunity = require('../models/Opportunity');
  
  const [contactCount, opportunityCount] = await Promise.all([
    Contact.countDocuments({ accountId: req.params.id, isActive: true }),
    Opportunity.countDocuments({ accountId: req.params.id, isActive: true })
  ]);

  if (contactCount > 0 || opportunityCount > 0) {
    return next(new AppError(
      `Cannot delete account. It has ${contactCount} active contacts and ${opportunityCount} active opportunities.`,
      400,
      'ACCOUNT_HAS_DEPENDENCIES'
    ));
  }

  // Soft delete
  await Account.findByIdAndUpdate(req.params.id, {
    isActive: false,
    updatedBy: req.user._id
  });

  res.status(200).json({
    status: 'success',
    message: 'Account deleted successfully'
  });
});

/**
 * Get account statistics
 * @route GET /api/accounts/stats
 * @access Private
 */
const getAccountStats = asyncHandler(async (req, res, next) => {
  const { dateFrom, dateTo, ownerId } = req.query;
  
  // Determine which accounts to include based on user role
  let targetOwnerId = req.user._id;
  if (req.user.role === 'admin' && ownerId) {
    targetOwnerId = ownerId;
  } else if (req.user.role === 'manager') {
    targetOwnerId = ownerId || req.user._id;
  }

  const dateRange = {};
  if (dateFrom) dateRange.startDate = dateFrom;
  if (dateTo) dateRange.endDate = dateTo;

  const stats = await Account.getStats(targetOwnerId, dateRange);

  res.status(200).json({
    status: 'success',
    data: {
      stats: stats[0] || {
        totalAccounts: 0,
        totalRevenue: 0,
        totalEmployees: 0,
        avgRevenue: 0,
        avgEmployees: 0,
        byType: [],
        byIndustry: []
      }
    }
  });
});

/**
 * Get account summary with related data
 * @route GET /api/accounts/:id/summary
 * @access Private
 */
const getAccountSummary = asyncHandler(async (req, res, next) => {
  const account = await Account.findById(req.params.id);

  if (!account) {
    return next(new AppError('Account not found', 404, 'ACCOUNT_NOT_FOUND'));
  }

  // Check access permissions
  if (req.user.role === 'sales_rep' && account.ownerId.toString() !== req.user._id.toString()) {
    return next(new AppError('Access denied. You can only view your own accounts.', 403, 'ACCESS_DENIED'));
  }

  const summary = await Account.getAccountSummary(req.params.id);

  res.status(200).json({
    status: 'success',
    data: {
      summary: summary[0] || null
    }
  });
});

/**
 * Get account hierarchy
 * @route GET /api/accounts/:id/hierarchy
 * @access Private
 */
const getAccountHierarchy = asyncHandler(async (req, res, next) => {
  const account = await Account.findById(req.params.id);

  if (!account) {
    return next(new AppError('Account not found', 404, 'ACCOUNT_NOT_FOUND'));
  }

  // Check access permissions
  if (req.user.role === 'sales_rep' && account.ownerId.toString() !== req.user._id.toString()) {
    return next(new AppError('Access denied. You can only view your own accounts.', 403, 'ACCESS_DENIED'));
  }

  const hierarchy = await account.getAccountHierarchy();

  res.status(200).json({
    status: 'success',
    data: {
      hierarchy
    }
  });
});

/**
 * Bulk update accounts
 * @route PUT /api/accounts/bulk-update
 * @access Private (Admin/Manager only)
 */
const bulkUpdateAccounts = asyncHandler(async (req, res, next) => {
  if (!['admin', 'manager'].includes(req.user.role)) {
    return next(new AppError('Access denied. Bulk operations require admin or manager role.', 403, 'ACCESS_DENIED'));
  }

  const { accountIds, updates } = req.body;

  if (!accountIds || !Array.isArray(accountIds) || accountIds.length === 0) {
    return next(new AppError('Please provide an array of account IDs', 400, 'INVALID_INPUT'));
  }

  if (!updates || Object.keys(updates).length === 0) {
    return next(new AppError('Please provide fields to update', 400, 'INVALID_INPUT'));
  }

  // Add updatedBy to updates
  updates.updatedBy = req.user._id;

  const result = await Account.updateMany(
    { _id: { $in: accountIds }, isActive: true },
    updates,
    { runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    message: `${result.modifiedCount} accounts updated successfully`,
    data: {
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    }
  });
});

/**
 * Bulk delete accounts
 * @route DELETE /api/accounts/bulk-delete
 * @access Private (Admin/Manager only)
 */
const bulkDeleteAccounts = asyncHandler(async (req, res, next) => {
  if (!['admin', 'manager'].includes(req.user.role)) {
    return next(new AppError('Access denied. Bulk operations require admin or manager role.', 403, 'ACCESS_DENIED'));
  }

  const { accountIds } = req.body;

  if (!accountIds || !Array.isArray(accountIds) || accountIds.length === 0) {
    return next(new AppError('Please provide an array of account IDs', 400, 'INVALID_INPUT'));
  }

  // Check for dependencies
  const Contact = require('../models/Contact');
  const Opportunity = require('../models/Opportunity');
  
  const [contactCount, opportunityCount] = await Promise.all([
    Contact.countDocuments({ accountId: { $in: accountIds }, isActive: true }),
    Opportunity.countDocuments({ accountId: { $in: accountIds }, isActive: true })
  ]);

  if (contactCount > 0 || opportunityCount > 0) {
    return next(new AppError(
      `Cannot delete accounts. They have ${contactCount} active contacts and ${opportunityCount} active opportunities.`,
      400,
      'ACCOUNTS_HAVE_DEPENDENCIES'
    ));
  }

  const result = await Account.updateMany(
    { _id: { $in: accountIds }, isActive: true },
    { 
      isActive: false,
      updatedBy: req.user._id
    }
  );

  res.status(200).json({
    status: 'success',
    message: `${result.modifiedCount} accounts deleted successfully`,
    data: {
      deletedCount: result.modifiedCount
    }
  });
});

/**
 * Get recent accounts
 * @route GET /api/accounts/recent
 * @access Private
 */
const getRecentAccounts = asyncHandler(async (req, res, next) => {
  const { limit = 10 } = req.query;
  
  const query = { isActive: true };
  
  // Role-based filtering
  if (req.user.role === 'sales_rep') {
    query.ownerId = req.user._id;
  }
  
  const accounts = await Account.find(query)
    .populate('ownerId', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .lean();

  res.status(200).json({
    status: 'success',
    data: {
      accounts
    }
  });
});

/**
 * Search accounts
 * @route GET /api/accounts/search
 * @access Private
 */
const searchAccounts = asyncHandler(async (req, res, next) => {
  const { q, limit = 10 } = req.query;

  if (!q) {
    return next(new AppError('Search query is required', 400, 'SEARCH_QUERY_REQUIRED'));
  }

  const query = { 
    isActive: true,
    $text: { $search: q }
  };
  
  // Role-based filtering
  if (req.user.role === 'sales_rep') {
    query.ownerId = req.user._id;
  }

  const accounts = await Account.find(query)
    .populate('ownerId', 'firstName lastName email')
    .sort({ score: { $meta: 'textScore' } })
    .limit(parseInt(limit))
    .lean();

  res.status(200).json({
    status: 'success',
    data: {
      accounts,
      count: accounts.length
    }
  });
});

module.exports = {
  getAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
  getAccountStats,
  getAccountSummary,
  getAccountHierarchy,
  bulkUpdateAccounts,
  bulkDeleteAccounts,
  getRecentAccounts,
  searchAccounts
};