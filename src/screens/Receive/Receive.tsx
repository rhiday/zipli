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
import { Plus, Calendar, Clock, ChevronRight, CircleDot, Trash2, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../components/AuthProvider";

// Define interface for user requests
interface UserRequest {
  id: string;
  description: string;
  people_count: number; // Renamed to match DB
  pickup_date: string; // Changed type to string for DB compatibility
  pickup_time: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string; // Changed type to string for DB compatibility
  user_id: string; // Added user_id
}

// Function to fetch user's requests from Supabase
const getUserRequests = async (userId: string): Promise<{ requests: UserRequest[], error: string | null }> => {
  try {
    const { data: requests, error } = await supabase
      .from('requests')
      .select('*')
      .eq('user_id', userId) // Filter by user ID
      .order('created_at', { ascending: false }); // Optional: order by creation date

    if (error) {
      Logger.error('Failed to fetch user requests', error, { userId });
      throw error;
    }
    
    // Ensure data conforms to UserRequest interface (basic check)
    const typedRequests = requests as UserRequest[];

    return { requests: typedRequests || [], error: null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch requests';
    return { requests: [], error: errorMessage };
  }
};

export const Receive = (): JSX.Element => {
  const { user, loading } = useAuth(); // Get user and loading state from auth context
  const txId = Logger.generateTransactionId();
  const location = useLocation();
  const navigate = useNavigate();
  const [donations, setDonations] = useState<SupabaseDonation[]>([]);
  const [userRequests, setUserRequests] = useState<UserRequest[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequestsLoading, setIsRequestsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const requestsChannelRef = useRef<RealtimeChannel | null>(null); // Add ref for requests channel

  // Only show active donations in the receive feed
  const activeDonations = donations.filter(d => d.status === 'active');
  const filteredDonations = sortDonations(activeDonations, selectedFilter);

  const loadDonations = async () => {
    // Pass user ID to the fetching function
    const currentUserId = user?.id; 
    return Logger.trackOperation('loadAvailableDonations', async (opTxId) => {
      try {
        Logger.log('Fetching available/rescued donations', {
          transactionId: opTxId,
          context: { userId: currentUserId } // Log which user we are fetching for
        });
        
        // Pass userId here
        const { donations: fetchedDonations, error: fetchError } = await getAvailableDonations(currentUserId); 
        
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
    if (!user) {
      setIsRequestsLoading(false);
      return; // Don't load if user is not logged in
    }
    try {
      setIsRequestsLoading(true);
      const { requests, error: requestsError } = await getUserRequests(user.id); // Pass user.id
      
      if (requestsError) {
        console.error('Failed to load user requests:', requestsError);
        setError(requestsError); // Set error state
      } else {
        setUserRequests(requests);
        setError(null); // Clear error on success
      }
    } catch (err) {
      console.error('Error loading user requests:', err);
      setError('An unexpected error occurred while loading requests.'); // Set generic error
    } finally {
      setIsRequestsLoading(false);
    }
  };

  // Setup subscription for real-time updates
  useEffect(() => {
    // Only run if user is loaded
    if (!user && !loading) {
      // If not loading and no user, clear requests and stop
      setUserRequests([]);
      setIsRequestsLoading(false);
      return;
    }

    if (user) {
      Logger.log('Setting up real-time subscription for donations', {
        transactionId: txId
      });
      
      // Create channel for listening to donation changes
      if (!channelRef.current) {
        const donationsChannel = supabase
          .channel('public:donations') // Rename for clarity
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
          
        channelRef.current = donationsChannel; // Assign to correct ref
      }

      // Create channel for listening to the user's requests changes
      if (!requestsChannelRef.current) {
        const requestsChannel = supabase
          .channel('public:requests')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'requests',
              filter: `user_id=eq.${user.id}` // Only listen to changes for the current user
            },
            (payload) => {
              Logger.log('Received real-time request update', { 
                context: { 
                  event: payload.eventType,
                  requestId: payload.new && typeof payload.new === 'object' && 'id' in payload.new
                    ? payload.new.id
                    : (payload.old && typeof payload.old === 'object' && 'id' in payload.old ? payload.old.id : undefined)
                },
                transactionId: txId
              });
              // Refresh the user requests list
              loadUserRequests(); 
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              Logger.log('Successfully subscribed to requests channel', {
                transactionId: txId
              });
            } else {
              Logger.log('Requests subscription error', {
                level: 'warn',
                context: { status },
                transactionId: txId
              });
            }
          });
        requestsChannelRef.current = requestsChannel; // Assign to the new ref
      }
      
      // Load donations and user requests initially
      loadDonations();
      loadUserRequests(); // loadUserRequests will now use the logged-in user's ID
    }
    
    // Cleanup subscription on unmount
    return () => {
      Logger.log('Cleaning up donations subscription', {
        transactionId: txId
      });
      
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      // Cleanup requests subscription
      if (requestsChannelRef.current) {
        Logger.log('Cleaning up requests subscription', { transactionId: txId });
        supabase.removeChannel(requestsChannelRef.current);
        requestsChannelRef.current = null;
      }
    };
  }, [user, loading]); // Add user and loading to dependency array

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

  // Function to handle request deletion
  const handleDeleteRequest = async (requestId: string) => {
    // Optional: Add a confirmation dialog here
    // if (!window.confirm("Are you sure you want to delete this request?")) {
    //   return;
    // }

    setIsDeleting(requestId); // Set loading state for this specific request
    const deleteTxId = Logger.generateTransactionId();

    try {
      Logger.log('Deleting request', { context: { requestId }, transactionId: deleteTxId });

      const { error: deleteError } = await supabase
        .from('requests')
        .delete()
        .match({ id: requestId, user_id: user?.id }); // Ensure user can only delete their own

      if (deleteError) {
        throw deleteError;
      }

      Logger.log('Request deleted successfully', { context: { requestId }, transactionId: deleteTxId });

      // Optimistic UI update (remove from local state) - the real-time listener will also update
      setUserRequests(prevRequests => prevRequests.filter(req => req.id !== requestId));
      // Or rely solely on the real-time update by calling loadUserRequests() if preferred
      // loadUserRequests(); 
      
    } catch (err: any) {
      Logger.error('Failed to delete request', err, { requestId }, deleteTxId);
      // Display error to user (e.g., using a toast notification or setting error state)
      setError("Failed to delete request. Please try again.");
    } finally {
      setIsDeleting(null); // Clear loading state
    }
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
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="font-medium text-base break-words flex-1">
                      {request.description}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        request.status === 'active' ? 'bg-blue-100 text-blue-800' : 
                        request.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                      <button
                        onClick={() => handleDeleteRequest(request.id)}
                        disabled={isDeleting === request.id}
                        className={`p-1 text-red-600 hover:bg-red-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                        aria-label="Delete request"
                      >
                        {isDeleting === request.id ? (
                          <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin"></div>
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mt-3">
                    <div className="flex items-center">
                      <Calendar size={14} className="mr-1" />
                      {formatDate(new Date(request.pickup_date))}
                    </div>
                    <div className="flex items-center">
                      <Clock size={14} className="mr-1" />
                      {request.pickup_time}
                    </div>
                    <div className="flex items-center">
                      <CircleDot size={14} className="mr-1" />
                      {request.people_count} {request.people_count === 1 ? 'person' : 'people'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-200">
              <p className="text-gray-600 mb-4">You haven't made any requests yet</p>
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
                // Disable button and remove click handler if donation is completed
                onClick={donation.status === 'active' ? () => handleDonationClick(donation) : undefined}
                disabled={donation.status === 'completed'}
                className={`w-full text-left focus:outline-none transition-opacity ${
                  donation.status === 'active' ? 'active:opacity-80 cursor-pointer' : 'opacity-70 cursor-default'
                }`}
              >
                <div className="bg-[#fff0f2] rounded-xl overflow-hidden">
                  <div className="flex gap-3 p-3">
                    {/* Image Display */}
                    <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {donation.image_url ? (
                        <img 
                          src={donation.image_url}
                          alt={donation.title ?? 'Donation image'} 
                          className="w-full h-full object-cover"
                          onError={(e) => { 
                            e.currentTarget.style.display = 'none'; 
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
                        {/* Optional: Add a status badge here too if needed */}
                      </div>
                      {/* Conditional Display: Pickup time/location OR Rescued status */}
                      {donation.status === 'active' ? (
                        <>
                          <div className="mt-1 text-sm text-gray-600">
                            {donation.location} • {donation.distance}
                          </div>
                          <div className="mt-1 text-sm text-[#085f33]">
                            {donation.pickup_time}
                          </div>
                        </>
                      ) : (
                        <div className="mt-2 text-sm text-green-600 font-medium flex items-center gap-1">
                           <CheckCircle2 size={16} className="flex-shrink-0"/>
                           Successfully Rescued
                        </div>
                      )}
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