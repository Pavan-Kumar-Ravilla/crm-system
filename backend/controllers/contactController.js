// backend/controllers/contactController.js
const Contact = require('../models/Contact');
const Account = require('../models/Account');
const User = require('../models/User');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const mongoose = require('mongoose');

/**
 * Get all contacts with filtering, pagination, and search
 * @route GET /api/contacts
 * @access Private
 */
const getContacts = asyncHandler(async (req, res, next) => {
  const {
    page = 1,
    limit = 20,
    accountId,
    department,
    title,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    ownerId,
    dateFrom,
    dateTo,
    hasEmail,
    hasPhone,
    leadSource,
    isActive = 'true'
  } = req.query;

  // Build query object
  const query = { isActive: isActive === 'true' };
  
  // Role-based filtering
  if (req.user.role === 'sales_rep') {
    query.ownerId = req.user._id;
  } else if (req.user.role === 'manager') {
    // Managers can see contacts from their team
    // TODO: Implement team logic here
  } else if (req.user.role === 'admin') {
    if (ownerId) query.ownerId = ownerId;
  }
  
  // Add filters
  if (accountId) {
    if (mongoose.Types.ObjectId.isValid(accountId)) {
      query.accountId = accountId;
    } else {
      return next(new AppError('Invalid account ID format', 400, 'INVALID_ACCOUNT_ID'));
    }
  }
  
  if (department) {
    query.department = new RegExp(department, 'i');
  }
  
  if (title) {
    query.title = new RegExp(title, 'i');
  }
  
  if (leadSource) {
    query.leadSource = leadSource;
  }
  
  // Filter by email/phone presence
  if (hasEmail === 'true') {
    query.email = { $exists: true, $ne: null, $ne: '' };
  } else if (hasEmail === 'false') {
    query.$or = [
      { email: { $exists: false } },
      { email: null },
      { email: '' }
    ];
  }
  
  if (hasPhone === 'true') {
    query.$or = [
      { phone: { $exists: true, $ne: null, $ne: '' } },
      { mobilePhone: { $exists: true, $ne: null, $ne: '' } },
      { homePhone: { $exists: true, $ne: null, $ne: '' } }
    ];
  }
  
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
  
  try {
    // Execute query
    const [contacts, totalCount] = await Promise.all([
      Contact.find(query)
        .populate('ownerId', 'firstName lastName email phone title department')
        .populate('accountId', 'name type industry phone website billingAddress')
        .populate('reportsToId', 'firstName lastName email title department')
        .populate('createdBy', 'firstName lastName email')
        .populate('updatedBy', 'firstName lastName email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Contact.countDocuments(query)
    ]);
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;
    
    res.status(200).json({
      status: 'success',
      data: {
        contacts,
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
  } catch (error) {
    return next(new AppError('Error fetching contacts', 500, 'FETCH_ERROR'));
  }
});

/**
 * Get single contact by ID
 * @route GET /api/contacts/:id
 * @access Private
 */
const getContact = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new AppError('Invalid contact ID format', 400, 'INVALID_ID'));
  }

  const contact = await Contact.findById(req.params.id)
    .populate('ownerId', 'firstName lastName email phone title department')
    .populate('accountId', 'name type industry phone website billingAddress shippingAddress employees annualRevenue')
    .populate('reportsToId', 'firstName lastName email title department accountId')
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email');

  if (!contact) {
    return next(new AppError('Contact not found', 404, 'CONTACT_NOT_FOUND'));
  }

  // Check access permissions
  if (req.user.role === 'sales_rep' && contact.ownerId.toString() !== req.user._id.toString()) {
    return next(new AppError('Access denied. You can only view your own contacts.', 403, 'ACCESS_DENIED'));
  }

  // Get direct reports
  const directReports = await Contact.find({
    reportsToId: contact._id,
    isActive: true
  })
    .populate('accountId', 'name')
    .select('firstName lastName email title department accountId')
    .lean();

  // Get related opportunities (as primary contact)
  const Opportunity = require('../models/Opportunity');
  const opportunities = await Opportunity.find({
    primaryContactId: contact._id,
    isActive: true
  })
    .populate('accountId', 'name')
    .select('name amount stage closeDate probability')
    .sort({ closeDate: 1 })
    .limit(5)
    .lean();

  // Get recent activities
  const Activity = require('../models/Activity');
  const recentActivities = await Activity.find({
    contactId: contact._id,
    isActive: true
  })
    .populate('ownerId', 'firstName lastName')
    .select('subject type status dueDate createdAt')
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  res.status(200).json({
    status: 'success',
    data: {
      contact: {
        ...contact.toObject(),
        directReports,
        opportunities,
        recentActivities
      }
    }
  });
});

