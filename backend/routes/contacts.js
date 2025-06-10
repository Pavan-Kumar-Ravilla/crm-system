// backend/routes/contacts.js
const express = require('express');
const {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  getContactStats,
  getContactsByAccount,
  getRecentContacts,
  bulkUpdateContacts,
  bulkDeleteContacts
} = require('../controllers/contactController');
const { authenticate, requireSalesAccess, logActivity } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/errorHandler');
const { contactValidation, validateQuery } = require('../middleware/validation');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);
router.use(requireSalesAccess); // Require sales access for all contact operations

/**
 * @route   GET /api/contacts/health
 * @desc    Health check for contact routes
 * @access  Private
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Contact routes are working',
    timestamp: new Date().toISOString()
  });
});

/**
 * @route   GET /api/contacts/stats
 * @desc    Get contact statistics
 * @access  Private
 */
router.get('/stats',
  [
    validateQuery.dateFrom,
    validateQuery.dateTo
  ],
  handleValidationErrors,
  logActivity('VIEW_CONTACT_STATS'),
  getContactStats
);

/**
 * @route   GET /api/contacts/recent
 * @desc    Get recent contacts
 * @access  Private
 */
router.get('/recent',
  [validateQuery.limit],
  handleValidationErrors,
  logActivity('VIEW_RECENT_CONTACTS'),
  getRecentContacts
);

/**
 * @route   GET /api/contacts/by-account/:accountId
 * @desc    Get contacts by account
 * @access  Private
 */
router.get('/by-account/:accountId',
  [validateQuery.limit],
  handleValidationErrors,
  logActivity('VIEW_CONTACTS_BY_ACCOUNT'),
  getContactsByAccount
);

/**
 * @route   PUT /api/contacts/bulk-update
 * @desc    Bulk update contacts
 * @access  Private (Manager/Admin only)
 */
router.put('/bulk-update',
  logActivity('BULK_UPDATE_CONTACTS'),
  bulkUpdateContacts
);

/**
 * @route   DELETE /api/contacts/bulk-delete
 * @desc    Bulk delete contacts
 * @access  Private (Manager/Admin only)
 */
router.delete('/bulk-delete',
  logActivity('BULK_DELETE_CONTACTS'),
  bulkDeleteContacts
);

/**
 * @route   GET /api/contacts
 * @desc    Get all contacts with filtering and pagination
 * @access  Private (Sales Rep can see own contacts, Manager/Admin can see all)
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
  logActivity('VIEW_CONTACTS'),
  getContacts
);

/**
 * @route   POST /api/contacts
 * @desc    Create new contact
 * @access  Private
 */
router.post('/',
  contactValidation.create,
  handleValidationErrors,
  logActivity('CREATE_CONTACT'),
  createContact
);

/**
 * @route   GET /api/contacts/:id
 * @desc    Get single contact by ID
 * @access  Private
 */
router.get('/:id',
  logActivity('VIEW_CONTACT'),
  getContact
);

/**
 * @route   PUT /api/contacts/:id
 * @desc    Update contact
 * @access  Private
 */
router.put('/:id',
  contactValidation.update,
  handleValidationErrors,
  logActivity('UPDATE_CONTACT'),
  updateContact
);

/**
 * @route   DELETE /api/contacts/:id
 * @desc    Delete contact (soft delete)
 * @access  Private
 */
router.delete('/:id',
  logActivity('DELETE_CONTACT'),
  deleteContact
);

// Error handling middleware specific to contacts
router.use((error, req, res, next) => {
  console.error('Contact route error:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: error.errors
    });
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid contact ID format'
    });
  }
  
  res.status(500).json({
    status: 'error',
    message: 'Internal server error in contact operations'
  });
});

module.exports = router;