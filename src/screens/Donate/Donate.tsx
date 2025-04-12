import React, { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { BottomNav } from "../../components/BottomNav";
import { UserAvatar } from "../../components/UserAvatar";
import { Trash2, CheckCircle2 } from "lucide-react";
import { getDonations, deleteDonation as deleteDonationFromDb } from "../../lib/donations";
import type { Database } from '../../types/supabase';

type Donation = Database['public']['Tables']['donations']['Row'];

export const Donate = (): JSX.Element => {
  const navigate = useNavigate();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [error, setError] = useState<string | null>(null);

  const activeDonations = donations.filter(d => d.status === 'active');
  const completedDonations = donations.filter(d => d.status === 'completed');

  const loadDonations = async () => {
    try {
      const { donations: fetchedDonations, error } = await getDonations();
      if (error) throw new Error(error);
      setDonations(fetchedDonations);
    } catch (error) {
      console.error('Error loading donations:', error);
      setError('Failed to load donations');
    }
  };

  const handleDeleteDonation = async (id: string) => {
    try {
      const { error } = await deleteDonationFromDb(id);
      if (error) throw new Error(error);
      await loadDonations(); // Reload donations after deletion
    } catch (error) {
      console.error('Error deleting donation:', error);
      setError('Failed to delete donation');
    }
  };

  useEffect(() => {
    loadDonations();
    const interval = setInterval(loadDonations, 60000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <Layout>
      <main className="p-6">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-medium">Good afternoon!</h1>
          <UserAvatar />
        </header>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <section className="mb-8">
          <h2 className="text-base font-medium mb-3">
            Active Donations
          </h2>
          {activeDonations.length > 0 ? (
            <div className="space-y-3">
              {activeDonations.map((donation) => (
                <Card key={donation.id} className="bg-[#fff0f2] border-none">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-sm">No image</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{donation.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{donation.quantity}</p>
                            <p className="text-sm text-[#085f33] mt-1">{donation.pickup_time}</p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDonation(donation.id);
                            }}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">No active donations</p>
          )}
        </section>

        <Separator className="my-6" />

        <section className="mb-32">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-medium text-gray-600">
              Past donations
            </h2>
            <Button 
              onClick={() => navigate('/new-donation')}
              className="h-10 px-4 bg-[#085f33] text-white rounded-full hover:bg-[#064726] transition-colors shadow-sm"
            >
              New Donation
            </Button>
          </div>
          <div className="grid gap-4">
            {completedDonations.length > 0 ? (
              completedDonations.map((donation) => (
                <Card key={donation.id} className="bg-[#fff0f2] border-none">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-sm">No image</span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{donation.title}</h3>
                              <div className="flex items-center gap-1 bg-[#085f33] bg-opacity-10 text-[#085f33] text-xs px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Completed</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{donation.quantity}</p>
                            <p className="text-sm text-[#085f33] mt-1">{donation.pickup_time}</p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDonation(donation.id);
                            }}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-sm text-gray-600">No past donations</p>
            )}
          </div>
        </section>

        <BottomNav />
      </main>
    </Layout>
  );
};