/**
 * Create new contact
 * @route POST /api/contacts
 * @access Private
 */
const createContact = asyncHandler(async (req, res, next) => {
  // Set owner and creator
  req.body.ownerId = req.body.ownerId || req.user._id;
  req.body.createdBy = req.user._id;
  
  // Only admins and managers can assign contacts to other users
  if (req.body.ownerId !== req.user._id.toString() && !['admin', 'manager'].includes(req.user.role)) {
    return next(new AppError('You can only create contacts for yourself', 403, 'ACCESS_DENIED'));
  }
  
  // Validate account exists if provided
  if (req.body.accountId) {
    if (!mongoose.Types.ObjectId.isValid(req.body.accountId)) {
      return next(new AppError('Invalid account ID format', 400, 'INVALID_ACCOUNT_ID'));
    }
    
    const accountExists = await Account.findOne({
      _id: req.body.accountId,
      isActive: true
    });
    
    if (!accountExists) {
      return next(new AppError('Account not found or inactive', 404, 'ACCOUNT_NOT_FOUND'));
    }
  }
  
  // Validate reportsTo contact exists if provided
  if (req.body.reportsToId) {
    if (!mongoose.Types.ObjectId.isValid(req.body.reportsToId)) {
      return next(new AppError('Invalid reports-to contact ID format', 400, 'INVALID_REPORTS_TO_ID'));
    }
    
    const managerExists = await Contact.findOne({
      _id: req.body.reportsToId,
      isActive: true
    });
    
    if (!managerExists) {
      return next(new AppError('Manager contact not found or inactive', 404, 'MANAGER_NOT_FOUND'));
    }
    
    // Prevent circular reporting relationships
    if (req.body.reportsToId === req.user._id.toString()) {
      return next(new AppError('Contact cannot report to themselves', 400, 'CIRCULAR_REPORTING'));
    }
  }
  
  // Validate owner exists if different from current user
  if (req.body.ownerId !== req.user._id.toString()) {
    const ownerExists = await User.findOne({
      _id: req.body.ownerId,
      isActive: true
    });
    
    if (!ownerExists) {
      return next(new AppError('Assigned owner not found or inactive', 404, 'OWNER_NOT_FOUND'));
    }
  }
  
  // Check for duplicate email within the same account
  if (req.body.email && req.body.accountId) {
    const existingContact = await Contact.findOne({
      email: req.body.email.toLowerCase(),
      accountId: req.body.accountId,
      isActive: true
    });
    
    if (existingContact) {
      return next(new AppError('A contact with this email already exists for this account', 400, 'DUPLICATE_CONTACT'));
    }
  }

  // Normalize email
  if (req.body.email) {
    req.body.email = req.body.email.toLowerCase();
  }

  try {
    const contact = await Contact.create(req.body);
    
    // Populate the created contact
    await contact.populate([
      { path: 'ownerId', select: 'firstName lastName email' },
      { path: 'accountId', select: 'name type industry' },
      { path: 'reportsToId', select: 'firstName lastName email title' },
      { path: 'createdBy', select: 'firstName lastName email' }
    ]);

    res.status(201).json({
      status: 'success',
      message: 'Contact created successfully',
      data: {
        contact
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      // Handle duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      return next(new AppError(`Contact with this ${field} already exists`, 400, 'DUPLICATE_FIELD'));
    }
    return next(new AppError('Error creating contact', 500, 'CREATE_ERROR'));
  }
});

/**
 * Update contact
 * @route PUT /api/contacts/:id
 * @access Private
 */
const updateContact = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new AppError('Invalid contact ID format', 400, 'INVALID_ID'));
  }

  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return next(new AppError('Contact not found', 404, 'CONTACT_NOT_FOUND'));
  }

  // Check access permissions
  if (req.user.role === 'sales_rep' && contact.ownerId.toString() !== req.user._id.toString()) {
    return next(new AppError('Access denied. You can only update your own contacts.', 403, 'ACCESS_DENIED'));
  }

  // Prevent changing owner unless admin/manager
  if (req.body.ownerId && req.body.ownerId !== contact.ownerId.toString() && !['admin', 'manager'].includes(req.user.role)) {
    return next(new AppError('You cannot change the contact owner', 403, 'ACCESS_DENIED'));
  }

  // Validate account exists if being changed
  if (req.body.accountId && req.body.accountId !== contact.accountId?.toString()) {
    if (!mongoose.Types.ObjectId.isValid(req.body.accountId)) {
      return next(new AppError('Invalid account ID format', 400, 'INVALID_ACCOUNT_ID'));
    }
    
    const accountExists = await Account.findOne({
      _id: req.body.accountId,
      isActive: true
    });
    
    if (!accountExists) {
      return next(new AppError('Account not found or inactive', 404, 'ACCOUNT_NOT_FOUND'));
    }
  }

  // Validate reportsTo contact if being changed
  if (req.body.reportsToId && req.body.reportsToId !== contact.reportsToId?.toString()) {
    if (!mongoose.Types.ObjectId.isValid(req.body.reportsToId)) {
      return next(new AppError('Invalid reports-to contact ID format', 400, 'INVALID_REPORTS_TO_ID'));
    }
    
    const managerExists = await Contact.findOne({
      _id: req.body.reportsToId,
      isActive: true
    });
    
    if (!managerExists) {
      return next(new AppError('Manager contact not found or inactive', 404, 'MANAGER_NOT_FOUND'));
    }
    
    // Prevent circular reporting relationships
    if (req.body.reportsToId === req.params.id) {
      return next(new AppError('Contact cannot report to themselves', 400, 'CIRCULAR_REPORTING'));
    }
  }

  // Validate owner exists if being changed
  if (req.body.ownerId && req.body.ownerId !== contact.ownerId.toString()) {
    const ownerExists = await User.findOne({
      _id: req.body.ownerId,
      isActive: true
    });
    
    if (!ownerExists) {
      return next(new AppError('Assigned owner not found or inactive', 404, 'OWNER_NOT_FOUND'));
    }
  }

  // Check for duplicate email if email is being changed
  if (req.body.email && req.body.email !== contact.email) {
    const accountId = req.body.accountId || contact.accountId;
    if (accountId) {
      const existingContact = await Contact.findOne({
        email: req.body.email.toLowerCase(),
        accountId: accountId,
        isActive: true,
        _id: { $ne: req.params.id }
      });
      
      if (existingContact) {
        return next(new AppError('A contact with this email already exists for this account', 400, 'DUPLICATE_CONTACT'));
      }
    }
  }

  // Set updatedBy
  req.body.updatedBy = req.user._id;

  // Normalize email
  if (req.body.email) {
    req.body.email = req.body.email.toLowerCase();
  }

  try {
    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate([
      { path: 'ownerId', select: 'firstName lastName email' },
      { path: 'accountId', select: 'name type industry' },
      { path: 'reportsToId', select: 'firstName lastName email title' },
      { path: 'updatedBy', select: 'firstName lastName email' }
    ]);

    res.status(200).json({
      status: 'success',
      message: 'Contact updated successfully',
      data: {
        contact: updatedContact
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return next(new AppError(`Contact with this ${field} already exists`, 400, 'DUPLICATE_FIELD'));
    }
    return next(new AppError('Error updating contact', 500, 'UPDATE_ERROR'));
  }
});

