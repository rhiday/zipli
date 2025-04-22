import { supabase } from './supabase';
import { APP_CONFIG } from './constants';
import type { Database } from '../types/supabase';
import Logger from './logger';
import { v4 as uuidv4 } from 'uuid';

type Donation = Database['public']['Tables']['donations']['Row'];

// Cache management
let cachedDonations: Donation[] | null = null;
let lastFetchTime = 0;

// Track in-progress donation creations to prevent duplicates
const pendingDonations = new Set<string>();

// Upload image to Supabase Storage
const uploadImage = async (file: File): Promise<string> => {
  try {
    // Create bucket if it doesn't exist
    const { data: bucketData, error: bucketError } = await supabase.storage
      .createBucket('donations', { public: true });

    if (bucketError && bucketError.message !== 'Bucket already exists') {
      throw bucketError;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `donations/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('donations')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('donations')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Create donation with image handling
export const createDonation = async (donation: Omit<Database['public']['Tables']['donations']['Insert'], 'id' | 'organization_id'> & { image?: File | null }) => {
  // Create a unique key for this donation
  const donationKey = `${donation.title}_${donation.pickup_time}`;
  
  // Use Logger to prevent duplicates and track the entire operation
  return Logger.preventDuplicates(
    donationKey,
    () => Logger.trackOperation('createDonation', async (txId) => {
      try {
        Logger.log('Processing donation data', { 
          context: { donation }, 
          transactionId: txId 
        });

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('Not authenticated');
        }

        // Handle image upload if provided
        let imageUrl = null;
        if (donation.image instanceof File) {
          imageUrl = await uploadImage(donation.image);
        }

        // Create the donation
        const { data, error } = await supabase
          .from('donations')
          .insert({
            ...donation,
            organization_id: user.id,
            status: 'active',
            image_url: imageUrl,
            image: imageUrl // Set both image fields for compatibility
          })
          .select()
          .single();

        if (error) throw error;
        
        return { donation: data, error: null };
      } catch (error) {
        return {
          donation: null,
          error: error instanceof Error ? error.message : 'Failed to create donation'
        };
      }
    }),
    { operation: 'createDonation', donationDetails: { title: donation.title, pickup_time: donation.pickup_time } }
  );
};

export const getDonations = async () => {
  return Logger.trackOperation('getDonations', async (txId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      Logger.log('Fetching donations', { 
        context: { userId: user.id },
        transactionId: txId 
      });

      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .eq('organization_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      Logger.log('Donations fetched successfully', { 
        context: { count: data?.length || 0 },
        transactionId: txId 
      });
      
      return { donations: data || [], error: null };
    } catch (error) {
      // Error is automatically logged by trackOperation
      return {
        donations: [],
        error: error instanceof Error ? error.message : 'Failed to fetch donations'
      };
    }
  });
};

export const getAvailableDonations = async () => {
  try {
    const now = Date.now();
    if (cachedDonations && (now - lastFetchTime) < APP_CONFIG.CACHE_DURATION) {
      return { donations: cachedDonations, error: null };
    }

    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .eq('status', APP_CONFIG.DONATIONS.STATUS.ACTIVE)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    cachedDonations = data;
    lastFetchTime = now;
    
    return { donations: data || [], error: null };
  } catch (error) {
    console.error('Error fetching available donations:', error);
    return {
      donations: [],
      error: error instanceof Error ? error.message : 'Failed to fetch available donations'
    };
  }
};

export const updateDonationStatus = async (id: string, status: 'active' | 'completed') => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('donations')
      .update({ status })
      .eq('id', id)
      .eq('organization_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return { donation: data, error: null };
  } catch (error) {
    console.error('Error updating donation status:', error);
    return {
      donation: null,
      error: error instanceof Error ? error.message : 'Failed to update donation status'
    };
  }
};

export const deleteDonation = async (id: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('donations')
      .delete()
      .eq('id', id)
      .eq('organization_id', user.id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting donation:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to delete donation'
    };
  }
};