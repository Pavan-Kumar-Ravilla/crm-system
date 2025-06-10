// src/context/AppContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state
const initialState = {
  // UI State
  sidebarCollapsed: false,
  theme: 'light',
  
  // Navigation state
  activeTab: 'dashboard',
  breadcrumbs: [],
  
  // Data loading states
  loading: {
    leads: false,
    contacts: false,
    accounts: false,
    opportunities: false,
    activities: false
  },
  
  // Error states
  errors: {
    leads: null,
    contacts: null,
    accounts: null,
    opportunities: null,
    activities: null
  },
  
  // Cached data
  cache: {
    leads: [],
    contacts: [],
    accounts: [],
    opportunities: [],
    activities: [],
    users: []
  },
  
  // Pagination states
  pagination: {
    leads: { page: 1, limit: 20, totalCount: 0 },
    contacts: { page: 1, limit: 20, totalCount: 0 },
    accounts: { page: 1, limit: 20, totalCount: 0 },
    opportunities: { page: 1, limit: 20, totalCount: 0 },
    activities: { page: 1, limit: 20, totalCount: 0 }
  },
  
  // Filter states
  filters: {
    leads: {},
    contacts: {},
    accounts: {},
    opportunities: {},
    activities: {}
  },
  
  // Search states
  searchQueries: {
    leads: '',
    contacts: '',
    accounts: '',
    opportunities: '',
    activities: ''
  },
  
  // Modal states
  modals: {
    leadForm: false,
    contactForm: false,
    accountForm: false,
    opportunityForm: false,
    activityForm: false,
    confirmDelete: false
  },
  
  // Form states
  forms: {
    lead: {},
    contact: {},
    account: {},
    opportunity: {},
    activity: {}
  },
  
  // Selected items
  selected: {
    leads: [],
    contacts: [],
    accounts: [],
    opportunities: [],
    activities: []
  },
  
  // Notifications
  notifications: [],
  
  // App settings
  settings: {
    recordsPerPage: 20,
    autoRefresh: true,
    refreshInterval: 300000, // 5 minutes
    notifications: {
      email: true,
      browser: true,
      desktop: false
    }
  }
};

