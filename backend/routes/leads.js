// backend/routes/leads.js
const express = require('express');
const {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  convertLead,
  getLeadStats,
  bulkUpdateLeads,
  bulkDeleteLeads,
  getRecentLeads
} = require('../controllers/leadController');
const { authenticate, requireSalesAccess, logActivity } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/errorHandler');
const { leadValidation, validateQuery } = require('../middleware/validation');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);
router.use(requireSalesAccess); // Require sales access for all lead operations

/**
 * @route   GET /api/leads
 * @desc    Get all leads with filtering and pagination
 * @access  Private (Sales Rep can see own leads, Manager/Admin can see all)
 */
router.get('/',
  [
    validateQuery.page,
    validateQuery.limit,
    validateQuery.sort,
    validateQuery.search,
    validateQuery.status,
    validateQuery.dateFrom,
    validateQuery.dateTo
  ],
  handleValidationErrors,
  logActivity('VIEW_LEADS'),
  getLeads
);

/**
 * @route   GET /api/leads/recent
 * @desc    Get recent leads
 * @access  Private
 */
router.get('/recent',
  [validateQuery.limit],
  handleValidationErrors,
  logActivity('VIEW_RECENT_LEADS'),
  getRecentLeads
);

/**
 * @route   POST /api/leads
 * @desc    Create new lead
 * @access  Private
 */
router.post('/',
  leadValidation.create,
  handleValidationErrors,
  logActivity('CREATE_LEAD'),
  createLead
);

/**
 * @route   PUT /api/leads/bulk-update
 * @desc    Bulk update leads
 * @access  Private (Manager/Admin only)
 */
router.put('/bulk-update',
  logActivity('BULK_UPDATE_LEADS'),
  bulkUpdateLeads
);

/**
 * @route   DELETE /api/leads/bulk-delete
 * @desc    Bulk delete leads
 * @access  Private (Manager/Admin only)
 */
router.delete('/bulk-delete',
  logActivity('BULK_DELETE_LEADS'),
  bulkDeleteLeads
);

/**
 * @route   GET /api/leads/:id
 * @desc    Get single lead by ID
 * @access  Private
 */
router.get('/:id',
  logActivity('VIEW_LEAD'),
  getLead
);

/**
 * @route   PUT /api/leads/:id
 * @desc    Update lead
 * @access  Private
 */
router.put('/:id',
  leadValidation.update,
  handleValidationErrors,
  logActivity('UPDATE_LEAD'),
  updateLead
);

/**
 * @route   DELETE /api/leads/:id
 * @desc    Delete lead (soft delete)
 * @access  Private
 */
router.delete('/:id',
  logActivity('DELETE_LEAD'),
  deleteLead
);

/**
 * @route   POST /api/leads/:id/convert
 * @desc    Convert lead to contact/account/opportunity
 * @access  Private
 */
// Health check for lead routes
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Lead routes are working',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;stats
 * @desc    Get lead statistics
 * @access  Private
 */
router.get('/stats',
  [
    validateQuery.dateFrom,
    validateQuery.dateTo
  ],
  handleValidationErrors,
  logActivity('VIEW_LEAD_STATS'),
  getLeadStats
);

/**
 * @route   GET /api/leads/