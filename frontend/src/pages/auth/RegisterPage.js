// src/pages/auth/RegisterPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import DynamicForm from '../../components/forms/DynamicForm';
import Card from '../../components/ui/Card';

const registerSchema = yup.object().shape({
  firstName: yup.string().required('First name is required').min(2, 'Must be at least 2 characters'),
  lastName: yup.string().required('Last name is required').min(2, 'Must be at least 2 characters'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup.string()
    .required('Confirm password is required')
    .oneOf([yup.ref('password')], 'Passwords must match'),
});

const RegisterPage = () => {
  const { register, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState('');

  const fields = [
    {
      name: 'firstName',
      type: 'text',
      label: 'First Name',
      placeholder: 'Enter your first name',
      required: true
    },
    {
      name: 'lastName',
      type: 'text',
      label: 'Last Name',
      placeholder: 'Enter your last name',
      required: true
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email Address',
      placeholder: 'Enter your email',
      required: true
    },
    {
      name: 'password',
      type: 'password',
      label: 'Password',
      placeholder: 'Enter your password',
      required: true
    },
    {
      name: 'confirmPassword',
      type: 'password',
      label: 'Confirm Password',
      placeholder: 'Confirm your password',
      required: true
    }
  ];

  const handleRegister = async (data) => {
    try {
      setFormError('');
      console.log('Registration data:', data);
      
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registrationData } = data;
      
      await register(registrationData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration form error:', error);
      // Error is already handled in auth context
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">CRM</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        <Card className="mt-8">
          {/* Display error from auth context */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              <div className="font-medium">Registration Failed</div>
              <div className="text-sm mt-1">{error}</div>
            </div>
          )}

          {/* Display form-specific errors */}
          {formError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              <div className="font-medium">Error</div>
              <div className="text-sm mt-1">{formError}</div>
            </div>
          )}

          <DynamicForm
            fields={fields}
            schema={registerSchema}
            onSubmit={handleRegister}
            isLoading={isLoading}
            submitLabel="Create account"
            layout="vertical"
          />

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">
              Password Requirements:
            </h4>
            <ul className="text-xs text-blue-600 space-y-1">
              <li>• At least 6 characters long</li>
              <li>• Must contain at least one uppercase letter</li>
              <li>• Must contain at least one lowercase letter</li>
              <li>• Must contain at least one number</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;