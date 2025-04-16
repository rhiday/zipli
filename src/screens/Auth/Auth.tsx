import React from 'react';
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../components/Layout";

export const Auth = (): JSX.Element => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="p-6 flex flex-col justify-center min-h-screen">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Welcome to Zipli!</h1>
          <p className="text-gray-600">
            Join our community to donate or receive food
          </p>
        </div>

        <div className="space-y-4 flex flex-col items-center">
          <Button 
            onClick={() => navigate('/signin')}
            className="px-12 h-12 bg-[#085f33] hover:bg-[#064726] text-white rounded-full text-lg"
          >
            Log in
          </Button>
          <div className="text-center">
            <button 
              onClick={() => navigate('/register')}
              className="text-[#085f33] hover:underline text-sm"
            >
              Don't have an account? Register here
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};