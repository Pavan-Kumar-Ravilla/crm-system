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
  getRecentLeads,
  assignLead,
  addLeadNote,
  getLeadActivities,
  scheduleLeadFollowUp
} = require('../controllers/leadController');
const { authenticate, requireSalesAccess, logActivity } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/errorHandler');
const { leadValidation, validateQuery } = require('../middleware/validation');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);
router.use(requireSalesAccess); // Require sales access for all lead operations

/**
 * @route   GET /api/leads/health
 * @desc    Health check for lead routes
 * @access  Private
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Lead routes are working',
    timestamp: new Date().toISOString()
  });
});

/**
 * @route   GET /api/leads/stats
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
 * @route   PUT /api/leads/bulk-update
 * @desc    Bulk update leads
 * @access  Private (Manager/Admin only)
 */
router.put('/bulk-update',
  leadValidation.bulkUpdate,
  handleValidationErrors,
  logActivity('BULK_UPDATE_LEADS'),
  bulkUpdateLeads
);

/**
 * @route   DELETE /api/leads/bulk-delete
 * @desc    Bulk delete leads
 * @access  Private (Manager/Admin only)
 */
router.delete('/bulk-delete',
  leadValidation.bulkDelete,
  handleValidationErrors,
  logActivity('BULK_DELETE_LEADS'),
  bulkDeleteLeads
);

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
    validateQuery.dateTo,
    validateQuery.assignedTo,
    validateQuery.source,
    validateQuery.priority
  ],
  handleValidationErrors,
  logActivity('VIEW_LEADS'),
  getLeads
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
 * @route   GET /api/leads/:id
 * @desc    Get single lead by ID
 * @access  Private
 */
router.get('/:id',
  leadValidation.leadId,
  handleValidationErrors,
  logActivity('VIEW_LEAD'),
  getLead
);

/**
 * @route   PUT /api/leads/:id
 * @desc    Update lead
 * @access  Private
 */
router.put('/:id',
  [
    leadValidation.leadId,
    leadValidation.update
  ],
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
  leadValidation.leadId,
  handleValidationErrors,
  logActivity('DELETE_LEAD'),
  deleteLead
);

/**
 * @route   POST /api/leads/:id/convert
 * @desc    Convert lead to contact/account/opportunity
 * @access  Private
 */
router.post('/:id/convert',
  [
    leadValidation.leadId,
    leadValidation.convert
  ],
  handleValidationErrors,
  logActivity('CONVERT_LEAD'),
  convertLead
);

/**
 * @route   POST /api/leads/:id/assign
 * @desc    Assign lead to another user
 * @access  Private (Manager/Admin only)
 */
router.post('/:id/assign',
  [
    leadValidation.leadId,
    leadValidation.assign
  ],
  handleValidationErrors,
  logActivity('ASSIGN_LEAD'),
  assignLead
);

/**
 * @route   POST /api/leads/:id/notes
 * @desc    Add note to lead
 * @access  Private
 */
router.post('/:id/notes',
  [
    leadValidation.leadId,
    leadValidation.addNote
  ],
  handleValidationErrors,
  logActivity('ADD_LEAD_NOTE'),
  addLeadNote
);

/**
 * @route   GET /api/leads/:id/activities
 * @desc    Get lead activity history
 * @access  Private
 */
router.get('/:id/activities',
  [
    leadValidation.leadId,
    validateQuery.page,
    validateQuery.limit
  ],
  handleValidationErrors,
  logActivity('VIEW_LEAD_ACTIVITIES'),
  getLeadActivities
);

/**
 * @route   POST /api/leads/:id/follow-up
 * @desc    Schedule follow-up for lead
 * @access  Private
 */
router.post('/:id/follow-up',
  [
    leadValidation.leadId,
    leadValidation.followUp
  ],
  handleValidationErrors,
  logActivity('SCHEDULE_LEAD_FOLLOWUP'),
  scheduleLeadFollowUp
);

// Error handling middleware specific to leads
router.use((error, req, res, next) => {
  console.error('Lead route error:', error);
  
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
      message: 'Invalid lead ID format'
    });
  }
  
  res.status(500).json({
    status: 'error',
    message: 'Internal server error in lead operations'
  });
});

module.exports = router;