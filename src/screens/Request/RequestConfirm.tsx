import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { Button } from "../../components/ui/button";
import { CircleDot, Pencil, ChevronLeft, AlertTriangle } from "lucide-react";
import { Card } from "../../components/ui/card";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../components/AuthProvider";
import Logger from "../../lib/logger";

// Mock function to get user address (would be replaced with real address fetching)
const getUserAddress = () => {
  return {
    street: "123 Main St",
    city: "San Francisco",
    postalCode: "94105",
  };
};

export const RequestConfirm = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { description, peopleCount, allergens, pickupDate, pickupTime } = location.state || {};
  const [driverInstructions, setDriverInstructions] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
  
  // Format allergen list for display
  const getAllergenList = () => {
    if (!allergens) return "None";
    const selected = Object.entries(allergens)
      .filter(([_, selected]) => selected)
      .map(([name]) => name.charAt(0).toUpperCase() + name.slice(1));
    
    return selected.length > 0 ? selected.join(', ') : "None";
  };
  
  const handleGoBack = () => {
    navigate('/request/calendar', {
      state: { description, peopleCount, allergens, pickupDate, pickupTime }
    });
  };
  
  const handleSubmit = async () => {
    if (!user) {
      setError("You must be logged in to submit a request.");
      return;
    }
    
    if (!pickupDate) {
        setError("Pickup date is missing.");
        return;
    }

    setIsSubmitting(true);
    setError(null);
    const txId = Logger.generateTransactionId();

    try {
      Logger.log('Submitting new request', { context: { userId: user.id }, transactionId: txId });

      // Format date to YYYY-MM-DD for Supabase DATE type
      const formattedPickupDate = pickupDate.toISOString().split('T')[0];
      
      const { data, error: insertError } = await supabase
        .from('requests')
        .insert([
          {
            user_id: user.id,
            description: description,
            people_count: peopleCount,
            pickup_date: formattedPickupDate,
            pickup_time: pickupTime,
            // status defaults to 'active' in the DB
            // created_at defaults to now() in the DB
            // Consider adding driver_instructions if you add the column to the table
          }
        ])
        .select(); // Optionally select the inserted data if needed

      if (insertError) {
        throw insertError;
      }

      Logger.log('Request submitted successfully', { context: { requestId: data?.[0]?.id }, transactionId: txId });

      // Navigate to thank you page on success
      navigate('/request/thank-you', {
        replace: true, // Replace history state so back button doesn't resubmit
        state: {
          description,
          peopleCount,
          allergens,
          pickupDate,
          pickupTime,
          // Pass the newly created request data if needed by the thank you page
          // newRequest: data?.[0] 
        }
      });

    } catch (err: any) {
      Logger.error('Failed to submit request', err, { userId: user.id }, txId);
      setError(err.message || "An error occurred while submitting the request. Please try again.");
      setIsSubmitting(false);
    }
  };
  
  const handleEditDetails = () => {
    navigate('/request/new', {
      state: { description, peopleCount, allergens }
    });
  };
  
  const handleEditPickup = () => {
    navigate('/request/calendar', {
      state: { description, peopleCount, allergens }
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
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-2xl font-medium">Request Summary</h1>
          </div>
        </header>

        <div className="flex gap-2 mb-8">
          <div className="h-1 bg-[#085f33] flex-1 rounded-full"></div>
          <div className="h-1 bg-[#085f33] flex-1 rounded-full"></div>
          <div className="h-1 bg-[#085f33] flex-1 rounded-full"></div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-medium mb-4">Review Request Details</h2>
          
          {/* Request Details */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <CircleDot size={20} className="text-gray-400" />
              <h3 className="text-lg font-medium">Request details</h3>
              <button 
                onClick={handleEditDetails}
                className="ml-auto text-gray-500"
              >
                <Pencil size={18} />
              </button>
            </div>
            <div className="pl-7">
              <div className="py-2 border-b border-gray-100">
                <span className="font-medium">Description:</span> 
                <p className="mt-1 text-gray-600">{description || "No description provided"}</p>
              </div>
              <div className="py-2 border-b border-gray-100">
                <span className="font-medium">People to feed:</span> 
                <span className="ml-2 text-gray-600">{peopleCount || 1}</span>
              </div>
              <div className="py-2">
                <span className="font-medium">Allergens to avoid:</span> 
                <span className="ml-2 text-gray-600">{getAllergenList()}</span>
              </div>
            </div>
          </div>
          
          {/* Pickup Details */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <CircleDot size={20} className="text-gray-400" />
              <h3 className="text-lg font-medium">Delivery details</h3>
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
              <h3 className="text-lg font-medium">Additional instructions (optional)</h3>
            </div>
            <div className="pl-7 py-2">
              <textarea
                className="w-full border border-gray-200 rounded-lg p-3 text-sm min-h-[80px]"
                placeholder="E.g., Call upon arrival, gate code, delivery instructions..."
                value={driverInstructions}
                onChange={(e) => setDriverInstructions(e.target.value)}
              />
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 mt-4">
              <AlertTriangle className="text-red-500 mt-0.5 flex-shrink-0" size={18} />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Button 
            onClick={handleSubmit}
            className="w-full h-12 rounded-full text-lg transition-colors bg-[#085f33] hover:bg-[#064726] text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      </div>
    </Layout>
  );
}; 