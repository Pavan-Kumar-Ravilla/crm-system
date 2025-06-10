// src/components/auth/Signup.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { User, Mail, Lock, Building, Phone, AlertCircle, CheckCircle } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    department: '',
    title: '',
    role: 'user'
  });
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, strength: 'Very Weak' });
  
  const { register, isAuthenticated, error, clearError } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Clear auth errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Calculate password strength
  useEffect(() => {
    if (formData.password) {
      const strength = calculatePasswordStrength(formData.password);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength({ score: 0, strength: 'Very Weak' });
    }
  }, [formData.password]);

  const calculatePasswordStrength = (password) => {
    let score = 0;
    
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    const strength = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    
    return {
      score,
      strength: strength[Math.min(score, 5)],
      percentage: Math.min((score / 6) * 100, 100)
    };
  };

  const getPasswordStrengthColor = () => {
    const { score } = passwordStrength;
    if (score <= 1) return '#c23934'; // Red
    if (score <= 2) return '#ff8a3c'; // Orange
    if (score <= 3) return '#ffb75d'; // Yellow
    if (score <= 4) return '#4bca81'; // Light Green
    return '#2e844a'; // Green
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (formData.firstName.length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (formData.lastName.length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    }
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
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
      const { confirmPassword, ...registrationData } = formData;
      const result = await register(registrationData);
      
      if (result.success) {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      // Error is handled by the auth context
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = [
    { value: 'user', label: 'User' },
    { value: 'sales_rep', label: 'Sales Representative' },
    { value: 'manager', label: 'Manager' },
    { value: 'admin', label: 'Administrator' }
  ];

  return (
    <div className="slds-scope">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/design-system/2.25.1/styles/salesforce-lightning-design-system.min.css" />
      
      <div className="slds-grid slds-grid_align-center slds-grid_vertical-align-center" style={{ minHeight: '100vh', backgroundColor: '#f3f2f2', padding: '2rem 0' }}>
        <div className="slds-col slds-size_1-of-1 slds-medium-size_2-of-3 slds-large-size_1-of-2">
          <div className="slds-card slds-p-around_large">
            {/* Header */}
            <div className="slds-text-align_center slds-m-bottom_large">
              <div className="slds-icon_container slds-icon-standard-account slds-m-bottom_medium">
                <svg className="slds-icon slds-icon_large" aria-hidden="true">
                  <use href="#standard-account"></use>
                </svg>
              </div>
              <h1 className="slds-text-heading_large slds-text-color_default">
                Create Your Account
              </h1>
              <p className="slds-text-body_regular slds-text-color_weak slds-m-top_small">
                Join our CRM system to get started
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

            {/* Signup Form */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="slds-form slds-form_stacked">
                {/* Name Fields */}
                <div className="slds-grid slds-gutters">
                  <div className="slds-col slds-size_1-of-2">
                    <Input
                      label="First Name"
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Enter your first name"
                      required
                      disabled={isLoading}
                      error={formErrors.firstName}
                      leftIcon={<User size={16} />}
                      autoComplete="given-name"
                    />
                  </div>
                  <div className="slds-col slds-size_1-of-2">
                    <Input
                      label="Last Name"
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Enter your last name"
                      required
                      disabled={isLoading}
                      error={formErrors.lastName}
                      autoComplete="family-name"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="slds-m-top_medium">
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
                </div>

                {/* Password Fields */}
                <div className="slds-grid slds-gutters slds-m-top_medium">
                  <div className="slds-col slds-size_1-of-2">
                    <Input
                      label="Password"
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Create a password"
                      required
                      disabled={isLoading}
                      error={formErrors.password}
                      leftIcon={<Lock size={16} />}
                      autoComplete="new-password"
                    />
                    
                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <div className="slds-m-top_small">
                        <div className="slds-text-body_small slds-m-bottom_x-small">
                          Password strength: <strong style={{ color: getPasswordStrengthColor() }}>
                            {passwordStrength.strength}
                          </strong>
                        </div>
                        <div className="slds-progress-bar slds-progress-bar_small">
                          <span 
                            className="slds-progress-bar__value" 
                            style={{ 
                              width: `${passwordStrength.percentage}%`,
                              backgroundColor: getPasswordStrengthColor()
                            }}
                          >
                            <span className="slds-assistive-text">Progress: {passwordStrength.percentage}%</span>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="slds-col slds-size_1-of-2">
                    <Input
                      label="Confirm Password"
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your password"
                      required
                      disabled={isLoading}
                      error={formErrors.confirmPassword}
                      leftIcon={<Lock size={16} />}
                      rightIcon={formData.confirmPassword && formData.password === formData.confirmPassword ? <CheckCircle size={16} color="#2e844a" /> : null}
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                {/* Professional Information */}
                <div className="slds-grid slds-gutters slds-m-top_medium">
                  <div className="slds-col slds-size_1-of-2">
                    <Input
                      label="Phone Number"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                      disabled={isLoading}
                      error={formErrors.phone}
                      leftIcon={<Phone size={16} />}
                      autoComplete="tel"
                    />
                  </div>
                  <div className="slds-col slds-size_1-of-2">
                    <Select
                      label="Role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      options={roleOptions}
                      disabled={isLoading}
                      error={formErrors.role}
                    />
                  </div>
                </div>

                <div className="slds-grid slds-gutters slds-m-top_medium">
                  <div className="slds-col slds-size_1-of-2">
                    <Input
                      label="Department"
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      placeholder="e.g., Sales, Marketing"
                      disabled={isLoading}
                      error={formErrors.department}
                      leftIcon={<Building size={16} />}
                    />
                  </div>
                  <div className="slds-col slds-size_1-of-2">
                    <Input
                      label="Job Title"
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g., Sales Manager"
                      disabled={isLoading}
                      error={formErrors.title}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="slds-m-top_large">
                  <Button
                    type="submit"
                    variant="brand"
                    className="slds-button_stretch"
                    loading={isLoading}
                    disabled={isLoading}
                  >
                    Create Account
                  </Button>
                </div>
              </div>
            </form>

            {/* Footer Links */}
            <div className="slds-text-align_center slds-m-top_large">
              <div className="slds-text-body_small slds-text-color_weak">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="slds-text-link"
                  tabIndex={isLoading ? -1 : 0}
                >
                  Sign in
                </Link>
              </div>
            </div>
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

export default Signup;