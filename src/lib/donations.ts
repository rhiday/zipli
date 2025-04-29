import { supabase } from './supabase';
import { APP_CONFIG } from './constants';
import type { Database } from '../types/supabase';
import Logger from './logger';

type Donation = Database['public']['Tables']['donations']['Row'];

// Cache management
let cachedDonations: Donation[] | null = null;
let lastFetchTime = 0;

// Track in-progress donation creations to prevent duplicates
const pendingDonations = new Set<string>();

export const createDonation = async (donation: Omit<Database['public']['Tables']['donations']['Insert'], 'id' | 'organization_id'>) => {
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

        Logger.log('User authenticated', { 
          context: { userId: user.id },
          transactionId: txId 
        });

        // Validate required fields
        if (!donation.title || !donation.description || !donation.quantity || 
            !donation.location || !donation.pickup_time) {
          Logger.log('Missing required fields', { 
            level: 'error',
            context: { donation },
            transactionId: txId
          });
          throw new Error('Missing required fields');
        }

        // Check if a similar donation already exists
        const { data: existingDonations } = await supabase
          .from('donations')
          .select('*')
          .eq('organization_id', user.id)
          .eq('title', donation.title)
          .eq('pickup_time', donation.pickup_time);
          
        if (existingDonations && existingDonations.length > 0) {
          Logger.log('Similar donation already exists', {
            context: { existingDonation: existingDonations[0] },
            transactionId: txId
          });
          return { donation: existingDonations[0], error: null };
        }

        // Insert the donation
        Logger.log('Inserting donation', { 
          context: { organizationId: user.id },
          transactionId: txId 
        });
        
        const { data, error } = await supabase
          .from('donations')
          .insert({
            ...donation,
            organization_id: user.id,
            status: 'active'
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        Logger.log('Donation created successfully', { 
          context: { donationId: data.id },
          transactionId: txId 
        });
        
        return { donation: data, error: null };
      } catch (error) {
        // Error is automatically logged by trackOperation
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

export const getAvailableDonations = async (userId?: string | null) => {
  try {
    let query = supabase
      .from('donations')
      .select('*')
      // Base filter: EITHER active OR (completed AND rescued by me)
      .or(`status.eq.${APP_CONFIG.DONATIONS.STATUS.ACTIVE}${userId ? `,and(status.eq.${APP_CONFIG.DONATIONS.STATUS.COMPLETED},rescuer_id.eq.${userId})` : ''}`) 
      .order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    
    return { donations: data || [], error: null };
  } catch (error) {
    console.error('Error fetching available/rescued donations:', error);
    return {
      donations: [],
      error: error instanceof Error ? error.message : 'Failed to fetch donations'
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