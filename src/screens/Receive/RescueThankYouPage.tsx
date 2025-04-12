import React from 'react';
import { Button } from "../../components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { CheckCircle2 } from 'lucide-react';

export const RescueThankYouPage = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const donation = location.state?.donation;

  return (
    <Layout>
      <div className="p-6">
        <div className="flex flex-col items-center justify-center mb-12">
          <div className="w-24 h-24 bg-[#085f33] rounded-full flex items-center justify-center mb-8">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-2xl font-medium text-center mb-4">
            Thank you for<br />rescuing this food!
          </h1>
          <p className="text-xl font-medium text-center">
            Pickup until {donation?.pickupTime?.split('until ')[1] || '16:00'}<br />
            today
          </p>
        </div>

        <div className="bg-gray-100 rounded-lg p-6 mb-12">
          <p className="text-gray-600 text-center">
            When picking up the donation, place it in a thermo box with a cold pack to keep it within 6-9°C.
          </p>
        </div>

        <Button 
          onClick={() => navigate('/')}
          className="w-full h-12 bg-[#085f33] hover:bg-[#064726] text-white rounded-full text-lg"
        >
          Finish
        </Button>
      </div>
    </Layout>
  );
};