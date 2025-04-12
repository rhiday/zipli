import React, { useState, useEffect } from 'react';
import { Button } from "../../components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { Card, CardContent } from "../../components/ui/card";
import { Image } from 'lucide-react';

export const DonationStep3 = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const { title, images, quantity, isUnder60C } = location.state || {};
  const firstImage = images?.[0]?.preview;

  const handleContinue = () => {
    navigate('/new-donation/step4', {
      state: {
        title,
        images,
        quantity,
        isUnder60C
      }
    });
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
            <h1 className="text-2xl font-medium">New donation</h1>
          </div>
        </header>

        <div className="flex gap-2 mb-8">
          <div className="h-1 bg-[#085f33] flex-1 rounded-full"></div>
          <div className="h-1 bg-[#085f33] flex-1 rounded-full"></div>
          <div className="h-1 bg-[#085f33] flex-1 rounded-full"></div>
          <div className="h-1 bg-[#e2e8f0] flex-1 rounded-full"></div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-medium mb-2">Donation summary</h2>
          <p className="text-gray-600 mb-4">Review your donation details</p>

          <Card className="bg-[#fff0f2] border-none">
            <CardContent className="p-4">
              <div className="flex gap-3">
                {firstImage && (
                  <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={firstImage}
                      alt="Food item"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{quantity ? `${quantity} kg` : 'Amount missing'}</p>
                      {isUnder60C && (
                        <p className="text-sm text-[#085f33] mt-1">Temperature verified ✓</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Button 
            onClick={handleContinue}
            className={`w-full h-12 rounded-full text-lg transition-colors ${
              'bg-[#085f33] hover:bg-[#064726] text-white'
            }`}
          >
            Continue
          </Button>
        </div>
      </div>
    </Layout>
  );
};