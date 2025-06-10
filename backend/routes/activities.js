// backend/routes/activities.js
const express = require('express');
const {
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
} = require('../controllers/activityController');
const { authenticate, requireSalesAccess, logActivity } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/errorHandler');
const { activityValidation, validateQuery } = require('../middleware/validation');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);
router.use(requireSalesAccess); // Require sales access for all activity operations

/**
 * @route   GET /api/activities/health
 * @desc    Health check for activity routes
 * @access  Private
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Activity routes are working',
    timestamp: new Date().toISOString()
  });
});

/**
 * @route   GET /api/activities/stats
 * @desc    Get activity statistics
 * @access  Private
 */
router.get('/stats',
  [
    validateQuery.dateFrom,
    validateQuery.dateTo
  ],
  handleValidationErrors,
  logActivity('VIEW_ACTIVITY_STATS'),
  getActivityStats
);

/**
 * @route   GET /api/activities/upcoming
 * @desc    Get upcoming activities
 * @access  Private
 */
router.get('/upcoming',
  logActivity('VIEW_UPCOMING_ACTIVITIES'),
  getUpcomingActivities
);

/**
 * @route   GET /api/activities/overdue
 * @desc    Get overdue activities
 * @access  Private
 */
router.get('/overdue',
  logActivity('VIEW_OVERDUE_ACTIVITIES'),
  getOverdueActivities
);

/**
 * @route   GET /api/activities/recent
 * @desc    Get recent activities
 * @access  Private
 */
router.get('/recent',
  [validateQuery.limit],
  handleValidationErrors,
  logActivity('VIEW_RECENT_ACTIVITIES'),
  getRecentActivities
);

/**
 * @route   GET /api/activities
 * @desc    Get all activities with filtering and pagination
 * @access  Private
 */
router.get('/',
  [
    validateQuery.page,
    validateQuery.limit,
    validateQuery.sort,
    validateQuery.search,
    validateQuery.status,
    validateQuery.priority,
    validateQuery.dateFrom,
    validateQuery.dateTo
  ],
  handleValidationErrors,
  logActivity('VIEW_ACTIVITIES'),
  getActivities
);

/**
 * @route   POST /api/activities
 * @desc    Create new activity
 * @access  Private
 */
router.post('/',
  activityValidation.create,
  handleValidationErrors,
  logActivity('CREATE_ACTIVITY'),
  createActivity
);

/**
 * @route   GET /api/activities/:id
 * @desc    Get single activity by ID
 * @access  Private
 */
router.get('/:id',
  logActivity('VIEW_ACTIVITY'),
  getActivity
);

/**
 * @route   PUT /api/activities/:id
 * @desc    Update activity
 * @access  Private
 */
router.put('/:id',
  activityValidation.update,
  handleValidationErrors,
  logActivity('UPDATE_ACTIVITY'),
  updateActivity
);

/**
 * @route   PUT /api/activities/:id/complete
 * @desc    Mark activity as completed
 * @access  Private
 */
router.put('/:id/complete',
  logActivity('COMPLETE_ACTIVITY'),
  completeActivity
);

/**
 * @route   DELETE /api/activities/:id
 * @desc    Delete activity (soft delete)
 * @access  Private
 */
router.delete('/:id',
  logActivity('DELETE_ACTIVITY'),
  deleteActivity
);

// Error handling middleware specific to activities
router.use((error, req, res, next) => {
  console.error('Activity route error:', error);
  
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
      message: 'Invalid activity ID format'
    });
  }
  
  res.status(500).json({
    status: 'error',
    message: 'Internal server error in activity operations'
  });
});

module.exports = router;