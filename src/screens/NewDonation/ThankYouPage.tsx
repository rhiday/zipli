import React, { useEffect, useState, useRef } from 'react';
import { Button } from "../../components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { CheckCircle2, CircleDot } from 'lucide-react';
import { createDonation } from "../../lib/donations";

interface FoodItem {
  title: string;
  quantity: string;
  image?: File | null;
}

export const ThankYouPage = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items = [] as FoodItem[], pickupDate, pickupTime, address, driverInstructions } = location.state || {};
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const hasCreatedDonation = useRef(false);
  const isCreatingDonation = useRef(false);

  // Format date for display
  const formatDate = (date: string | Date) => {
    if (!date) return "Not specified";
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return "Invalid date";
      
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'long', 
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  // Format pickup time string
  const formatPickupTimeString = (date: string | Date, time: string) => {
    if (!date || !time) return "Not specified";
    try {
      const formattedDate = formatDate(date);
      return `${formattedDate} at ${time}`;
    } catch (e) {
      return "Invalid pickup time";
    }
  };

  useEffect(() => {
    const saveDonation = async () => {
      // Double-check to prevent concurrent creation attempts
      if (hasCreatedDonation.current || isCreatingDonation.current || !items.length) return;
      
      try {
        isCreatingDonation.current = true;
        setIsProcessing(true);
        
        // Create the donation description from items
        const description = items.map((item: FoodItem) => `${item.title}: ${item.quantity}`).join('\n');
        
        // Format the title as the first item + count of additional items
        const title = items.length > 1 
          ? `${items[0].title} + ${items.length - 1} more`
          : items[0].title;

        // Add driver instructions to the description if provided
        const fullDescription = driverInstructions 
          ? `${description}\n\nDriver Instructions: ${driverInstructions}`
          : description;

        const formattedPickupTime = formatPickupTimeString(pickupDate, pickupTime);

        const { donation, error: saveError } = await createDonation({
          title,
          description: fullDescription,
          quantity: items.map((item: FoodItem) => item.quantity).join(', '),
          image: items[0]?.image || null,
          location: address,
          distance: '0 km',
          pickup_time: formattedPickupTime,
          status: 'active'
        });

        if (saveError) throw new Error(saveError);
        
        hasCreatedDonation.current = true;
        setIsProcessing(false);
      } catch (err) {
        console.error('Error saving donation:', err);
        setError('Failed to save donation. Please try again.');
        setIsProcessing(false);
      } finally {
        isCreatingDonation.current = false;
      }
    };
    
    saveDonation();

    return () => {
      hasCreatedDonation.current = false;
      isCreatingDonation.current = false;
    };
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
                items.map((item: FoodItem, index: number) => (
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