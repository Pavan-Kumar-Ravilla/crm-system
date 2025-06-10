import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Form from '../components/ui/Form';
import Button from '../components/ui/Button';
import { Eye, EyeOff, Cloud } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || '/app-manager';

  const fields = [
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      placeholder: 'Enter your email',
      required: true,
      validation: {
        required: 'Email is required',
        pattern: {
          value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
          message: 'Please enter a valid email address',
        },
      },
    },
    {
      name: 'password',
      type: showPassword ? 'text' : 'password',
      label: 'Password',
      placeholder: 'Enter your password',
      required: true,
      validation: {
        required: 'Password is required',
        minLength: {
          value: 6,
          message: 'Password must be at least 6 characters',
        },
      },
      rightIcon: (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="text-salesforce-gray-400 hover:text-salesforce-gray-600"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      ),
    },
  ];

  const handleSubmit = async (data) => {
    const result = await login(data);
    if (result.success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-salesforce-blue-600 to-salesforce-blue-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-white rounded-full flex items-center justify-center">
            <Cloud className="h-8 w-8 text-salesforce-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-salesforce-blue-100">
            Or{' '}
            <Link
              to="/register"
              className="font-medium text-white hover:text-salesforce-blue-200 underline"
            >
              create a new account
            </Link>
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <Form
            fields={fields}
            onSubmit={handleSubmit}
            submitLabel="Sign In"
            loading={isLoading}
            className="space-y-6"
          />

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-salesforce-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-salesforce-gray-500">
                  Forgot your password?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/forgot-password"
                className="text-sm text-salesforce-blue-600 hover:text-salesforce-blue-500"
              >
                Reset your password
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-salesforce-blue-100">
            By signing in, you agree to our{' '}
            <a href="#" className="underline hover:text-white">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="underline hover:text-white">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;