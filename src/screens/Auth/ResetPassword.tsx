import React, { useState, useEffect } from 'react';
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { supabase } from '../../lib/supabase';

export const ResetPassword = (): JSX.Element => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`
      });

      if (error) throw error;
      setSuccess(true);
    } catch (error) {
      console.error('Reset password error:', error);
      setError(
        error instanceof Error 
          ? error.message 
          : 'Failed to send reset password email. Please try again.'
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
            <h1 className="text-2xl font-medium">Reset Password</h1>
          </div>
        </header>

        <form onSubmit={handleResetRequest} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#085f33] focus:border-transparent"
              placeholder="Enter your email address"
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
                Password reset instructions have been sent to your email address.
              </p>
            </div>
          )}

          <div className="space-y-4 pt-4">
            <Button 
              type="submit"
              disabled={isLoading || !email}
              className={`w-full h-12 rounded-full text-lg transition-colors ${
                isLoading || !email
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#085f33] hover:bg-[#064726] text-white'
              }`}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
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