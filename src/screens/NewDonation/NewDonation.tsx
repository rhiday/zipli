import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { Mic, Plus, Minus, X, Pencil, Trash2 } from 'lucide-react';

// Item type definition
type FoodItem = {
  id: number;
  title: string;
  quantity: string;
  unit: string;
  allergens: {
    VL: boolean;
    Veg: boolean;
    G: boolean;
  };
};

export const NewDonation = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const savedItems = location.state?.items || [];
  
  // If we have saved items from step 2, use them, otherwise use default
  const [items, setItems] = useState<FoodItem[]>(
    savedItems.length > 0 
      ? savedItems.map((item: any, index: number) => ({
          id: index + 1,
          title: item.title || '',
          quantity: item.quantity?.replace(/[^0-9]/g, '') || '500',
          unit: item.quantity?.includes('Kg') ? 'Kg' : 'g',
          allergens: {
            VL: item.allergens?.includes('VL') || false,
            Veg: item.allergens?.includes('Veg') || false,
            G: item.allergens?.includes('G') || false
          }
        }))
      : [
          {
            id: 1,
            title: '',
            quantity: '500',
            unit: 'g',
            allergens: {
              VL: false,
              Veg: false,
              G: false
            }
          }
        ]
  );
  const [error, setError] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [savedItemIds, setSavedItemIds] = useState<number[]>(
    savedItems.length > 0 
      ? savedItems.map((_: any, index: number) => index + 1) // Mark all items from step 2 as saved
      : []
  );
  
  useEffect(() => {
    // Clear any errors when component mounts
    setError(null);
    
    // Clean up function to clear errors when component unmounts
    return () => {
      setError(null);
    };
  }, []);

  const handleChange = (id: number, field: string, value: string) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
    setError(null);
  };

  const handleQuantityChange = (id: number, amount: number) => {
    setItems(prevItems => 
      prevItems.map(item => {
        if (item.id === id) {
          const currentQuantity = parseInt(item.quantity) || 0;
          const newQuantity = Math.max(0, currentQuantity + amount);
          return { ...item, quantity: newQuantity.toString() };
        }
        return item;
      })
    );
  };

  const handleUnitChange = (id: number, unit: string) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, unit } : item
      )
    );
  };

  const toggleAllergen = (id: number, allergen: 'VL' | 'Veg' | 'G') => {
    setItems(prevItems => 
      prevItems.map(item => {
        if (item.id === id) {
          return {
            ...item,
            allergens: {
              ...item.allergens,
              [allergen]: !item.allergens[allergen]
            }
          };
        }
        return item;
      })
    );
  };

  const isItemValid = (item: FoodItem) => {
    return item.title.trim() !== '' && parseInt(item.quantity) > 0;
  };

  const canAddAnotherItem = () => {
    // Check if all current items have valid title and quantity
    return items.every(item => isItemValid(item));
  };

  const addAnotherItem = () => {
    // Don't validate current items, just add a new one
    const newItem = {
      id: Math.max(...items.map(item => item.id), 0) + 1,
      title: '',
      quantity: '500',
      unit: 'g',
      allergens: {
        VL: false,
        Veg: false,
        G: false
      }
    };

    setItems(prevItems => [...prevItems, newItem]);
    setEditingItemId(newItem.id);
    setError(null);
  };

  const removeItem = (id: number) => {
    // Don't allow removing the last item
    if (items.length <= 1) return;
    
    setItems(prevItems => prevItems.filter(item => item.id !== id));
    
    // If we're removing the currently edited item, clear the editing state
    if (editingItemId === id) {
      setEditingItemId(null);
    }
  };

  const deleteItem = (id: number) => {
    // Don't allow deleting the last item
    if (items.length <= 1) {
      setError('You must have at least one food item');
      return;
    }
    
    // Clear any previous errors when successfully deleting
    setError(null);
    
    // Remove from savedItemIds if it was saved
    if (savedItemIds.includes(id)) {
      setSavedItemIds(prev => prev.filter(itemId => itemId !== id));
    }
    
    // Remove the item from the items array
    setItems(prev => prev.filter(item => item.id !== id));
    
    // If we're deleting the currently edited item, clear the editing state
    if (editingItemId === id) {
      setEditingItemId(null);
    }
  };

  const getSelectedAllergens = (item: FoodItem) => {
    return Object.entries(item.allergens)
      .filter(([_, value]) => value)
      .map(([key]) => key);
  };

  const getAllergenText = (item: FoodItem) => {
    const selectedAllergens = getSelectedAllergens(item);
    return selectedAllergens.length > 0 ? selectedAllergens.join(', ') : '';
  };

  const saveItem = (id: number, shouldExitEditMode: boolean = false) => {
    console.log('Save item called with id:', id);
    
    const item = items.find(item => item.id === id);
    if (!item) {
      setError('Item not found');
      return;
    }
    
    if (!isItemValid(item)) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Add this item to the saved items list if not already there
    if (!savedItemIds.includes(id)) {
      setSavedItemIds(prev => [...prev, id]);
    }
    
    // Only exit edit mode if requested
    if (shouldExitEditMode) {
      setEditingItemId(() => null);
    }
    
    setError(null);
    
    // Force browser to redraw
    window.requestAnimationFrame(() => {
      const savedItem = document.getElementById(`item-${id}`);
      if (savedItem) {
        savedItem.classList.add('opacity-70');
        setTimeout(() => {
          savedItem.classList.remove('opacity-70');
        }, 300);
      }
    });
  };

  const editItem = (id: number) => {
    setEditingItemId(id);
    setError(null);
  };

  const handleContinue = () => {
    // Add debug logging
    console.log('Saved item IDs:', savedItemIds);
    console.log('Valid items:', items.filter(item => isItemValid(item)).map(item => item.id));
    
    // Check if we have at least one saved valid item
    const hasSavedValidItems = items.some(item => 
      isItemValid(item) && savedItemIds.includes(item.id)
    );
    console.log('Has saved valid items:', hasSavedValidItems);
    
    if (!hasSavedValidItems) {
      setError('Please complete and save at least one food item');
      return;
    }
    
    // Format items for the next step - only include valid items
    const formattedItems = items
      .filter(item => isItemValid(item) && savedItemIds.includes(item.id))
      .map(item => ({
        title: item.title,
        quantity: `${item.quantity} ${item.unit}`,
        allergens: getSelectedAllergens(item)
      }));
    
    console.log('Navigating with items:', formattedItems);
    
    // Fix the navigation path - use /new-donation/step2 instead of /donation/step2
    navigate('/new-donation/step2', {
      state: { 
        items: formattedItems
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
          <div className="h-1 bg-[#e2e8f0] flex-1 rounded-full"></div>
          <div className="h-1 bg-[#e2e8f0] flex-1 rounded-full"></div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-medium mb-2">Donation details</h2>
          <p className="text-gray-600 mb-6">Enter the details of your donation</p>

          {items.map((item, index) => {
            // Only auto-open first item if it hasn't been saved yet
            const isEditing = editingItemId === item.id || 
                             (index === 0 && items.length === 1 && editingItemId === null && !savedItemIds.includes(item.id));
            
            return (
              <Card key={item.id} id={`item-${item.id}`} className="bg-[#fff0f2] border-none mb-4">
                {isEditing ? (
                  // Expanded edit form
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">Item {index + 1}</h3>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="p-1 text-gray-500 hover:text-red-500"
                          aria-label="Delete item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <button 
                        onClick={() => setEditingItemId(null)}
                        className="text-gray-500 hover:text-red-500"
                        aria-label="Close form"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <label htmlFor={`title-${item.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                          Food item
                        </label>
                        <input
                          id={`title-${item.id}`}
                          name={`title-${item.id}`}
                          type="text"
                          value={item.title}
                          onChange={(e) => handleChange(item.id, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#085f33] focus:border-transparent bg-white"
                          placeholder="Enter the name of the food item"
                        />
                      </div>

                      <div>
                        <label htmlFor={`quantity-${item.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                          Quantity
                        </label>
                        <div className="flex items-center gap-2">
                          <button 
                            type="button"
                            onClick={() => handleQuantityChange(item.id, -100)}
                            className="p-2 rounded-lg border border-gray-300 bg-white"
                          >
                            <Minus size={16} />
                          </button>
                          <input
                            id={`quantity-${item.id}`}
                            name={`quantity-${item.id}`}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={item.quantity}
                            onChange={(e) => handleChange(item.id, 'quantity', e.target.value)}
                            className="w-20 text-center px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#085f33] focus:border-transparent bg-white"
                          />
                          <button 
                            type="button"
                            onClick={() => handleQuantityChange(item.id, 100)}
                            className="p-2 rounded-lg border border-gray-300 bg-white"
                          >
                            <Plus size={16} />
                          </button>
                          
                          <div className="flex ml-2">
                            <button
                              type="button"
                              onClick={() => handleUnitChange(item.id, 'g')}
                              className={`px-4 py-2 rounded-l-lg ${item.unit === 'g' 
                                ? 'bg-[#085f33] text-white' 
                                : 'bg-white border border-gray-300 text-gray-700'}`}
                            >
                              g
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUnitChange(item.id, 'Kg')}
                              className={`px-4 py-2 rounded-r-lg ${item.unit === 'Kg' 
                                ? 'bg-[#085f33] text-white' 
                                : 'bg-white border border-gray-300 text-gray-700'}`}
                            >
                              Kg
                            </button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label htmlFor={`allergens-${item.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                          Allergens
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => toggleAllergen(item.id, 'VL')}
                            className={`px-4 py-2 rounded-lg ${item.allergens.VL 
                              ? 'bg-[#085f33] text-white' 
                              : 'bg-white border border-gray-300 text-gray-700'}`}
                          >
                            VL
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleAllergen(item.id, 'Veg')}
                            className={`px-4 py-2 rounded-lg ${item.allergens.Veg 
                              ? 'bg-[#085f33] text-white' 
                              : 'bg-white border border-gray-300 text-gray-700'}`}
                          >
                            Veg
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleAllergen(item.id, 'G')}
                            className={`px-4 py-2 rounded-lg ${item.allergens.G 
                              ? 'bg-[#085f33] text-white' 
                              : 'bg-white border border-gray-300 text-gray-700'}`}
                          >
                            G
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-end pt-4">
                        <Button
                          onClick={() => saveItem(item.id, true)}
                          className="bg-[#085f33] text-white rounded-full px-8 py-2 hover:bg-[#064726] transition-colors"
                          disabled={!isItemValid(item)}
                        >
                          Done
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Collapsed view
                  <div className="p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-gray-600">{item.quantity} {item.unit}</p>
                      <p className="text-gray-600">{getAllergenText(item)}</p>
                    </div>
                    <button
                      onClick={() => editItem(item.id)}
                      className="p-1 text-gray-500 hover:text-[#085f33]"
                      aria-label="Edit item"
                    >
                      <Pencil size={18} />
                    </button>
                  </div>
                )}
              </Card>
            );
          })}

          {canAddAnotherItem() && (
            <button
              type="button"
              onClick={addAnotherItem}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700"
            >
              Add another item
            </button>
          )}
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="flex justify-end">
          <Button 
            onClick={handleContinue}
            className="w-full h-12 rounded-full text-lg transition-colors bg-[#085f33] hover:bg-[#064726] text-white"
            disabled={!items.some(item => isItemValid(item) && savedItemIds.includes(item.id))}
          >
            Review and Continue
          </Button>
        </div>
      </div>
    </Layout>
  );
};
