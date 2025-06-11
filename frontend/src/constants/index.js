export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH: '/auth/refresh'
  },
  LEADS: {
    LIST: '/leads',
    CREATE: '/leads',
    UPDATE: (id) => `/leads/${id}`,
    DELETE: (id) => `/leads/${id}`,
    CONVERT: (id) => `/leads/${id}/convert`
  },
  CONTACTS: {
    LIST: '/contacts',
    CREATE: '/contacts',
    UPDATE: (id) => `/contacts/${id}`,
    DELETE: (id) => `/contacts/${id}`
  },
  ACCOUNTS: {
    LIST: '/accounts',
    CREATE: '/accounts',
    UPDATE: (id) => `/accounts/${id}`,
    DELETE: (id) => `/accounts/${id}`
  },
  OPPORTUNITIES: {
    LIST: '/opportunities',
    CREATE: '/opportunities',
    UPDATE: (id) => `/opportunities/${id}`,
    DELETE: (id) => `/opportunities/${id}`
  }
};

export const LEAD_STATUSES = [
  'New',
  'Contacted',
  'Qualified',
  'Unqualified'
];

export const LEAD_SOURCES = [
  'Website',
  'Phone Inquiry',
  'Partner Referral',
  'Trade Show',
  'Email Campaign',
  'Social Media',
  'Other'
];

export const OPPORTUNITY_STAGES = [
  'Prospecting',
  'Qualification',
  'Needs Analysis',
  'Value Proposition',
  'Id. Decision Makers',
  'Perception Analysis',
  'Proposal/Price Quote',
  'Negotiation/Review',
  'Closed Won',
  'Closed Lost'
];

export const ACCOUNT_TYPES = [
  'Prospect',
  'Customer - Direct',
  'Customer - Channel',
  'Channel Partner / Reseller',
  'Installation Partner',
  'Technology Partner',
  'Other'
];

export const INDUSTRIES = [
  'Agriculture',
  'Apparel',
  'Banking',
  'Biotechnology',
  'Chemicals',
  'Communications',
  'Construction',
  'Consulting',
  'Education',
  'Electronics',
  'Energy',
  'Engineering',
  'Entertainment',
  'Environmental',
  'Finance',
  'Food & Beverage',
  'Government',
  'Healthcare',
  'Hospitality',
  'Insurance',
  'Machinery',
  'Manufacturing',
  'Media',
  'Not For Profit',
  'Other',
  'Recreation',
  'Retail',
  'Shipping',
  'Technology',
  'Telecommunications',
  'Transportation',
  'Utilities'
];