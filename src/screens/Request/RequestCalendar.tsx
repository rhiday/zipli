import React, { useState } from 'react';
import { Button } from "../../components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { Card } from "../../components/ui/card";
import { Calendar, Clock, ChevronLeft } from 'lucide-react';

// Available time slots for pickup
const timeSlots = [
  '8:00 AM - 10:00 AM',
  '10:00 AM - 12:00 PM',
  '12:00 PM - 2:00 PM',
  '2:00 PM - 4:00 PM',
  '4:00 PM - 6:00 PM'
];

// Available dates (next 7 days)
const getAvailableDates = () => {
  const dates = [];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }
  
  return dates;
};

export const RequestCalendar = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const { description, peopleCount, allergens } = location.state || {};
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const availableDates = getAvailableDates();
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setError(null);
  };
  
  const handleTimeSelect = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
    setError(null);
  };
  
  const handleGoBack = () => {
    navigate('/request/new', {
      state: { description, peopleCount, allergens }
    });
  };
  
  const handleContinue = () => {
    if (!selectedDate) {
      setError('Please select a pickup date');
      return;
    }
    
    if (!selectedTimeSlot) {
      setError('Please select a pickup time');
      return;
    }
    
    // In a real implementation, this would navigate to a confirmation screen
    // or summary screen before final submission
    navigate('/request/confirm', {
      state: {
        description,
        peopleCount,
        allergens,
        pickupDate: selectedDate,
        pickupTime: selectedTimeSlot
      }
    });
  };

  return (
    <Layout>
      <div className="p-6">
        <header className="mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleGoBack}
              className="text-2xl"
              aria-label="Go back"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-2xl font-medium">Make a Request</h1>
          </div>
        </header>

        <div className="flex gap-2 mb-8">
          <div className="h-1 bg-[#085f33] flex-1 rounded-full"></div>
          <div className="h-1 bg-[#085f33] flex-1 rounded-full"></div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-medium mb-2">Select Pickup Time</h2>
          <p className="text-gray-600 mb-6">Choose when you would like to receive the food items</p>
          
          <div className="space-y-6">
            {/* Date Selection */}
            <div>
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <Calendar className="mr-2 h-5 w-5" /> Select Date
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {availableDates.map((date, index) => (
                  <button
                    key={index}
                    onClick={() => handleDateSelect(date)}
                    className={`p-3 rounded-lg border ${
                      selectedDate && date.toDateString() === selectedDate.toDateString()
                        ? 'bg-[#085f33] text-white border-[#085f33]'
                        : 'bg-white text-gray-800 border-gray-300 hover:border-[#085f33]'
                    }`}
                  >
                    {formatDate(date)}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Time Selection */}
            <div>
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <Clock className="mr-2 h-5 w-5" /> Select Time
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {timeSlots.map((timeSlot, index) => (
                  <button
                    key={index}
                    onClick={() => handleTimeSelect(timeSlot)}
                    className={`p-3 rounded-lg border ${
                      selectedTimeSlot === timeSlot
                        ? 'bg-[#085f33] text-white border-[#085f33]'
                        : 'bg-white text-gray-800 border-gray-300 hover:border-[#085f33]'
                    }`}
                  >
                    {timeSlot}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 text-sm text-red-500">
              {error}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Button 
            onClick={handleContinue}
            className="w-full h-12 rounded-full text-lg transition-colors bg-[#085f33] hover:bg-[#064726] text-white"
          >
            Continue
          </Button>
        </div>
      </div>
    </Layout>
  );
}; 