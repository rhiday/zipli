import React, { useState } from 'react';
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { supabase } from '../../lib/supabase';

export const UpdatePassword = (): JSX.Element => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/signin');
      }, 2000);
    } catch (error) {
      console.error('Password update error:', error);
      setError(
        error instanceof Error 
          ? error.message 
          : 'Failed to update password. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <header className="mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="text-2xl"
              aria-label="Go back"
            >
              ←
            </button>
            <h1 className="text-2xl font-medium">Set New Password</h1>
          </div>
        </header>

        <form onSubmit={handlePasswordUpdate} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#085f33] focus:border-transparent"
              placeholder="Enter your new password"
            />
            <p className="mt-1 text-sm text-gray-500">
              Must be at least 6 characters
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#085f33] focus:border-transparent"
              placeholder="Confirm your new password"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-600 text-sm">
                Password updated successfully! Redirecting to sign in...
              </p>
            </div>
          )}

          <div className="space-y-4 pt-4">
            <Button 
              type="submit"
              disabled={isLoading || !password}
              className={`w-full h-12 rounded-full text-lg transition-colors ${
                isLoading || !password
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#085f33] hover:bg-[#064726] text-white'
              }`}
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </Button>
            <Button 
              type="button"
              onClick={() => navigate('/signin')}
              variant="outline"
              className="w-full h-12 bg-white border-2 border-[#085f33] text-[#085f33] rounded-full text-lg hover:bg-[#085f33] hover:text-white"
            >
              Back to Sign In
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};