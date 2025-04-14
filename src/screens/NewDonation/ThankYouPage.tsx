import React, { useEffect, useState } from 'react';
import { Button } from "../../components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { CheckCircle2, CircleDot } from 'lucide-react';

export const ThankYouPage = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items = [] as Array<{title: string, quantity: string}>, pickupDate, pickupTime, address, driverInstructions } = location.state || {};
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Format date for display
  const formatDate = (date: string | Date) => {
    if (!date) return "Not specified";
    try {
      return new Date(date).toLocaleDateString('en-US', {
        weekday: 'long', 
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  useEffect(() => {
    // Here you would typically make an API call to save the donation
    // For now, we'll simulate the process
    const saveDonation = async () => {
      setIsProcessing(true);
      
      try {
        // Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For demo purposes, we'll assume success
        // In a real app, this would call a backend API
        console.log('Donation saved with:', { items, pickupDate, pickupTime, address, driverInstructions });
        
        setIsProcessing(false);
      } catch (err) {
        console.error('Error saving donation:', err);
        setError('Failed to save donation. Please try again.');
        setIsProcessing(false);
      }
    };
    
    saveDonation();
  }, [items, pickupDate, pickupTime, address, driverInstructions]);

  const handleViewDonations = () => {
    navigate('/', { replace: true });
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="flex flex-col items-center justify-center mb-8">
          <CheckCircle2 className="w-24 h-24 text-[#085f33] mb-4" />
          <h1 className="text-2xl font-medium text-center">Thank you for your donation!</h1>
          <p className="text-gray-600 text-center mt-2">
            {!error ? 'Your donation has been successfully registered' : 'Failed to save donation. Please try again.'}
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-medium mb-4">Donation Summary</h2>
          
          {/* Donation Items */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <CircleDot size={20} className="text-gray-400" />
              <h3 className="text-lg font-medium">Donation items</h3>
            </div>
            <div className="pl-7">
              {items && items.length > 0 ? (
                items.map((item: {title: string, quantity: string}, index: number) => (
                  <div key={index} className="py-2 border-b border-gray-100 last:border-0">
                    {item.title}, {item.quantity}
                  </div>
                ))
              ) : (
                <div className="py-2 text-gray-500">No items specified</div>
              )}
            </div>
          </div>
          
          {/* Pickup Details */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <CircleDot size={20} className="text-gray-400" />
              <h3 className="text-lg font-medium">Pickup details</h3>
            </div>
            <div className="pl-7">
              <div className="py-2 border-b border-gray-100">
                {pickupDate ? formatDate(pickupDate) : "Date not specified"}
              </div>
              <div className="py-2">
                {pickupTime || "Time not specified"}
              </div>
            </div>
          </div>
          
          {/* Location */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <CircleDot size={20} className="text-gray-400" />
              <h3 className="text-lg font-medium">Location</h3>
            </div>
            <div className="pl-7 py-2">
              {address || "Address not specified"}
            </div>
          </div>
          
          {/* Driver Instructions */}
          {driverInstructions && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <CircleDot size={20} className="text-gray-400" />
                <h3 className="text-lg font-medium">Instructions for the driver</h3>
              </div>
              <div className="pl-7 py-2">
                {driverInstructions}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Button 
            onClick={handleViewDonations}
            disabled={isProcessing}
            className={`w-full h-12 rounded-full text-lg transition-colors ${
              isProcessing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#085f33] hover:bg-[#064726] text-white'
            }`}
          >
            {isProcessing ? 'Processing...' : 'View My Donations'}
          </Button>
          <Button 
            onClick={() => navigate('/', { replace: true })}
            variant="outline"
            disabled={isProcessing}
            className="w-full h-12 bg-white border-2 border-[#085f33] text-[#085f33] rounded-full text-lg hover:bg-[#085f33] hover:text-white"
          >
            Return to Home
          </Button>
        </div>
      </div>
    </Layout>
  );
};