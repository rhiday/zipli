import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ChevronDown, SlidersHorizontal, X, Calendar as CalendarIcon } from 'lucide-react';
import { Slider } from './ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';

interface FilterOption {
  label: string;
  value: string;
}

interface FiltersProps {
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
}

interface FilterValues {
  quantity: [number, number];
  distance: [number, number];
  pickup: string;
  customDate?: Date;
}

const pickupOptions = [
  { label: 'Today', value: 'today' },
  { label: 'Tomorrow', value: 'tomorrow' },
  { label: 'Custom', value: 'custom' }
];

export const DonationFilters = ({ selectedFilter, onFilterChange }: FiltersProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({
    quantity: [2, 15],
    distance: [0.5, 20],
    pickup: 'today'
  });

  const formatValue = (value: number, unit: string) => `${value} ${unit}`;

  const handleQuantityChange = (value: number[]) => {
    setFilters(prev => ({ ...prev, quantity: [value[0], value[1]] }));
  };

  const handleDistanceChange = (value: number[]) => {
    setFilters(prev => ({ ...prev, distance: [value[0], value[1]] }));
  };

  const handlePickupChange = (value: string) => {
    setFilters(prev => ({ 
      ...prev, 
      pickup: value,
      // Clear custom date when switching to non-custom options
      customDate: value === 'custom' ? prev.customDate : undefined
    }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    setFilters(prev => ({
      ...prev,
      customDate: date
    }));
  };

  const getActiveFiltersCount = (): number => {
    let count = 0;
    if (filters.quantity[0] !== 2 || filters.quantity[1] !== 15) count++;
    if (filters.distance[0] !== 0.5 || filters.distance[1] !== 20) count++;
    if (filters.pickup !== 'today') count++;
    return count;
  };

  const resetFilters = () => {
    setFilters({
      quantity: [2, 15],
      distance: [0.5, 20],
      pickup: 'today',
      customDate: undefined
    });
  };

  return (
    <div className="relative">
      <div className="flex gap-2 items-center mb-4">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-gray-600 bg-white border border-gray-200 hover:bg-gray-50"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters</span>
          {getActiveFiltersCount() > 0 && (
            <span className="bg-[#085f33] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {getActiveFiltersCount()}
            </span>
          )}
          <ChevronDown className="w-4 h-4" />
        </Button>
      </div>

      {isOpen && (
        <Card className="absolute top-full left-0 z-50 w-80 mt-1 bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Filters</h3>
              <button
                onClick={resetFilters}
                className="text-sm text-[#085f33] hover:text-[#064726]"
              >
                Reset all
              </button>
            </div>

            <div className="space-y-6">
              {/* Quantity Slider */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="px-2">
                  <Slider
                    value={filters.quantity}
                    min={2}
                    max={15}
                    step={0.5}
                    onValueChange={handleQuantityChange}
                    className="my-4"
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{formatValue(filters.quantity[0], 'kg')}</span>
                  <span>{formatValue(filters.quantity[1], 'kg')}</span>
                </div>
              </div>

              {/* Distance Slider */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Distance
                </label>
                <div className="px-2">
                  <Slider
                    value={filters.distance}
                    min={0.5}
                    max={20}
                    step={0.5}
                    onValueChange={handleDistanceChange}
                    className="my-4"
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{formatValue(filters.distance[0], 'km')}</span>
                  <span>{formatValue(filters.distance[1], 'km')}</span>
                </div>
              </div>

              {/* Pickup Time Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pickup Time
                </label>
                <div className="flex gap-2 mb-3">
                  {pickupOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handlePickupChange(option.value)}
                      className={`px-4 py-2 rounded-full text-sm transition-colors ${
                        filters.pickup === option.value
                          ? 'bg-[#085f33] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                {/* Date Picker for Custom option */}
                {filters.pickup === 'custom' && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${
                          !filters.customDate && "text-gray-500"
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.customDate ? (
                          format(filters.customDate, "PPP")
                        ) : (
                          "Pick a date"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.customDate}
                        onSelect={handleDateSelect}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <Button
                onClick={() => setIsOpen(false)}
                className="w-full bg-[#085f33] hover:bg-[#064726] text-white"
              >
                Apply Filters
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
                variant="outline"
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};