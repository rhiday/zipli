import React, { useEffect } from 'react';
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { CheckCircle2 } from 'lucide-react';

export const VerificationSuccess = (): JSX.Element => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect after 3 seconds
    const timer = setTimeout(() => {
      navigate('/signin', { 
        replace: true,
        state: { message: 'Email verified successfully! Please sign in.' }
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Layout>
      <div className="p-6 flex flex-col items-center justify-center min-h-screen">
        <div className="w-24 h-24 bg-[#085f33] rounded-full flex items-center justify-center mb-8">
          <CheckCircle2 className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-2xl font-medium text-center mb-4">
          Email Verified Successfully!
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Redirecting you to sign in...
        </p>
        <Button 
          onClick={() => navigate('/signin')}
          className="w-full h-12 bg-[#085f33] hover:bg-[#064726] text-white rounded-full text-lg"
        >
          Continue to Sign In
        </Button>
      </div>
    </Layout>
  );
};