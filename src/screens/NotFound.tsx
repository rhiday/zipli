import React from 'react';
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components/Layout";

export const NotFound = (): JSX.Element => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="p-6 flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold mb-4">404</h1>
        <p className="text-gray-600 mb-8">Page not found</p>
        <Button 
          onClick={() => navigate('/')}
          className="bg-[#085f33] hover:bg-[#064726] text-white"
        >
          Go to Home
        </Button>
      </div>
    </Layout>
  );
};