/**
 * Delete contact (soft delete)
 * @route DELETE /api/contacts/:id
 * @access Private
 */
const deleteContact = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new AppError('Invalid contact ID format', 400, 'INVALID_ID'));
  }

  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return next(new AppError('Contact not found', 404, 'CONTACT_NOT_FOUND'));
  }

  // Check access permissions
  if (req.user.role === 'sales_rep' && contact.ownerId.toString() !== req.user._id.toString()) {
    return next(new AppError('Access denied. You can only delete your own contacts.', 403, 'ACCESS_DENIED'));
  }

  // Check if contact has direct reports
  const directReports = await Contact.countDocuments({
    reportsToId: req.params.id,
    isActive: true
  });

  if (directReports > 0) {
    return next(new AppError(`Cannot delete contact. They have ${directReports} direct reports. Please reassign them first.`, 400, 'HAS_DIRECT_REPORTS'));
  }

  // Check if contact is primary contact for any opportunities
  const Opportunity = require('../models/Opportunity');
  const opportunityCount = await Opportunity.countDocuments({
    primaryContactId: req.params.id,
    isActive: true
  });

  if (opportunityCount > 0) {
    return next(new AppError(`Cannot delete contact. They are the primary contact for ${opportunityCount} active opportunities.`, 400, 'IS_PRIMARY_CONTACT'));
  }

  try {
    // Soft delete
    await Contact.findByIdAndUpdate(req.params.id, {
      isActive: false,
      updatedBy: req.user._id
    });

    res.status(200).json({
      status: 'success',
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    return next(new AppError('Error deleting contact', 500, 'DELETE_ERROR'));
  }
});

