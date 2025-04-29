import React, { useState, useRef, useEffect } from 'react';
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { Mic, Plus, Minus, X, Pencil, Trash2, MoreVertical, Camera, Upload } from 'lucide-react';

// Item type definition
interface FoodItem {
  id: number;
  title: string;
  quantity: string;
  unit: string;
  allergens: {
    VL: boolean;
    Veg: boolean;
    G: boolean;
  };
  image?: {
    dataUrl?: string; // Keep dataUrl for preview
    name?: string;
    type?: string;
  } | null;
  imageFile?: File | null; // Add field for the actual file object
}

// Default units for quantity
const defaultUnits = ["Kg", "L", "pcs", "serving"];

export const NewDonation = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Initialize items from location state or with a default item
  const initialItems = location.state?.items as FoodItem[] | undefined;
  const [items, setItems] = useState<FoodItem[]>(() => 
    initialItems && initialItems.length > 0
      ? initialItems.map((item: any) => ({ // Map initial state to ensure all fields exist
          id: item.id || Date.now() + Math.random(), // Ensure ID
          title: item.title || '',
          quantity: item.quantity || '',
          unit: item.unit || defaultUnits[0],
          allergens: item.allergens || { VL: false, Veg: false, G: false },
          image: item.image || null,
          imageFile: item.imageFile || null // Initialize imageFile here too
        }))
      : [
          {
            id: Date.now(),
            title: '',
            quantity: '',
            unit: defaultUnits[0],
            allergens: {
              VL: false,
              Veg: false,
              G: false
            },
            image: null,
            imageFile: null // Initialize imageFile
          }
        ]
  );
  
  const [error, setError] = useState<string | null>(null);
  const [isEditingItemId, setIsEditingItemId] = useState<number | null>(() => 
    // Automatically open the first item if it's new
    items.length === 1 && items[0].title === '' ? items[0].id : null
  );

  // Refs for file inputs
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const cameraInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Validation function
  const isItemValid = (item: FoodItem): boolean => {
    return item.title.trim() !== '' && item.quantity.trim() !== '' && parseFloat(item.quantity) > 0;
  };

  // Handler for input changes
  const handleChange = (id: number, field: keyof FoodItem | `allergens.${keyof FoodItem['allergens']}`, value: any) => {
    setItems(prevItems => 
      prevItems.map(item => {
        if (item.id === id) {
          if (field.startsWith('allergens.')) {
            const allergenKey = field.split('.')[1] as keyof FoodItem['allergens'];
            return {
              ...item,
              allergens: {
                ...(item.allergens ?? { VL: false, Veg: false, G: false }),
                [allergenKey]: value as boolean
              }
            };
          } else {
            return { ...item, [field]: value };
          }
        }
        return item;
      })
    );
    setError(null); // Clear error on change
  };

  // Add a new empty item
  const addAnotherItem = () => {
    const newItem = {
      id: Math.max(...items.map(item => item.id), 0) + 1,
      title: '',
      quantity: '0.5',
      unit: 'Kg',
      allergens: {
        VL: false,
        Veg: false,
        G: false
      },
      image: null,
      imageFile: null // Initialize imageFile
    };
    setItems(prevItems => [...prevItems, newItem]);
    setIsEditingItemId(newItem.id);
    setError(null);
  };

  // Delete an item
  const deleteItem = (id: number) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
    if (isEditingItemId === id) {
      setIsEditingItemId(null); // Close editor if the deleted item was being edited
    }
    // Prevent navigating away if last item is deleted - user must add a new one
    if (items.length === 1) {
       addAnotherItem(); // Add a new blank item immediately
       setItems(prev => prev.filter(item => item.id !== id)); // Remove the deleted one after adding new
    }
  };
  
  // Edit an item
  const editItem = (id: number) => {
    // Save the currently editing item first if it's different
    if (isEditingItemId !== null && isEditingItemId !== id) {
      const currentItem = items.find(i => i.id === isEditingItemId);
      if (currentItem && !isItemValid(currentItem)) {
        setError('Please complete the current item before editing another.');
        return;
      }
    }
    setIsEditingItemId(id);
    setError(null);
  };

  // Save (close editor) an item
  const saveItem = (id: number) => {
    const item = items.find(i => i.id === id);
    if (item && !isItemValid(item)) {
      setError('Please fill in all required fields (Food item, Quantity) before saving.');
      return;
    }
    setIsEditingItemId(null);
    setError(null);
  };

  // Get selected allergens as string array
  const getSelectedAllergens = (item: FoodItem): string[] => {
    return Object.entries(item.allergens ?? {})
      .filter(([_, value]) => value)
      .map(([key]) => key);
  };

  // Modify handleContinue to pass items with imageFile
  const handleContinue = () => {
    // Use existing validation
    const hasSavedValidItems = items.some(item => 
      isItemValid(item) && savedItemIds.includes(item.id)
    );
    if (!hasSavedValidItems) {
      setError('Please complete and save at least one food item');
      return;
    }
    
    // Format items for the next step, ensuring imageFile is included
    const formattedItems = items
      .filter(item => isItemValid(item) && savedItemIds.includes(item.id))
      .map(item => ({
        title: item.title,
        quantity: `${item.quantity} ${item.unit}`,
        allergens: getSelectedAllergens(item),
        image: item.image, // Keep preview data if needed by next steps
        imageFile: item.imageFile // *** Pass the file object ***
      }));
    
    setError(null);
    navigate('/new-donation/step2', { 
      state: { 
        items: formattedItems 
      }
    });
  };

  // Modify handleFileChange to store File object
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, itemId: number) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      alert('Please upload images under 5MB in jpg, png, or gif format');
      e.target.value = ''; 
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const target = event.target;
      if (target && target.result) {
        setItems(prev => 
          prev.map(item => 
            item.id === itemId 
              ? { 
                  ...item, 
                  image: { // Set preview data
                    dataUrl: target.result as string,
                    name: file.name,
                    type: file.type
                  },
                  imageFile: file // Store the actual file object
                } 
              : item
          )
        );
      }
    };
    reader.onerror = () => {
      console.error('Error reading file');
      alert('Failed to load image. Please try another image.');
    };
    reader.readAsDataURL(file);
    e.target.value = ''; 
  };

  // Modify removeImage to clear File object
  const removeImage = (itemId: number) => {
    setItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, image: null, imageFile: null } : item // Clear both preview and file
      )
    );
  };

  // Trigger hidden file input
  const handleCameraClick = (itemId: number) => {
    const index = items.findIndex(item => item.id === itemId);
    if (index !== -1 && cameraInputRefs.current[index]) {
      cameraInputRefs.current[index]?.click();
    }
  };

  const handleFileClick = (itemId: number) => {
    const index = items.findIndex(item => item.id === itemId);
    if (index !== -1 && fileInputRefs.current[index]) {
      fileInputRefs.current[index]?.click();
    }
  };

  // Effect to resize refs array when items change
  useEffect(() => {
    fileInputRefs.current = fileInputRefs.current.slice(0, items.length);
    cameraInputRefs.current = cameraInputRefs.current.slice(0, items.length);
  }, [items.length]);

  return (
    <Layout>
      <div className="p-6">
        <header className="mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
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
            const isEditing = isEditingItemId === item.id || 
                             (index === 0 && items.length === 1 && isEditingItemId === null && !items.some(i => i.saved));
            
            return (
              <Card key={item.id} id={`item-${item.id}`} className="bg-[#fff0f2] border-none mb-4">
                {isEditing ? (
                  // Expanded edit form
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">Item {index + 1}</h3>
                      </div>
                      <button 
                        onClick={() => setIsEditingItemId(null)}
                        className="text-gray-500 hover:text-red-500"
                        aria-label="Close form"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <div className="space-y-6">
                      {/* Image upload area */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Photo
                        </label>
                        {item.image?.dataUrl ? (
                          <div className="relative w-full h-40 mb-2">
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
                            {/* X button to remove image */}
                            <button
                              onClick={() => removeImage(item.id)}
                              className="absolute -top-1 -right-1 z-10 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                              aria-label="Remove image"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleFileClick(item.id)}
                            className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-[#085f33] hover:bg-gray-50 transition-colors text-gray-500 hover:text-[#085f33]"
                            type="button"
                          >
                            <Plus size={24} className="text-[#085f33]" />
                            <span className="text-sm">Add a photo of your dish or container</span>
                          </button>
                        )}
                      </div>

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
                          Quantity (in Kg)
                        </label>
                        <div className="flex items-center gap-2">
                          <button 
                            type="button"
                            onClick={() => handleChange(item.id, 'quantity', (parseFloat(item.quantity) - 0.1).toString())}
                            className="p-2 rounded-lg border border-gray-300 bg-white"
                          >
                            <Minus size={16} />
                          </button>
                          <input
                            id={`quantity-${item.id}`}
                            name={`quantity-${item.id}`}
                            type="text"
                            inputMode="decimal"
                            pattern="[0-9]*\.?[0-9]*"
                            value={item.quantity}
                            onChange={(e) => handleChange(item.id, 'quantity', e.target.value)}
                            className="w-20 text-center px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#085f33] focus:border-transparent bg-white"
                            placeholder="0.5"
                          />
                          <button 
                            type="button"
                            onClick={() => handleChange(item.id, 'quantity', (parseFloat(item.quantity) + 0.1).toString())}
                            className="p-2 rounded-lg border border-gray-300 bg-white"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>

                      <div>
                        <label htmlFor={`allergens-${item.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                          Allergens
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleChange(item.id, 'allergens.VL', !item.allergens?.VL)}
                            className={`px-4 py-2 rounded-lg ${item.allergens?.VL 
                              ? 'bg-[#085f33] text-white' 
                              : 'bg-white border border-gray-300 text-gray-700'}`}
                          >
                            VL
                          </button>
                          <button
                            type="button"
                            onClick={() => handleChange(item.id, 'allergens.Veg', !item.allergens?.Veg)}
                            className={`px-4 py-2 rounded-lg ${item.allergens?.Veg 
                              ? 'bg-[#085f33] text-white' 
                              : 'bg-white border border-gray-300 text-gray-700'}`}
                          >
                            Veg
                          </button>
                          <button
                            type="button"
                            onClick={() => handleChange(item.id, 'allergens.G', !item.allergens?.G)}
                            className={`px-4 py-2 rounded-lg ${item.allergens?.G 
                              ? 'bg-[#085f33] text-white' 
                              : 'bg-white border border-gray-300 text-gray-700'}`}
                          >
                            G
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-end pt-4">
                        <Button
                          onClick={() => saveItem(item.id)}
                          className="bg-[#085f33] text-white rounded-full px-8 py-2 hover:bg-[#064726] transition-colors"
                          disabled={!isItemValid(item)}
                        >
                          Done
                        </Button>
                      </div>
                    </div>
                    
                    {/* Hidden file inputs */}
                    <input
                      ref={el => {
                        const itemIndex = items.findIndex(i => i.id === item.id);
                        if (itemIndex !== -1) {
                          fileInputRefs.current[itemIndex] = el;
                        }
                      }}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, item.id)}
                    />
                    <input
                      ref={el => {
                        const itemIndex = items.findIndex(i => i.id === item.id);
                        if (itemIndex !== -1) {
                          cameraInputRefs.current[itemIndex] = el;
                        }
                      }}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, item.id)}
                    />
                  </div>
                ) : (
                  // Collapsed view
                  <div className="p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      {item.image?.dataUrl && (
                        <div className="w-12 h-12 flex-shrink-0">
                          <img 
                            src={item.image.dataUrl}
                            alt={item.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium">{item.title}</h3>
                        <p className="text-gray-600">{item.quantity} {item.unit}</p>
                        <p className="text-gray-600">{getSelectedAllergens(item).join(', ')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => editItem(item.id)}
                        className="p-1 text-gray-500 hover:text-[#085f33]"
                        aria-label="Edit item"
                      >
                        <Pencil size={18} />
                      </button>
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteItem(item.id);
                          }}
                          className="p-1 text-gray-500 hover:text-gray-700"
                          aria-label="More options"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}

          {items.length < 4 && (
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

        <div className="flex justify-center">
          <Button 
            onClick={handleContinue}
            className="px-12 h-12 rounded-full text-lg transition-colors bg-[#085f33] hover:bg-[#064726] text-white"
            disabled={!items.some(item => isItemValid(item))}
          >
            Review and Continue
          </Button>
        </div>
      </div>
    </Layout>
  );
};
