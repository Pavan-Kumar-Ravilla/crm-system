import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Form from '../components/ui/Form';
import { Eye, EyeOff, Cloud } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const fields = [
    {
      name: 'firstName',
      type: 'text',
      label: 'First Name',
      placeholder: 'Enter your first name',
      required: true,
      validation: {
        required: 'First name is required',
        minLength: {
          value: 2,
          message: 'First name must be at least 2 characters',
        },
      },
    },
    {
      name: 'lastName',
      type: 'text',
      label: 'Last Name',
      placeholder: 'Enter your last name',
      required: true,
      validation: {
        required: 'Last name is required',
        minLength: {
          value: 2,
          message: 'Last name must be at least 2 characters',
        },
      },
    },
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
      name: 'phone',
      type: 'tel',
      label: 'Phone Number',
      placeholder: 'Enter your phone number',
      required: false,
    },
    {
      name: 'title',
      type: 'text',
      label: 'Job Title',
      placeholder: 'Enter your job title',
      required: false,
    },
    {
      name: 'department',
      type: 'text',
      label: 'Department',
      placeholder: 'Enter your department',
      required: false,
    },
    {
      name: 'role',
      type: 'select',
      label: 'Role',
      required: true,
      options: [
        { value: 'user', label: 'User' },
        { value: 'sales_rep', label: 'Sales Representative' },
        { value: 'manager', label: 'Manager' },
        { value: 'admin', label: 'Administrator' },
      ],
      validation: {
        required: 'Role is required',
      },
    },
    {
      name: 'password',
      type: showPassword ? 'text' : 'password',
      label: 'Password',
      placeholder: 'Create a password',
      required: true,
      validation: {
        required: 'Password is required',
        minLength: {
          value: 6,
          message: 'Password must be at least 6 characters',
        },
        pattern: {
          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          message: 'Password must contain at least one lowercase letter, one uppercase letter, and one number',
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
    {
      name: 'confirmPassword',
      type: showConfirmPassword ? 'text' : 'password',
      label: 'Confirm Password',
      placeholder: 'Confirm your password',
      required: true,
      validation: {
        required: 'Please confirm your password',
        validate: (value, { password }) => {
          return value === password || 'Passwords do not match';
        },
      },
      rightIcon: (
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="text-salesforce-gray-400 hover:text-salesforce-gray-600"
        >
          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      ),
    },
  ];

  const handleSubmit = async (data) => {
    const { confirmPassword, ...userData } = data;
    const result = await registerUser(userData);
    if (result.success) {
      navigate('/app-manager');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-salesforce-blue-600 to-salesforce-blue-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-white rounded-full flex items-center justify-center">
            <Cloud className="h-8 w-8 text-salesforce-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-salesforce-blue-100">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-white hover:text-salesforce-blue-200 underline"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <Form
            fields={fields}
            onSubmit={handleSubmit}
            submitLabel="Create Account"
            loading={isLoading}
            layout="horizontal"
          />
        </div>

        <div className="text-center">
          <p className="text-xs text-salesforce-blue-100">
            By creating an account, you agree to our{' '}
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

export default Register;