/**
 * Get contact statistics
 * @route GET /api/contacts/stats
 * @access Private
 */
const getContactStats = asyncHandler(async (req, res, next) => {
  const { dateFrom, dateTo, ownerId, accountId } = req.query;
  
  // Determine which contacts to include based on user role
  let targetOwnerId = req.user._id;
  if (req.user.role === 'admin' && ownerId) {
    targetOwnerId = ownerId;
  } else if (req.user.role === 'manager') {
    targetOwnerId = ownerId || req.user._id;
  }

  const matchStage = { 
    ownerId: mongoose.Types.ObjectId(targetOwnerId), 
    isActive: true 
  };

  if (accountId) {
    if (!mongoose.Types.ObjectId.isValid(accountId)) {
      return next(new AppError('Invalid account ID format', 400, 'INVALID_ACCOUNT_ID'));
    }
    matchStage.accountId = mongoose.Types.ObjectId(accountId);
  }

  if (dateFrom || dateTo) {
    matchStage.createdAt = {};
    if (dateFrom) matchStage.createdAt.$gte = new Date(dateFrom);
    if (dateTo) matchStage.createdAt.$lte = new Date(dateTo);
  }

  try {
    const stats = await Contact.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalContacts: { $sum: 1 },
          contactsWithEmail: {
            $sum: { 
              $cond: [
                { 
                  $and: [
                    { $ne: ['$email', null] },
                    { $ne: ['$email', ''] }
                  ]
                }, 
                1, 
                0
              ] 
            }
          },
          contactsWithPhone: {
            $sum: { 
              $cond: [
                { 
                  $or: [
                    { 
                      $and: [
                        { $ne: ['$phone', null] },
                        { $ne: ['$phone', ''] }
                      ]
                    },
                    { 
                      $and: [
                        { $ne: ['$mobilePhone', null] },
                        { $ne: ['$mobilePhone', ''] }
                      ]
                    },
                    { 
                      $and: [
                        { $ne: ['$homePhone', null] },
                        { $ne: ['$homePhone', ''] }
                      ]
                    }
                  ]
                }, 
                1, 
                0
              ] 
            }
          },
          contactsWithBothEmailAndPhone: {
            $sum: { 
              $cond: [
                { 
                  $and: [
                    { $ne: ['$email', null] },
                    { $ne: ['$email', ''] },
                    { 
                      $or: [
                        { 
                          $and: [
                            { $ne: ['$phone', null] },
                            { $ne: ['$phone', ''] }
                          ]
                        },
                        { 
                          $and: [
                            { $ne: ['$mobilePhone', null] },
                            { $ne: ['$mobilePhone', ''] }
                          ]
                        }
                      ]
                    }
                  ]
                }, 
                1, 
                0
              ] 
            }
          },
          byDepartment: {
            $push: {
              $cond: [
                { $ne: ['$department', null] },
                '$department',
                'Unspecified'
              ]
            }
          },
          byTitle: {
            $push: {
              $cond: [
                { $ne: ['$title', null] },
                '$title',
                'Unspecified'
              ]
            }
          },
          byLeadSource: {
            $push: {
              $cond: [
                { $ne: ['$leadSource', null] },
                '$leadSource',
                'Unknown'
              ]
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
          contactsWithBothEmailAndPhone: 1,
          emailContactRate: {
            $cond: [
              { $eq: ['$totalContacts', 0] },
              0,
              { $round: [{ $multiply: [{ $divide: ['$contactsWithEmail', '$totalContacts'] }, 100] }, 2] }
            ]
          },
          phoneContactRate: {
            $cond: [
              { $eq: ['$totalContacts', 0] },
              0,
              { $round: [{ $multiply: [{ $divide: ['$contactsWithPhone', '$totalContacts'] }, 100] }, 2] }
            ]
          },
          completeContactRate: {
            $cond: [
              { $eq: ['$totalContacts', 0] },
              0,
              { $round: [{ $multiply: [{ $divide: ['$contactsWithBothEmailAndPhone', '$totalContacts'] }, 100] }, 2] }
            ]
          },
          byDepartment: 1,
          byTitle: 1,
          byLeadSource: 1
        }
      }
    ]);

    // Process department, title, and lead source statistics
    const result = stats[0] || {
      totalContacts: 0,
      contactsWithEmail: 0,
      contactsWithPhone: 0,
      contactsWithBothEmailAndPhone: 0,
      emailContactRate: 0,
      phoneContactRate: 0,
      completeContactRate: 0,
      byDepartment: [],
      byTitle: [],
      byLeadSource: []
    };

    // Group and count departments
    if (result.byDepartment) {
      const departmentCounts = result.byDepartment.reduce((acc, dept) => {
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
      }, {});
      result.byDepartment = Object.entries(departmentCounts)
        .map(([department, count]) => ({ department, count }))
        .sort((a, b) => b.count - a.count);
    }

    // Group and count titles
    if (result.byTitle) {
      const titleCounts = result.byTitle.reduce((acc, title) => {
        acc[title] = (acc[title] || 0) + 1;
        return acc;
      }, {});
      result.byTitle = Object.entries(titleCounts)
        .map(([title, count]) => ({ title, count }))
        .sort((a, b) => b.count - a.count);
    }

    // Group and count lead sources
    if (result.byLeadSource) {
      const sourceCounts = result.byLeadSource.reduce((acc, source) => {
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {});
      result.byLeadSource = Object.entries(sourceCounts)
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count);
    }

    res.status(200).json({
      status: 'success',
      data: {
        stats: result
      }
    });
  } catch (error) {
    return next(new AppError('Error generating contact statistics', 500, 'STATS_ERROR'));
  }
});

