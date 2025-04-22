import React, { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { BottomNav } from "../../components/BottomNav";
import { UserAvatar } from "../../components/UserAvatar";
import { Trash2, CheckCircle2, ChevronDown, Info } from "lucide-react";
import { getDonations, deleteDonation as deleteDonationFromDb } from "../../lib/donations";
import { supabase } from "../../lib/supabase"; // Ensure supabase client is imported
import type { Database } from '../../types/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js'; // Import RealtimeChannel type
import jsPDF from 'jspdf';

type Donation = Database['public']['Tables']['donations']['Row'];

export const Donate = (): JSX.Element => {
  const navigate = useNavigate();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonthYear, setSelectedMonthYear] = useState("February 2025");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const availableMonths = [
    "February 2025",
    "January 2025",
    "December 2024",
    "November 2024",
  ];

  const activeDonations = donations.filter(d => d.status === 'active');
  const completedDonations = donations.filter(d => d.status === 'completed');

  // Memoize fetchDonations to avoid recreating it on each render
  const fetchDonations = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('User not authenticated');
        return;
      }
      
      setUserId(user.id);
      
      const { donations: fetchedDonations, error: fetchError } = await getDonations();
      if (fetchError) throw new Error(fetchError);
      
      // Deduplicate donations by ID before setting state
      const uniqueDonations = Array.from(
        new Map(fetchedDonations.map(item => [item.id, item])).values()
      );
      
      setDonations(uniqueDonations);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error('Error loading donations:', err);
      setError('Failed to load donations');
    }
  }, []);

  const handleDeleteDonation = async (id: string) => {
    try {
      const { error } = await deleteDonationFromDb(id);
      if (error) throw new Error(error);
      setDonations(currentDonations => currentDonations.filter(d => d.id !== id));
    } catch (error) {
      console.error('Error deleting donation:', error);
      setError('Failed to delete donation');
    }
  };

  // Initial data fetch on component mount
  useEffect(() => {
    fetchDonations();
  }, []); 

  // Add a "focus" event listener to refresh data when user returns to tab
  useEffect(() => {
    const handleFocus = () => {
      console.log('Window focused, refreshing donations');
      fetchDonations();
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchDonations]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleMonthSelect = (monthYear: string) => {
    setSelectedMonthYear(monthYear);
    setIsDropdownOpen(false);
    // TODO: Add logic to fetch/update data for the selected month
  };

  // Function to handle PDF generation and download
  const handleSharePdf = () => {
    const doc = new jsPDF();
    
    // Get current impact data (using placeholders for now)
    const totalFoodOffered = "46kg";
    const portionsOffered = "131";
    const costSaved = "125€";
    const emissionReduction = "89%";
    const selectedMonth = selectedMonthYear; // Use the state variable

    // Set document properties (optional)
    doc.setProperties({
      title: `Impact Report - ${selectedMonth}`,
    });

    // Add content to the PDF
    doc.setFontSize(18);
    doc.text(`Impact Report - ${selectedMonth}`, 14, 22);
    
    doc.setFontSize(12);
    doc.text(`Total Food Offered: ${totalFoodOffered}`, 14, 40);
    doc.text(`Portions Offered: ${portionsOffered} (approx. 350g/portion)`, 14, 50);
    doc.text(`Saved Food Disposal Costs: ${costSaved}`, 14, 60);
    doc.text(`Emission Reduction: ${emissionReduction}`, 14, 70);

    // TODO: Add more details, styling, or charts as needed

    // Trigger download
    doc.save(`zipli-impact-report-${selectedMonth.replace(" ", "-")}.pdf`);
  };

  return (
    <Layout>
      <main className="p-6">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-medium">Dashboard</h1>
          <UserAvatar />
        </header>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Moved New Donation Button */}
        <div className="flex mb-6">
           <Button 
              onClick={() => navigate('/new-donation')}
              className="h-10 px-4 bg-[#085f33] text-white rounded-full hover:bg-[#064726] transition-colors shadow-sm w-full"
            >
              Make a new donation
            </Button>
        </div>

        {/* Your Impact Section */}
        <section className="my-8 p-4 bg-[#fff0f2] rounded-lg">
          <div className="flex justify-between items-center mb-4 relative" ref={dropdownRef}>
            <h2 className="text-base font-medium">Your impact</h2>
            <Button 
              variant="outline" 
              className="h-8 px-3 text-sm border-[#085f33] text-[#085f33] rounded-full flex items-center gap-1 bg-transparent hover:bg-green-50/50"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {selectedMonthYear}
              <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </Button>
            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                <ul className="py-1">
                  {availableMonths.map((month) => (
                    <li key={month}>
                      <button 
                        className="w-full text-left px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => handleMonthSelect(month)}
                      >
                        {month}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mb-4">
            <span className="text-4xl font-bold text-[#085f33]">46kg</span>
            <span className="ml-2 text-sm text-gray-600">Total food offered</span>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <Card className="bg-white p-3 text-center rounded-lg shadow-sm">
              <div className="text-xl font-semibold text-[#085f33]">131</div>
              <div className="text-xs text-gray-500">portions offered</div>
              <div className="text-xs text-gray-400">(350g/portion)</div>
            </Card>
            <Card className="bg-white p-3 text-center rounded-lg shadow-sm">
              <div className="text-xl font-semibold text-[#085f33]">125€</div>
              <div className="text-xs text-gray-500">Saved - Food</div>
              <div className="text-xs text-gray-500">disposal costs</div>
            </Card>
            <Card className="bg-white p-3 text-center rounded-lg shadow-sm relative">
              <div className="text-xl font-semibold text-[#085f33]">89%</div>
              <div className="text-xs text-gray-500">Emission</div>
              <div className="text-xs text-gray-500">reduction</div>
              <button className="absolute top-1 right-1 text-gray-400 hover:text-gray-600">
                <Info size={16} />
              </button>
            </Card>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-1">Export data for impact reporting</h3>
            <p className="text-sm text-gray-600 mb-3">
              Share detailed financial, social and environmental impact data for reporting, communications and operation planning:
            </p>
            <Button 
              variant="outline" 
              className="h-9 px-4 text-sm border-[#085f33] text-[#085f33] rounded-full bg-transparent hover:bg-green-50/50"
              onClick={handleSharePdf}
            >
              Export as PDF
            </Button>
          </div>
        </section>

        <Separator className="my-6" />

        <section className="mb-32">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-medium text-gray-600">
              Past donations
            </h2>
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