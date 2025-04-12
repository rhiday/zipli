import React, { useEffect, useState } from "react";
import { Layout } from "../../components/Layout";
import { BottomNav } from "../../components/BottomNav";
import { useLocation, useNavigate } from "react-router-dom";
import { UserAvatar } from "../../components/UserAvatar";
import { DonationFilters } from "../../components/DonationFilters";
import { sortDonations } from "../../lib/filters";
import { getAvailableDonations } from "../../lib/donations";
import type { Database } from '../../types/supabase';

type Donation = Database['public']['Tables']['donations']['Row'];

export const Receive = (): JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Only show active donations in the receive feed
  const activeDonations = donations.filter(d => d.status === 'active');
  const filteredDonations = sortDonations(activeDonations, selectedFilter);

  const loadDonations = async () => {
    try {
      const { donations: fetchedDonations, error } = await getAvailableDonations();
      if (error) throw new Error(error);
      setDonations(fetchedDonations);
    } catch (error) {
      console.error('Error loading donations:', error);
      setError('Failed to load donations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDonations();
    const interval = setInterval(loadDonations, 60000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleDonationClick = (donation: Donation) => {
    navigate(`/receive/${donation.id}`, { state: { donation } });
  };

  return (
    <Layout>
      <main className="p-6">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-medium">Available offers</h1>
          <UserAvatar />
        </header>

        <DonationFilters
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
        />

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-[calc(100vh-12rem)]">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        ) : filteredDonations.length > 0 ? (
          <div className="space-y-3 mb-24">
            {filteredDonations.map((donation) => (
              <button
                key={donation.id}
                onClick={() => handleDonationClick(donation)}
                className="w-full text-left focus:outline-none active:opacity-80 transition-opacity"
              >
                <div className="bg-[#fff0f2] rounded-xl overflow-hidden">
                  <div className="flex gap-3 p-3">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">No image</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h2 className="font-medium text-base truncate">
                          {donation.title}
                        </h2>
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        {donation.location} • {donation.distance}
                      </div>
                      <div className="mt-1 text-sm text-[#085f33]">
                        {donation.pickup_time}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)]">
            <p className="text-gray-500 text-center">No donations available at the moment</p>
          </div>
        )}

        <BottomNav />
      </main>
    </Layout>
  );
};