/**
 * Get contacts by account
 * @route GET /api/contacts/by-account/:accountId
 * @access Private
 */
const getContactsByAccount = asyncHandler(async (req, res, next) => {
  const { accountId } = req.params;
  const { limit = 50, includeInactive = false } = req.query;

  if (!mongoose.Types.ObjectId.isValid(accountId)) {
    return next(new AppError('Invalid account ID format', 400, 'INVALID_ACCOUNT_ID'));
  }

  // Verify account exists and user has access
  const account = await Account.findById(accountId);
  if (!account) {
    return next(new AppError('Account not found', 404, 'ACCOUNT_NOT_FOUND'));
  }

  // Check access permissions
  if (req.user.role === 'sales_rep' && account.ownerId.toString() !== req.user._id.toString()) {
    return next(new AppError('Access denied. You can only view contacts for your own accounts.', 403, 'ACCESS_DENIED'));
  }

  try {
    const contacts = await Contact.findByAccount(accountId, { 
      limit: parseInt(limit), 
      includeInactive: includeInactive === 'true' 
    });

    res.status(200).json({
      status: 'success',
      data: {
        contacts,
        account: {
          id: account._id,
          name: account.name,
          type: account.type
        }
      }
    });
  } catch (error) {
    return next(new AppError('Error fetching contacts by account', 500, 'FETCH_ERROR'));
  }
});

/**
 * Get recent contacts
 * @route GET /api/contacts/recent
 * @access Private
 */
const getRecentContacts = asyncHandler(async (req, res, next) => {
  const { limit = 10 } = req.query;
  
  const query = { isActive: true };
  
  // Role-based filtering
  if (req.user.role === 'sales_rep') {
    query.ownerId = req.user._id;
  }
  
  try {
    const contacts = await Contact.find(query)
      .populate('ownerId', 'firstName lastName email')
      .populate('accountId', 'name type')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      status: 'success',
      data: {
        contacts
      }
    });
  } catch (error) {
    return next(new AppError('Error fetching recent contacts', 500, 'FETCH_ERROR'));
  }
});

/**
 * Get contact hierarchy for an account
 * @route GET /api/contacts/hierarchy/:accountId
 * @access Private
 */
