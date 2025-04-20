import React, { useEffect, useState, useRef } from "react";
import { Layout } from "../../components/Layout";
import { BottomNav } from "../../components/BottomNav";
import { useLocation, useNavigate } from "react-router-dom";
import { UserAvatar } from "../../components/UserAvatar";
import { DonationFilters } from "../../components/DonationFilters";
import { sortDonations } from "../../lib/filters";
import { getAvailableDonations } from "../../lib/donations";
import { supabase } from "../../lib/supabase";
import Logger from "../../lib/logger";
import { SupabaseDonation, supabaseToDonationItem } from "../../types/donation";
import type { RealtimeChannel } from '@supabase/supabase-js';
import { Button } from "../../components/ui/button";
import { Plus, Calendar, Clock, ChevronRight, CircleDot } from "lucide-react";

// Define interface for user requests
interface UserRequest {
  id: string;
  description: string;
  peopleCount: number;
  pickupDate: Date;
  pickupTime: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
}

// Mock function for user's requests - in a real app, you would fetch this from your database
const getUserRequests = async (): Promise<{ requests: UserRequest[], error: string | null }> => {
  try {
    // This would be replaced with a real API call
    // For now, just return mock data
    const mockRequests: UserRequest[] = [
      {
        id: '1',
        description: 'Non-perishable items like rice, pasta, canned vegetables',
        peopleCount: 3,
        pickupDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        pickupTime: '12:00 PM - 2:00 PM',
        status: 'active',
        createdAt: new Date()
      }
    ];
    
    return { requests: mockRequests, error: null };
  } catch (error) {
    return { requests: [], error: 'Failed to fetch requests' };
  }
};

export const Receive = (): JSX.Element => {
  const txId = Logger.generateTransactionId();
  const location = useLocation();
  const navigate = useNavigate();
  const [donations, setDonations] = useState<SupabaseDonation[]>([]);
  const [userRequests, setUserRequests] = useState<UserRequest[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequestsLoading, setIsRequestsLoading] = useState(true);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Only show active donations in the receive feed
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

  const loadUserRequests = async () => {
    try {
      setIsRequestsLoading(true);
      const { requests, error: requestsError } = await getUserRequests();
      
      if (requestsError) {
        console.error('Failed to load user requests:', requestsError);
      } else {
        setUserRequests(requests);
      }
    } catch (err) {
      console.error('Error loading user requests:', err);
    } finally {
      setIsRequestsLoading(false);
    }
  };

  // Setup subscription for real-time updates
  useEffect(() => {
    Logger.log('Setting up real-time subscription for donations', {
      transactionId: txId
    });
    
    // Create channel for listening to donation changes
    if (!channelRef.current) {
      const channel = supabase
        .channel('public:donations')
        .on(
          'postgres_changes',
          {
            event: '*', // Listen for all events
            schema: 'public',
            table: 'donations'
          },
          (payload) => {
            Logger.log('Received real-time donation update', { 
              context: { 
                event: payload.eventType, 
                donationId: payload.new?.id || payload.old?.id 
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
        
      channelRef.current = channel;
    }
    
    // Load donations and user requests initially
    loadDonations();
    loadUserRequests();
    
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

  const handleDonationClick = (donation: SupabaseDonation) => {
    Logger.log('User clicked on donation', {
      context: { donationId: donation.id },
      transactionId: txId
    });
    
    // Convert to compatible format and navigate
    navigate(`/receive/${donation.id}`, { state: { donation } });
  };

  const handleMakeRequest = () => {
    Logger.log('User clicked make request button', {
      transactionId: txId
    });
    navigate('/request/new');
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Layout>
      <main className="p-6">
        <header className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-medium">Receiver Dashboard</h1>
          <UserAvatar />
        </header>

        {/* User's Active Requests Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">Your Requests</h2>
            <Button 
              onClick={handleMakeRequest}
              className="bg-[#085f33] hover:bg-[#064726] rounded-full h-9 px-4 text-white flex items-center"
              size="sm"
            >
              <Plus size={16} className="mr-1" />
              New Request
            </Button>
          </div>
          
          {isRequestsLoading ? (
            <div className="flex justify-center items-center h-24">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          ) : userRequests.length > 0 ? (
            <div className="space-y-3">
              {userRequests.map((request) => (
                <div 
                  key={request.id}
                  className="bg-[#F1F5F9] rounded-xl p-4 border border-gray-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">Request #{request.id}</h3>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                      Active
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                    {request.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-1" />
                      {formatDate(request.pickupDate)}
                    </div>
                    <div className="flex items-center">
                      <Clock size={14} className="mr-1" />
                      {request.pickupTime}
                    </div>
                    <div className="flex items-center">
                      <CircleDot size={14} className="mr-1" />
                      {request.peopleCount} {request.peopleCount === 1 ? 'person' : 'people'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-200">
              <p className="text-gray-600 mb-4">You haven't made any requests yet</p>
              <Button 
                onClick={handleMakeRequest}
                className="bg-[#085f33] hover:bg-[#064726] text-white rounded-full"
              >
                Make Your First Request
              </Button>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 pt-6 mb-4">
          <h2 className="text-xl font-medium mb-4">Available Donations</h2>
        </div>

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
          <div className="bg-gray-50 rounded-xl p-6 text-center mb-24 border border-gray-200">
            <p className="text-gray-600">No available donations match your criteria</p>
          </div>
        )}

        <BottomNav />
      </main>
    </Layout>
  );
};