import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { AlertCircle, ChevronLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/AuthProvider';
import Logger from '../../lib/logger';
import type { Database } from '../../types/supabase';

type Donation = Database['public']['Tables']['donations']['Row'];

export const RescueConfirm = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const donation = location.state?.donation as Donation;
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!donation) {
    // Handle case where donation data is missing (e.g., direct navigation)
    return (
      <Layout>
        <div className="p-6">
          <p className="text-red-600 text-center">Donation details are missing. Please go back.</p>
          <Button onClick={() => navigate('/receive')} variant="outline" className="mt-4 w-full">
            Back to Donations
          </Button>
        </div>
      </Layout>
    );
  }

  const handleConfirmRescue = async () => {
    const txId = Logger.generateTransactionId();
    return Logger.trackOperation('confirmDonationRescue', async (opTxId) => {
      try {
        setIsProcessing(true);
        setError(null);
        
        if (!user) {
          throw new Error('You must be logged in to rescue a donation');
        }
        
        if (donation.organization_id === user.id) {
          // This check should ideally happen before navigating here, but double-check
          throw new Error('You cannot rescue your own donation');
        }
        
        Logger.log('Confirming rescue: Updating donation status and setting rescuer', {
          context: { donationId: donation.id, rescuerId: user.id },
          transactionId: opTxId
        });
        
        const { data: updatedData, error: updateError } = await supabase
          .from('donations')
          .update({ 
            status: 'completed', 
            rescuer_id: user.id 
          })
          .match({ id: donation.id, status: 'active' })
          .select()
          .single();

        if (updateError) {
          if (updateError.code === 'PGRST116') {
             throw new Error('This donation is no longer available or has already been claimed.');
          }
          throw updateError;
        }
        
        if (!updatedData) {
            throw new Error('Failed to update donation status, but no error was reported.');
        }
        
        // TODO: Call Edge Function here if needed (or maybe call it from thank you page?)

        Logger.log('Donation rescued successfully in DB', {
          context: { donationId: donation.id },
          transactionId: opTxId
        });
        
        navigate('/receive/thank-you', { replace: true, state: { donation: updatedData } }); 
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to rescue donation';
        Logger.error('Failed to confirm rescue', err as Error, { donationId: donation.id }, opTxId);
        setError(errorMessage);
        setIsProcessing(false);
      }
    });
  };

  const handleCancel = () => {
    // Go back to the donation details page
    navigate(-1);
  };

  return (
    <Layout>
      <div className="p-6">
        <header className="mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancel} // Use cancel handler
              className="text-2xl"
              aria-label="Go back"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-2xl font-medium">Confirm Rescue</h1>
          </div>
        </header>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4 flex items-center gap-2">
            <AlertCircle size={16} className="text-red-500" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <Card className="p-6 mb-8 space-y-4">
          <h2 className="text-lg font-semibold">Confirm Pickup Details</h2>
          <div>
            <p className="text-sm text-gray-500 mb-1">Donation</p>
            <p className="font-medium">{donation.title}</p>
          </div>
           <div>
            <p className="text-sm text-gray-500 mb-1">Pickup Location</p>
            <p className="font-medium">{donation.location}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Pickup Time Window</p>
            <p className="font-medium">{donation.pickup_time}</p>
          </div>
        </Card>
        
        <p className="text-sm text-gray-600 text-center mb-8">
          By confirming, you agree to pick up this donation within the specified time frame.
        </p>

        <div className="space-y-4">
          <Button 
            onClick={handleConfirmRescue}
            disabled={isProcessing}
            className={`w-full h-12 ${
              isProcessing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-[#085f33] hover:bg-[#064726]'
            } text-white rounded-full text-lg`}
          >
            {isProcessing ? 'Confirming...' : 'Confirm Rescue'}
          </Button>
          <Button 
            onClick={handleCancel}
            variant="outline"
            disabled={isProcessing}
            className="w-full h-12 bg-white border-2 border-gray-300 text-gray-700 rounded-full text-lg hover:bg-gray-50"
          >
            Cancel
          </Button>
        </div>
      </div>
    </Layout>
  );
}; 