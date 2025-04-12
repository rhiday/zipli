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

        <div className="space-y-4">
          <Button 
            onClick={() => navigate('/register')}
            className="w-full h-12 bg-[#085f33] hover:bg-[#064726] text-white rounded-full text-lg"
          >
            Register
          </Button>
          <Button 
            onClick={() => navigate('/signin')}
            variant="outline"
            className="w-full h-12 bg-white border-2 border-[#085f33] text-[#085f33] rounded-full text-lg hover:bg-[#085f33] hover:text-white"
          >
            Sign in
          </Button>
        </div>
      </div>
    </Layout>
  );
};