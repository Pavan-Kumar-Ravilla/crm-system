// backend/middleware/validation.js
const { body, param, query } = require('express-validator');
const mongoose = require('mongoose');

/**
 * Common validation rules that can be reused across different routes
 */

// MongoDB ObjectId validation
const validateObjectId = (field = 'id') => {
  return param(field)
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid ID format');
      }
      return true;
    });
};

// Email validation
const validateEmail = (field = 'email', options = {}) => {
  const { required = true } = options;
  
  let validation = body(field)
    .trim()
    .normalizeEmail();
    
  if (required) {
    validation = validation.notEmpty().withMessage(`${field} is required`);
  } else {
    validation = validation.optional();
  }
  
  return validation
    .isEmail()
    .withMessage(`Please provide a valid ${field}`);
};

// Phone validation
const validatePhone = (field = 'phone', options = {}) => {
  const { required = false } = options;
  
  let validation = body(field).trim();
  
  if (required) {
    validation = validation.notEmpty().withMessage(`${field} is required`);
  } else {
    validation = validation.optional();
  }
  
  return validation
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage(`Please provide a valid ${field} number`);
};

// Name validation (for first name, last name, etc.)
const validateName = (field, options = {}) => {
  const { required = true, min = 2, max = 50 } = options;
  
  let validation = body(field).trim();
  
  if (required) {
    validation = validation.notEmpty().withMessage(`${field} is required`);
  } else {
    validation = validation.optional();
  }
  
  return validation
    .isLength({ min, max })
    .withMessage(`${field} must be between ${min} and ${max} characters`)
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage(`${field} can only contain letters, spaces, hyphens, and apostrophes`);
};

// Text field validation
const validateText = (field, options = {}) => {
  const { required = false, min = 0, max = 1000 } = options;
  
  let validation = body(field).trim();
  
  if (required) {
    validation = validation.notEmpty().withMessage(`${field} is required`);
  } else {
    validation = validation.optional();
  }
  
  return validation
    .isLength({ min, max })
    .withMessage(`${field} must be between ${min} and ${max} characters`);
};

// URL validation
const validateUrl = (field, options = {}) => {
  const { required = false } = options;
  
  let validation = body(field).trim();
  
  if (required) {
    validation = validation.notEmpty().withMessage(`${field} is required`);
  } else {
    validation = validation.optional();
  }
  
  return validation
    .isURL({ require_protocol: true })
    .withMessage(`Please provide a valid ${field} URL`);
};

// Date validation
const validateDate = (field, options = {}) => {
  const { required = false, isFuture = false, isPast = false } = options;
  
  let validation = body(field);
  
  if (required) {
    validation = validation.notEmpty().withMessage(`${field} is required`);
  } else {
    validation = validation.optional();
  }
  
  validation = validation
    .isISO8601()
    .withMessage(`Please provide a valid ${field} date`);
    
  if (isFuture) {
    validation = validation.custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error(`${field} must be a future date`);
      }
      return true;
    });
  }
  
  if (isPast) {
    validation = validation.custom((value) => {
      if (new Date(value) >= new Date()) {
        throw new Error(`${field} must be a past date`);
      }
      return true;
    });
  }
  
  return validation;
};

// Number validation
const validateNumber = (field, options = {}) => {
  const { required = false, min, max, isInteger = false } = options;
  
  let validation = body(field);
  
  if (required) {
    validation = validation.notEmpty().withMessage(`${field} is required`);
  } else {
    validation = validation.optional();
  }
  
  if (isInteger) {
    validation = validation.isInt({ min, max }).withMessage(
      `${field} must be an integer${min !== undefined ? ` >= ${min}` : ''}${max !== undefined ? ` <= ${max}` : ''}`
    );
  } else {
    validation = validation.isFloat({ min, max }).withMessage(
      `${field} must be a number${min !== undefined ? ` >= ${min}` : ''}${max !== undefined ? ` <= ${max}` : ''}`
    );
  }
  
  return validation;
};

// Enum validation
const validateEnum = (field, values, options = {}) => {
  const { required = false } = options;
  
  let validation = body(field);
  
  if (required) {
    validation = validation.notEmpty().withMessage(`${field} is required`);
  } else {
    validation = validation.optional();
  }
  
  return validation
    .isIn(values)
    .withMessage(`${field} must be one of: ${values.join(', ')}`);
};

