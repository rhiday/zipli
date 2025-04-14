import React, { useState, useEffect } from 'react';
import { Button } from "../../components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { Card } from "../../components/ui/card";
import { CircleDot, Pencil } from 'lucide-react';

// This would normally come from a user context/auth service
const getUserAddress = () => {
  // Placeholder for user profile data
  return {
    street: "Kaisaniemenkatu 7 a",
    city: "Helsinki",
    postalCode: "00100",
    country: "Finland"
  };
};

export const DonationStep4 = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items = [], pickupDate, pickupTime } = location.state || {};
  const [driverInstructions, setDriverInstructions] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  // Get user address (in a real app, this would come from a user context/auth)
  const userAddress = getUserAddress();
  const formattedAddress = `${userAddress.street}, ${userAddress.postalCode} ${userAddress.city}`;
  
  // Format date for display
  const formatDate = (date: Date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long', 
      month: 'long',
      day: 'numeric'
    });
  };
  
  const handleGoBack = () => {
    navigate('/new-donation/step3', {
      state: { items, pickupDate, pickupTime }
    });
  };
  
  const handleContinue = () => {
    navigate('/new-donation/thank-you', {
      state: {
        items,
        pickupDate,
        pickupTime,
        address: formattedAddress,
        driverInstructions
      }
    });
  };
  
  const handleEditItems = () => {
    navigate('/new-donation', {
      state: { items }
    });
  };
  
  const handleEditPickup = () => {
    navigate('/new-donation/step3', {
      state: { items }
    });
  };
  
  const handleEditAddress = () => {
    // In a real app, this would navigate to a profile page or address editor
    alert("This would navigate to address settings");
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
          <div className="h-1 bg-[#085f33] flex-1 rounded-full"></div>
          <div className="h-1 bg-[#085f33] flex-1 rounded-full"></div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-medium mb-2">Donation summary</h2>
          <p className="text-gray-600 mb-6">Review your donation details</p>
          
          {/* Donation Items */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <CircleDot size={20} className="text-gray-400" />
              <h3 className="text-lg font-medium">Donation items</h3>
              <button 
                onClick={handleEditItems}
                className="ml-auto text-gray-500"
              >
                <Pencil size={18} />
              </button>
            </div>
            <div className="pl-7">
              {items.map((item: any, index: number) => (
                <div key={index} className="py-2 border-b border-gray-100 last:border-0">
                  {item.title}, {item.quantity}
                </div>
              ))}
            </div>
          </div>
          
          {/* Pickup Details */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <CircleDot size={20} className="text-gray-400" />
              <h3 className="text-lg font-medium">Pickup details</h3>
              <button 
                onClick={handleEditPickup}
                className="ml-auto text-gray-500"
              >
                <Pencil size={18} />
              </button>
            </div>
            <div className="pl-7">
              <div className="py-2 border-b border-gray-100">
                {pickupDate ? formatDate(pickupDate) : "No date selected"}
              </div>
              <div className="py-2">
                {pickupTime || "No time selected"}
              </div>
            </div>
          </div>
          
          {/* Address Details */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <CircleDot size={20} className="text-gray-400" />
              <h3 className="text-lg font-medium">Address details</h3>
              <button 
                onClick={handleEditAddress}
                className="ml-auto text-gray-500"
              >
                <Pencil size={18} />
              </button>
            </div>
            <div className="pl-7 py-2">
              {formattedAddress}
            </div>
          </div>
          
          {/* Driver Instructions */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <CircleDot size={20} className="text-gray-400" />
              <h3 className="text-lg font-medium">Instructions for the driver</h3>
            </div>
            <div className="pl-7">
              <textarea
                value={driverInstructions}
                onChange={(e) => setDriverInstructions(e.target.value)}
                placeholder="E.g., Park in garage and enter through staff only entrance. Thank you :)"
                className="w-full p-3 border border-gray-200 rounded-lg resize-none min-h-[100px]"
              />
            </div>
          </div>
          
          {error && (
            <div className="mt-4 text-sm text-red-500">
              {error}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Button 
            onClick={handleContinue}
            className="w-full h-12 rounded-full text-lg transition-colors bg-[#085f33] hover:bg-[#064726] text-white"
          >
            Continue
          </Button>
        </div>
      </div>
    </Layout>
  );
};