// src/components/auth/ForgotPassword.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../common/Input';
import Button from '../common/Button';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const { forgotPassword } = useAuth();

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await forgotPassword(email);
      
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'Failed to send reset email');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) {
      setError('');
    }
  };

  if (success) {
    return (
      <div className="slds-scope">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/design-system/2.25.1/styles/salesforce-lightning-design-system.min.css" />
        
        <div className="slds-grid slds-grid_align-center slds-grid_vertical-align-center" style={{ minHeight: '100vh', backgroundColor: '#f3f2f2' }}>
          <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-2 slds-large-size_1-of-3">
            <div className="slds-card slds-p-around_large">
              <div className="slds-text-align_center">
                <div className="slds-icon_container slds-icon_container_circle slds-icon-action-approval slds-m-bottom_medium" style={{ backgroundColor: '#4bca81' }}>
                  <CheckCircle size={32} color="white" />
                </div>
                <h1 className="slds-text-heading_large slds-text-color_default slds-m-bottom_medium">
                  Check Your Email
                </h1>
                <p className="slds-text-body_regular slds-text-color_weak slds-m-bottom_large">
                  We've sent a password reset link to <strong>{email}</strong>. 
                  Please check your email and click the link to reset your password.
                </p>
                <p className="slds-text-body_small slds-text-color_weak slds-m-bottom_large">
                  Didn't receive the email? Check your spam folder or try again with a different email address.
                </p>
                <div className="slds-grid slds-grid_vertical slds-grid_align-center">
                  <Button
                    variant="brand"
                    onClick={() => {
                      setSuccess(false);
                      setEmail('');
                    }}
                    className="slds-m-bottom_small"
                  >
                    Try Again
                  </Button>
                  <Link to="/login" className="slds-text-link">
                    Back to Sign In
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="slds-scope">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/design-system/2.25.1/styles/salesforce-lightning-design-system.min.css" />
      
      <div className="slds-grid slds-grid_align-center slds-grid_vertical-align-center" style={{ minHeight: '100vh', backgroundColor: '#f3f2f2' }}>
        <div className="slds-col slds-size_1-of-1 slds-medium-size_1-of-2 slds-large-size_1-of-3">
          <div className="slds-card slds-p-around_large">
            {/* Header */}
            <div className="slds-text-align_center slds-m-bottom_large">
              <Link 
                to="/login" 
                className="slds-button slds-button_icon slds-float_left"
                title="Back to Sign In"
              >
                <ArrowLeft size={16} />
                <span className="slds-assistive-text">Back to Sign In</span>
              </Link>
              
              <div className="slds-icon_container slds-icon-standard-password slds-m-bottom_medium">
                <Mail size={32} />
              </div>
              <h1 className="slds-text-heading_large slds-text-color_default">
                Reset Your Password
              </h1>
              <p className="slds-text-body_regular slds-text-color_weak slds-m-top_small">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="slds-notify slds-notify_alert slds-alert_error slds-m-bottom_medium" role="alert">
                <h2 className="slds-text-heading_small">
                  {error}
                </h2>
              </div>
            )}

            {/* Reset Form */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="slds-form slds-form_stacked">
                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Enter your email address"
                  required
                  disabled={loading}
                  error={error}
                  leftIcon={<Mail size={16} />}
                  autoComplete="email"
                  autoFocus
                />

                <div className="slds-m-top_large">
                  <Button
                    type="submit"
                    variant="brand"
                    className="slds-button_stretch"
                    loading={loading}
                    disabled={loading || !email}
                  >
                    Send Reset Link
                  </Button>
                </div>
              </div>
            </form>

            {/* Footer Links */}
            <div className="slds-text-align_center slds-m-top_large">
              <div className="slds-text-body_small slds-text-color_weak">
                Remember your password?{' '}
                <Link to="/login" className="slds-text-link">
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

export default ForgotPassword;