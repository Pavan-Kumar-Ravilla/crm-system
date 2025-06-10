// backend/routes/opportunities.js
const express = require('express');
const {
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
} = require('../controllers/opportunityController');
const { authenticate, requireSalesAccess, logActivity } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/errorHandler');
const { opportunityValidation, validateQuery } = require('../middleware/validation');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);
router.use(requireSalesAccess); // Require sales access for all opportunity operations

/**
 * @route   GET /api/opportunities/health
 * @desc    Health check for opportunity routes
 * @access  Private
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Opportunity routes are working',
    timestamp: new Date().toISOString()
  });
});

/**
 * @route   GET /api/opportunities/stats
 * @desc    Get opportunity statistics
 * @access  Private
 */
router.get('/stats',
  [
    validateQuery.dateFrom,
    validateQuery.dateTo
  ],
  handleValidationErrors,
  logActivity('VIEW_OPPORTUNITY_STATS'),
  getOpportunityStats
);

/**
 * @route   GET /api/opportunities/pipeline
 * @desc    Get sales pipeline data
 * @access  Private
 */
router.get('/pipeline',
  logActivity('VIEW_SALES_PIPELINE'),
  getPipelineData
);

/**
 * @route   GET /api/opportunities/forecast
 * @desc    Get forecast data
 * @access  Private
 */
router.get('/forecast',
  logActivity('VIEW_SALES_FORECAST'),
  getForecastData
);

/**
 * @route   GET /api/opportunities/recent
 * @desc    Get recent opportunities
 * @access  Private
 */
router.get('/recent',
  [validateQuery.limit],
  handleValidationErrors,
  logActivity('VIEW_RECENT_OPPORTUNITIES'),
  getRecentOpportunities
);

/**
 * @route   PUT /api/opportunities/bulk-update
 * @desc    Bulk update opportunities
 * @access  Private (Manager/Admin only)
 */
router.put('/bulk-update',
  logActivity('BULK_UPDATE_OPPORTUNITIES'),
  bulkUpdateOpportunities
);

/**
 * @route   DELETE /api/opportunities/bulk-delete
 * @desc    Bulk delete opportunities
 * @access  Private (Manager/Admin only)
 */
router.delete('/bulk-delete',
  logActivity('BULK_DELETE_OPPORTUNITIES'),
  bulkDeleteOpportunities
);

/**
 * @route   GET /api/opportunities
 * @desc    Get all opportunities with filtering and pagination
 * @access  Private (Sales Rep can see own opportunities, Manager/Admin can see all)
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
  logActivity('VIEW_OPPORTUNITIES'),
  getOpportunities
);

/**
 * @route   POST /api/opportunities
 * @desc    Create new opportunity
 * @access  Private
 */
router.post('/',
  opportunityValidation.create,
  handleValidationErrors,
  logActivity('CREATE_OPPORTUNITY'),
  createOpportunity
);

/**
 * @route   GET /api/opportunities/:id
 * @desc    Get single opportunity by ID
 * @access  Private
 */
router.get('/:id',
  logActivity('VIEW_OPPORTUNITY'),
  getOpportunity
);

/**
 * @route   PUT /api/opportunities/:id
 * @desc    Update opportunity
 * @access  Private
 */
router.put('/:id',
  opportunityValidation.update,
  handleValidationErrors,
  logActivity('UPDATE_OPPORTUNITY'),
  updateOpportunity
);

/**
 * @route   DELETE /api/opportunities/:id
 * @desc    Delete opportunity (soft delete)
 * @access  Private
 */
router.delete('/:id',
  logActivity('DELETE_OPPORTUNITY'),
  deleteOpportunity
);

// Error handling middleware specific to opportunities
router.use((error, req, res, next) => {
  console.error('Opportunity route error:', error);
  
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
      message: 'Invalid opportunity ID format'
    });
  }
  
  res.status(500).json({
    status: 'error',
    message: 'Internal server error in opportunity operations'
  });
});

module.exports = router;