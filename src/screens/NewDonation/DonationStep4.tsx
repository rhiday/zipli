import React, { useState } from 'react';
import { Button } from "../../components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { Switch } from "../../components/ui/switch";

interface TimeSlot {
  start: string;
  end: string;
}

export const DonationStep4 = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [timeSlot, setTimeSlot] = useState<TimeSlot>({ start: '10:00', end: '16:00' });
  const [isRecurring, setIsRecurring] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState({
    address: '',
    driverMessage: ''
  });

  const days = [
    { id: 'mon', label: 'M' },
    { id: 'tue', label: 'T' },
    { id: 'wed', label: 'W' },
    { id: 'thu', label: 'Th' },
    { id: 'fri', label: 'F' },
    { id: 'sat', label: 'Sa' },
    { id: 'sun', label: 'Su' }
  ];

  const toggleDay = (dayId: string) => {
    setSelectedDays(prev => 
      prev.includes(dayId) 
        ? prev.filter(d => d !== dayId)
        : [...prev, dayId]
    );
  };

  const handleTimeChange = (type: 'start' | 'end', value: string) => {
    setTimeSlot(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDeliveryInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    navigate('/new-donation/thank-you', {
      state: {
        ...location.state,
        pickup: {
          days: selectedDays,
          timeSlot,
          isRecurring
        },
        deliveryInfo
      }
    });
  };

  return (
    <Layout>
      <div className="p-6">
        <header className="mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="text-2xl"
              aria-label="Go back"
            >
              ←
            </button>
            <h1 className="text-2xl font-medium">New donation</h1>
          </div>
        </header>

        <div className="flex gap-2 mb-8">
          <div className="h-1 bg-[#085f33] flex-1 rounded-full"></div>
          <div className="h-1 bg-[#085f33] flex-1 rounded-full"></div>
          <div className="h-1 bg-[#085f33] flex-1 rounded-full"></div>
          <div className="h-1 bg-[#085f33] flex-1 rounded-full"></div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-medium mb-2">When should we pick up the donation</h2>
          <p className="text-gray-600 mb-6">Select available days and time window</p>

          <div className="bg-[#fff0f2] rounded-lg p-6 mb-6">
            <div className="grid grid-cols-7 gap-2 mb-6">
              {days.map((day) => (
                <button
                  key={day.id}
                  onClick={() => toggleDay(day.id)}
                  className={`
                    h-12 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                    ${selectedDays.includes(day.id)
                      ? 'bg-[#085f33] text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                    }
                  `}
                  style={{
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation'
                  }}
                >
                  {day.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-2">
              <div className="flex-1">
                <label htmlFor="time-start" className="block text-sm text-gray-600 mb-1">Start time</label>
                <input
                  id="time-start"
                  type="time"
                  value={timeSlot.start}
                  onChange={(e) => handleTimeChange('start', e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 h-12 text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#085f33] appearance-none"
                  style={{
                    WebkitAppearance: 'none',
                    MozAppearance: 'textfield'
                  }}
                />
              </div>
              <div className="hidden sm:flex items-center text-gray-600">-</div>
              <div className="flex-1">
                <label htmlFor="time-end" className="block text-sm text-gray-600 mb-1">End time</label>
                <input
                  id="time-end"
                  type="time"
                  value={timeSlot.end}
                  onChange={(e) => handleTimeChange('end', e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 h-12 text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#085f33] appearance-none"
                  style={{
                    WebkitAppearance: 'none',
                    MozAppearance: 'textfield'
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm mb-8">
            <div>
              <h3 className="font-medium">Recurring time window</h3>
              <p className="text-sm text-gray-600">Enable for regular donations</p>
            </div>
            <Switch
              checked={isRecurring}
              onCheckedChange={setIsRecurring}
              className="data-[state=checked]:bg-[#085f33] h-8 w-14"
            />
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pickup Location
              </label>
              <textarea
                name="address"
                value={deliveryInfo.address}
                onChange={handleInputChange}
                placeholder="Enter your address and any specific location details"
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#085f33] min-h-[100px] resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message for Driver
              </label>
              <textarea
                name="driverMessage"
                value={deliveryInfo.driverMessage}
                onChange={handleInputChange}
                placeholder="Add any special instructions or notes for the driver"
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#085f33] min-h-[100px] resize-none"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Button 
            onClick={handleSubmit}
            disabled={selectedDays.length === 0 || !deliveryInfo.address.trim()}
            className={`w-full h-12 rounded-full text-lg transition-colors ${
              selectedDays.length > 0 && deliveryInfo.address.trim()
                ? 'bg-[#085f33] hover:bg-[#064726] text-white'
                : 'bg-gray-400 text-white cursor-not-allowed'
            }`}
          >
            Complete Donation
          </Button>
        </div>
      </div>
    </Layout>
  );
};