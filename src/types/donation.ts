import type { Database } from './supabase';

export type DonationStatus = 'active' | 'completed';

// Base type from Supabase
export type SupabaseDonation = Database['public']['Tables']['donations']['Row'];

// Legacy interface with added compatibility properties
export interface DonationItem {
  id: string;
  organization_id?: string;  // Added for Supabase compatibility
  title: string;
  quantity: string;
  location: string;
  distance: string;
  pickupTime: string;     // Legacy field
  pickup_time?: string;   // Supabase field
  description: string;
  createdAt: number;      // Legacy field
  created_at?: string;    // Supabase field
  updated_at?: string;    // Supabase field
  status: DonationStatus;
}

// Helper functions for conversion between types
export const supabaseToDonationItem = (donation: SupabaseDonation): DonationItem => {
  return {
    id: donation.id,
    organization_id: donation.organization_id,
    title: donation.title,
    quantity: donation.quantity,
    location: donation.location,
    distance: donation.distance,
    pickupTime: donation.pickup_time,
    pickup_time: donation.pickup_time,
    description: donation.description,
    createdAt: new Date(donation.created_at).getTime(),
    created_at: donation.created_at,
    updated_at: donation.updated_at,
    status: donation.status as DonationStatus,
  };
};

export const donationItemToSupabase = (item: DonationItem): Partial<SupabaseDonation> => {
  return {
    id: item.id,
    organization_id: item.organization_id,
    title: item.title,
    quantity: item.quantity,
    location: item.location,
    distance: item.distance,
    pickup_time: item.pickup_time || item.pickupTime,
    description: item.description,
    status: item.status,
  };
};