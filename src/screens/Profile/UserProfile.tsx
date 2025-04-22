import React, { useState, useEffect, useRef } from 'react';
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { supabase } from '../../lib/supabase';
import { signOut } from '../../lib/auth';
import { LogOut, Save, ChevronLeft, Camera, Upload, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { APP_CONFIG } from '../../lib/constants';

export const UserProfile = (): JSX.Element => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: '',
    contactPerson: '',
    email: '',
    contactNumber: '',
    address: '',
    role: ''
  });

  // Fetch user and organization details
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('Not authenticated');
        }

        // Get organization details
        const { data: organization, error } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (!organization) {
          throw new Error('Organization profile not found');
        }

        // Update form state with organization data
        setForm({
          name: organization.name || '',
          contactPerson: organization.contact_person || '',
          email: organization.email || '',
          contactNumber: organization.contact_number || '',
          address: organization.address || '',
          role: organization.role || 'donor'
        });

        // Set profile image if available
        setProfileImage(organization.profile_image || null);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError(error instanceof Error ? error.message : 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError(null);
    setSuccess(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccess(null);
    
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    const file = files[0];
    // Validate file type and size (5MB max)
    if (!file.type.startsWith('image/') || file.size > APP_CONFIG.MAX_IMAGE_SIZE) {
      setError(`Please upload an image under ${APP_CONFIG.MAX_IMAGE_SIZE / (1024 * 1024)}MB in jpg, png, or gif format`);
      return;
    }

    setImageFile(file);
    
    // Create a preview
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target && typeof e.target.result === 'string') {
        setImagePreview(e.target.result);
      }
    };
    reader.onerror = () => {
      setError('Failed to read the image file');
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Helper function to get initial letter from name
  const getInitial = () => {
    return form.name ? form.name.charAt(0).toUpperCase() : '?';
  };

  // Handle image loading error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error('Error loading profile image');
    e.currentTarget.style.display = 'none';
    
    // Show the fallback when image fails to load
    const fallback = e.currentTarget.parentElement?.querySelector('div');
    if (fallback) {
      fallback.style.display = 'flex';
    }
    
    // If this is the profile image (not the preview) that failed, clear it
    if (e.currentTarget.alt === 'Profile' && profileImage) {
      console.log('Clearing problematic profile image');
      setProfileImage(null);
      
      // Optionally update the database to remove the broken image
      const clearBrokenImage = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase
              .from('organizations')
              .update({ profile_image: null })
              .eq('id', user.id);
            console.log('Cleared broken profile image from database');
          }
        } catch (err) {
          console.error('Failed to clear broken image from database:', err);
        }
      };
      
      clearBrokenImage();
    }
  };

  // Use base64 encoding for profile images instead of Supabase storage
  const uploadProfileImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      console.log('Starting profile image upload process', { fileName: file.name, fileType: file.type, fileSize: file.size });

      // Check if file is valid
      if (!file || file.size === 0) {
        console.error('Invalid file object:', file);
        reject(new Error('Invalid file object'));
        return;
      }
      
      // Verify file type more strictly
      if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
        console.error('Invalid file type:', file.type);
        reject(new Error(`Invalid file type. Allowed types: JPEG, PNG, GIF, WEBP. Got: ${file.type}`));
        return;
      }

      // Convert the file to a base64 string
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          if (event.target && event.target.result) {
            const base64String = event.target.result as string;
            
            // Verify the base64 string is valid and starts with the correct prefix
            if (!base64String.startsWith('data:image/')) {
              console.error('Invalid base64 image data');
              reject(new Error('Invalid image data format'));
              return;
            }
            
            console.log('Successfully converted image to base64', { 
              resultLength: base64String.length,
              previewStart: base64String.substring(0, 50) + '...'
            });
            
            // Test the image by preloading it
            const testImg = new Image();
            testImg.onload = () => {
              // Image loaded successfully, resolve with the base64 string
              resolve(base64String);
            };
            testImg.onerror = () => {
              console.error('Generated base64 image failed to load');
              reject(new Error('Generated image data is invalid'));
            };
            testImg.src = base64String;
          } else {
            console.error('Failed to read file data - no result available');
            reject(new Error('Failed to read file data - no result available'));
          }
        } catch (err) {
          console.error('Error in reader.onload callback:', err);
          reject(new Error(`Error processing file data: ${err instanceof Error ? err.message : String(err)}`));
        }
      };
      
      reader.onerror = () => {
        console.error('Error reading file:', reader.error);
        reject(new Error(`Error reading file: ${reader.error ? reader.error.message : 'Unknown reader error'}`));
      };
      
      try {
        reader.readAsDataURL(file);
        console.log('Started file reading process');
      } catch (err) {
        console.error('Error starting file read:', err);
        reject(new Error(`Error starting file read: ${err instanceof Error ? err.message : String(err)}`));
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Upload profile image if selected
      let profileImageUrl = profileImage;
      if (imageFile) {
        try {
          console.log('Uploading profile image...', { 
            fileName: imageFile.name, 
            fileType: imageFile.type, 
            fileSize: imageFile.size 
          });
          
          setIsUploading(true);
          profileImageUrl = await uploadProfileImage(imageFile);
          setIsUploading(false);
          
          console.log('Profile image uploaded successfully as base64', {
            base64Length: profileImageUrl ? profileImageUrl.length : 0
          });
        } catch (error) {
          console.error('Error uploading profile image:', error);
          setError(`Failed to upload profile image: ${error instanceof Error ? error.message : 'Unknown error'}`);
          setIsSaving(false);
          return;
        }
      }

      // Update organization profile
      const { error } = await supabase
        .from('organizations')
        .update({
          name: form.name,
          contact_person: form.contactPerson,
          email: form.email,
          contact_number: form.contactNumber,
          address: form.address,
          profile_image: profileImageUrl
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // Update state with new image URL
      setProfileImage(profileImageUrl);
      setImageFile(null);
      setImagePreview(null);
      
      setSuccess('Profile updated successfully');
      
      // Force a reload after 1 second to ensure all components get updated
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      if (error) throw error;
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
      setError(error instanceof Error ? error.message : 'Failed to log out');
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="text-2xl"
                aria-label="Go back"
              >
                <ChevronLeft size={24} />
              </button>
              <h1 className="text-2xl font-medium">My Profile</h1>
            </div>
            <Button 
              onClick={handleLogout} 
              variant="outline"
              className="flex items-center gap-2 border-red-500 text-red-500 hover:bg-red-50"
            >
              <LogOut size={18} />
              <span>Log Out</span>
            </Button>
          </div>
        </header>

        {isLoading ? (
          <div className="flex justify-center my-12">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Image Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative mb-4">
                <Avatar className="w-24 h-24 bg-[#fff0f2] border-2 border-[#085f33]">
                  {imagePreview ? (
                    <AvatarImage 
                      src={imagePreview} 
                      alt="Profile Preview"
                      onError={handleImageError} 
                    />
                  ) : profileImage ? (
                    <AvatarImage 
                      src={profileImage} 
                      alt="Profile"
                      onError={handleImageError}
                    />
                  ) : null}
                  <AvatarFallback className="bg-[#fff0f2] text-[#085f33] text-xl font-medium">
                    {getInitial()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="w-8 h-8 rounded-full bg-[#085f33] text-white flex items-center justify-center shadow-md"
                  >
                    <Camera size={16} />
                  </button>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="text-sm flex items-center gap-1 border-[#085f33] text-[#085f33]"
                >
                  <Upload size={14} />
                  Upload Photo
                </Button>
                
                {(imagePreview || profileImage) && (
                  <Button 
                    type="button"
                    onClick={removeImage}
                    variant="outline"
                    className="text-sm flex items-center gap-1 border-red-500 text-red-500"
                  >
                    <X size={14} />
                    Remove
                  </Button>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Organization Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#085f33] focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Person
              </label>
              <input
                id="contactPerson"
                name="contactPerson"
                type="text"
                required
                value={form.contactPerson}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#085f33] focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#085f33] focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number
              </label>
              <input
                id="contactNumber"
                name="contactNumber"
                type="tel"
                required
                value={form.contactNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#085f33] focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                id="address"
                name="address"
                type="text"
                required
                value={form.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#085f33] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Type
              </label>
              <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                {form.role === 'receiver' ? 'Food Receiver' : 'Food Donor'}
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Account type cannot be changed
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-600 text-sm">{success}</p>
              </div>
            )}

            <div className="pt-4">
              <Button 
                type="submit"
                disabled={isSaving || isUploading}
                className={`w-full h-12 flex items-center justify-center gap-2 rounded-full text-lg transition-colors ${
                  isSaving || isUploading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#085f33] hover:bg-[#064726] text-white'
                }`}
              >
                {isSaving || isUploading ? 'Saving...' : (
                  <>
                    <Save size={18} />
                    <span>Save Changes</span>
                  </>
                )}
              </Button>
            </div>

            <div>
              <Button 
                type="button"
                onClick={() => navigate('/update-password')}
                variant="outline"
                className="w-full h-12 mt-4 border-2 border-[#085f33] text-[#085f33] rounded-full text-lg hover:bg-[#085f33] hover:text-white"
              >
                Change Password
              </Button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
}; 