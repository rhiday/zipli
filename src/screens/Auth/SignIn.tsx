import React, { useState } from 'react';
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { supabase } from '../../lib/supabase';

export const SignIn = (): JSX.Element => {
  const navigate = useNavigate();
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

      // Attempt sign in
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
        options: {
          expiresIn: keepLoggedIn ? 30 * 24 * 60 * 60 : 24 * 60 * 60 // 30 days : 1 day
        }
      });

      if (signInError) {
        // Handle specific error cases
        if (signInError.message.includes('Invalid login credentials')) {
          throw new Error('Incorrect email or password. Please try again.');
        } else if (signInError.message.includes('Email not confirmed')) {
          throw new Error('Please verify your email before signing in. Check your inbox for the verification link.');
        }
        throw signInError;
      }

      if (!data.session) {
        throw new Error('No session data returned');
      }

      // Check if user has metadata from registration
      const metadata = data.session.user.user_metadata;
      if (!metadata?.name || !metadata?.contact_person || !metadata?.role) {
        throw new Error('Missing registration data. Please register again.');
      }

      // Fetch organization details
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .select('role')
        .eq('id', data.session.user.id)
        .maybeSingle(); // Use maybeSingle() instead of single() to handle no results gracefully

      // Only throw error if there was an actual database error
      if (orgError) {
        console.error('Error fetching organization:', orgError);
        throw new Error('Unable to fetch organization details. Please try again.');
      }

      // If no organization found, redirect to registration completion
      if (!organization) {
        // Create organization profile from metadata
        const { error: createError } = await supabase
          .from('organizations')
          .insert({
            id: data.session.user.id,
            name: metadata.name,
            contact_person: metadata.contact_person,
            email: data.session.user.email,
            role: metadata.role,
            contact_number: metadata.contact_number || '',
            address: metadata.address || '',
            created_by: data.session.user.id
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating organization:', createError);
          throw new Error('Failed to create organization profile');
        }

        // Use metadata role for redirection
        if (metadata.role === 'receiver') {
          navigate('/receive');
        } else {
          navigate('/');
        }
        return;
      }

      // Redirect based on role
      if (organization.role === 'receiver') {
        navigate('/receive');
      } else {
        navigate('/'); // Default donor page
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError(
        error instanceof Error 
          ? error.message 
          : 'An error occurred during sign in. Please try again.'
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
            <h1 className="text-2xl font-medium">Sign In</h1>
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

          <div className="space-y-4 pt-4">
            <Button 
              type="submit"
              disabled={isLoading}
              className={`w-full h-12 rounded-full text-lg transition-colors ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#085f33] hover:bg-[#064726] text-white'
              }`}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
            <Button 
              type="button"
              onClick={() => navigate(-1)}
              variant="outline"
              className="w-full h-12 bg-white border-2 border-[#085f33] text-[#085f33] rounded-full text-lg hover:bg-[#085f33] hover:text-white"
            >
              Back
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-[#085f33] hover:underline"
              >
                Register here
              </button>
            </p>
          </div>
        </form>
      </div>
    </Layout>
  );
};