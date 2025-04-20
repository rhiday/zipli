import React from "react";
import { Layout } from "../../components/Layout";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { ChevronLeft, Check } from "lucide-react";

export const DonationConfirmation = (): JSX.Element => {
  const navigate = useNavigate();

  return (
    <Layout>
      <main className="p-6">
        <header className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mr-4"
            aria-label="Go back"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-medium">Donation Confirmation</h1>
        </header>

        <div className="space-y-6">
          <div className="bg-[#fff0f2] rounded-xl p-6">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-[#085f33] flex items-center justify-center">
                <Check size={40} className="text-white" />
              </div>
            </div>
            
            <h2 className="text-xl font-medium text-center mb-4">
              Donation Confirmed!
            </h2>
            
            <p className="text-center text-gray-600 mb-6">
              Your donation has been successfully confirmed and is now available for food receivers.
            </p>
            
            <Button
              onClick={() => navigate('/donate')}
              className="w-full bg-[#085f33] hover:bg-[#064726] text-white py-3 rounded-lg"
            >
              Back to Donations
            </Button>
          </div>
        </div>
      </main>
    </Layout>
  );
}; 