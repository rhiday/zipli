import React, { useState } from "react";
import { Layout } from "../../components/Layout";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "../../components/BottomNav";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { ChevronLeft, Plus, Minus, AlertTriangle } from "lucide-react";

export const NewRequest = (): JSX.Element => {
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [peopleCount, setPeopleCount] = useState(1);
  const [allergens, setAllergens] = useState({
    nuts: false,
    dairy: false,
    gluten: false,
    shellfish: false,
    eggs: false
  });
  const [error, setError] = useState<string | null>(null);

  const toggleAllergen = (allergen: keyof typeof allergens) => {
    setAllergens(prev => ({
      ...prev,
      [allergen]: !prev[allergen]
    }));
  };

  const handlePeopleCountChange = (amount: number) => {
    const newCount = Math.max(1, peopleCount + amount);
    setPeopleCount(newCount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      setError("Please provide a description of your request");
      return;
    }
    
    // Navigate to calendar page
    navigate('/request/calendar', { 
      state: { 
        description: description.trim(), 
        peopleCount, 
        allergens 
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
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-2xl font-medium">Make a Request</h1>
          </div>
        </header>

        <div className="flex gap-2 mb-8">
          <div className="h-1 bg-[#085f33] flex-1 rounded-full"></div>
          <div className="h-1 bg-gray-200 flex-1 rounded-full"></div>
          <div className="h-1 bg-gray-200 flex-1 rounded-full"></div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-medium mb-2">Request Details</h2>
          <p className="text-gray-600 mb-6">Tell us what food items you need, and we'll notify nearby donors</p>
        
          <form onSubmit={handleSubmit} className="space-y-6 mb-24">
            <Card className="p-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description of food items needed*
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="E.g., We need non-perishable items like rice, pasta, canned vegetables"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#085f33] focus:border-transparent min-h-[100px]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of people to feed*
                  </label>
                  <div className="flex items-center justify-between border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => handlePeopleCountChange(-1)}
                      className="p-3 flex-shrink-0 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <Minus size={20} />
                    </button>
                    <span className="flex-grow text-center font-medium">{peopleCount}</span>
                    <button
                      type="button"
                      onClick={() => handlePeopleCountChange(1)}
                      className="p-3 flex-shrink-0 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allergen Information (select all that apply)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => toggleAllergen('nuts')}
                      className={`px-3 py-1 rounded-lg text-sm border transition-colors ${
                        allergens.nuts 
                          ? 'bg-[#085f33] text-white border-[#085f33]' 
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Nuts
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleAllergen('dairy')}
                      className={`px-3 py-1 rounded-lg text-sm border transition-colors ${
                        allergens.dairy 
                          ? 'bg-[#085f33] text-white border-[#085f33]' 
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Dairy
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleAllergen('gluten')}
                      className={`px-3 py-1 rounded-lg text-sm border transition-colors ${
                        allergens.gluten 
                          ? 'bg-[#085f33] text-white border-[#085f33]' 
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Gluten
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleAllergen('shellfish')}
                      className={`px-3 py-1 rounded-lg text-sm border transition-colors ${
                        allergens.shellfish 
                          ? 'bg-[#085f33] text-white border-[#085f33]' 
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Shellfish
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleAllergen('eggs')}
                      className={`px-3 py-1 rounded-lg text-sm border transition-colors ${
                        allergens.eggs 
                          ? 'bg-[#085f33] text-white border-[#085f33]' 
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Eggs
                    </button>
                  </div>
                </div>
              </div>
            </Card>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="text-red-500 mt-0.5 flex-shrink-0" size={18} />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            
            <div className="flex justify-center pt-4">
              <Button
                type="submit"
                className="px-12 h-12 rounded-full text-lg transition-colors bg-[#085f33] hover:bg-[#064726] text-white"
              >
                Continue
              </Button>
            </div>
          </form>
        </div>
        
        <BottomNav />
      </div>
    </Layout>
  );
}; 