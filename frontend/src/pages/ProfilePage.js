import React from 'react';
import { useAuth } from '@/context/AuthContext';
import PageHeader from '@/components/layout/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { UserCircleIcon } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div>
      <PageHeader
        title="Profile"
        subtitle="Manage your account information"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">
            Personal Information
          </h3>
          
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                defaultValue={user?.firstName}
                placeholder="Enter first name"
              />
              <Input
                label="Last Name"
                defaultValue={user?.lastName}
                placeholder="Enter last name"
              />
            </div>
            
            <Input
              label="Email Address"
              type="email"
              defaultValue={user?.email}
              placeholder="Enter email address"
            />
            
            <Input
              label="Phone Number"
              type="tel"
              placeholder="Enter phone number"
            />
            
            <div className="pt-4">
              <Button type="submit">
                Update Profile
              </Button>
            </div>
          </form>
        </Card>

        <Card className="p-6">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
              <UserCircleIcon className="w-16 h-16 text-gray-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              {user?.firstName} {user?.lastName}
            </h3>
            <p className="text-sm text-gray-500 mb-4">{user?.email}</p>
            <Button variant="outline" size="sm">
              Change Photo
            </Button>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-4">
              Change Password
            </h4>
            <div className="space-y-3">
              <Input
                type="password"
                placeholder="Current password"
                size="sm"
              />
              <Input
                type="password"
                placeholder="New password"
                size="sm"
              />
              <Input
                type="password"
                placeholder="Confirm new password"
                size="sm"
              />
              <Button size="sm" fullWidth>
                Update Password
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;