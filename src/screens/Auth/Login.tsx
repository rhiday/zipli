import React, { useState } from 'react';
import { Button } from "../../components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { supabase } from '../../lib/supabase';
import { Link } from "react-router-dom";

export const Login = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validate input
      if (!form.email.trim() || !form.password.trim()) {
        throw new Error('Please enter both email and password');
      }

      // Attempt log in
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password
      });

      if (loginError) {
        setError(loginError.message);
        setIsLoading(false);
        return;
      }

      // Store keepLoggedIn preference
      if (!keepLoggedIn) {
        localStorage.setItem('session-preference', 'short-term');
      } else {
        localStorage.setItem('session-preference', 'long-term');
      }

      // Fetch organization details
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', data.session.user.id)
        .maybeSingle();

      // Log for debugging
      console.log('User ID:', data.session.user.id);
      console.log('Organization query result:', organization);
      console.log('Organization error:', orgError);

      if (orgError) {
        console.error('Error fetching organization:', orgError);
        throw new Error('Unable to fetch organization details. Please try again.');
      }

      if (!organization) {
        console.error('No organization found for user');
        throw new Error('No organization found. Please contact support.');
      }

      // Redirect based on role
      if (organization.role === 'receiver') {
        navigate('/receive');
      } else {
        navigate('/'); // Default donor page
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(
        error instanceof Error 
          ? error.message 
          : 'An error occurred during log in. Please try again.'
      );
      setForm(prev => ({ ...prev, password: '' })); // Clear password on error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-6">
        {location.state?.message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 text-sm">{location.state.message}</p>
          </div>
        )}
        <header className="mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="text-2xl"
              aria-label="Go back"
            >
              ←
            </button>
            <h1 className="text-2xl font-medium">Log in</h1>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#085f33] focus:border-transparent"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <button
                type="button"
                onClick={() => navigate('/reset-password')}
                className="text-sm text-[#085f33] hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={form.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#085f33] focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="keep-logged-in"
              checked={keepLoggedIn}
              onChange={(e) => setKeepLoggedIn(e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-[#085f33] focus:ring-[#085f33] focus:ring-2 focus:ring-offset-2"
            />
            <label htmlFor="keep-logged-in" className="text-sm text-gray-600">
              Keep me logged in
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4 pt-4 flex flex-col items-center">
            <Button 
              type="submit"
              disabled={isLoading}
              className={`px-12 h-12 rounded-full text-lg transition-colors ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#085f33] hover:bg-[#064726] text-white'
              }`}
            >
              {isLoading ? 'Logging In...' : 'Log in'}
            </Button>
            <Button 
              type="button"
              onClick={() => navigate(-1)}
              variant="outline"
              className="px-12 h-12 bg-white border-2 border-[#085f33] text-[#085f33] rounded-full text-lg hover:bg-[#085f33] hover:text-white"
            >
              Back
            </Button>
          </div>

          <div className="text-center">
            <Link
              to="/register"
              className="text-sm text-gray-600 hover:text-[#085f33] hover:underline"
            >
              Don't have an account? Register here
            </Link>
          </div>
        </form>
      </div>
    </Layout>
  );
}; 