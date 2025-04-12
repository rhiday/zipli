export type DonationStatus = 'active' | 'completed';

export interface DonationItem {
  id: string;
  title: string;
  quantity: string;
  location: string;
  distance: string;
  pickupTime: string;
  description: string;
  createdAt: number;
  status: DonationStatus;
}