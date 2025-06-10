// backend/routes/accounts.js
const express = require('express');
const {
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
} = require('../controllers/accountController');
const { authenticate, requireSalesAccess, logActivity } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/errorHandler');
const { accountValidation, validateQuery } = require('../middleware/validation');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);
router.use(requireSalesAccess); // Require sales access for all account operations

/**
 * @route   GET /api/accounts
 * @desc    Get all accounts with filtering and pagination
 * @access  Private (Sales Rep can see own accounts, Manager/Admin can see all)
 */
router.get('/',
  [
    validateQuery.page,
    validateQuery.limit,
    validateQuery.sort,
    validateQuery.search,
    validateQuery.dateFrom,
    validateQuery.dateTo
  ],
  handleValidationErrors,
  logActivity('VIEW_ACCOUNTS'),
  getAccounts
);

/**
 * @route   GET /api/accounts/stats
 * @desc    Get account statistics
 * @access  Private
 */
router.get('/stats',
  [
    validateQuery.dateFrom,
    validateQuery.dateTo
  ],
  handleValidationErrors,
  logActivity('VIEW_ACCOUNT_STATS'),
  getAccountStats
);

/**
 * @route   GET /api/accounts/recent
 * @desc    Get recent accounts
 * @access  Private
 */
router.get('/recent',
  [validateQuery.limit],
  handleValidationErrors,
  logActivity('VIEW_RECENT_ACCOUNTS'),
  getRecentAccounts
);

/**
 * @route   GET /api/accounts/search
 * @desc    Search accounts
 * @access  Private
 */
router.get('/search',
  [validateQuery.search, validateQuery.limit],
  handleValidationErrors,
  logActivity('SEARCH_ACCOUNTS'),
  searchAccounts
);

/**
 * @route   POST /api/accounts
 * @desc    Create new account
 * @access  Private
 */
router.post('/',
  accountValidation.create,
  handleValidationErrors,
  logActivity('CREATE_ACCOUNT'),
  createAccount
);

/**
 * @route   PUT /api/accounts/bulk-update
 * @desc    Bulk update accounts
 * @access  Private (Manager/Admin only)
 */
router.put('/bulk-update',
  logActivity('BULK_UPDATE_ACCOUNTS'),
  bulkUpdateAccounts
);

/**
 * @route   DELETE /api/accounts/bulk-delete
 * @desc    Bulk delete accounts
 * @access  Private (Manager/Admin only)
 */
router.delete('/bulk-delete',
  logActivity('BULK_DELETE_ACCOUNTS'),
  bulkDeleteAccounts
);

/**
 * @route   GET /api/accounts/:id
 * @desc    Get single account by ID
 * @access  Private
 */
router.get('/:id',
  logActivity('VIEW_ACCOUNT'),
  getAccount
);

/**
 * @route   GET /api/accounts/:id/summary
 * @desc    Get account summary with related data
 * @access  Private
 */
router.get('/:id/summary',
  logActivity('VIEW_ACCOUNT_SUMMARY'),
  getAccountSummary
);

/**
 * @route   GET /api/accounts/:id/hierarchy
 * @desc    Get account hierarchy
 * @access  Private
 */
router.get('/:id/hierarchy',
  logActivity('VIEW_ACCOUNT_HIERARCHY'),
  getAccountHierarchy
);

/**
 * @route   PUT /api/accounts/:id
 * @desc    Update account
 * @access  Private
 */
router.put('/:id',
  accountValidation.update,
  handleValidationErrors,
  logActivity('UPDATE_ACCOUNT'),
  updateAccount
);

/**
 * @route   DELETE /api/accounts/:id
 * @desc    Delete account (soft delete)
 * @access  Private
 */
router.delete('/:id',
  logActivity('DELETE_ACCOUNT'),
  deleteAccount
);

// Health check for account routes
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Account routes are working',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;