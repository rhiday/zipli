import React, { useState, useRef, useCallback } from 'react';
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { Mic } from 'lucide-react';

export const NewDonation = (): JSX.Element => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: ''
  });
  const [error, setError] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const handleContinue = () => {
    if (!form.title.trim()) {
      setError('Please fill in all fields');
      return;
    }
    
    navigate('/new-donation/step2', {
      state: { title: form.title }
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
          <div className="h-1 bg-[#e2e8f0] flex-1 rounded-full"></div>
          <div className="h-1 bg-[#e2e8f0] flex-1 rounded-full"></div>
          <div className="h-1 bg-[#e2e8f0] flex-1 rounded-full"></div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-medium mb-2">New donation</h2>
          <p className="text-gray-600 mb-6">Enter the details of your donation</p>

          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Item name
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#085f33] focus:border-transparent"
                placeholder="Enter the name of the food item"
              />
            </div>
          </div>

          {error && (
            <div className="mt-2 text-sm text-red-500">
              {error}
            </div>
          )}
          
        </div>

        <div className="flex flex-col gap-4">
          <Button 
            onClick={handleContinue}
            disabled={!form.title.trim()}
            className={`w-full h-12 rounded-full text-lg transition-colors ${
              form.title.trim()
                ? 'bg-[#085f33] hover:bg-[#064726] text-white'
                : 'bg-gray-400 text-white cursor-not-allowed'
            }`}
          >
            Continue
          </Button>
        </div>
      </div>
    </Layout>
  );
};