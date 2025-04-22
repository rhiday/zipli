import React, { useEffect, useState } from "react";
import { Layout } from "../../components/Layout";
import { BottomNav } from "../../components/BottomNav";
import { UserAvatar } from "../../components/UserAvatar";
import { DonationFilters } from "../../components/DonationFilters";
import { sortDonations } from "../../lib/filters";
import { getAvailableDonations } from "../../lib/donations";
import { supabase } from "../../lib/supabase";
import Logger from "../../lib/logger";
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { SupabaseDonation } from "../../types/donation";

export const Explore = (): JSX.Element => {
  const txId = Logger.generateTransactionId();
  const [donations, setDonations] = useState<SupabaseDonation[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const channelRef = React.useRef<RealtimeChannel | null>(null);

  // Only show active donations
  const activeDonations = donations.filter(d => d.status === 'active');
  const filteredDonations = sortDonations(activeDonations, selectedFilter);

  const loadDonations = async () => {
    return Logger.trackOperation('loadAvailableDonations', async (opTxId) => {
      try {
        Logger.log('Fetching available donations', {
          transactionId: opTxId
        });
        
        const { donations: fetchedDonations, error: fetchError } = await getAvailableDonations();
        
        if (fetchError) throw new Error(fetchError);
        
        Logger.log('Donations fetched successfully', {
          context: { count: fetchedDonations.length },
          transactionId: opTxId
        });
        
        setDonations(fetchedDonations);
        setError(null);
      } catch (err) {
        Logger.error('Failed to load donations', err as Error, {}, opTxId);
        setError('Failed to load donations. Please try again.');
      } finally {
        setIsLoading(false);
      }
    });
  };

  // Setup subscription for real-time updates
  useEffect(() => {
    Logger.log('Setting up real-time subscription for donations', {
      transactionId: txId
    });
    
    // Create channel for listening to donation changes
    if (!channelRef.current) {
      const donationsChannel = supabase
        .channel('public:donations')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'donations'
          },
          (payload) => {
            Logger.log('Received real-time donation update', { 
              context: { 
                event: payload.eventType, 
                donationId: payload.new && typeof payload.new === 'object' && 'id' in payload.new 
                  ? payload.new.id 
                  : (payload.old && typeof payload.old === 'object' && 'id' in payload.old ? payload.old.id : undefined)
              },
              transactionId: txId
            });
            
            // Refresh the donations list when any donation changes
            loadDonations();
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            Logger.log('Successfully subscribed to donations channel', {
              transactionId: txId
            });
          } else {
            Logger.log('Subscription error', {
              level: 'warn',
              context: { status },
              transactionId: txId
            });
          }
        });
        
      channelRef.current = donationsChannel;
    }
    
    // Load donations initially
    loadDonations();
    
    // Cleanup subscription on unmount
    return () => {
      Logger.log('Cleaning up donations subscription', {
        transactionId: txId
      });
      
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  return (
    <Layout>
      <main className="p-6">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-medium">Explore</h1>
          <UserAvatar />
        </header>

        <DonationFilters
          selectedFilter={selectedFilter}
          onFilterChange={(filter) => {
            Logger.log('User changed donation filter', {
              context: { filter },
              transactionId: txId
            });
            setSelectedFilter(filter);
          }}
        />

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-[calc(100vh-24rem)]">
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
                onClick={() => navigate(`/receive/${donation.id}`, { state: { donation } })}
                className="w-full text-left focus:outline-none active:opacity-80 transition-opacity"
              >
                <div className="bg-[#fff0f2] rounded-xl overflow-hidden">
                  <div className="flex gap-3 p-3">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {donation.image_url ? (
                        <img
                          src={donation.image_url}
                          alt={donation.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '';
                            e.currentTarget.alt = 'No image';
                            e.currentTarget.className += ' bg-gray-200 flex items-center justify-center text-gray-400 text-sm';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-sm">No image</span>
                        </div>
                      )}
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
          <div className="bg-gray-50 rounded-xl p-6 text-center mb-24 border border-gray-200">
            <p className="text-gray-600">No available donations match your criteria</p>
          </div>
        )}

        <BottomNav />
      </main>
    </Layout>
  );
};