const getContactHierarchy = asyncHandler(async (req, res, next) => {
  const { accountId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(accountId)) {
    return next(new AppError('Invalid account ID format', 400, 'INVALID_ACCOUNT_ID'));
  }

  // Verify account exists and user has access
  const account = await Account.findById(accountId);
  if (!account) {
    return next(new AppError('Account not found', 404, 'ACCOUNT_NOT_FOUND'));
  }

  // Check access permissions
  if (req.user.role === 'sales_rep' && account.ownerId.toString() !== req.user._id.toString()) {
    return next(new AppError('Access denied. You can only view hierarchy for your own accounts.', 403, 'ACCESS_DENIED'));
  }

  try {
    const hierarchy = await Contact.getAccountHierarchy(accountId);

    res.status(200).json({
      status: 'success',
      data: {
        hierarchy,
        account: {
          id: account._id,
          name: account.name,
          type: account.type
        }
      }
    });
  } catch (error) {
    return next(new AppError('Error fetching contact hierarchy', 500, 'HIERARCHY_ERROR'));
  }
});

/**
 * Search contacts
 * @route GET /api/contacts/search
 * @access Private
 */
const searchContacts = asyncHandler(async (req, res, next) => {
  const { q, limit = 10, accountId } = req.query;

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

  // Filter by account if provided
  if (accountId) {
    if (!mongoose.Types.ObjectId.isValid(accountId)) {
      return next(new AppError('Invalid account ID format', 400, 'INVALID_ACCOUNT_ID'));
    }
    query.accountId = accountId;
  }

  try {
    const contacts = await Contact.find(query)
      .populate('ownerId', 'firstName lastName email')
      .populate('accountId', 'name type')
      .sort({ score: { $meta: 'textScore' } })
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      status: 'success',
      data: {
        contacts,
        count: contacts.length
      }
    });
  } catch (error) {
    return next(new AppError('Error searching contacts', 500, 'SEARCH_ERROR'));
  }
});

/**
 * Bulk update contacts
 * @route PUT /api/contacts/bulk-update
 * @access Private (Admin/Manager only)
 */
const bulkUpdateContacts = asyncHandler(async (req, res, next) => {
  if (!['admin', 'manager'].includes(req.user.role)) {
    return next(new AppError('Access denied. Bulk operations require admin or manager role.', 403, 'ACCESS_DENIED'));
  }

  const { contactIds, updates } = req.body;

  if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
    return next(new AppError('Please provide an array of contact IDs', 400, 'INVALID_INPUT'));
  }

  if (!updates || Object.keys(updates).length === 0) {
    return next(new AppError('Please provide fields to update', 400, 'INVALID_INPUT'));
  }

  // Validate all contact IDs
  const invalidIds = contactIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
  if (invalidIds.length > 0) {
    return next(new AppError('Invalid contact ID format in request', 400, 'INVALID_ID_FORMAT'));
  }

  // Validate updates don't contain restricted fields
  const restrictedFields = ['_id', 'createdAt', 'createdBy'];
  const hasRestrictedFields = restrictedFields.some(field => updates.hasOwnProperty(field));
  if (hasRestrictedFields) {
    return next(new AppError('Cannot update restricted fields', 400, 'RESTRICTED_FIELDS'));
  }

  // Add updatedBy to updates
  updates.updatedBy = req.user._id;

  try {
    const result = await Contact.updateMany(
      { _id: { $in: contactIds }, isActive: true },
      updates,
      { runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      message: `${result.modifiedCount} contacts updated successfully`,
      data: {
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount
      }
    });
  } catch (error) {
    return next(new AppError('Error updating contacts', 500, 'BULK_UPDATE_ERROR'));
  }
});

/**
 * Bulk delete contacts
 * @route DELETE /api/contacts/bulk-delete
 * @access Private (Admin/Manager only)
 */
