// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import PrivateRoute from './components/common/PrivateRoute';

// Auth Components
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import ForgotPassword from './components/auth/ForgotPassword';

// Main App Components
import AppLayout from './components/layout/AppLayout';
import Dashboard from './components/dashboard/Dashboard';

// CRM Module Components
import LeadsList from './components/leads/LeadsList';
import LeadView from './components/leads/LeadView';
import ContactsList from './components/contacts/ContactsList';
import ContactView from './components/contacts/ContactView';
import AccountsList from './components/accounts/AccountsList';
import AccountView from './components/accounts/AccountView';
import OpportunitiesList from './components/opportunities/OpportunitiesList';
import OpportunityView from './components/opportunities/OpportunityView';
import ActivitiesList from './components/activities/ActivitiesList';
import ActivityView from './components/activities/ActivityView';

// Styles
import './App.css';
import './styles/slds-overrides.css';

function App() {
  return (
    <div className="App">
      <Router>
        <AuthProvider>
          <AppProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              {/* Protected Routes */}
              <Route 
                path="/" 
                element={
                  <PrivateRoute>
                    <AppLayout />
                  </PrivateRoute>
                }
              >
                {/* Dashboard */}
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                
                {/* Leads */}
                <Route path="leads">
                  <Route index element={<LeadsList />} />
                  <Route path="new" element={<LeadView mode="create" />} />
                  <Route path=":id" element={<LeadView mode="view" />} />
                  <Route path=":id/edit" element={<LeadView mode="edit" />} />
                </Route>
                
                {/* Contacts */}
                <Route path="contacts">
                  <Route index element={<ContactsList />} />
                  <Route path="new" element={<ContactView mode="create" />} />
                  <Route path=":id" element={<ContactView mode="view" />} />
                  <Route path=":id/edit" element={<ContactView mode="edit" />} />
                </Route>
                
                {/* Accounts */}
                <Route path="accounts">
                  <Route index element={<AccountsList />} />
                  <Route path="new" element={<AccountView mode="create" />} />
                  <Route path=":id" element={<AccountView mode="view" />} />
                  <Route path=":id/edit" element={<AccountView mode="edit" />} />
                </Route>
                
                {/* Opportunities */}
                <Route path="opportunities">
                  <Route index element={<OpportunitiesList />} />
                  <Route path="new" element={<OpportunityView mode="create" />} />
                  <Route path=":id" element={<OpportunityView mode="view" />} />
                  <Route path=":id/edit" element={<OpportunityView mode="edit" />} />
                </Route>
                
                {/* Activities */}
                <Route path="activities">
                  <Route index element={<ActivitiesList />} />
                  <Route path="new" element={<ActivityView mode="create" />} />
                  <Route path=":id" element={<ActivityView mode="view" />} />
                  <Route path=":id/edit" element={<ActivityView mode="edit" />} />
                </Route>
              </Route>
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AppProvider>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;