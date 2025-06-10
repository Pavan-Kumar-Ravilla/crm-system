// src/components/auth/Login.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../common/Input';
import Button from '../common/Button';
import { Mail, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, isAuthenticated, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = location.state?.from?.pathname || '/dashboard';
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  // Clear auth errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear auth error when user makes changes
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await login(formData);
      
      if (result.success) {
        const redirectTo = location.state?.from?.pathname || '/dashboard';
        navigate(redirectTo, { replace: true });
      }
    } catch (err) {
      // Error is handled by the auth context
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="slds-scope">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/design-system/2.25.1/styles/salesforce-lightning-design-system.min.css" />
      
      <div className="slds-grid slds-grid_align-center slds-grid_vertical-align-center" style={{ minHeight: '100vh', backgroundColor: '#f3f2f2' }}>
        <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-2 slds-large-size_1-of-3">
          <div className="slds-card slds-p-around_large">
            {/* Header */}
            <div className="slds-text-align_center slds-m-bottom_large">
              <div className="slds-icon_container slds-icon-standard-account slds-m-bottom_medium">
                <svg className="slds-icon slds-icon_large" aria-hidden="true">
                  <use href="#standard-account"></use>
                </svg>
              </div>
              <h1 className="slds-text-heading_large slds-text-color_default">
                Welcome to CRM System
              </h1>
              <p className="slds-text-body_regular slds-text-color_weak slds-m-top_small">
                Sign in to your account to continue
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="slds-notify slds-notify_alert slds-alert_error slds-m-bottom_medium" role="alert">
                <span className="slds-icon_container slds-icon-utility-error slds-m-right_x-small">
                  <AlertCircle size={16} />
                </span>
                <h2 className="slds-text-heading_small">
                  {error}
                </h2>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="slds-form slds-form_stacked">
                {/* Email Field */}
                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                  disabled={isLoading}
                  error={formErrors.email}
                  leftIcon={<Mail size={16} />}
                  autoComplete="email"
                />

                {/* Password Field */}
                <div className="slds-m-top_medium">
                  <Input
                    label="Password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                    error={formErrors.password}
                    leftIcon={<Lock size={16} />}
                    autoComplete="current-password"
                  />
                </div>

                {/* Login Button */}
                <div className="slds-m-top_large">
                  <Button
                    type="submit"
                    variant="brand"
                    className="slds-button_stretch"
                    loading={isLoading}
                    disabled={isLoading}
                  >
                    Sign In
                  </Button>
                </div>
              </div>
            </form>

            {/* Footer Links */}
            <div className="slds-text-align_center slds-m-top_large">
              <div className="slds-m-bottom_small">
                <Link 
                  to="/forgot-password" 
                  className="slds-text-link"
                  tabIndex={isLoading ? -1 : 0}
                >
                  Forgot your password?
                </Link>
              </div>
              <div className="slds-text-body_small slds-text-color_weak">
                Don't have an account?{' '}
                <Link 
                  to="/signup" 
                  className="slds-text-link"
                  tabIndex={isLoading ? -1 : 0}
                >
                  Sign up
                </Link>
              </div>
            </div>

            {/* Demo Credentials */}
            {process.env.NODE_ENV === 'development' && (
              <div className="slds-box slds-theme_shade slds-m-top_large">
                <h3 className="slds-text-heading_small slds-m-bottom_small">
                  Demo Credentials
                </h3>
                <div className="slds-text-body_small">
                  <div className="slds-m-bottom_x-small">
                    <strong>Admin:</strong> admin@crm.com / password123
                  </div>
                  <div className="slds-m-bottom_x-small">
                    <strong>Manager:</strong> manager@crm.com / password123
                  </div>
                  <div>
                    <strong>Sales Rep:</strong> sales@crm.com / password123
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="slds-text-align_center slds-m-top_medium">
            <p className="slds-text-body_small slds-text-color_weak">
              © 2025 CRM System. Built with Salesforce Lightning Design System.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;