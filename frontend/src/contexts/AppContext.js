import React, { createContext, useContext, useReducer } from 'react';

const AppContext = createContext();

const initialState = {
  selectedApp: null,
  sidebarCollapsed: false,
  theme: 'light',
  notifications: [],
  globalSearch: '',
  currentModule: null,
  breadcrumbs: [],
};

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_SELECTED_APP':
      return {
        ...state,
        selectedApp: action.payload,
        currentModule: null,
        breadcrumbs: [{ label: action.payload.label, path: action.payload.path }],
      };
    case 'SET_CURRENT_MODULE':
      return {
        ...state,
        currentModule: action.payload,
      };
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        sidebarCollapsed: !state.sidebarCollapsed,
      };
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };
    case 'SET_GLOBAL_SEARCH':
      return {
        ...state,
        globalSearch: action.payload,
      };
    case 'SET_BREADCRUMBS':
      return {
        ...state,
        breadcrumbs: action.payload,
      };
    case 'ADD_BREADCRUMB':
      return {
        ...state,
        breadcrumbs: [...state.breadcrumbs, action.payload],
      };
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const setSelectedApp = (app) => {
    dispatch({ type: 'SET_SELECTED_APP', payload: app });
  };

  const setCurrentModule = (module) => {
    dispatch({ type: 'SET_CURRENT_MODULE', payload: module });
  };

  const toggleSidebar = () => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  };

  const setTheme = (theme) => {
    dispatch({ type: 'SET_THEME', payload: theme });
  };

  const addNotification = (notification) => {
    const id = Date.now();
    dispatch({ type: 'ADD_NOTIFICATION', payload: { ...notification, id } });
    
    if (notification.autoRemove !== false) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration || 5000);
    }
  };

  const removeNotification = (id) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  const setGlobalSearch = (search) => {
    dispatch({ type: 'SET_GLOBAL_SEARCH', payload: search });
  };

  const setBreadcrumbs = (breadcrumbs) => {
    dispatch({ type: 'SET_BREADCRUMBS', payload: breadcrumbs });
  };

  const addBreadcrumb = (breadcrumb) => {
    dispatch({ type: 'ADD_BREADCRUMB', payload: breadcrumb });
  };

  const value = {
    ...state,
    setSelectedApp,
    setCurrentModule,
    toggleSidebar,
    setTheme,
    addNotification,
    removeNotification,
    setGlobalSearch,
    setBreadcrumbs,
    addBreadcrumb,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};