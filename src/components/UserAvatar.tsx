import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from '../lib/supabase';
import { LogOut, User } from 'lucide-react';

export const UserAvatar = (): JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();
  const [initial, setInitial] = useState<string>('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);

  // Add a timestamp to force refresh when necessary
  const [timestamp, setTimestamp] = useState<number>(Date.now());
  
  useEffect(() => {
    const fetchOrganizationData = async () => {
      try {
        // Force avatar to refresh every time we access the profile page or when timestamp changes
        if (location.pathname === '/profile') {
          setTimestamp(Date.now());
        }
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setInitial('');
          setProfileImage(null);
          return;
        }

        const { data: organization, error } = await supabase
          .from('organizations')
          .select('name, profile_image')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching organization:', error);
          setError(error.message);
          setInitial('');
          setProfileImage(null);
          return;
        }

        if (organization) {
          // Just take the first letter of the organization name
          if (organization.name) {
            setInitial(organization.name.charAt(0));
          } else {
            setInitial('');
          }

          // Set profile image if available (could be a URL or base64 string)
          if (organization.profile_image) {
            console.log('Found profile image in organization data');
            // Check if it's a base64 string or URL
            if (organization.profile_image.startsWith('data:image')) {
              console.log('Using base64 image');
              setProfileImage(organization.profile_image);
            } else {
              console.log('Using URL image');
              setProfileImage(organization.profile_image);
            }
            // Reset any previous image load errors
            setImageLoadError(false);
          } else {
            setProfileImage(null);
          }
        } else {
          setInitial('');
          setProfileImage(null);
        }
      } catch (error) {
        console.error('Error fetching organization data:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
        setInitial('');
        setProfileImage(null);
      }
    };

    fetchOrganizationData();
  }, [location.pathname, timestamp]); // Add location.pathname to dependencies

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error('Error loading avatar image');
    setImageLoadError(true);
    e.currentTarget.style.display = 'none';
    // Show the fallback when image fails to load
    const fallback = e.currentTarget.parentElement?.querySelector('div');
    if (fallback) {
      fallback.style.display = 'flex';
    }
    
    // Optional: clear profile image if it consistently fails to load
    // This will ensure it doesn't try to load the broken image again
    if (profileImage && !profileImage.startsWith('data:image')) {
      console.log('Clearing problematic profile image URL');
      setProfileImage(null);
    }
  };

  return (
    <Avatar 
      className="w-10 h-10 bg-[#fff0f2] border border-[#085f33] cursor-pointer"
      onClick={handleProfileClick}
    >
      {profileImage && !imageLoadError ? (
        <AvatarImage 
          src={profileImage}
          alt="Profile" 
          onError={handleImageError}
        />
      ) : null}
      <AvatarFallback className="bg-[#fff0f2] text-[#085f33] font-medium">
        {initial || '?'}
      </AvatarFallback>
    </Avatar>
  );
};