const bulkDeleteContacts = asyncHandler(async (req, res, next) => {
  if (!['admin', 'manager'].includes(req.user.role)) {
    return next(new AppError('Access denied. Bulk operations require admin or manager role.', 403, 'ACCESS_DENIED'));
  }

  const { contactIds } = req.body;

  if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
    return next(new AppError('Please provide an array of contact IDs', 400, 'INVALID_INPUT'));
  }

  // Validate all contact IDs
  const invalidIds = contactIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
  if (invalidIds.length > 0) {
    return next(new AppError('Invalid contact ID format in request', 400, 'INVALID_ID_FORMAT'));
  }

  try {
    // Check for contacts with dependencies
    const [directReportsCount, opportunityCount] = await Promise.all([
      Contact.countDocuments({
        reportsToId: { $in: contactIds },
        isActive: true
      }),
      mongoose.model('Opportunity').countDocuments({
        primaryContactId: { $in: contactIds },
        isActive: true
      })
    ]);

    if (directReportsCount > 0) {
      return next(new AppError(`Cannot delete contacts. ${directReportsCount} contacts have direct reports.`, 400, 'HAS_DEPENDENCIES'));
    }

    if (opportunityCount > 0) {
      return next(new AppError(`Cannot delete contacts. ${opportunityCount} contacts are primary contacts for opportunities.`, 400, 'HAS_DEPENDENCIES'));
    }

    const result = await Contact.updateMany(
      { _id: { $in: contactIds }, isActive: true },
      { 
        isActive: false,
        updatedBy: req.user._id
      }
    );

    res.status(200).json({
      status: 'success',
      message: `${result.modifiedCount} contacts deleted successfully`,
      data: {
        deletedCount: result.modifiedCount
      }
    });
  } catch (error) {
    return next(new AppError('Error deleting contacts', 500, 'BULK_DELETE_ERROR'));
  }
});

/**
 * Export contacts to CSV
 * @route GET /api/contacts/export
 * @access Private
 */
const exportContacts = asyncHandler(async (req, res, next) => {
  const { format = 'csv', accountId, department } = req.query;
  
  const query = { isActive: true };
  
  // Role-based filtering
  if (req.user.role === 'sales_rep') {
    query.ownerId = req.user._id;
  }

  // Add filters
  if (accountId) {
    if (!mongoose.Types.ObjectId.isValid(accountId)) {
      return next(new AppError('Invalid account ID format', 400, 'INVALID_ACCOUNT_ID'));
    }
    query.accountId = accountId;
  }
  
  if (department) {
    query.department = new RegExp(department, 'i');
  }

  try {
    const contacts = await Contact.find(query)
      .populate('accountId', 'name type')
      .populate('ownerId', 'firstName lastName email')
      .populate('reportsToId', 'firstName lastName')
      .select('-__v -customFields -updatedBy -createdBy')
      .lean();

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeaders = [
        'ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Mobile Phone', 
        'Title', 'Department', 'Account', 'Reports To', 'Lead Source', 
        'Created Date', 'Last Activity'
      ];

      const csvRows = contacts.map(contact => [
        contact._id,
        contact.firstName,
        contact.lastName,
        contact.email || '',
        contact.phone || '',
        contact.mobilePhone || '',
        contact.title || '',
        contact.department || '',
        contact.accountId?.name || '',
        contact.reportsToId ? `${contact.reportsToId.firstName} ${contact.reportsToId.lastName}` : '',
        contact.leadSource || '',
        contact.createdAt,
        contact.lastActivityDate || ''
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=contacts-export.csv');
      return res.send(csvContent);
    }

    // Default JSON export
    res.status(200).json({
      status: 'success',
      data: {
        contacts,
        exportedAt: new Date().toISOString(),
        totalCount: contacts.length
      }
    });
  } catch (error) {
    return next(new AppError('Error exporting contacts', 500, 'EXPORT_ERROR'));
  }
});

/**
 * Update contact activity
 * @route PUT /api/contacts/:id/activity
 * @access Private
 */
const updateContactActivity = asyncHandler(async (req, res, next) => {
  const { activityType = 'general' } = req.body;

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new AppError('Invalid contact ID format', 400, 'INVALID_ID'));
  }

  const contact = await Contact.findById(req.params.id);

  if (!contact) {
    return next(new AppError('Contact not found', 404, 'CONTACT_NOT_FOUND'));
  }

  // Check access permissions
  if (req.user.role === 'sales_rep' && contact.ownerId.toString() !== req.user._id.toString()) {
    return next(new AppError('Access denied. You can only update activity for your own contacts.', 403, 'ACCESS_DENIED'));
  }

  try {
    await contact.updateLastActivity(new Date(), activityType);

    res.status(200).json({
      status: 'success',
      message: 'Contact activity updated successfully',
      data: {
        contactId: contact._id,
        lastActivityDate: contact.lastActivityDate
      }
    });
  } catch (error) {
    return next(new AppError('Error updating contact activity', 500, 'UPDATE_ACTIVITY_ERROR'));
  }
});

module.exports = {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  getContactStats,
  getContactsByAccount,
  getRecentContacts,
  getContactHierarchy,
  searchContacts,
  bulkUpdateContacts,
  bulkDeleteContacts,
  exportContacts,
  updateContactActivity
};