import React, { useState } from 'react';
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { FileText } from 'lucide-react';

// Define types
interface FoodItemWithImage {
  title: string;
  quantity: string;
  allergens: string[];
  image?: {
    dataUrl?: string;
    name?: string;
    type?: string;
  } | null;
}

export const DonationStep2 = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items = [] } = location.state || {};
  
  // Use the items directly from step 1, preserving their images
  const foodItems: FoodItemWithImage[] = items;

  const handleContinue = () => {
    navigate('/new-donation/step3', {
      state: {
        items: foodItems
      }
    });
  };

  const handleGoBack = () => {
    navigate('/new-donation', {
      state: {
        items: foodItems // Pass all items back to step 1 without mapping
      }
    });
  };

  return (
    <Layout>
      <div className="p-6">
        <header className="mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleGoBack}
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
          <div className="h-1 bg-[#e2e8f0] flex-1 rounded-full"></div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-medium mb-2">Review your donation</h2>
          <p className="text-gray-600 mb-6">Check your donation details before proceeding</p>

          {foodItems.map((item, index) => (
            <Card 
              key={index} 
              id={`item-${index}`}
              className="bg-[#fff0f2] border-none p-4 mb-4"
            >
              <div className="flex items-center gap-3">
                {/* Show the image if it exists, otherwise show a placeholder */}
                {item.image?.dataUrl ? (
                  <div className="relative w-16 h-16 rounded-lg flex-shrink-0 overflow-hidden">
                    <img 
                      src={item.image.dataUrl} 
                      alt={item.title}
                      className="w-full h-full object-cover rounded-lg"
                      onError={(e) => {
                        console.error('Image failed to load');
                        e.currentTarget.src = ''; 
                        e.currentTarget.alt = '!';
                        e.currentTarget.className += ' bg-red-100 flex items-center justify-center text-red-500 font-bold';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-[#f2d4d8] rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText size={20} className="text-[#085f33]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium">{item.title}, {item.quantity}</h3>
                  <p className="text-sm text-gray-600">{item.allergens.join(', ')}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex flex-col items-center gap-4">
          <Button 
            onClick={handleContinue}
            className="px-12 h-12 rounded-full text-lg transition-colors bg-[#085f33] hover:bg-[#064726] text-white"
          >
            Select Pickup Time
          </Button>
        </div>
      </div>
    </Layout>
  );
};