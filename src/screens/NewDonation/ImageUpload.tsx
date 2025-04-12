import React, { useState, useRef } from 'react';
import { Button } from "../../components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { Camera, Image, X } from 'lucide-react';

interface ImageFile extends File {
  preview?: string;
}

export const ImageUpload = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const [images, setImages] = useState<ImageFile[]>([]);
  const [menuImage, setMenuImage] = useState<ImageFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const menuCameraRef = useRef<HTMLInputElement>(null);
  const title = location.state?.title || '';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isMenu: boolean = false) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024;
      if (!isValid) {
        alert('Please upload images under 5MB in jpg, png, or gif format');
      }
      return isValid;
    });

    const newImages = validFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    }));

    if (isMenu) {
      if (menuImage) {
        URL.revokeObjectURL(menuImage.preview!);
      }
      setMenuImage(newImages[0] || null);
    } else {
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview!);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const removeMenuImage = () => {
    if (menuImage) {
      URL.revokeObjectURL(menuImage.preview!);
      setMenuImage(null);
    }
  };

  const handleContinue = () => {
    if (images.length === 0) {
      setError('Please add at least one photo of your food items');
      return;
    }

    navigate('/new-donation/step3', {
      state: {
        title,
        images,
        menuImage
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
            <h1 className="text-2xl font-medium">Upload Photos</h1>
          </div>
        </header>

        <div className="flex gap-2 mb-8">
          <div className="h-1 bg-[#085f33] flex-1 rounded-full"></div>
          <div className="h-1 bg-[#085f33] flex-1 rounded-full"></div>
          <div className="h-1 bg-[#e2e8f0] flex-1 rounded-full"></div>
          <div className="h-1 bg-[#e2e8f0] flex-1 rounded-full"></div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-medium mb-2">Photos of food items</h2>
          <p className="text-gray-600 mb-6">Take clear photos of your food items</p>

          <div 
            className={`border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6 ${
              images.length === 0 ? 'hover:border-[#085f33] hover:bg-gray-50/50 transition-colors cursor-pointer' : ''
            }`}
            onClick={() => images.length === 0 && fileInputRef.current?.click()}
          >
            {images.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4">
                <Image className="w-12 h-12 text-gray-400" />
                <div className="text-center">
                  <p className="text-gray-600 mb-1">Add photos of food items</p>
                  <div className="flex justify-center gap-4 mt-4">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        cameraInputRef.current?.click();
                      }}
                      className="text-[#085f33] hover:text-[#064726] font-medium"
                    >
                      Take Photo
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="text-[#085f33] hover:text-[#064726] font-medium"
                    >
                      Upload
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto p-1">
                {images.map((file, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={file.preview}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(index);
                      }}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <X className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-[#085f33] hover:bg-gray-50/50 transition-colors"
                >
                  <Image className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-500">Add more</span>
                </button>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            id="images"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e)}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFileChange(e)}
          />

          <div className="h-px bg-gray-200 my-8"></div>

          <h2 className="text-xl font-medium mb-2">Dish name and allergens</h2>
          <p className="text-gray-600 mb-6">Add a photo of the menu or label (optional)</p>

          <div 
            className={`border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6 ${
              !menuImage ? 'hover:border-[#085f33] hover:bg-gray-50/50 transition-colors cursor-pointer' : ''
            }`}
            onClick={() => !menuImage && menuInputRef.current?.click()}
          >
            {!menuImage ? (
              <div className="flex flex-col items-center justify-center gap-4">
                <Image className="w-12 h-12 text-gray-400" />
                <div className="text-center">
                  <p className="text-gray-600 mb-1">Add photo of menu or label</p>
                  <div className="flex justify-center gap-4 mt-4">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        menuCameraRef.current?.click();
                      }}
                      className="text-[#085f33] hover:text-[#064726] font-medium"
                    >
                      Take Photo
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        menuInputRef.current?.click();
                      }}
                      className="text-[#085f33] hover:text-[#064726] font-medium"
                    >
                      Upload
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={menuImage.preview}
                  alt="Menu"
                  className="w-full aspect-[4/3] object-cover rounded-lg"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeMenuImage();
                  }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            )}
          </div>

          <input
            ref={menuInputRef}
            type="file"
            id="menu"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e, true)}
          />
          <input
            ref={menuCameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFileChange(e, true)}
          />

          {error && (
            <div className="mt-2 text-sm text-red-500">
              {error}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <Button 
            onClick={handleContinue}
            disabled={images.length === 0}
            className={`w-full h-12 rounded-full text-lg transition-colors ${
              images.length > 0
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