import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from "../../components/Layout";
import { supabase } from '../../lib/supabase';
import { Button } from "../../components/ui/button";
import { Link } from 'react-router-dom';

export const EmailVerification = (): JSX.Element => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Get the type and next URL from search params
  const type = searchParams.get('type');
  const next = searchParams.get('next');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get the token hash from URL
        const tokenHash = searchParams.get('token_hash');
        const refreshToken = searchParams.get('refresh_token');

        if (!tokenHash) {
          // No token hash means we're just showing the pending verification screen
          setVerifying(false);
          return;
        }

        let error;
        
        if (refreshToken) {
          // If we have a refresh token, exchange it
          const { error: refreshError } = await supabase.auth.refreshSession({
            refresh_token: refreshToken
          });
          error = refreshError;
        } else {
          // Otherwise verify the email OTP
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'email'
          });
          error = verifyError;
        }

        if (error) throw error;
        setSuccess(true);

        // Redirect to success page
        setTimeout(() => {
          navigate('/auth/verify/success', { replace: true });
        }, 1000);
      } catch (error) {
        console.error('Verification error:', error);
        setError(error instanceof Error ? error.message : 'Failed to verify email');
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [navigate, searchParams]);

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
            <h1 className="text-2xl font-medium">Email Verification</h1>
          </div>
        </header>

        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        {verifying ? (
          <div className="text-center">
            <div className="flex gap-2 justify-center mb-4">
              <div className="w-2 h-2 bg-[#085f33] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2 h-2 bg-[#085f33] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-[#085f33] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <p className="text-gray-600">Verifying your email...</p>
          </div>
        ) : success ? (
          <div className="text-center">
            <h1 className="text-2xl font-medium mb-4">Email Verified!</h1>
            <p className="text-gray-600 mb-8">Redirecting to sign in...</p>
          </div>
        ) : error ? (
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button
              onClick={() => navigate('/signin')}
              className="bg-[#085f33] hover:bg-[#064726] text-white"
            >
              Return to Sign In
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <h1 className="text-2xl font-medium mb-4">Check Your Email</h1>
            <p className="text-gray-600 mb-8">
              We've sent a verification link to your email address. Please click the link to verify your account.
            </p>
            <Button
              onClick={() => navigate('/signin')}
              variant="outline"
              className="bg-white border-2 border-[#085f33] text-[#085f33] hover:bg-[#085f33] hover:text-white"
            >
              Return to Sign In
            </Button>
          </div>
        )}
        </div>
      </div>
    </Layout>
  );
};