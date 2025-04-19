import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { AlertCircle } from 'lucide-react';
import { updateDonationStatus } from '../../lib/donations';
import { supabase } from '../../lib/supabase';
import Logger from '../../lib/logger';
import type { Database } from '../../types/supabase';

type Donation = Database['public']['Tables']['donations']['Row'];

export const DonationDetails = (): JSX.Element => {
  const txId = Logger.generateTransactionId();
  const location = useLocation();
  const navigate = useNavigate();
  const donation = location.state?.donation as Donation;
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequestPickup = async () => {
    return Logger.trackOperation('requestDonationPickup', async (opTxId) => {
      try {
        setIsProcessing(true);
        setError(null);
        
        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('You must be logged in to rescue a donation');
        }
        
        // Check if user is trying to claim their own donation
        if (donation.organization_id === user.id) {
          Logger.log('User attempted to claim their own donation', {
            level: 'warn',
            context: { donationId: donation.id, userId: user.id },
            transactionId: opTxId
          });
          throw new Error('You cannot rescue your own donation');
        }
        
        Logger.log('Attempting to update donation status', {
          context: { donationId: donation.id },
          transactionId: opTxId
        });
        
        // Update donation status in Supabase
        const { donation: updatedDonation, error: updateError } = await updateDonationStatus(donation.id, 'completed');
        
        if (updateError) {
          throw new Error(updateError);
        }
        
        Logger.log('Donation rescued successfully', {
          context: { donationId: donation.id },
          transactionId: opTxId
        });
        
        // Navigate to thank you page
        navigate('/receive/thank-you', { state: { donation: updatedDonation || donation } });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to rescue donation';
        Logger.error('Failed to rescue donation', err as Error, { 
          donationId: donation?.id 
        }, opTxId);
        setError(errorMessage);
        setIsProcessing(false);
      }
    });
  };

  if (!donation) {
    return (
      <Layout>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="text-2xl"
              aria-label="Go back"
            >
              ←
            </button>
            <h1 className="text-2xl font-medium">Donation Details</h1>
          </div>
          <p className="text-gray-500 text-center">Donation not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-2xl"
            aria-label="Go back"
          >
            ←
          </button>
          <h1 className="text-2xl font-medium">Donation Details</h1>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4 flex items-center gap-2">
            <AlertCircle size={16} className="text-red-500" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-6 mb-8">
          <div className="aspect-square w-full bg-gray-200 rounded-lg overflow-hidden">
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          </div>

          <Card className="bg-[#fff0f2] border-none">
            <div className="p-4">
              <h2 className="text-xl font-medium mb-2">{donation.title}</h2>
              <div className="space-y-2 text-gray-600">
                <p>Total Quantity: {donation.quantity}</p>
                <p>Location: {donation.location}</p>
                <p>Distance: {donation.distance}</p>
                <p>Pickup Time: {donation.pickup_time}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-[#fff0f2] border-none">
            <div className="p-4">
              <h3 className="font-medium mb-3">Items</h3>
              <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-600">
                {donation.description}
              </pre>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={handleRequestPickup}
            disabled={isProcessing}
            className={`w-full h-12 ${
              isProcessing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-[#085f33] hover:bg-[#064726]'
            } text-white rounded-full text-lg`}
          >
            {isProcessing ? 'Processing...' : 'Rescue'}
          </Button>
          <Button 
            onClick={() => navigate(-1)}
            variant="outline"
            disabled={isProcessing}
            className="w-full h-12 bg-white border-2 border-[#085f33] text-[#085f33] rounded-full text-lg hover:bg-[#085f33] hover:text-white"
          >
            Back
          </Button>
        </div>
      </div>
    </Layout>
  );
};