// Array validation
const validateArray = (field, options = {}) => {
  const { required = false, min = 0, max, itemType = 'string' } = options;
  
  let validation = body(field);
  
  if (required) {
    validation = validation.notEmpty().withMessage(`${field} is required`);
  } else {
    validation = validation.optional();
  }
  
  validation = validation
    .isArray({ min, max })
    .withMessage(
      `${field} must be an array${min ? ` with at least ${min} items` : ''}${max ? ` with at most ${max} items` : ''}`
    );
    
  if (itemType === 'objectId') {
    validation = validation.custom((array) => {
      for (const item of array) {
        if (!mongoose.Types.ObjectId.isValid(item)) {
          throw new Error(`${field} must contain valid ObjectIds`);
        }
      }
      return true;
    });
  }
  
  return validation;
};

// Password validation
const validatePassword = (field = 'password', options = {}) => {
  const { required = true, minLength = 6 } = options;
  
  let validation = body(field);
  
  if (required) {
    validation = validation.notEmpty().withMessage(`${field} is required`);
  } else {
    validation = validation.optional();
  }
  
  return validation
    .isLength({ min: minLength })
    .withMessage(`${field} must be at least ${minLength} characters long`)
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(`${field} must contain at least one lowercase letter, one uppercase letter, and one number`);
};

// Query parameter validation
const validateQuery = {
  page: query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
    
  limit: query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
    
  sort: query('sort')
    .optional()
    .matches(/^[a-zA-Z_]+(:asc|:desc)?$/)
    .withMessage('Sort must be in format: field or field:asc or field:desc'),
    
  search: query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
    
  status: query('status')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Status must be between 1 and 50 characters'),
    
  dateFrom: query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Date from must be a valid date'),
    
  dateTo: query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Date to must be a valid date')
};

// Common validation sets for different entities
const leadValidation = {
  create: [
    validateName('firstName'),
    validateName('lastName'),
    validateText('company', { required: true, max: 100 }),
    validateEmail('email', { required: false }),
    validatePhone('phone'),
    validateEnum('status', ['New', 'Contacted', 'Qualified', 'Unqualified']),
    validateEnum('leadSource', ['Website', 'Phone Inquiry', 'Partner Referral', 'Trade Show', 'Web', 'Other']),
    validateText('notes', { max: 1000 })
  ],
  
  update: [
    validateObjectId(),
    validateName('firstName', { required: false }),
    validateName('lastName', { required: false }),
    validateText('company', { required: false, max: 100 }),
    validateEmail('email', { required: false }),
    validatePhone('phone'),
    validateEnum('status', ['New', 'Contacted', 'Qualified', 'Unqualified'], { required: false }),
    validateEnum('leadSource', ['Website', 'Phone Inquiry', 'Partner Referral', 'Trade Show', 'Web', 'Other'], { required: false }),
    validateText('notes', { max: 1000 })
  ]
};

const contactValidation = {
  create: [
    validateName('firstName'),
    validateName('lastName'),
    validateEmail('email', { required: false }),
    validatePhone('phone'),
    validatePhone('mobilePhone'),
    validateText('title', { max: 100 }),
    validateText('department', { max: 100 }),
    validateObjectId('accountId').optional(),
    validateText('description', { max: 1000 })
  ],
  
  update: [
    validateObjectId(),
    validateName('firstName', { required: false }),
    validateName('lastName', { required: false }),
    validateEmail('email', { required: false }),
    validatePhone('phone'),
    validatePhone('mobilePhone'),
    validateText('title', { max: 100 }),
    validateText('department', { max: 100 }),
    validateObjectId('accountId').optional(),
    validateText('description', { max: 1000 })
  ]
};

