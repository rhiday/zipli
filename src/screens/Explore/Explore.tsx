import React, { useEffect, useState } from 'react';
import { Layout } from "../../components/Layout";
import { BottomNav } from "../../components/BottomNav";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";
import { Search } from 'lucide-react';
import type { Database } from '../../types/supabase';

type Donation = Database['public']['Tables']['donations']['Row'];

export const Explore = (): JSX.Element => {
  const navigate = useNavigate();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const { data, error } = await supabase
          .from('donations')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setDonations(data || []);
      } catch (error) {
        console.error('Error fetching donations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDonations();

    // Subscribe to new donations
    const subscription = supabase
      .channel('public:donations')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'donations' 
        }, 
        payload => {
          if (payload.eventType === 'INSERT') {
            setDonations(prev => [payload.new as Donation, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setDonations(prev => prev.filter(d => d.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setDonations(prev => prev.map(d => 
              d.id === payload.new.id ? payload.new as Donation : d
            ));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const filteredDonations = donations.filter(donation =>
    donation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    donation.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-medium mb-4">Explore</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search donations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#085f33] focus:border-transparent"
            />
          </div>
        </header>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="flex gap-2">
              <div className="w-2 h-2 bg-[#085f33] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2 h-2 bg-[#085f33] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-[#085f33] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        ) : filteredDonations.length > 0 ? (
          <div className="grid gap-4">
            {filteredDonations.map((donation) => (
              <button
                key={donation.id}
                onClick={() => navigate(`/donations/${donation.id}`)}
                className="block w-full text-left"
              >
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-[#085f33] transition-colors">
                  {donation.image_url && (
                    <img
                      src={donation.image_url}
                      alt={donation.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-medium text-lg mb-2">{donation.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{donation.description}</p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">{donation.location}</span>
                      <span className="text-[#085f33]">{donation.pickup_time}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No donations found</p>
          </div>
        )}
      </div>
      <BottomNav />
    </Layout>
  );
}; 