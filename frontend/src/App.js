import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import AppManager from './pages/AppManager';
import Leads from './pages/sales/Leads';
import LeadDetail from './pages/sales/LeadDetail';
import LeadForm from './pages/sales/LeadForm';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                <Route
                  path="/app-manager"
                  element={
                    <ProtectedRoute>
                      <AppManager />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/app/*"
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="sales" element={<Navigate to="leads" replace />} />
                  <Route path="sales/leads" element={<Leads />} />
                  <Route path="sales/leads/new" element={<LeadForm />} />
                  <Route path="sales/leads/:id" element={<LeadDetail />} />
                  <Route path="sales/leads/:id/edit" element={<LeadForm />} />
                  
                  <Route path="sales/contacts" element={<div>Contacts Page</div>} />
                  <Route path="sales/contacts/new" element={<div>New Contact</div>} />
                  <Route path="sales/contacts/:id" element={<div>Contact Detail</div>} />
                  <Route path="sales/contacts/:id/edit" element={<div>Edit Contact</div>} />
                  
                  <Route path="sales/accounts" element={<div>Accounts Page</div>} />
                  <Route path="sales/accounts/new" element={<div>New Account</div>} />
                  <Route path="sales/accounts/:id" element={<div>Account Detail</div>} />
                  <Route path="sales/accounts/:id/edit" element={<div>Edit Account</div>} />
                  
                  <Route path="sales/opportunities" element={<div>Opportunities Page</div>} />
                  <Route path="sales/opportunities/new" element={<div>New Opportunity</div>} />
                  <Route path="sales/opportunities/:id" element={<div>Opportunity Detail</div>} />
                  <Route path="sales/opportunities/:id/edit" element={<div>Edit Opportunity</div>} />
                  
                  <Route path="sales/activities" element={<div>Activities Page</div>} />
                  <Route path="sales/activities/new" element={<div>New Activity</div>} />
                  <Route path="sales/activities/:id" element={<div>Activity Detail</div>} />
                  <Route path="sales/activities/:id/edit" element={<div>Edit Activity</div>} />
                  
                  <Route path="sales/reports" element={<div>Reports Page</div>} />
                  
                  <Route path="marketing" element={<div>Marketing Cloud</div>} />
                  <Route path="service" element={<div>Service Cloud</div>} />
                  <Route path="analytics" element={<div>Analytics Cloud</div>} />
                  
                  <Route path="settings" element={<div>Settings Page</div>} />
                  <Route path="profile" element={<div>Profile Page</div>} />
                  <Route path="notifications" element={<div>Notifications Page</div>} />
                  <Route path="search" element={<div>Search Results</div>} />
                </Route>
                
                <Route path="/" element={<Navigate to="/app-manager" replace />} />
                <Route path="*" element={<Navigate to="/app-manager" replace />} />
              </Routes>
            </div>
            
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#fff',
                  color: '#374151',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                },
                success: {
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </Router>
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;