import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { DonationItem } from '../../types/donation';

const STORAGE_KEY = 'donations';

export const DonationDetails = (): JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();
  const donation = location.state?.donation as DonationItem;

  const handleRequestPickup = () => {
    try {
      // Load all donations
      const storedDonations = localStorage.getItem(STORAGE_KEY);
      if (!storedDonations) return;

      const donations = JSON.parse(storedDonations);
      
      // Update the status of the current donation
      const updatedDonations = donations.map((d: DonationItem) => 
        d.id === donation.id ? { ...d, status: 'completed' } : d
      );

      // Save back to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDonations));

      // Navigate to thank you page
      navigate('/receive/thank-you', { state: { donation } });
    } catch (error) {
      console.error('Error updating donation status:', error);
    }
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
                <p>Pickup Time: {donation.pickupTime}</p>
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
            className="w-full h-12 bg-[#085f33] hover:bg-[#064726] text-white rounded-full text-lg"
          >
            Rescue
          </Button>
          <Button 
            onClick={() => navigate(-1)}
            variant="outline"
            className="w-full h-12 bg-white border-2 border-[#085f33] text-[#085f33] rounded-full text-lg hover:bg-[#085f33] hover:text-white"
          >
            Back
          </Button>
        </div>
      </div>
    </Layout>
  );
};