// Action types
const APP_ACTIONS = {
  // UI Actions
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_THEME: 'SET_THEME',
  SET_ACTIVE_TAB: 'SET_ACTIVE_TAB',
  SET_BREADCRUMBS: 'SET_BREADCRUMBS',
  
  // Loading Actions
  SET_LOADING: 'SET_LOADING',
  CLEAR_LOADING: 'CLEAR_LOADING',
  
  // Error Actions
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  CLEAR_ALL_ERRORS: 'CLEAR_ALL_ERRORS',
  
  // Data Actions
  SET_DATA: 'SET_DATA',
  ADD_ITEM: 'ADD_ITEM',
  UPDATE_ITEM: 'UPDATE_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  CLEAR_DATA: 'CLEAR_DATA',
  
  // Pagination Actions
  SET_PAGINATION: 'SET_PAGINATION',
  
  // Filter Actions
  SET_FILTER: 'SET_FILTER',
  CLEAR_FILTERS: 'CLEAR_FILTERS',
  
  // Search Actions
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  CLEAR_SEARCH: 'CLEAR_SEARCH',
  
  // Modal Actions
  OPEN_MODAL: 'OPEN_MODAL',
  CLOSE_MODAL: 'CLOSE_MODAL',
  CLOSE_ALL_MODALS: 'CLOSE_ALL_MODALS',
  
  // Form Actions
  SET_FORM_DATA: 'SET_FORM_DATA',
  CLEAR_FORM_DATA: 'CLEAR_FORM_DATA',
  
  // Selection Actions
  SELECT_ITEM: 'SELECT_ITEM',
  DESELECT_ITEM: 'DESELECT_ITEM',
  SELECT_ALL: 'SELECT_ALL',
  CLEAR_SELECTION: 'CLEAR_SELECTION',
  
  // Notification Actions
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  CLEAR_NOTIFICATIONS: 'CLEAR_NOTIFICATIONS',
  
  // Settings Actions
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  RESET_SETTINGS: 'RESET_SETTINGS'
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case APP_ACTIONS.TOGGLE_SIDEBAR:
      return {
        ...state,
        sidebarCollapsed: !state.sidebarCollapsed
      };

    case APP_ACTIONS.SET_THEME:
      return {
        ...state,
        theme: action.payload
      };

    case APP_ACTIONS.SET_ACTIVE_TAB:
      return {
        ...state,
        activeTab: action.payload
      };

    case APP_ACTIONS.SET_BREADCRUMBS:
      return {
        ...state,
        breadcrumbs: action.payload
      };

    case APP_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.entity]: action.payload.isLoading
        }
      };

    case APP_ACTIONS.CLEAR_LOADING:
      return {
        ...state,
        loading: initialState.loading
      };

    case APP_ACTIONS.SET_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.entity]: action.payload.error
        }
      };

    case APP_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload]: null
        }
      };

    case APP_ACTIONS.CLEAR_ALL_ERRORS:
      return {
        ...state,
        errors: initialState.errors
      };

    case APP_ACTIONS.SET_DATA:
      return {
        ...state,
        cache: {
          ...state.cache,
          [action.payload.entity]: action.payload.data
        }
      };

    case APP_ACTIONS.ADD_ITEM:
      return {
        ...state,
        cache: {
          ...state.cache,
          [action.payload.entity]: [
            action.payload.item,
            ...state.cache[action.payload.entity]
          ]
        }
      };

    case APP_ACTIONS.UPDATE_ITEM:
      return {
        ...state,
        cache: {
          ...state.cache,
          [action.payload.entity]: state.cache[action.payload.entity].map(item =>
            item.id === action.payload.item.id ? action.payload.item : item
          )
        }
      };

    case APP_ACTIONS.REMOVE_ITEM:
      return {
        ...state,
        cache: {
          ...state.cache,
          [action.payload.entity]: state.cache[action.payload.entity].filter(
            item => item.id !== action.payload.id
          )
        }
      };

    case APP_ACTIONS.CLEAR_DATA:
      return {
        ...state,
        cache: action.payload ? {
          ...state.cache,
          [action.payload]: []
        } : initialState.cache
      };

    case APP_ACTIONS.SET_PAGINATION:
      return {
        ...state,
        pagination: {
          ...state.pagination,
          [action.payload.entity]: {
            ...state.pagination[action.payload.entity],
            ...action.payload.pagination
          }
        }
      };

    case APP_ACTIONS.SET_FILTER:
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload.entity]: {
            ...state.filters[action.payload.entity],
            ...action.payload.filters
          }
        }
      };

    case APP_ACTIONS.CLEAR_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          [action.payload]: {}
        }
      };

    case APP_ACTIONS.SET_SEARCH_QUERY:
      return {
        ...state,
        searchQueries: {
          ...state.searchQueries,
          [action.payload.entity]: action.payload.query
        }
      };

    case APP_ACTIONS.CLEAR_SEARCH:
      return {
        ...state,
        searchQueries: {
          ...state.searchQueries,
          [action.payload]: ''
        }
      };

    case APP_ACTIONS.OPEN_MODAL:
      return {
        ...state,
        modals: {
          ...state.modals,
          [action.payload]: true
        }
      };

    case APP_ACTIONS.CLOSE_MODAL:
      return {
        ...state,
        modals: {
          ...state.modals,
          [action.payload]: false
        }
      };

    case APP_ACTIONS.CLOSE_ALL_MODALS:
      return {
        ...state,
        modals: initialState.modals
      };

    case APP_ACTIONS.SET_FORM_DATA:
      return {
        ...state,
        forms: {
          ...state.forms,
          [action.payload.entity]: {
            ...state.forms[action.payload.entity],
            ...action.payload.data
          }
        }
      };

    case APP_ACTIONS.CLEAR_FORM_DATA:
      return {
        ...state,
        forms: {
          ...state.forms,
          [action.payload]: {}
        }
      };

    case APP_ACTIONS.SELECT_ITEM:
      return {
        ...state,
        selected: {
          ...state.selected,
          [action.payload.entity]: action.payload.multiple
            ? [...state.selected[action.payload.entity], action.payload.id]
            : [action.payload.id]
        }
      };

    case APP_ACTIONS.DESELECT_ITEM:
      return {
        ...state,
        selected: {
          ...state.selected,
          [action.payload.entity]: state.selected[action.payload.entity].filter(
            id => id !== action.payload.id
          )
        }
      };

    case APP_ACTIONS.SELECT_ALL:
      return {
        ...state,
        selected: {
          ...state.selected,
          [action.payload.entity]: action.payload.ids
        }
      };

    case APP_ACTIONS.CLEAR_SELECTION:
      return {
        ...state,
        selected: {
          ...state.selected,
          [action.payload]: []
        }
      };

    case APP_ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [
          ...state.notifications,
          {
            id: Date.now(),
            timestamp: new Date(),
            ...action.payload
          }
        ]
      };

    case APP_ACTIONS.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification.id !== action.payload
        )
      };

    case APP_ACTIONS.CLEAR_NOTIFICATIONS:
      return {
        ...state,
        notifications: []
      };

    case APP_ACTIONS.UPDATE_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload
        }
      };

    case APP_ACTIONS.RESET_SETTINGS:
      return {
        ...state,
        settings: initialState.settings
      };

    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Context provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        dispatch({
          type: APP_ACTIONS.UPDATE_SETTINGS,
          payload: settings
        });
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(state.settings));
  }, [state.settings]);

  // UI Actions
  const toggleSidebar = () => {
    dispatch({ type: APP_ACTIONS.TOGGLE_SIDEBAR });
  };

  const setTheme = (theme) => {
    dispatch({ type: APP_ACTIONS.SET_THEME, payload: theme });
  };

  const setActiveTab = (tab) => {
    dispatch({ type: APP_ACTIONS.SET_ACTIVE_TAB, payload: tab });
  };

  const setBreadcrumbs = (breadcrumbs) => {
    dispatch({ type: APP_ACTIONS.SET_BREADCRUMBS, payload: breadcrumbs });
  };

  // Loading Actions
  const setLoading = (entity, isLoading) => {
    dispatch({
      type: APP_ACTIONS.SET_LOADING,
      payload: { entity, isLoading }
    });
  };

  const clearLoading = () => {
    dispatch({ type: APP_ACTIONS.CLEAR_LOADING });
  };

  // Error Actions
  const setError = (entity, error) => {
    dispatch({
      type: APP_ACTIONS.SET_ERROR,
      payload: { entity, error }
    });
  };

  const clearError = (entity) => {
    dispatch({ type: APP_ACTIONS.CLEAR_ERROR, payload: entity });
  };

  const clearAllErrors = () => {
    dispatch({ type: APP_ACTIONS.CLEAR_ALL_ERRORS });
  };

  // Data Actions
  const setData = (entity, data) => {
    dispatch({
      type: APP_ACTIONS.SET_DATA,
      payload: { entity, data }
    });
  };

  const addItem = (entity, item) => {
    dispatch({
      type: APP_ACTIONS.ADD_ITEM,
      payload: { entity, item }
    });
  };

  const updateItem = (entity, item) => {
    dispatch({
      type: APP_ACTIONS.UPDATE_ITEM,
      payload: { entity, item }
    });
  };

  const removeItem = (entity, id) => {
    dispatch({
      type: APP_ACTIONS.REMOVE_ITEM,
      payload: { entity, id }
    });
  };

  const clearData = (entity) => {
    dispatch({ type: APP_ACTIONS.CLEAR_DATA, payload: entity });
  };

  // Pagination Actions
  const setPagination = (entity, pagination) => {
    dispatch({
      type: APP_ACTIONS.SET_PAGINATION,
      payload: { entity, pagination }
    });
  };

  // Filter Actions
  const setFilter = (entity, filters) => {
    dispatch({
      type: APP_ACTIONS.SET_FILTER,
      payload: { entity, filters }
    });
  };

  const clearFilters = (entity) => {
    dispatch({ type: APP_ACTIONS.CLEAR_FILTERS, payload: entity });
  };

  // Search Actions
  const setSearchQuery = (entity, query) => {
    dispatch({
      type: APP_ACTIONS.SET_SEARCH_QUERY,
      payload: { entity, query }
    });
  };

  const clearSearch = (entity) => {
    dispatch({ type: APP_ACTIONS.CLEAR_SEARCH, payload: entity });
  };

  // Modal Actions
  const openModal = (modal) => {
    dispatch({ type: APP_ACTIONS.OPEN_MODAL, payload: modal });
  };

  const closeModal = (modal) => {
    dispatch({ type: APP_ACTIONS.CLOSE_MODAL, payload: modal });
  };

  const closeAllModals = () => {
    dispatch({ type: APP_ACTIONS.CLOSE_ALL_MODALS });
  };

  // Form Actions
  const setFormData = (entity, data) => {
    dispatch({
      type: APP_ACTIONS.SET_FORM_DATA,
      payload: { entity, data }
    });
  };

  const clearFormData = (entity) => {
    dispatch({ type: APP_ACTIONS.CLEAR_FORM_DATA, payload: entity });
  };

  // Selection Actions
  const selectItem = (entity, id, multiple = false) => {
    dispatch({
      type: APP_ACTIONS.SELECT_ITEM,
      payload: { entity, id, multiple }
    });
  };

  const deselectItem = (entity, id) => {
    dispatch({
      type: APP_ACTIONS.DESELECT_ITEM,
      payload: { entity, id }
    });
  };

  const selectAll = (entity, ids) => {
    dispatch({
      type: APP_ACTIONS.SELECT_ALL,
      payload: { entity, ids }
    });
  };

  const clearSelection = (entity) => {
    dispatch({ type: APP_ACTIONS.CLEAR_SELECTION, payload: entity });
  };

  // Notification Actions
  const addNotification = (notification) => {
    dispatch({ type: APP_ACTIONS.ADD_NOTIFICATION, payload: notification });
    
    // Auto-remove notification after delay
    if (notification.autoRemove !== false) {
      setTimeout(() => {
        removeNotification(notification.id || Date.now());
      }, notification.duration || 5000);
    }
  };

  const removeNotification = (id) => {
    dispatch({ type: APP_ACTIONS.REMOVE_NOTIFICATION, payload: id });
  };

  const clearNotifications = () => {
    dispatch({ type: APP_ACTIONS.CLEAR_NOTIFICATIONS });
  };

  // Settings Actions
  const updateSettings = (settings) => {
    dispatch({ type: APP_ACTIONS.UPDATE_SETTINGS, payload: settings });
  };

  const resetSettings = () => {
    dispatch({ type: APP_ACTIONS.RESET_SETTINGS });
  };

  const contextValue = {
    // State
    ...state,
    
    // UI Actions
    toggleSidebar,
    setTheme,
    setActiveTab,
    setBreadcrumbs,
    
    // Loading Actions
    setLoading,
    clearLoading,
    
    // Error Actions
    setError,
    clearError,
    clearAllErrors,
    
    // Data Actions
    setData,
    addItem,
    updateItem,
    removeItem,
    clearData,
    
    // Pagination Actions
    setPagination,
    
    // Filter Actions
    setFilter,
    clearFilters,
    
    // Search Actions
    setSearchQuery,
    clearSearch,
    
    // Modal Actions
    openModal,
    closeModal,
    closeAllModals,
    
    // Form Actions
    setFormData,
    clearFormData,
    
    // Selection Actions
    selectItem,
    deselectItem,
    selectAll,
    clearSelection,
    
    // Notification Actions
    addNotification,
    removeNotification,
    clearNotifications,
    
    // Settings Actions
    updateSettings,
    resetSettings
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use app context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;