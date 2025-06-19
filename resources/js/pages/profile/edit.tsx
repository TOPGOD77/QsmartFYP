import { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Lock, LogOut } from 'lucide-react';
import { router } from '@inertiajs/react';

interface User {
  id: number;
  name: string;
  email: string;
}

interface PageProps {
  auth: {
    user: User;
  };
  user: User;
  [key: string]: any;
}

export default function EditProfile() {
  const { user } = usePage<PageProps>().props;
  const [showPassword, setShowPassword] = useState(false);

  const { data, setData, patch, errors, processing, reset } = useForm({
    name: user.name,
    email: user.email,
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    patch(route('profile.update'), {
      onSuccess: () => {
        reset('current_password', 'new_password', 'new_password_confirmation');
      },
    });
  };

  return (
    <>
      <Head title="Edit Profile" />

      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-teal-600">Q<span className="text-gray-900">Smart</span></span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.post(route('logout'))}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button 
            onClick={() => router.visit(route('dashboard'))}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
          >
            <span>← Back to Dashboard</span>
          </button>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
              </div>

              <form onSubmit={submit} className="space-y-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <div className="mt-1 relative">
                    <Input
                      id="name"
                      type="text"
                      value={data.name}
                      onChange={e => setData('name', e.target.value)}
                      className="pl-10"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  {errors.name && <div className="mt-1 text-sm text-red-600">{errors.name}</div>}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="mt-1 relative">
                    <Input
                      id="email"
                      type="email"
                      value={data.email}
                      onChange={e => setData('email', e.target.value)}
                      className="pl-10"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  {errors.email && <div className="mt-1 text-sm text-red-600">{errors.email}</div>}
                </div>

                {/* Password Section */}
                <div className="border-t pt-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Change Password</h2>
                  
                  {/* Current Password */}
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="current_password" className="block text-sm font-medium text-gray-700">
                        Current Password
                      </label>
                      <div className="mt-1 relative">
                        <Input
                          id="current_password"
                          type={showPassword ? 'text' : 'password'}
                          value={data.current_password}
                          onChange={e => setData('current_password', e.target.value)}
                          className="pl-10"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                      {errors.current_password && (
                        <div className="mt-1 text-sm text-red-600">{errors.current_password}</div>
                      )}
                    </div>

                    {/* New Password */}
                    <div>
                      <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">
                        New Password
                      </label>
                      <div className="mt-1 relative">
                        <Input
                          id="new_password"
                          type={showPassword ? 'text' : 'password'}
                          value={data.new_password}
                          onChange={e => setData('new_password', e.target.value)}
                          className="pl-10"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                      {errors.new_password && (
                        <div className="mt-1 text-sm text-red-600">{errors.new_password}</div>
                      )}
                    </div>

                    {/* Confirm New Password */}
                    <div>
                      <label htmlFor="new_password_confirmation" className="block text-sm font-medium text-gray-700">
                        Confirm New Password
                      </label>
                      <div className="mt-1 relative">
                        <Input
                          id="new_password_confirmation"
                          type={showPassword ? 'text' : 'password'}
                          value={data.new_password_confirmation}
                          onChange={e => setData('new_password_confirmation', e.target.value)}
                          className="pl-10"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    {/* Show Password Toggle */}
                    <div className="flex items-center">
                      <input
                        id="show_password"
                        type="checkbox"
                        checked={showPassword}
                        onChange={() => setShowPassword(!showPassword)}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      />
                      <label htmlFor="show_password" className="ml-2 block text-sm text-gray-900">
                        Show password
                      </label>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.visit(route('dashboard'))}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                    disabled={processing}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 