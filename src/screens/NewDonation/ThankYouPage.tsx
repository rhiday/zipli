import React, { useEffect, useState, useRef } from 'react';
import { Button } from "../../components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { CheckCircle2 } from 'lucide-react';
import { createDonation } from '../../lib/donations';
import { supabase } from '../../lib/supabase';

export const ThankYouPage = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const { description, deliveryInfo, pickup, images } = location.state || {};
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const saveAttempted = useRef(false);

  useEffect(() => {
    const saveDonation = async () => {
      // Prevent multiple save attempts
      if (saveAttempted.current) {
        return;
      }
      saveAttempted.current = true;

      console.log('Starting donation save process');
      
      if (!description || !deliveryInfo || !pickup) {
        console.log('Missing required data:', { description, deliveryInfo, pickup });
        setIsProcessing(false);
        setError('Missing donation information');
        return;
      }

      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw new Error('Authentication error');
        if (!user) throw new Error('Not authenticated');

        const donationData = {
          title: description.split('\n')[0].split(' - ')[0].trim(),
          description,
          quantity: description.split('\n')
            .map(line => line.split(' - ')[1])
            .filter(Boolean)
            .join(', '),
          location: deliveryInfo.address,
          distance: '1.2km',
          pickup_time: `${pickup.days.join(', ')} ${pickup.timeSlot.start}-${pickup.timeSlot.end}`,
          status: 'active'
        };

        console.log('Creating donation with data:', donationData);

        const { donation, error: donationError } = await createDonation(donationData);

        if (donationError) throw new Error(donationError);
        if (!donation) throw new Error('Failed to create donation');

        console.log('Donation created successfully:', donation);
      } catch (error) {
        console.error('Error saving donation:', error);
        setError(error instanceof Error ? error.message : 'Failed to save donation');
      } finally {
        setIsProcessing(false);
      }
    };

    saveDonation();
  }, []); // Empty dependency array - only run once on mount

  const handleViewDonations = () => {
    console.log('Navigating to home with replace');
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

        <div className="space-y-6 mb-8">
          <div className="space-y-2">
            <h2 className="text-lg font-medium">Donation Summary</h2>
            <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-600">
              {description}
            </pre>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-medium">Pickup Details</h2>
            <div className="space-y-4 text-gray-600">
              <div>
                <p className="font-medium mb-1">Location</p>
                <p className="text-sm">{deliveryInfo?.address}</p>
              </div>
              {deliveryInfo?.driverMessage && (
                <div>
                  <p className="font-medium mb-1">Instructions</p>
                  <p className="text-sm">{deliveryInfo.driverMessage}</p>
                </div>
              )}
              <div>
                <p className="font-medium mb-1">Pickup Time</p>
                <p className="text-sm">
                  {pickup?.days.join(', ')} {pickup?.timeSlot.start}-{pickup?.timeSlot.end}
                </p>
              </div>
            </div>
          </div>
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