import { supabase } from './supabase';
import { APP_CONFIG } from './constants';
import type { Database } from '../types/supabase';

type Donation = Database['public']['Tables']['donations']['Row'];

// Cache management
let cachedDonations: Donation[] | null = null;
let lastFetchTime = 0;

export const createDonation = async (donation: Omit<Database['public']['Tables']['donations']['Insert'], 'id' | 'organization_id'>) => {
  try {
    console.log('Starting createDonation with data:', donation);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    console.log('User authenticated:', user.id);

    // Validate required fields
    if (!donation.title || !donation.description || !donation.quantity || 
        !donation.location || !donation.pickup_time) {
      console.log('Missing required fields:', { donation });
      throw new Error('Missing required fields');
    }

    // Insert the donation
    console.log('Inserting donation for organization:', user.id);
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
      console.error('Database error:', error);
      throw error;
    }

    console.log('Donation created successfully:', data);
    return { donation: data, error: null };
  } catch (error) {
    console.error('Error in createDonation:', error);
    return {
      donation: null,
      error: error instanceof Error ? error.message : 'Failed to create donation'
    };
  }
};

export const getDonations = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .eq('organization_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { donations: data || [], error: null };
  } catch (error) {
    console.error('Error fetching donations:', error);
    return {
      donations: [],
      error: error instanceof Error ? error.message : 'Failed to fetch donations'
    };
  }
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