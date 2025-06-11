// src/pages/auth/LoginPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import DynamicForm from '../../components/forms/DynamicForm';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const loginSchema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
});

const LoginPage = () => {
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState('');

  const fields = [
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
    }
  ];

  const handleLogin = async (data) => {
    try {
      setFormError('');
      await login(data);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login form error:', error);
      // Error is already handled in auth context
    }
  };

  const handleDemoLogin = async () => {
    try {
      setFormError('');
      await login({
        email: 'admin@crm.com',
        password: 'admin123'
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Demo login error:', error);
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
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              create a new account
            </Link>
          </p>
        </div>

        <Card className="mt-8">
          {/* Display error from auth context */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              <div className="font-medium">Login Failed</div>
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
            schema={loginSchema}
            onSubmit={handleLogin}
            isLoading={isLoading}
            submitLabel="Sign in"
            layout="vertical"
          />

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or try demo</span>
              </div>
            </div>

            <div className="mt-4">
              <Button
                variant="outline"
                fullWidth
                onClick={handleDemoLogin}
                disabled={isLoading}
              >
                Demo Login (admin@crm.com)
              </Button>
            </div>

            <div className="mt-4 bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Demo Credentials:</strong>
              </p>
              <p className="text-xs text-gray-500">
                Email: admin@crm.com<br />
                Password: admin123
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;