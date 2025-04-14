import React, { useState, useCallback, useRef } from 'react';
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { Camera, FileText, X, Pencil, Plus, Minus } from 'lucide-react';

// Define types
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
  
  const cameraInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      alert('Please upload images under 5MB in jpg, png, or gif format');
      return;
    }

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

  const handleContinue = () => {
    navigate('/new-donation/step3', {
      state: {
        items: foodItems
      }
    });
  };

  if (cameraInputRefs.current.length !== foodItems.length) {
    cameraInputRefs.current = foodItems.map((_, i) => cameraInputRefs.current[i] || null);
  }

  const handleGoBack = () => {
    navigate('/new-donation', {
      state: {
        items: foodItems.map(item => ({
          title: item.title,
          quantity: item.quantity,
          allergens: item.allergens,
          // Don't pass images back
        }))
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
              ←
            </button>
            <h1 className="text-2xl font-medium">New donation</h1>
          </div>
        </header>

        <div className="flex gap-2 mb-8">
          <div className="h-1 bg-[#085f33] flex-1 rounded-full"></div>
          <div className="h-1 bg-[#085f33] flex-1 rounded-full"></div>
          <div className="h-1 bg-[#e2e8f0] flex-1 rounded-full"></div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-medium mb-2">Review your donation</h2>
          <p className="text-gray-600 mb-6">Add photos and check your donation details before proceeding</p>

          {foodItems.map((item, index) => (
            <Card 
              key={index} 
              id={`item-${index}`}
              className="bg-[#fff0f2] border-none p-4 mb-4"
            >
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 bg-[#f2d4d8] rounded-lg flex items-center justify-center flex-shrink-0">
                  <div className="w-full h-full rounded-lg">
                    {item.image?.dataUrl ? (
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
                    ) : (
                      <button
                        onClick={() => handleCameraClick(index)}
                        className="text-[#085f33] w-full h-full flex items-center justify-center"
                        aria-label={`Add photo for ${item.title || 'item ' + (index + 1)}`}
                      >
                        <Camera size={20} />
                      </button>
                    )}
                  </div>
                  {item.image?.dataUrl && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                      className="absolute -top-1 -right-1 z-10 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                      aria-label={`Remove image for ${item.title || 'item ' + (index + 1)}`}
                    >
                      <X size={10} />
                    </button>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium">{item.title}, {item.quantity}</h3>
                  <p className="text-sm text-gray-600">{item.allergens.join(', ')}</p>
                </div>
              </div>
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
        </div>

        <div className="flex flex-col gap-4">
          <Button 
            onClick={handleContinue}
            className="w-full h-12 rounded-full text-lg transition-colors bg-[#085f33] hover:bg-[#064726] text-white"
          >
            Select Pickup Time
          </Button>
        </div>
      </div>
    </Layout>
  );
};