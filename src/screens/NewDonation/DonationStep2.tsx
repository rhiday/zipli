import React, { useState, useCallback, useRef } from 'react';
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { Camera, FileText, X, Pencil, Plus, Minus } from 'lucide-react';

// Define types
interface ImageFile extends File {
  preview?: string;
}

interface FoodItemWithImage {
  title: string;
  quantity: string;
  allergens: string[];
  image?: {
    dataUrl?: string;
    name?: string;
    type?: string;
  } | null;
}

export const DonationStep2 = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items = [] } = location.state || {};
  
  // Add image property to each item
  const [foodItems, setFoodItems] = useState<FoodItemWithImage[]>(
    items.map((item: any) => ({
      ...item,
      image: null
    }))
  );
  
  const [error, setError] = useState<string | null>(null);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const cameraInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Handle editing state
  const startEditing = (index: number) => {
    // If we're already editing an item, save it first
    if (editingItemIndex !== null && editingItemIndex !== index) {
      const item = foodItems[editingItemIndex];
      
      // Skip validation here as we'll handle it in cancelEditing
      // Just make sure to add unit if needed
      if (!item.quantity.includes('g') && !item.quantity.includes('Kg')) {
        const quantity = parseInt(item.quantity.replace(/\D/g, ''));
        if (!isNaN(quantity) && quantity > 0) {
          setFoodItems(prev => {
            const updated = [...prev];
            updated[editingItemIndex].quantity = `${quantity}g`;
            return updated;
          });
        }
      }
    }
    
    setEditingItemIndex(index);
    setError(null);
  };

  const cancelEditing = () => {
    if (editingItemIndex !== null) {
      const item = foodItems[editingItemIndex];
      
      // Validation
      if (!item.title.trim()) {
        setError('Food item name is required');
        return;
      }
      
      const quantity = parseInt(item.quantity.replace(/\D/g, ''));
      if (isNaN(quantity) || quantity <= 0) {
        setError('Please enter a valid quantity');
        return;
      }
      
      // Make sure the unit is part of the quantity string
      if (!item.quantity.includes('g') && !item.quantity.includes('Kg')) {
        setFoodItems(prev => {
          const updated = [...prev];
          updated[editingItemIndex].quantity = `${quantity}g`;
          return updated;
        });
      }
    }
    
    setEditingItemIndex(null);
    setError(null);
  };

  const updateItemField = (index: number, field: keyof FoodItemWithImage, value: any) => {
    setFoodItems(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return updated;
    });
  };

  const updateQuantity = (index: number, amount: number) => {
    setFoodItems(prev => {
      const updated = [...prev];
      const currentQuantity = parseInt(updated[index].quantity) || 0;
      const newQuantity = Math.max(0, currentQuantity + amount);
      updated[index] = {
        ...updated[index],
        quantity: newQuantity.toString()
      };
      return updated;
    });
  };

  const toggleAllergen = (index: number, allergen: string) => {
    setFoodItems(prev => {
      const updated = [...prev];
      const itemAllergens = [...updated[index].allergens];
      
      if (itemAllergens.includes(allergen)) {
        updated[index].allergens = itemAllergens.filter(a => a !== allergen);
      } else {
        updated[index].allergens = [...itemAllergens, allergen];
      }
      
      return updated;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      alert('Please upload images under 5MB in jpg, png, or gif format');
      return;
    }

    // Use FileReader to create a base64 data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const target = event.target;
      if (target && target.result) {
        setFoodItems(prev => {
          const updated = [...prev];
          updated[index].image = {
            dataUrl: target.result as string,
            name: file.name,
            type: file.type
          };
          return updated;
        });
      }
    };
    reader.onerror = () => {
      console.error('Error reading file');
      alert('Failed to load image. Please try another image.');
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index: number) => {
    setFoodItems(prev => {
      const updated = [...prev];
      updated[index].image = null;
      return updated;
    });
  };

  const handleCameraClick = (index: number) => {
    if (cameraInputRefs.current[index]) {
      cameraInputRefs.current[index]?.click();
    }
  };

  const handleFileClick = (index: number) => {
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index]?.click();
    }
  };

  const handleContinue = () => {
    // If we're editing an item, validate and save it first
    if (editingItemIndex !== null) {
      const item = foodItems[editingItemIndex];
      
      // Validation
      if (!item.title.trim()) {
        setError('Food item name is required');
        return;
      }
      
      const quantity = parseInt(item.quantity.replace(/\D/g, ''));
      if (isNaN(quantity) || quantity <= 0) {
        setError('Please enter a valid quantity');
        return;
      }
      
      // Make sure the unit is part of the quantity string
      if (!item.quantity.includes('g') && !item.quantity.includes('Kg')) {
        setFoodItems(prev => {
          const updated = [...prev];
          updated[editingItemIndex].quantity = `${quantity}g`;
          return updated;
        });
      }
      
      // Exit edit mode
      setEditingItemIndex(null);
      setError(null);
    }
    
    navigate('/new-donation/step3', {
      state: {
        items: foodItems
      }
    });
  };

  // Ensure refs arrays are correctly sized
  if (fileInputRefs.current.length !== foodItems.length) {
    fileInputRefs.current = foodItems.map((_, i) => fileInputRefs.current[i] || null);
  }
  if (cameraInputRefs.current.length !== foodItems.length) {
    cameraInputRefs.current = foodItems.map((_, i) => cameraInputRefs.current[i] || null);
  }

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
          <div className="h-1 bg-[#e2e8f0] flex-1 rounded-full"></div>
          <div className="h-1 bg-[#e2e8f0] flex-1 rounded-full"></div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-medium mb-2">Summary</h2>
          <p className="text-gray-600 mb-6">Review your donation items and add photos</p>

          {foodItems.map((item, index) => (
            <Card 
              key={index} 
              id={`item-${index}`}
              className="bg-[#fff0f2] border-none p-4 mb-4 transition-opacity duration-300"
            >
              {editingItemIndex === index ? (
                // Edit mode
                <div className="space-y-4 relative">
                  <div className="flex justify-between">
                    <h3 className="font-medium">Item {index + 1}</h3>
                    <button
                      onClick={cancelEditing}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Food item
                    </label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateItemField(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#085f33] focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <div className="flex items-center gap-2">
                      <button 
                        type="button"
                        onClick={() => updateQuantity(index, -100)}
                        className="p-2 rounded-lg border border-gray-300 bg-white"
                      >
                        <Minus size={16} />
                      </button>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={item.quantity.replace(/\D/g, '')}
                        onChange={(e) => updateItemField(index, 'quantity', e.target.value)}
                        className="w-20 text-center px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#085f33] focus:border-transparent"
                      />
                      <button 
                        type="button"
                        onClick={() => updateQuantity(index, 100)}
                        className="p-2 rounded-lg border border-gray-300 bg-white"
                      >
                        <Plus size={16} />
                      </button>
                      
                      <div className="flex ml-2">
                        <button
                          type="button"
                          onClick={() => {
                            const numericValue = item.quantity.replace(/\D/g, '');
                            updateItemField(index, 'quantity', `${numericValue}g`);
                          }}
                          className={`px-4 py-2 rounded-l-lg ${item.quantity.includes('g') && !item.quantity.includes('Kg') 
                            ? 'bg-[#085f33] text-white' 
                            : 'bg-white border border-gray-300 text-gray-700'}`}
                        >
                          g
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const numericValue = item.quantity.replace(/\D/g, '');
                            updateItemField(index, 'quantity', `${numericValue}Kg`);
                          }}
                          className={`px-4 py-2 rounded-r-lg ${item.quantity.includes('Kg')
                            ? 'bg-[#085f33] text-white' 
                            : 'bg-white border border-gray-300 text-gray-700'}`}
                        >
                          Kg
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Allergens
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => toggleAllergen(index, 'VL')}
                        className={`px-4 py-2 rounded-lg ${item.allergens.includes('VL')
                          ? 'bg-[#085f33] text-white' 
                          : 'bg-white border border-gray-300 text-gray-700'}`}
                      >
                        VL
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleAllergen(index, 'Veg')}
                        className={`px-4 py-2 rounded-lg ${item.allergens.includes('Veg')
                          ? 'bg-[#085f33] text-white' 
                          : 'bg-white border border-gray-300 text-gray-700'}`}
                      >
                        Veg
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleAllergen(index, 'G')}
                        className={`px-4 py-2 rounded-lg ${item.allergens.includes('G')
                          ? 'bg-[#085f33] text-white' 
                          : 'bg-white border border-gray-300 text-gray-700'}`}
                      >
                        G
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <button
                      onClick={() => cancelEditing()}
                      className="px-8 py-2 rounded-full bg-[#085f33] text-white hover:bg-[#064726] transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                // Display mode
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#f2d4d8] rounded-lg flex items-center justify-center flex-shrink-0">
                    {item.image?.dataUrl ? (
                      <div className="relative w-full h-full">
                        <img 
                          src={item.image.dataUrl} 
                          alt={item.title}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            console.error('Image failed to load');
                            e.currentTarget.src = ''; 
                            e.currentTarget.alt = '!';
                            e.currentTarget.className += ' bg-red-100 flex items-center justify-center text-red-500 font-bold';
                          }}
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleCameraClick(index)}
                        className="text-[#085f33]"
                      >
                        <Camera size={20} />
                      </button>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.title}, {item.quantity}</h3>
                    <p className="text-sm text-gray-600">{item.allergens.join(', ')}</p>
                  </div>
                  <button
                    onClick={() => startEditing(index)}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    aria-label="Edit item"
                  >
                    <Pencil size={18} className="text-gray-600" />
                  </button>
                </div>
              )}
              <input
                ref={el => fileInputRefs.current[index] = el}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e, index)}
              />
              <input
                ref={el => cameraInputRefs.current[index] = el}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => handleFileChange(e, index)}
              />
            </Card>
          ))}

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