const accountValidation = {
  create: [
    validateText('name', { required: true, max: 100 }),
    validateEnum('type', ['Customer', 'Prospect', 'Partner', 'Competitor', 'Other']),
    validateEnum('industry', [
      'Technology', 'Healthcare', 'Finance', 'Manufacturing', 
      'Retail', 'Education', 'Government', 'Non-profit', 
      'Real Estate', 'Transportation', 'Energy', 'Other'
    ]),
    validateUrl('website'),
    validatePhone('phone'),
    validateText('description', { max: 1000 }),
    validateNumber('employees', { min: 0, isInteger: true }),
    validateNumber('annualRevenue', { min: 0 })
  ],
  
  update: [
    validateObjectId(),
    validateText('name', { required: false, max: 100 }),
    validateEnum('type', ['Customer', 'Prospect', 'Partner', 'Competitor', 'Other'], { required: false }),
    validateEnum('industry', [
      'Technology', 'Healthcare', 'Finance', 'Manufacturing', 
      'Retail', 'Education', 'Government', 'Non-profit', 
      'Real Estate', 'Transportation', 'Energy', 'Other'
    ], { required: false }),
    validateUrl('website'),
    validatePhone('phone'),
    validateText('description', { max: 1000 }),
    validateNumber('employees', { min: 0, isInteger: true }),
    validateNumber('annualRevenue', { min: 0 })
  ]
};

const opportunityValidation = {
  create: [
    validateText('name', { required: true, max: 100 }),
    validateObjectId('accountId'),
    validateEnum('stage', [
      'Prospecting', 'Qualification', 'Needs Analysis', 
      'Value Proposition', 'Id. Decision Makers', 'Perception Analysis',
      'Proposal/Price Quote', 'Negotiation/Review', 'Closed Won', 'Closed Lost'
    ]),
    validateNumber('amount', { min: 0 }),
    validateNumber('probability', { min: 0, max: 100, isInteger: true }),
    validateDate('closeDate', { required: true, isFuture: true }),
    validateText('description', { max: 1000 })
  ],
  
  update: [
    validateObjectId(),
    validateText('name', { required: false, max: 100 }),
    validateObjectId('accountId').optional(),
    validateEnum('stage', [
      'Prospecting', 'Qualification', 'Needs Analysis', 
      'Value Proposition', 'Id. Decision Makers', 'Perception Analysis',
      'Proposal/Price Quote', 'Negotiation/Review', 'Closed Won', 'Closed Lost'
    ], { required: false }),
    validateNumber('amount', { min: 0 }),
    validateNumber('probability', { min: 0, max: 100, isInteger: true }),
    validateDate('closeDate'),
    validateText('description', { max: 1000 })
  ]
};

const activityValidation = {
  create: [
    validateText('subject', { required: true, max: 255 }),
    validateEnum('type', ['Call', 'Email', 'Meeting', 'Task', 'Note']),
    validateEnum('status', ['Not Started', 'In Progress', 'Completed', 'Waiting on someone else', 'Deferred']),
    validateEnum('priority', ['High', 'Normal', 'Low']),
    validateDate('dueDate'),
    validateDate('startDate'),
    validateDate('endDate'),
    validateText('description', { max: 1000 }),
    validateObjectId('leadId').optional(),
    validateObjectId('contactId').optional(),
    validateObjectId('accountId').optional(),
    validateObjectId('opportunityId').optional()
  ],
  
  update: [
    validateObjectId(),
    validateText('subject', { required: false, max: 255 }),
    validateEnum('type', ['Call', 'Email', 'Meeting', 'Task', 'Note'], { required: false }),
    validateEnum('status', ['Not Started', 'In Progress', 'Completed', 'Waiting on someone else', 'Deferred'], { required: false }),
    validateEnum('priority', ['High', 'Normal', 'Low'], { required: false }),
    validateDate('dueDate'),
    validateDate('startDate'),
    validateDate('endDate'),
    validateText('description', { max: 1000 }),
    validateObjectId('leadId').optional(),
    validateObjectId('contactId').optional(),
    validateObjectId('accountId').optional(),
    validateObjectId('opportunityId').optional()
  ]
};

module.exports = {
  // Individual validators
  validateObjectId,
  validateEmail,
  validatePhone,
  validateName,
  validateText,
  validateUrl,
  validateDate,
  validateNumber,
  validateEnum,
  validateArray,
  validatePassword,
  validateQuery,
  
  // Entity validation sets
  leadValidation,
  contactValidation,
  accountValidation,
  opportunityValidation,
  activityValidation
};